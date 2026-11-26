import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { getProduct } from "@/lib/catalog/store";
import { productInfo } from "@/lib/catalog/info";
import ProductDetailView from "@/components/admin/ProductDetailView";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const p = await getProduct(id, { includeDrafts: true });
  return { title: p ? p.name : "Product" };
}

const NOTICES = { saved: "Changes saved.", copied: "This is the copy (a draft). Edit it, then publish it from the list." };

// Admin → Product Management → Product Information.
export default async function AdminProductPage({ params, searchParams }) {
  await requireAdmin("products");
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const product = await getProduct(id, { includeDrafts: true });
  if (!product) notFound();
  const info = productInfo(product);

  // Every photo (all colours), main photo first, no repeats.
  const seen = new Set();
  const images = [{ src: product.image, color: product.color }, ...info.variants.flatMap((v) => v.images.map((src) => ({ src, color: v.color })))]
    .filter((img) => img.src && !seen.has(img.src) && seen.add(img.src));

  return (
    <ProductDetailView
      notice={NOTICES[sp.notice] ?? null}
      product={{
        id: product.id,
        name: product.name,
        sku: product.sku,
        brand: product.brand,
        price: product.price,
        oldPrice: product.oldPrice ?? null,
        stock: typeof product.stock === "number" ? product.stock : null,
        status: product.status,
        categoryPath: product.categoryPath ?? [],
        colors: product.colors,
        description: info.description,
        specs: info.specs,
        images,
      }}
    />
  );
}
