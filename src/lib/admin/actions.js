"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSession, deleteSession } from "@/lib/auth/session";
import {
  createPasswordResetToken,
  findUserByEmail,
  findUserByResetToken,
  resetPasswordWithToken,
  updateUser,
  verifyPassword,
} from "@/lib/auth/users";
import { sendPasswordResetEmail } from "@/lib/email";
import { getAdmin, isAdmin, isTeamMember } from "./auth";
import { saveAvatar } from "./avatars";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const field = (formData, name) => String(formData.get(name) ?? "");

export async function adminSignIn(_prev, formData) {
  const values = { email: field(formData, "email").trim() };
  const password = field(formData, "password");
  const remember = formData.get("remember") === "on";

  const errors = {};
  if (!EMAIL_RE.test(values.email)) errors.email = "Enter a valid email address";
  if (!password) errors.password = "Enter your password";
  if (Object.keys(errors).length) return { errors, values };

  const user = await findUserByEmail(values.email);
  // One message for unknown email, wrong password or a non-admin account,
  // so the form can't be used to find out who the admins are.
  if (!user || !(await verifyPassword(password, user.passwordHash)) || !isTeamMember(user)) {
    return { errors: { form: "Incorrect email address or password" }, values };
  }
  // Right password, but a Super Admin has turned this member's access off.
  if (!isAdmin(user)) {
    return { errors: { form: "Your admin access has been turned off. Ask a Super Admin to turn it back on." }, values };
  }
  await updateUser(user.id, { lastLoginAt: new Date().toISOString() });

  await createSession(user.id, remember);
  redirect("/admin");
}

export async function adminSignOut() {
  await deleteSession();
  redirect("/admin/signin");
}

// Forgot password, step 1: email a link (admins only). Always reports "sent" so the
// form can't be used to find out which emails belong to admins.
export async function adminRequestPasswordReset(_prev, formData) {
  const email = field(formData, "email").trim();
  if (!EMAIL_RE.test(email)) return { errors: { email: "Enter a valid email address" }, values: { email } };

  let devLink;
  const user = await findUserByEmail(email);
  if (isAdmin(user)) {
    const token = await createPasswordResetToken(email);
    const h = await headers();
    const origin = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("x-forwarded-host") ?? h.get("host")}`;
    const link = `${origin}/admin/reset-password?token=${token}`;
    await sendPasswordResetEmail(user.email, user.firstName, link);
    // No email service yet: show the link on the page while developing.
    if (process.env.NODE_ENV !== "production" || process.env.SHOW_RESET_LINKS === "true") devLink = link;
  }
  return { sent: true, email, devLink };
}

// Forgot password, step 2 ("Lets secure your account"): set the new password from the
// emailed link, then sign the admin in.
export async function adminResetPassword(_prev, formData) {
  const token = field(formData, "token");
  const password = field(formData, "password");
  const confirmPassword = field(formData, "confirmPassword");

  const errors = {};
  if (password.length < 8) errors.password = "Password must be at least 8 characters";
  if (confirmPassword !== password) errors.confirmPassword = "Passwords don't match";
  if (Object.keys(errors).length) return { errors };

  const user = await findUserByResetToken(token);
  if (!isAdmin(user) || !(await resetPasswordWithToken(token, password))) {
    return { errors: { form: "This link is invalid or has expired. Please request a new one." } };
  }
  await createSession(user.id, false);
  redirect("/admin");
}

// "Tell us your name": names + optional profile photo. Marks setup as done.
export async function completeAdminProfile(_prev, formData) {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/signin");

  const values = { firstName: field(formData, "firstName").trim(), lastName: field(formData, "lastName").trim() };
  const errors = {};
  if (!values.firstName) errors.firstName = "Enter your first name";
  if (!values.lastName) errors.lastName = "Enter your last name";

  const file = formData.get("avatar");
  let avatar;
  if (!errors.firstName && !errors.lastName && file && typeof file === "object" && file.size > 0) {
    const saved = await saveAvatar(admin.id, file);
    if (saved.error) errors.avatar = saved.error;
    else avatar = { ext: saved.ext, updatedAt: Date.now() };
  }
  if (Object.keys(errors).length) return { errors, values };

  await updateUser(admin.id, { ...values, ...(avatar && { avatar }), profileCompletedAt: new Date().toISOString() });
  return { done: true };
}
