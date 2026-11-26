import { requireAdmin } from "@/lib/admin/auth";
import { getCategoryTree } from "@/lib/catalog/categories";
import { colourPresets } from "@/lib/catalog/colours";
import ProductForm from "@/components/admin/ProductForm";

export const metadata = { title: "Add New Product" };

export default async function AddProductPage() {
  await requireAdmin("products");
  return <ProductForm tree={await getCategoryTree()} presets={colourPresets()} />;
}
