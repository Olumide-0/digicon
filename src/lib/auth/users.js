// User store (server only).
//
// ⚠️ DEVELOPMENT STORE: users are saved to .data/users.json on this machine.
// That works for local development and testing, but NOT on serverless hosting
// (e.g. Vercel), where the filesystem is read-only/ephemeral. Before launch,
// replace the exported functions with calls to a real database or auth provider
// (Supabase, Firebase, Postgres + Prisma, Clerk, …). The rest of the app only
// uses the functions exported from this file.
import { createHash, randomBytes, randomUUID, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const scryptAsync = promisify(scrypt);
const DATA_DIR = path.join(process.cwd(), ".data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

async function readUsers() {
  try {
    return JSON.parse(await readFile(USERS_FILE, "utf8"));
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

async function writeUsers(users) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const key = await scryptAsync(password, salt, 64);
  return `${salt}:${key.toString("hex")}`;
}

export async function verifyPassword(password, stored) {
  const [salt, keyHex] = stored.split(":");
  const key = await scryptAsync(password, salt, 64);
  const expected = Buffer.from(keyHex, "hex");
  return expected.length === key.length && timingSafeEqual(expected, key);
}

const normalizeEmail = (email) => email.trim().toLowerCase();

export async function findUserByEmail(email) {
  const users = await readUsers();
  return users.find((u) => u.email === normalizeEmail(email)) ?? null;
}

export async function findUserById(id) {
  const users = await readUsers();
  return users.find((u) => u.id === id) ?? null;
}

// Returns the new user, or null if the email is already registered.
export async function createUser({ firstName, lastName, phone, email, password }) {
  const users = await readUsers();
  if (users.some((u) => u.email === normalizeEmail(email))) return null;
  const user = {
    id: randomUUID(),
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    phone: phone.trim(),
    email: normalizeEmail(email),
    passwordHash: await hashPassword(password),
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  await writeUsers(users);
  return user;
}

// ── Password reset ────────────────────────────────────────────────────────────
// A random token is emailed to the user; only its SHA-256 hash is stored, so a
// leaked users file can't be used to reset passwords. Tokens are single-use and
// expire after RESET_TTL_MS.
export const RESET_TTL_MS = 30 * 60 * 1000;
const hashToken = (token) => createHash("sha256").update(token).digest("hex");

// Returns the raw token to email, or null if no account uses this email.
export async function createPasswordResetToken(email) {
  const users = await readUsers();
  const user = users.find((u) => u.email === normalizeEmail(email));
  if (!user) return null;
  const token = randomBytes(32).toString("base64url");
  user.resetTokenHash = hashToken(token);
  user.resetTokenExpires = Date.now() + RESET_TTL_MS;
  await writeUsers(users);
  return token;
}

// The user a still-valid token belongs to, or null.
export async function findUserByResetToken(token) {
  if (!token) return null;
  const users = await readUsers();
  const hash = hashToken(token);
  return users.find((u) => u.resetTokenHash === hash && u.resetTokenExpires > Date.now()) ?? null;
}

// Sets the new password and uses up the token. Returns false if the token is invalid/expired.
export async function resetPasswordWithToken(token, newPassword) {
  const users = await readUsers();
  const hash = hashToken(token);
  const user = users.find((u) => u.resetTokenHash === hash && u.resetTokenExpires > Date.now());
  if (!user) return false;
  user.passwordHash = await hashPassword(newPassword);
  user.passwordChangedAt = new Date().toISOString();
  delete user.resetTokenHash;
  delete user.resetTokenExpires;
  await writeUsers(users);
  return true;
}

// ── Account updates ───────────────────────────────────────────────────────────
// patch: any of { firstName, lastName, phone, email, address: { country, line1, city, state, postalCode } }
// Returns the updated user, null if not found, or { error: "email_taken" }.
export async function updateUser(id, patch) {
  const users = await readUsers();
  const user = users.find((u) => u.id === id);
  if (!user) return null;
  if (patch.email !== undefined) {
    const email = normalizeEmail(patch.email);
    if (users.some((u) => u.id !== id && u.email === email)) return { error: "email_taken" };
    patch = { ...patch, email };
  }
  Object.assign(user, patch, { updatedAt: new Date().toISOString() });
  await writeUsers(users);
  return user;
}

export async function setPassword(id, newPassword) {
  const users = await readUsers();
  const user = users.find((u) => u.id === id);
  if (!user) return false;
  user.passwordHash = await hashPassword(newPassword);
  user.passwordChangedAt = new Date().toISOString();
  await writeUsers(users);
  return true;
}

// Every account (admin). Never send passwordHash or reset fields to the browser.
export async function listUsers() {
  return readUsers();
}
