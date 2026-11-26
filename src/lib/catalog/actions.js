"use server";

import { revalidatePath } from "next/cache";
import { adminWith } from "@/lib/admin/auth";
import { createProduct, deleteProducts, duplicateProducts, listAllProducts, listRecords, setProductStatus, updateProduct } from "./store";
import { productInfo } from "./info";
import { getCategoryTree } from "./categories";
import { saveProductImage } from "./images";
import { validateProduct } from "./productInput";

// Admin product actions. Each one re-checks that the caller is a signed-in admin.
async function guard(ids) {
  if (!(await adminWith("products"))) return { error: "Please sign in again." };
  const known = new Set((await listAllProducts()).map((p) => p.id));
  const list = [...new Set((Array.isArray(ids) ? ids : []).filter((id) => typeof id === "string" && known.has(id)))];
  if (!list.length) return { error: "Select at least one product." };
  return { list };
}

const refresh = () => revalidatePath("/admin", "layout");

export async function duplicateProductsAction(ids) {
  const { list, error } = await guard(ids);
  if (error) return { error };
  const made = await duplicateProducts(list);
  refresh();
  return { message: `${made.length} ${made.length === 1 ? "copy" : "copies"} added as draft${made.length === 1 ? "" : "s"}.`, made };
}

export async function deleteProductsAction(ids) {
  const { list, error } = await guard(ids);
  if (error) return { error };
  const n = await deleteProducts(list);
  refresh();
  return { message: `${n} ${n === 1 ? "product" : "products"} deleted.` };
}

export async function setProductStatusAction(ids, status) {
  const { list, error } = await guard(ids);
  if (error) return { error };
  await setProductStatus(list, status);
  refresh();
  return { message: status === "active" ? "Published — now visible in the shop." : "Moved to drafts — hidden from the shop." };
}

// ── Add New Product ──────────────────────────────────────────────────────────
// Photos upload one at a time as soon as they're chosen; the form keeps their URLs.
export async function uploadProductImageAction(formData) {
  if (!(await adminWith("products"))) return { error: "Please sign in again." };
  return saveProductImage(formData.get("file"));
}

export async function createProductAction(input) {
  if (!(await adminWith("products"))) return { errors: { form: "Please sign in again." }, step: 1 };
  const [tree, records] = await Promise.all([getCategoryTree(), listRecords()]);
  const result = validateProduct(input ?? {}, tree, records);
  if (result.errors) return result;
  const saved = await createProduct(result.record);
  revalidatePath("/", "layout");
  return { id: saved.id, name: saved.name, status: saved.status };
}

// Edit Product. The edited colour replaces the product's main colour; any other colours
// (sample products often have several) are kept as they were.
export async function updateProductAction(id, input) {
  if (!(await adminWith("products"))) return { errors: { form: "Please sign in again." }, step: 1 };
  const [tree, records, products] = await Promise.all([getCategoryTree(), listRecords(), listAllProducts()]);
  const current = records.find((r) => r.id === id);
  const product = products.find((p) => p.id === id);
  if (!current || !product) return { errors: { form: "This product no longer exists." }, step: 1 };
  const info = productInfo(product);
  const result = validateProduct(input ?? {}, tree, records, { id, ownImages: info.variants.flatMap((v) => v.images) });
  if (result.errors) return result;
  const record = result.record;
  const others = info.variants.filter((v) => v.color !== current.color && v.color !== record.variants[0].color);
  record.variants = [record.variants[0], ...others];
  // The sample catalogue's short spec line (e.g. "6.1″ Super Retina XDR • 128GB") is kept.
  if (current.source !== "admin" && current.spec) record.spec = current.spec;
  const saved = await updateProduct(id, record);
  revalidatePath("/", "layout");
  return { id: saved.id };
}
