// Signed, httpOnly session cookie (server only).
// The cookie holds { userId, expiresAt } plus an HMAC-SHA256 signature, so it
// can't be forged or edited in the browser. Set AUTH_SECRET in your environment
// (any long random string) — required in production.
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { cookies } from "next/headers";

const COOKIE = "digicon_session";
const DAY = 24 * 60 * 60;

let devSecret;
async function getSecret() {
  if (process.env.AUTH_SECRET) return process.env.AUTH_SECRET;
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET is not set. Add it to your environment variables.");
  }
  // Development only: generate once and keep it in .data/ so sessions survive restarts.
  if (devSecret) return devSecret;
  const file = path.join(process.cwd(), ".data", "auth-secret");
  try {
    devSecret = (await readFile(file, "utf8")).trim();
  } catch {
    devSecret = randomBytes(32).toString("hex");
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, devSecret);
  }
  return devSecret;
}

const sign = (data, secret) => createHmac("sha256", secret).update(data).digest("base64url");

async function encode(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${sign(data, await getSecret())}`;
}

async function decode(token) {
  if (!token || !token.includes(".")) return null;
  const [data, sig] = token.split(".");
  const expected = Buffer.from(sign(data, await getSecret()));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString());
    return payload.expiresAt > Date.now() ? payload : null;
  } catch {
    return null;
  }
}

// remember = true keeps the user signed in for 30 days; otherwise until the browser closes (max 1 day).
export async function createSession(userId, remember = false) {
  const maxAge = remember ? 30 * DAY : DAY;
  const token = await encode({ userId, expiresAt: Date.now() + maxAge * 1000 });
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(remember && { maxAge }),
  });
}

export async function getSession() {
  return decode((await cookies()).get(COOKIE)?.value);
}

export async function deleteSession() {
  (await cookies()).delete(COOKIE);
}
