"use server";

import { revalidatePath } from "next/cache";
import { adminWith } from "@/lib/admin/auth";
import { addMainCategory, addSubcategories, addSubSubcategories, getCategoryTree } from "./categories";

// "Create New Category" wizard. Each step returns the updated tree so the dropdowns refresh.
async function done(result) {
  if (result.error) return result;
  revalidatePath("/", "layout"); // shop menu + admin pages
  return { ...result, tree: await getCategoryTree() };
}

export async function createMainCategoryAction(name) {
  if (!(await adminWith("products"))) return { error: "Please sign in again." };
  return done(await addMainCategory(name));
}

export async function createSubcategoriesAction(parentId, names) {
  if (!(await adminWith("products"))) return { error: "Please sign in again." };
  return done(await addSubcategories(parentId, names));
}

export async function createSubSubcategoriesAction(parentId, subId, names) {
  if (!(await adminWith("products"))) return { error: "Please sign in again." };
  return done(await addSubSubcategories(parentId, subId, names));
}
