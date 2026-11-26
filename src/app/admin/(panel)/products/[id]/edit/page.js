import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { getProduct } from "@/lib/catalog/store";
import { getCategoryTree } from "@/lib/catalog/categories";
import { productInfo } from "@/lib/catalog/info";
import { slugify } from "@/data/categories";
import { colorHex } from "@/data/productDetails";
import { colorFamily } from "@/data/products";
import ProductForm from "@/components/admin/ProductForm";
import { colourPresets } from "@/lib/catalog/colours";

export const metadata = { title: "Edit Product" };

// Find a category by name, forgiving small differences ("Mobile Phones" ≈ "Mobile phone").
const loose = (s) => slugify(s ?? "").replace(/s$/, "");
const findByName = (list, name) => (name ? list?.find((c) => loose(c.name) === loose(name)) : undefined);

const AUTO_GENERAL = ["Brand", "Warranty", "Size/Weight"]; // filled from their own fields

export default async function EditProductPage({ params }) {
  await requireAdmin("products");
  const { id } = await params;
  const [product, tree] = await Promise.all([getProduct(id, { includeDrafts: true }), getCategoryTree()]);
  if (!product) notFound();
  const info = productInfo(product);

  const [mainName, subName, subSubName] = product.categoryPath ?? [];
  const main = findByName(tree, mainName);
  const sub = findByName(main?.children, subName);
  const subSub = findByName(sub?.children, subSubName);

  const mainVariant = info.variants.find((v) => v.color === product.color) ?? info.variants[0];
  const hex = mainVariant?.hex ?? colorHex[colorFamily(product.color)] ?? "#9ca3af";

  const specs = Object.entries(info.specs)
    .map(([name, rows]) => ({
      name,
      rows: Object.entries(rows)
        .filter(([type]) => !(name === "General" && AUTO_GENERAL.includes(type)))
        .map(([type, value]) => ({ type, value: Array.isArray(value) ? value.join("\n") : String(value) })),
    }))
    .filter((g) => g.rows.length);

  const basePrice = product.oldPrice ?? product.price;
  return (
    <ProductForm
      tree={tree}
      presets={colourPresets()}
      productId={product.id}
      productName={product.name}
      initial={{
        values: {
          name: product.name,
          brand: product.brand ?? "",
          description: info.description,
          price: basePrice.toLocaleString("en-NG"),
          categoryId: main?.id ?? "",
          subcategoryId: sub?.id ?? "",
          subSubcategoryId: subSub?.id ?? "",
          stock: typeof product.stock === "number" ? String(product.stock) : "",
          sku: product.sku ?? "",
          visibility: product.status,
          warranty: product.warranty ?? "",
          sizeWeight: product.sizeWeight ?? "",
        },
        color: { name: product.color, hex },
        images: mainVariant?.images?.length ? mainVariant.images : [product.image],
        specs,
      }}
    />
  );
}
