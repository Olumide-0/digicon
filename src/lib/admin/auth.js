// Admin access (server only). Admins are ordinary accounts with role "admin" in the user store,
// plus a level (Super Admin or Admin, see src/lib/team/permissions.js) and a status
// (Inactive = access turned off).
// Everything is re-read on every request, so changes take effect at once.
// Make an account an admin with:  node scripts/make-admin.mjs you@example.com
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/users";
import { findRole } from "@/lib/team/store";

// Part of the team at all (active or not).
export const isTeamMember = (user) => user?.role === "admin";
// Allowed into the admin right now.
export const isAdmin = (user) => isTeamMember(user) && user.teamStatus !== "inactive";

// The signed-in admin with { permissions, teamRole }, or null.
export async function getAdmin() {
  const session = await getSession();
  if (!session) return null;
  const user = await findUserById(session.userId);
  if (!isAdmin(user)) return null;
  const teamRole = await findRole(user.teamRoleId);
  return { ...user, teamRole, permissions: teamRole.permissions };
}

export const can = (admin, permission) => !permission || Boolean(admin?.permissions?.includes(permission));

// Use at the top of every admin page. permission (optional): "products" | "orders" | "inventory" | "team".
// Without that permission the admin is sent to the dashboard with a notice.
export async function requireAdmin(permission) {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/signin");
  if (!can(admin, permission)) redirect(`/admin?denied=${permission}`);
  return admin;
}

// For server actions: the admin if allowed, otherwise null.
export async function adminWith(permission) {
  const admin = await getAdmin();
  return admin && can(admin, permission) ? admin : null;
}
