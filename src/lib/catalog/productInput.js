// Checks the "Add New Product" form on the server and turns it into a store record.
// Never trust the browser: every field is re-validated here.
import { slugify } from "@/data/categories";
import { IMAGE_URL_RE } from "./images";

export const LIMITS = {
  name: 120,
  brand: 60,
  colorName: 40,
  description: 2000,
  price: 100_000_000,
  images: 8,
  specGroups: 20,
  specRows: 30,
  specText: 200,
  specValue: 1000,
  stock: 100_000,
  sku: 30,
  warranty: 80,
  sizeWeight: 120,
};

const text = (v, max) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max + 1);
const longText = (v, max) => String(v ?? "").replace(/\r\n/g, "\n").trim().slice(0, max + 1);

// Which shop section (used by the shop's filters) a category path belongs to.
export function shopCategory(path) {
  const s = path.join(" ").toLowerCase();
  if (/tablet|ipad/.test(s)) return "Tablets";
  if (/accessor|case|cover|charger|adapter|cable|airpods|buds|earbud|headphone|watch|band|pencil|power ?bank|screen protector|batter/.test(s)) return "Accessories";
  if (/phone/.test(s)) return "Phones";
  return path[0];
}

// input: plain object from the form. tree: category tree. existing: current records.
// current (when editing): the product being edited — its own SKU and photos are allowed.
// Returns { record } or { errors: { field: message }, step }.
export function validateProduct(input, tree, existing, current = null) {
  const errors = {};
  const step = {}; // which form step each field is on
  const fail = (field, message, s) => {
    if (!errors[field]) {
      errors[field] = message;
      step[field] = s;
    }
  };

  // Step 1
  const name = text(input.name, LIMITS.name);
  if (!name) fail("name", "Enter the product name", 1);
  else if (name.length > LIMITS.name) fail("name", `Keep the name under ${LIMITS.name} characters`, 1);
  else if (!slugify(name)) fail("name", "The name needs at least one letter or number", 1);

  const brand = text(input.brand, LIMITS.brand);
  if (brand.length > LIMITS.brand) fail("brand", `Keep the brand under ${LIMITS.brand} characters`, 1);

  let color = null;
  if (input.color) {
    const colorName = text(input.color.name, LIMITS.colorName);
    const hex = String(input.color.hex ?? "").toLowerCase();
    if (!colorName || colorName.length > LIMITS.colorName || !/^#[0-9a-f]{6}$/.test(hex)) fail("color", "Choose the colour again", 1);
    else color = { name: colorName, hex };
  }

  const description = longText(input.description, LIMITS.description);
  if (description.length > LIMITS.description) fail("description", `Keep the description under ${LIMITS.description} characters`, 1);

  const price = Number(String(input.price ?? "").replace(/[,\s₦]/g, ""));
  if (!String(input.price ?? "").trim()) fail("price", "Enter the price", 1);
  else if (!Number.isFinite(price) || price <= 0) fail("price", "Enter a price above ₦0", 1);
  else if (price > LIMITS.price) fail("price", "That price looks too high", 1);

  const main = tree.find((c) => c.id === input.categoryId);
  const sub = main?.children.find((s) => s.id === input.subcategoryId);
  const subsub = sub?.children.find((x) => x.id === input.subSubcategoryId);
  if (!main) fail("categoryId", "Choose a category", 1);
  else if (input.subcategoryId && !sub) fail("subcategoryId", "Choose the sub-category again", 1);
  else if (input.subSubcategoryId && !subsub) fail("subSubcategoryId", "Choose the sub-subcategory again", 1);

  const ownImages = new Set(current?.ownImages ?? []);
  const images = Array.isArray(input.images) ? input.images.filter((u) => typeof u === "string" && (IMAGE_URL_RE.test(u) || ownImages.has(u))) : [];
  if (!images.length) fail("images", "Upload at least one photo of the product", 1);
  else if (images.length > LIMITS.images) fail("images", `Up to ${LIMITS.images} photos`, 1);

  // Step 2: { Group: { Type: Value } }. Empty rows are ignored; half-filled ones are errors.
  const specs = {};
  const groups = Array.isArray(input.specs) ? input.specs.slice(0, LIMITS.specGroups) : [];
  groups.forEach((g, gi) => {
    const title = text(g?.name, LIMITS.specText);
    const rows = (Array.isArray(g?.rows) ? g.rows : []).slice(0, LIMITS.specRows).map((r) => ({ type: text(r?.type, LIMITS.specText), value: longText(r?.value, LIMITS.specValue) }));
    const filled = rows.filter((r) => r.type || r.value);
    if (!title && !filled.length) return;
    if (!title) return fail(`spec-${gi}-name`, "Name this specification (e.g. Display)", 2);
    if (specs[title]) return fail(`spec-${gi}-name`, `“${title}” is already used above`, 2);
    if (!filled.length) return fail(`spec-${gi}-row-0-type`, "Add at least one type and value", 2);
    const out = {};
    rows.forEach((r, ri) => {
      if (!r.type && !r.value) return;
      if (!r.type) return fail(`spec-${gi}-row-${ri}-type`, "Enter the specification type", 2);
      if (!r.value) return fail(`spec-${gi}-row-${ri}-value`, "Enter the value", 2);
      out[r.type] = r.value.includes("\n") ? r.value.split("\n").map((l) => l.trim()) : r.value;
    });
    specs[title] = out;
  });

  // Step 3
  const stockRaw = String(input.stock ?? "").trim();
  const stock = Number(stockRaw);
  if (!stockRaw) fail("stock", "Enter how many you have in stock", 3);
  else if (!Number.isInteger(stock) || stock < 0 || stock > LIMITS.stock) fail("stock", "Enter a whole number, 0 or more", 3);

  const sku = text(input.sku, LIMITS.sku).toUpperCase();
  if (sku && !/^[A-Z0-9][A-Z0-9_-]*$/.test(sku)) fail("sku", "Use letters, numbers, - or _ only", 3);
  else if (sku.length > LIMITS.sku) fail("sku", `Keep the SKU under ${LIMITS.sku} characters`, 3);
  else if (sku && existing.some((r) => r.sku === sku && r.id !== current?.id)) fail("sku", `Another product already uses ${sku}`, 3);

  const status = input.visibility === "draft" ? "draft" : input.visibility === "active" ? "active" : null;
  if (!status) fail("visibility", "Choose Visible or Hidden", 3);

  const warranty = text(input.warranty, LIMITS.warranty);
  if (warranty.length > LIMITS.warranty) fail("warranty", `Keep this under ${LIMITS.warranty} characters`, 3);
  const sizeWeight = text(input.sizeWeight, LIMITS.sizeWeight);
  if (sizeWeight.length > LIMITS.sizeWeight) fail("sizeWeight", `Keep this under ${LIMITS.sizeWeight} characters`, 3);

  if (Object.keys(errors).length) return { errors, step: Math.min(...Object.values(step)) };

  const categoryPath = [main.name, sub?.name, subsub?.name].filter(Boolean);
  // Short line under the name on product cards: the first two spec values, else the brand/category.
  const firstValues = Object.values(specs)
    .flatMap((rows) => Object.values(rows))
    .map((v) => (Array.isArray(v) ? v.find(Boolean) : v))
    .slice(0, 2);
  const general = Object.fromEntries([["Brand", brand], ["Warranty", warranty], ["Size/Weight", sizeWeight]].filter(([, v]) => v));
  const colorName = color?.name ?? "Default";

  return {
    record: {
      name,
      brand: brand || "Digicon",
      color: colorName,
      category: shopCategory(categoryPath),
      categoryPath,
      categoryIds: [main.id, sub?.id, subsub?.id].filter(Boolean),
      spec: firstValues.length ? firstValues.join(" • ") : categoryPath.at(-1),
      description,
      price: Math.round(price),
      stock,
      sku,
      status,
      warranty,
      sizeWeight,
      image: images[0],
      variants: [{ color: colorName, ...(color && { hex: color.hex }), images }],
      specs: Object.keys(general).length ? { ...specs, General: { ...(specs.General ?? {}), ...general } } : specs,
      source: "admin",
    },
  };
}
