import Link from "next/link";
import { resolveCategoryLabels, slugify } from "@/data/categories";
import { getCategoryTree, toMenu } from "@/lib/catalog/categories";
import { getProducts } from "@/lib/catalog/store";
import ProductListing from "@/components/shop/ProductListing";

// Work out which filters to pre-select from the URL.
function initialFilters(segments, products, categories) {
  // Ignore the top-level menu category (e.g. "phones-and-tablets" would otherwise
  // match both "phone" and "tablet"); decide from the group/item segments instead.
  const isMenuCategory = categories.some((c) => slugify(c.name) === segments[0]);
  const path = (isMenuCategory ? segments.slice(1) : segments).join("/");
  const brands = [...new Set(products.map((p) => p.brand))].filter((b) =>
    segments.some((s) => s === slugify(b) || slugify(b).startsWith(s + "-") || s.startsWith(slugify(b)))
  );

  let category = null;
  if (/accessor|airpod|watch|pencil|case|charger|bud|adapter|batter|power-bank|screen-protector/.test(path)) {
    category = "Accessories";
  } else if (/tablet|ipad/.test(path)) {
    category = "Tablets";
  } else if (/phone|iphone|android|pixel|samsung|smartphone|xiaomi|tecno|itel|top-brands/.test(path)) {
    category = "Phones";
  }
  return { category, brands };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const labels = resolveCategoryLabels(slug, toMenu(await getCategoryTree()));
  return { title: labels.at(-1) ?? "Shop" };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const menu = toMenu(await getCategoryTree());
  const labels = resolveCategoryLabels(slug, menu);
  const products = await getProducts();
  const { category, brands } = initialFilters(slug, products, menu);

  const crumbs = [
    { label: "Home", href: "/" },
    ...labels.map((label, i) => ({
      label,
      href: `/categories/${slug.slice(0, i + 1).join("/")}`,
    })),
  ];

  return (
    <div className="min-h-[85vh] bg-[#f4f4f6] px-4 pt-6 pb-16 text-ink sm:px-8 lg:px-12 xl:px-16">
      <nav aria-label="Breadcrumb" className="mb-6 lg:mb-4 lg:ml-70 xl:ml-72">
        <ol className="flex flex-wrap items-center gap-1.5 text-xs">
          {crumbs.map((c, i) => {
            const last = i === crumbs.length - 1;
            return (
              <li key={c.href} className="flex items-center gap-1.5">
                {last ? (
                  <span aria-current="page" className="text-neutral-500">
                    {c.label}
                  </span>
                ) : (
                  <>
                    <Link href={c.href} className="text-brand hover:underline">
                      {c.label}
                    </Link>
                    <span aria-hidden className="text-neutral-400">
                      ›
                    </span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* key resets the filters when navigating between category URLs */}
      <ProductListing key={slug.join("/")} products={products} initialCategory={category} initialBrands={brands} />
    </div>
  );
}
