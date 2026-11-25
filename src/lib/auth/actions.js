"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  createPasswordResetToken,
  createUser,
  findUserByEmail,
  resetPasswordWithToken,
  verifyPassword,
} from "./users";
import { createSession, deleteSession } from "./session";
import { sendPasswordResetEmail } from "../email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9\s-]{10,17}$/;

// Only allow redirects to paths on this site (blocks "//evil.com" and full URLs).
function safeNext(value) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

const field = (formData, name) => String(formData.get(name) ?? "");

export async function signUp(_prev, formData) {
  const values = {
    firstName: field(formData, "firstName").trim(),
    lastName: field(formData, "lastName").trim(),
    phone: field(formData, "phone").trim(),
    email: field(formData, "email").trim(),
  };
  const password = field(formData, "password");
  const confirmPassword = field(formData, "confirmPassword");

  const errors = {};
  if (!values.firstName) errors.firstName = "Enter your first name";
  if (!values.lastName) errors.lastName = "Enter your last name";
  if (!PHONE_RE.test(values.phone) || values.phone.replace(/\D/g, "").length < 10)
    errors.phone = "Enter a valid phone number";
  if (!EMAIL_RE.test(values.email)) errors.email = "Enter a valid email address";
  if (password.length < 8) errors.password = "Password must be at least 8 characters";
  if (confirmPassword !== password) errors.confirmPassword = "Passwords don't match";
  if (Object.keys(errors).length) return { errors, values };

  const user = await createUser({ ...values, password });
  if (!user) return { errors: { email: "An account with this email already exists" }, values };

  await createSession(user.id, true);
  redirect(safeNext(field(formData, "next")));
}

export async function signIn(_prev, formData) {
  const values = { email: field(formData, "email").trim() };
  const password = field(formData, "password");
  const remember = formData.get("remember") === "on";

  if (!EMAIL_RE.test(values.email) || !password) {
    return { errors: { form: "Enter your email address and password" }, values };
  }
  const user = await findUserByEmail(values.email);
  // Same message whether the email or the password is wrong, so accounts can't be probed.
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { errors: { form: "Incorrect email address or password" }, values };
  }

  await createSession(user.id, remember);
  redirect(safeNext(field(formData, "next")));
}

export async function signOut() {
  await deleteSession();
  redirect("/");
}

// Step 1: email a reset link. Always reports success, whether or not the email
// has an account, so the form can't be used to find out who is registered.
export async function requestPasswordReset(_prev, formData) {
  const email = field(formData, "email").trim();
  if (!EMAIL_RE.test(email)) return { errors: { email: "Enter a valid email address" }, values: { email } };

  let devLink;
  const token = await createPasswordResetToken(email);
  if (token) {
    const h = await headers();
    const origin = `${h.get("x-forwarded-proto") ?? "http"}://${h.get("x-forwarded-host") ?? h.get("host")}`;
    const link = `${origin}/reset-password?token=${token}`;
    const user = await findUserByEmail(email);
    await sendPasswordResetEmail(user.email, user.firstName, link);
    // No email service yet: show the link on the page while developing.
    if (process.env.NODE_ENV !== "production" || process.env.SHOW_RESET_LINKS === "true") devLink = link;
  }
  return { sent: true, email, devLink };
}

// Step 2: set the new password using the token from the link.
export async function resetPassword(_prev, formData) {
  const token = field(formData, "token");
  const password = field(formData, "password");
  const confirmPassword = field(formData, "confirmPassword");

  const errors = {};
  if (password.length < 8) errors.password = "Password must be at least 8 characters";
  if (confirmPassword !== password) errors.confirmPassword = "Passwords don't match";
  if (Object.keys(errors).length) return { errors };

  if (!(await resetPasswordWithToken(token, password))) {
    return { errors: { form: "This reset link is invalid or has expired. Please request a new one." } };
  }
  redirect("/signin?reset=1");
}
