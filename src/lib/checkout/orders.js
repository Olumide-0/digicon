// Order store (server only).
//
// ⚠️ DEVELOPMENT STORE: orders are saved to .data/orders.json on this machine — fine for testing,
// but NOT on serverless hosting. Before launch, replace saveOrder/findOrder with your database.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";

const FILE = path.join(process.cwd(), ".data", "orders.json");

async function readAll() {
  try {
    return JSON.parse(await readFile(FILE, "utf8"));
  } catch (err) {
    if (err.code === "ENOENT") return [];
    throw err;
  }
}

export async function saveOrder(order) {
  const all = await readAll();
  const record = { id: `DGC-${randomBytes(4).toString("hex").toUpperCase()}`, createdAt: new Date().toISOString(), ...order };
  all.push(record);
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify(all, null, 2));
  return record;
}

export async function findOrder(id) {
  return (await readAll()).find((o) => o.id === id) ?? null;
}

// Newest first.
export async function findOrdersByUser(userId) {
  return (await readAll()).filter((o) => o.userId === userId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// Every order, newest first (admin).
export async function listOrders() {
  return (await readAll()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
