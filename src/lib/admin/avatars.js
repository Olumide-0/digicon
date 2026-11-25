// Admin profile photos (server only).
// ⚠️ DEVELOPMENT STORE: saved to .data/avatars/ on this machine. Before launch, move to
// file storage (e.g. Cloudinary, S3, Vercel Blob, Supabase Storage).
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const DIR = path.join(process.cwd(), ".data", "avatars");
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
export const AVATAR_TYPES = { "image/jpeg": "jpg", "image/png": "png" };

// Check the real file contents, not just the name/type the browser sent.
function sniff(buf) {
  if (buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "png";
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  return null;
}

// Returns { ext } on success or { error }.
export async function saveAvatar(userId, file) {
  if (file.size > AVATAR_MAX_BYTES) return { error: "Image must be 5MB or smaller" };
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = sniff(buf);
  if (!ext) return { error: "Upload a JPG or PNG image" };
  await mkdir(DIR, { recursive: true });
  for (const other of Object.values(AVATAR_TYPES)) if (other !== ext) await unlink(path.join(DIR, `${userId}.${other}`)).catch(() => {});
  await writeFile(path.join(DIR, `${userId}.${ext}`), buf);
  return { ext };
}

export async function readAvatar(userId, ext) {
  if (!/^[\w-]+$/.test(userId) || !Object.values(AVATAR_TYPES).includes(ext)) return null;
  try {
    return await readFile(path.join(DIR, `${userId}.${ext}`));
  } catch {
    return null;
  }
}
