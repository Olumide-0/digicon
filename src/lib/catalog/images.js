// Product photos uploaded in the admin (server only).
// ⚠️ DEVELOPMENT STORE: saved to .data/product-images/ and served by /api/product-images/<file>.
// Before launch, move to file storage (Cloudinary, S3, Vercel Blob, Supabase Storage…).
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DIR = path.join(process.cwd(), ".data", "product-images");
export const IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const IMAGE_URL_RE = /^\/api\/product-images\/[0-9a-f-]{36}\.(png|jpg)$/;

// Check the real file contents, not just the name/type the browser sent.
function sniff(buf) {
  if (buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "png";
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  return null;
}

// Returns { url } or { error }.
export async function saveProductImage(file) {
  if (!file || typeof file !== "object" || !file.size) return { error: "Choose an image." };
  if (file.size > IMAGE_MAX_BYTES) return { error: `${file.name || "Image"} is over 5MB.` };
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = sniff(buf);
  if (!ext) return { error: `${file.name || "That file"} isn't a JPG or PNG.` };
  const name = `${randomUUID()}.${ext}`;
  await mkdir(DIR, { recursive: true });
  await writeFile(path.join(DIR, name), buf);
  return { url: `/api/product-images/${name}` };
}

export async function readProductImage(name) {
  if (!/^[0-9a-f-]{36}\.(png|jpg)$/.test(name)) return null;
  try {
    return await readFile(path.join(DIR, name));
  } catch {
    return null;
  }
}
