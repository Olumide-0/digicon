"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adminWith, isAdmin, isTeamMember } from "@/lib/admin/auth";
import { createSession } from "@/lib/auth/session";
import { createUser, findUserByEmail, findUserById, listUsers, setPassword, updateUser } from "@/lib/auth/users";
import { sendTeamInviteEmail } from "@/lib/email";
import { SUPER_ADMIN, roleOf } from "./permissions";
import { createInvite, deleteInvite, findInviteByToken, findRole, listRoles, renewInvite, updateInvite } from "./store";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DENIED = { error: "Your role can't manage the team. Please sign in again or ask a Super Admin." };
const refresh = () => revalidatePath("/admin", "layout");
const isSuper = (u) => roleOf(u.teamRoleId).id === SUPER_ADMIN.id;

async function origin() {
  const h = await headers();
  return `${h.get("x-forwarded-proto") ?? "http"}://${h.get("x-forwarded-host") ?? h.get("host")}`;
}

// Active Super Admins other than `exceptId`. The team must always keep at least one.
async function otherActiveSuperAdmins(exceptId) {
  return (await listUsers()).filter((u) => u.id !== exceptId && isAdmin(u) && isSuper(u)).length;
}

// ── Invitations ──────────────────────────────────────────────────────────────
const MAX_INVITES = 20;

// "Invite New User": one or more emails, one role. Returns { invites: [{ email, link }] } so the
// inviter can copy and share each link (emails aren't connected yet).
export async function inviteMembersAction(input) {
  const admin = await adminWith("team");
  if (!admin) return DENIED;
  const emails = [...new Set((Array.isArray(input?.emails) ? input.emails : []).map((e) => String(e ?? "").trim().toLowerCase()).filter(Boolean))];
  const roleId = String(input?.roleId ?? "");

  const errors = {};
  const bad = emails.filter((e) => !EMAIL_RE.test(e));
  if (!emails.length) errors.email = "Add at least one email address";
  else if (emails.length > MAX_INVITES) errors.email = `Invite up to ${MAX_INVITES} people at a time`;
  else if (bad.length) errors.email = `Not a valid email: ${bad.join(", ")}`;
  const role = (await listRoles()).find((r) => r.id === roleId);
  if (!role) errors.roleId = "Choose a role";
  if (!errors.email) {
    const already = [];
    for (const e of emails) if (isTeamMember(await findUserByEmail(e))) already.push(e);
    if (already.length) errors.email = `Already on the team: ${already.join(", ")}`;
  }
  if (Object.keys(errors).length) return { errors };

  const base = await origin();
  const inviter = `${admin.firstName} ${admin.lastName}`.trim();
  const invites = [];
  for (const email of emails) {
    const { token } = await createInvite({ email, firstName: "", lastName: "", roleId, invitedBy: admin.id });
    const link = `${base}/admin/accept-invite?token=${token}`;
    await sendTeamInviteEmail(email, "", role.name, inviter, link);
    invites.push({ email, link });
  }
  refresh();
  return { invites, role: role.name };
}

export async function resendInviteAction(id) {
  const admin = await adminWith("team");
  if (!admin) return DENIED;
  const res = await renewInvite(id);
  if (!res) return { error: "That invitation no longer exists." };
  const role = await findRole(res.invite.roleId);
  const link = `${await origin()}/admin/accept-invite?token=${res.token}`;
  await sendTeamInviteEmail(res.invite.email, res.invite.firstName, role.name, `${admin.firstName} ${admin.lastName}`.trim(), link);
  refresh();
  return { link, email: res.invite.email };
}

export async function cancelInviteAction(id) {
  if (!(await adminWith("team"))) return DENIED;
  await deleteInvite(id);
  refresh();
  return { message: "Invitation cancelled." };
}

