// Product store (server only). The shop and the admin both read products from here.
//
// ⚠️ DEVELOPMENT STORE: saved to .data/catalog.json on this machine. Fine for building and
// testing, but NOT on serverless hosting. Before launch, swap these functions for a database;
// nothing else in the app reads the file directly.
//
// The first time it runs, the store is filled with the sample catalogue from src/data/products.js.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { connection } from "next/server";
import { deriveProduct, sampleProducts } from "@/data/products";
import { slugify } from "@/data/categories";

const FILE = path.join(process.cwd(), ".data", "catalog.json");
export const LOW_STOCK = 10; // same limit the shop uses for "N units left"

// ── Seed helpers ─────────────────────────────────────────────────────────────
// "iPhone 15 Pro" -> "IP15P", "Pixel 9 Pro Fold" -> "PI9PF", "AirPods Pro 2" -> "AI2P"... first
// word's first two letters, then each later word's number or first letter.
function skuPrefix(name) {
  const words = name.replace(/[–(),&″"]/g, " ").split(/\s+/).filter(Boolean);
  const [first, ...rest] = words;
  const head = first.replace(/[^a-z0-9]/gi, "").slice(0, 2);
  const tail = rest.slice(0, 4).map((w) => (/^\d/.test(w) ? w.replace(/[^0-9]/g, "") : w[0]));
  return (head + tail.join("")).toUpperCase().replace(/[^A-Z0-9]/g, "") || "PRD";
}
function nextSku(name, records) {
  const prefix = skuPrefix(name);
  const used = records.filter((r) => r.sku?.startsWith(`${prefix}-`)).map((r) => Number(r.sku.split("-").pop()) || 0);
  return `${prefix}-${String(Math.max(0, ...used) + 1).padStart(3, "0")}`;
}

// Where a product sits in the shop's category menu, e.g. ["Phones and Tablets", "Mobile Phones", "Smartphones"].
function categoryPath(p) {
  const root = "Phones and Tablets";
  if (p.category === "Phones") return [root, "Mobile Phones", "Smartphones"];
  if (p.category === "Tablets") return [root, "Tablets", /^iPad/.test(p.name) ? "iPad" : "Android Tablets"];
  const n = p.name;
  const sub = /case|folio|wallet|cover/i.test(n)
    ? "Case & covers"
    : /band|watch/i.test(n)
      ? "Watch & bands"
      : /adapter|charger|cable/i.test(n)
        ? "Phone Chargers"
        : /pencil/i.test(n)
          ? "Apple Pencil"
          : /airpods/i.test(n)
            ? "AirPods"
            : /buds/i.test(n)
              ? "Earbuds"
              : "Accessory Kits";
  return [root, "Accessories", sub];
}

function seed() {
  const now = new Date().toISOString();
  const records = [];
  for (const p of sampleProducts) {
    records.push({ ...p, id: slugify(p.name), sku: nextSku(p.name, records), categoryPath: categoryPath(p), status: "active", createdAt: now });
  }
  return records;
}

// ── Reading & writing ────────────────────────────────────────────────────────
async function readRecords() {
  try {
    return JSON.parse(await readFile(FILE, "utf8")).products;
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
    const records = seed();
    await writeRecords(records);
    return records;
  }
}

async function writeRecords(products) {
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify({ version: 1, products }, null, 2));
}

const toProduct = (r) => ({ ...deriveProduct(r), sku: r.sku, categoryPath: r.categoryPath, status: r.status, createdAt: r.createdAt });

// Products customers can see (active only), in catalogue order. Always read fresh per request.
export async function getProducts() {
  await connection();
  return (await readRecords()).filter((r) => r.status === "active").map(toProduct);
}

// One product by id. Drafts are only returned when includeDrafts is set (admin preview).
export async function getProduct(id, { includeDrafts = false } = {}) {
  await connection();
  const r = (await readRecords()).find((x) => x.id === id);
  return r && (r.status === "active" || includeDrafts) ? toProduct(r) : null;
}

// Everything, drafts included (admin).
export async function listAllProducts() {
  await connection();
  return (await readRecords()).map(toProduct);
}

// ── Admin changes ────────────────────────────────────────────────────────────
// Copies become drafts ("… (Copy)"), so the shop doesn't show twins until they're published.
export async function duplicateProducts(ids) {
  const records = await readRecords();
  const made = [];
  for (const id of ids) {
    const src = records.find((r) => r.id === id);
    if (!src) continue;
    const name = `${src.name.replace(/ \(Copy( \d+)?\)$/, "")} (Copy)`;
    let newId = slugify(name);
    for (let k = 2; records.some((r) => r.id === newId); k++) newId = `${slugify(name)}-${k}`;
    const copy = { ...src, id: newId, name, sku: nextSku(src.name, records), detailsId: src.detailsId ?? src.id, status: "draft", createdAt: new Date().toISOString() };
    records.splice(records.indexOf(src) + 1, 0, copy);
    made.push(copy.id);
  }
  await writeRecords(records);
  return made;
}

export async function deleteProducts(ids) {
  const records = await readRecords();
  const kept = records.filter((r) => !ids.includes(r.id));
  await writeRecords(kept);
  return records.length - kept.length;
}

export async function setProductStatus(ids, status) {
  if (!["active", "draft"].includes(status)) return 0;
  const records = await readRecords();
  let changed = 0;
  for (const r of records) if (ids.includes(r.id) && r.status !== status) (r.status = status), changed++;
  await writeRecords(records);
  return changed;
}

// New product from Admin → Add New Product (already validated). Newest products go first.
// Returns the saved record.
export async function createProduct(record) {
  const records = await readRecords();
  let id = slugify(record.name);
  for (let k = 2; records.some((r) => r.id === id); k++) id = `${slugify(record.name)}-${k}`;
  const saved = { ...record, id, sku: record.sku || nextSku(record.name, records), createdAt: new Date().toISOString() };
  records.unshift(saved);
  await writeRecords(records);
  return saved;
}

// Raw records, for validation (e.g. checking a SKU isn't taken).
export async function listRecords() {
  return readRecords();
}

// Saves an edited product (already validated). id, SKU history, date added and any shop
// extras (deal %, accessory model…) are kept. Returns the saved record, or null if it's gone.
export async function updateProduct(id, changes) {
  const records = await readRecords();
  const i = records.findIndex((r) => r.id === id);
  if (i < 0) return null;
  records[i] = { ...records[i], ...changes, id, createdAt: records[i].createdAt, sku: changes.sku || records[i].sku, updatedAt: new Date().toISOString() };
  await writeRecords(records);
  return records[i];
}
