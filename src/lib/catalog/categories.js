// Category store (server only): main category → subcategory → sub-subcategory.
// The shop's mega menu and the admin "Create New Category" wizard both use it.
//
// ⚠️ DEVELOPMENT STORE: saved to .data/categories.json. Swap for a database before launch.
// The first time it runs it is filled from the menu in src/data/categories.js.
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { categories as seedMenu, slugify } from "@/data/categories";

const FILE = path.join(process.cwd(), ".data", "categories.json");
const COLUMNS = 3; // the mega menu shows subcategories in 3 columns
export const NAME_MAX = 60;

// Tree: [{ id, name, slug, children: [{ id, name, slug, column, children: [{ id, name, slug }] }] }]
function seed() {
  return seedMenu.map((c) => ({
    id: randomUUID(),
    name: c.name,
    slug: slugify(c.name),
    children: c.columns.flatMap((groups, column) =>
      groups.map((g) => ({
        id: randomUUID(),
        name: g.title,
        slug: slugify(g.title),
        column,
        children: g.items.map((item) => ({ id: randomUUID(), name: item, slug: slugify(item) })),
      }))
    ),
  }));
}

export async function getCategoryTree() {
  try {
    return JSON.parse(await readFile(FILE, "utf8")).categories;
  } catch (err) {
    if (err.code !== "ENOENT") throw err;
    const tree = seed();
    await save(tree);
    return tree;
  }
}

async function save(tree) {
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify({ version: 1, categories: tree }, null, 2));
}

// Same shape as src/data/categories.js, for the navbar / mega menu. Main categories with
// nothing under them yet are left out of the shop menu.
export function toMenu(tree) {
  return tree
    .filter((c) => c.children.length)
    .map((c) => ({
      name: c.name,
      columns: Array.from({ length: COLUMNS }, (_, col) =>
        c.children.filter((s) => (s.column ?? 0) === col).map((s) => ({ title: s.name, items: s.children.map((x) => x.name) }))
      ),
    }));
}

export const countCategories = (tree) => tree.reduce((n, c) => n + 1 + c.children.reduce((m, s) => m + 1 + s.children.length, 0), 0);

// ── Adding ───────────────────────────────────────────────────────────────────
const clean = (name) => String(name ?? "").replace(/\s+/g, " ").trim();
const taken = (list, name) => list.some((x) => x.slug === slugify(name));

// Validates a batch of names against their siblings. Returns { names } or { error }.
function checkNames(raw, siblings, what) {
  const names = [];
  for (const r of Array.isArray(raw) ? raw : [raw]) {
    const name = clean(r);
    if (!name) continue;
    if (name.length > NAME_MAX) return { error: `“${name.slice(0, 20)}…” is too long (max ${NAME_MAX} characters).` };
    if (!slugify(name)) return { error: `“${name}” needs at least one letter or number.` };
    if (taken(siblings, name) || names.some((n) => slugify(n) === slugify(name))) return { error: `${what} “${name}” already exists here.` };
    names.push(name);
  }
  if (!names.length) return { error: `Enter a ${what.toLowerCase()} name.` };
  return { names };
}

export async function addMainCategory(name) {
  const tree = await getCategoryTree();
  const { names, error } = checkNames(name, tree, "Category");
  if (error) return { error };
  const node = { id: randomUUID(), name: names[0], slug: slugify(names[0]), children: [] };
  tree.push(node);
  await save(tree);
  return { id: node.id };
}

export async function addSubcategories(parentId, rawNames) {
  const tree = await getCategoryTree();
  const parent = tree.find((c) => c.id === parentId);
  if (!parent) return { error: "Choose a parent category." };
  const { names, error } = checkNames(rawNames, parent.children, "Subcategory");
  if (error) return { error };
  const ids = [];
  for (const name of names) {
    // New subcategories go into the menu column with the fewest links.
    const load = Array.from({ length: COLUMNS }, (_, col) =>
      parent.children.filter((s) => (s.column ?? 0) === col).reduce((n, s) => n + 1 + s.children.length, 0)
    );
    const node = { id: randomUUID(), name, slug: slugify(name), column: load.indexOf(Math.min(...load)), children: [] };
    parent.children.push(node);
    ids.push(node.id);
  }
  await save(tree);
  return { ids };
}

export async function addSubSubcategories(parentId, subId, rawNames) {
  const tree = await getCategoryTree();
  const sub = tree.find((c) => c.id === parentId)?.children.find((s) => s.id === subId);
  if (!sub) return { error: "Choose a subcategory." };
  const { names, error } = checkNames(rawNames, sub.children, "Sub-subcategory");
  if (error) return { error };
  for (const name of names) sub.children.push({ id: randomUUID(), name, slug: slugify(name) });
  await save(tree);
  return { count: names.length };
}