export async function changeInviteRoleAction(id, roleId) {
  if (!(await adminWith("team"))) return DENIED;
  const role = (await listRoles()).find((r) => r.id === roleId);
  if (!role) return { error: "Choose a role." };
  await updateInvite(id, { roleId });
  refresh();
  return { message: `Invitation changed to ${role.name}.` };
}

// ── Members ──────────────────────────────────────────────────────────────────
async function member(id) {
  const user = await findUserById(id);
  return isTeamMember(user) ? user : null;
}

export async function setMemberStatusAction(ids, status) {
  const admin = await adminWith("team");
  if (!admin) return DENIED;
  if (!["active", "inactive"].includes(status)) return { error: "Unknown status." };
  const list = [...new Set(Array.isArray(ids) ? ids : [])];
  if (status === "inactive" && list.includes(admin.id)) return { error: "You can't turn off your own access." };
  let changed = 0;
  for (const id of list) {
    const user = await member(id);
    if (!user) continue;
    if (status === "inactive" && isSuper(user) && (await otherActiveSuperAdmins(id)) === 0) return { error: "At least one Super Admin must stay active." };
    await updateUser(id, { teamStatus: status });
    changed++;
  }
  refresh();
  return { message: `${changed} ${changed === 1 ? "member" : "members"} set to ${status === "active" ? "Active" : "Inactive"}.` };
}

export async function changeMemberRoleAction(id, roleId) {
  const admin = await adminWith("team");
  if (!admin) return DENIED;
  const user = await member(id);
  if (!user) return { error: "That team member no longer exists." };
  const role = (await listRoles()).find((r) => r.id === roleId);
  if (!role) return { error: "Choose a role." };
  if (isSuper(user) && roleId !== SUPER_ADMIN.id && (await otherActiveSuperAdmins(id)) === 0)
    return { error: "At least one active Super Admin is needed. Make someone else Super Admin first." };
  await updateUser(id, { teamRoleId: roleId });
  refresh();
  return { message: `${user.firstName || user.email} is now ${role.name}.` };
}

// Takes away admin access. The account itself stays (they can still shop), so orders aren't lost.
export async function removeMembersAction(ids) {
  const admin = await adminWith("team");
  if (!admin) return DENIED;
  const list = [...new Set(Array.isArray(ids) ? ids : [])];
  if (list.includes(admin.id)) return { error: "You can't remove yourself from the team." };
  let removed = 0;
  for (const id of list) {
    const user = await member(id);
    if (!user) continue;
    if (isSuper(user) && isAdmin(user) && (await otherActiveSuperAdmins(id)) === 0) return { error: "At least one Super Admin must stay on the team." };
    await updateUser(id, { role: undefined, teamRoleId: undefined, teamStatus: undefined, addedToTeamAt: undefined });
    removed++;
  }
  refresh();
  return { message: `${removed} ${removed === 1 ? "member" : "members"} removed from the team.` };
}

// ── Accepting an invitation ("Welcome! Let's secure your account") ───────────
export async function acceptInviteAction(_prev, formData) {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const errors = {};
  if (password.length < 8) errors.password = "Password must be at least 8 characters";
  if (confirmPassword !== password) errors.confirmPassword = "Passwords don't match";
  if (Object.keys(errors).length) return { errors };

  const invite = await findInviteByToken(token);
  if (!invite) return { errors: { form: "This invitation is invalid or has expired. Ask for a new one." } };

  const now = new Date().toISOString();
  const teamFields = { role: "admin", teamRoleId: invite.roleId, teamStatus: "active", addedToTeamAt: now, lastLoginAt: now };
  let user = await findUserByEmail(invite.email);
  if (user) {
    // They already shop with us: same account, now with admin access and the new password.
    await setPassword(user.id, password);
  } else {
    user = await createUser({ firstName: invite.firstName, lastName: invite.lastName, phone: "", email: invite.email, password });
  }
  await updateUser(user.id, teamFields);
  await deleteInvite(invite.id);
  await createSession(user.id, false);
  redirect("/admin");
}
