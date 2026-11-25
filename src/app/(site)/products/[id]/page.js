import Link from "next/link";
import { notFound } from "next/navigation";
import { products } from "@/data/products";
import { productDetails } from "@/data/productDetails";
import ProductHero from "@/components/shop/ProductHero";
import ProductSpecs from "@/components/shop/ProductSpecs";
import ProductCard from "@/components/shop/ProductCard";

const root = { label: "Phone and Tablets", href: "/categories/phones-and-tablets" };
const breadcrumbTrail = {
  Phones: [
    root,
    { label: "Mobile Phones", href: "/categories/phones-and-tablets/mobile-phone" },
    { label: "Smartphones", href: "/categories/phones-and-tablets/top-smartphones/smartphones" },
  ],
  Tablets: [root, { label: "Tablets", href: "/categories/phones-and-tablets/tablets" }],
  Accessories: [root, { label: "Accessories", href: "/categories/phones-and-tablets/accessories" }],
};

// "₦ 880,000" style used on the product page.
const formatPrice = (n) => `₦ ${n.toLocaleString("en-NG")}`;

function stockLabel(stock, inStock) {
  if (stock === 0 || inStock === false) return { text: "Out of stock", low: true };
  if (typeof stock === "number" && stock <= 10)
    return { text: `${stock} ${stock === 1 ? "unit" : "units"} left`, low: true };
  return { text: "In stock", low: false };
}

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5 text-neutral-700" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

const findProduct = (id) => products.find((p) => p.id === id);

// Prerender every product page at build time.
export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const p = findProduct(id);
  return p ? { title: p.name, description: `${p.name} — ${p.spec}` } : {};
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = findProduct(id);
  if (!product) notFound();

  const details = productDetails[id] ?? {};
  // Each colour has its own photos; fall back to the product's main photo.
  const variants = details.variants ?? [{ color: product.color, images: [product.image] }];
  const stock = stockLabel(product.stock, product.inStock);
  const available = stock.text !== "Out of stock";

  // Same category first, then anything else, up to 6.
  const related = [
    ...products.filter((p) => p.category === product.category && p.id !== id),
    ...products.filter((p) => p.category !== product.category),
  ].slice(0, 6);

  return (
    <div className="bg-white px-4 pt-6 pb-16 text-ink sm:px-8 sm:pt-10 lg:px-12 xl:px-16">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[10px] sm:gap-x-3 sm:text-xs">
          {[{ label: "Home", href: "/" }, ...breadcrumbTrail[product.category]].map((c) => (
            <li key={c.href} className="flex items-center gap-1.5 sm:gap-3">
              <Link href={c.href} className="text-brand hover:underline">
                {c.label}
              </Link>
              <Chevron />
            </li>
          ))}
          <li aria-current="page" className="text-neutral-700">
            {product.name}
          </li>
        </ol>
      </nav>

      {/* Top: gallery + purchase panel (colour swatches swap the photos) */}
      <ProductHero
        id={product.id}
        name={product.name}
        spec={product.spec}
        priceLabel={formatPrice(product.price)}
        oldPriceLabel={product.oldPrice ? formatPrice(product.oldPrice) : undefined}
        discount={product.deal}
        stock={stock}
        available={available}
        maxQty={typeof product.stock === "number" ? Math.max(1, product.stock) : 10}
        description={details.description ?? `${product.name} — ${product.spec}.`}
        variants={variants}
        initialColor={product.color}
      />

      {/* Specifications */}
      <div className="mt-14">
        <ProductSpecs specs={details.specs} />
      </div>

      {/* Related */}
      <section aria-labelledby="related-title" className="mt-16">
        <h2 id="related-title" className="text-center text-xl font-semibold tracking-tight sm:text-2xl">
          Gadgets you Might Like
        </h2>
        <div className="mx-auto mt-8 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((p) => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
      </section>
    </div>
  );
}
