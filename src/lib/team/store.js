// Team store (server only): pending invitations (roles are fixed, see permissions.js). Team members themselves are user
// accounts with role "admin" plus { teamRoleId, teamStatus, addedToTeamAt, lastLoginAt }.
//
// ⚠️ DEVELOPMENT STORE: saved to .data/team.json. Swap for a database before launch.
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { ROLES, roleOf } from "./permissions";

const FILE = path.join(process.cwd(), ".data", "team.json");
export const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // invitation links last 7 days
const hashToken = (t) => createHash("sha256").update(t).digest("hex");

async function read() {
  try {
    return JSON.parse(await readFile(FILE, "utf8"));
  } catch (err) {
    if (err.code === "ENOENT") return { invites: [] };
    throw err;
  }
}
async function write(data) {
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify(data, null, 2));
}

// ── Roles: fixed (Super Admin, Admin) ───────────────────────────────────────
export async function listRoles() {
  return ROLES;
}
export async function findRole(id) {
  return roleOf(id);
}

// ── Invitations ──────────────────────────────────────────────────────────────
// Only the token's hash is stored. Returns { invite, token }.
export async function createInvite({ email, firstName, lastName, roleId, invitedBy }) {
  const data = await read();
  data.invites = data.invites.filter((i) => i.email !== email); // a new invite replaces an old one
  const token = randomBytes(32).toString("base64url");
  const invite = { id: randomUUID(), email, firstName, lastName, roleId, invitedBy, tokenHash: hashToken(token), expiresAt: Date.now() + INVITE_TTL_MS, createdAt: new Date().toISOString() };
  data.invites.push(invite);
  await write(data);
  return { invite, token };
}

export async function listInvites() {
  return (await read()).invites;
}

// A fresh link for an existing invite. Returns { invite, token } or null.
export async function renewInvite(id) {
  const data = await read();
  const invite = data.invites.find((i) => i.id === id);
  if (!invite) return null;
  const token = randomBytes(32).toString("base64url");
  Object.assign(invite, { tokenHash: hashToken(token), expiresAt: Date.now() + INVITE_TTL_MS });
  await write(data);
  return { invite, token };
}

export async function updateInvite(id, patch) {
  const data = await read();
  const invite = data.invites.find((i) => i.id === id);
  if (invite) Object.assign(invite, patch);
  await write(data);
  return invite ?? null;
}

export async function deleteInvite(id) {
  const data = await read();
  data.invites = data.invites.filter((i) => i.id !== id);
  await write(data);
}

// The still-valid invite for a token, or null.
export async function findInviteByToken(token) {
  if (!token) return null;
  const hash = hashToken(token);
  return (await read()).invites.find((i) => i.tokenHash === hash && i.expiresAt > Date.now()) ?? null;
}
