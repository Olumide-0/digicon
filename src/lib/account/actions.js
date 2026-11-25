"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSession } from "../auth/session";
import { findUserById, setPassword, updateUser, verifyPassword } from "../auth/users";
import { countries } from "@/data/shipping";

const EMAIL_RE = /^[^\s@]+@([^\s@.]+\.)+[^\s@.]{2,}$/;
const letters = (s) => (s.match(/\p{L}/gu) ?? []).length;
const field = (fd, name) => String(fd.get(name) ?? "").trim();

async function currentUser() {
  const session = await getSession();
  const user = session && (await findUserById(session.userId));
  if (!user) redirect("/signin?next=/account");
  return user;
}

const done = () => {
  revalidatePath("/account");
  return { ok: true, at: Date.now() };
};

export async function updateName(_prev, fd) {
  const user = await currentUser();
  const values = { firstName: field(fd, "firstName"), lastName: field(fd, "lastName") };
  const errors = {};
  if (letters(values.firstName) < 2 || values.firstName.length > 60) errors.firstName = "Enter your first name";
  if (letters(values.lastName) < 2 || values.lastName.length > 60) errors.lastName = "Enter your last name";
  if (Object.keys(errors).length) return { errors, values };
  await updateUser(user.id, values);
  return done();
}

export async function updateEmail(_prev, fd) {
  const user = await currentUser();
  const values = { email: field(fd, "email") };
  const password = String(fd.get("currentPassword") ?? "");
  const errors = {};
  if (!EMAIL_RE.test(values.email) || values.email.length > 254) errors.email = "Enter a valid email address";
  if (!password) errors.currentPassword = "Enter your current password to confirm";
  if (Object.keys(errors).length) return { errors, values };
  if (!(await verifyPassword(password, user.passwordHash))) return { errors: { currentPassword: "That password isn't correct" }, values };
  const result = await updateUser(user.id, { email: values.email });
  if (result?.error === "email_taken") return { errors: { email: "Another account already uses this email" }, values };
  return done();
}

export async function updatePhone(_prev, fd) {
  const user = await currentUser();
  const values = { phone: field(fd, "phone") };
  const digits = values.phone.replace(/\D/g, "");
  if (!/^\+?[0-9\s-]+$/.test(values.phone) || digits.length < 10 || digits.length > 15)
    return { errors: { phone: "Enter a valid phone number, like 0815 445 2310" }, values };
  await updateUser(user.id, values);
  return done();
}

export async function updateAddress(_prev, fd) {
  const user = await currentUser();
  const values = {
    country: field(fd, "country"),
    line1: field(fd, "line1"),
    state: field(fd, "state"),
  };
  const errors = {};
  if (!countries.includes(values.country)) errors.country = "Choose your country or region";
  if (values.line1.length < 5 || values.line1.length > 200) errors.line1 = "Enter your full street name and number";
  if (letters(values.state) < 2 || values.state.length > 80) errors.state = "Enter your state";
  if (Object.keys(errors).length) return { errors, values };
  await updateUser(user.id, { address: values });
  return done();
}

export async function changePassword(_prev, fd) {
  const user = await currentUser();
  const current = String(fd.get("currentPassword") ?? "");
  const next = String(fd.get("newPassword") ?? "");
  const confirm = String(fd.get("confirmPassword") ?? "");
  const errors = {};
  if (!current) errors.currentPassword = "Enter your current password";
  if (next.length < 8) errors.newPassword = "New password must be at least 8 characters";
  else if (next === current) errors.newPassword = "Choose a password different from your current one";
  if (confirm !== next) errors.confirmPassword = "Passwords don't match";
  if (Object.keys(errors).length) return { errors };
  if (!(await verifyPassword(current, user.passwordHash))) return { errors: { currentPassword: "That password isn't correct" } };
  await setPassword(user.id, next);
  return done();
}
