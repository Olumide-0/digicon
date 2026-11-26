"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { productCategories } from "@/data/products";
import { collections } from "@/data/collections";
import ProductCard from "./ProductCard";
import { ChevronDownIcon } from "../icons";
import { Divider, FilterSection, Option, Pagination, PriceFilter, toggle } from "./filters";

// A product can fit several models (e.g. one case for Pixel 9, 9 Pro and 9 Pro XL).
const fits = (p, model) => [].concat(p.model ?? []).includes(model);

const PAGE_SIZE = 15;
const STORAGE_ORDER = ["64GB", "128GB", "256GB", "512GB", "1TB", "2TB"];
const COLOR_ORDER = ["Black", "White", "Starlight", "Blue", "Green", "Pink", "Purple", "Red", "Orange", "Yellow", "Gold", "Silver", "Space Gray", "Brown"];
const byOrder = (order) => (a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99);

// Brand shop / deals page: sidebar filters + 3-column grid + page numbers.
export default function CollectionListing({ collectionKey, products }) {
  const config = collections[collectionKey];
  const pool = useMemo(() => products.filter(config.match), [config, products]);

  const [category, setCategory] = useState(null);
  const [colors, setColors] = useState([]);
  const [storage, setStorage] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [price, setPrice] = useState({ min: null, max: null });
  const [page, setPage] = useState(1);
  const [priceKey, setPriceKey] = useState(0); // bumped by "Clear all" to reset the slider
  const [showFilters, setShowFilters] = useState(false);
  const topRef = useRef(null);

  // Any filter change goes back to page 1.
  const update = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const matches = (p, skip) =>
    (skip === "category" || !category || p.category === category) &&
    (skip === "colors" || !colors.length || p.colorFamilies.some((c) => colors.includes(c))) &&
    (skip === "storage" || !storage.length || p.storage.some((s) => storage.includes(s))) &&
    (skip === "brands" || !brands.length || brands.includes(p.brand)) &&
    (skip === "models" || !models.length || models.some((m) => fits(p, m))) &&
    (price.min == null || p.price >= price.min) &&
    (price.max == null || p.price <= price.max);

  // Top of the price slider: priciest product on this page, rounded up to the next ₦50,000.
  const priceCap = pool.length ? Math.ceil(Math.max(...pool.map((p) => p.price)) / 50000) * 50000 : 0;

  const results = pool.filter((p) => matches(p));
  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const shown = results.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  // Count for an option = products that would show if it were ticked (other filters kept).
  const countFor = (skip, test) => pool.filter((p) => matches(p, skip) && test(p)).length;
  const optionsFrom = (key, order) => [...new Set(pool.flatMap((p) => p[key]))].sort(byOrder(order));

  const activeCount =
    (category ? 1 : 0) + colors.length + storage.length + brands.length + models.length + (price.min != null || price.max != null ? 1 : 0);

  const clearAll = () => {
    setCategory(null);
    setColors([]);
    setStorage([]);
    setBrands([]);
    setModels([]);
    setPrice({ min: null, max: null });
    setPriceKey((k) => k + 1);
    setPage(1);
  };

  const goToPage = (p) => {
    setPage(p);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const renderFilter = (f, i) => {
    switch (f.type) {
      case "price":
        return <PriceFilter key={`${i}-${priceKey}`} max={priceCap} onApply={update(setPrice)} />;
      case "category":
        return (
          <FilterSection key={i} title="Category" collapsible={false}>
            {productCategories.map((c) => (
              <Option
                key={c}
                type="radio"
                name="category"
                label={c}
                checked={category === c}
                count={countFor("category", (p) => p.category === c)}
                onChange={() => update(setCategory)(c)}
              />
            ))}
          </FilterSection>
        );
      case "colors":
        return (
          <FilterSection key={i} title="Colors">
            {optionsFrom("colorFamilies", COLOR_ORDER).map((c) => (
              <Option key={c} type="checkbox" label={c} checked={colors.includes(c)} count={countFor("colors", (p) => p.colorFamilies.includes(c))} onChange={() => update(setColors)(toggle(colors, c))} />
            ))}
          </FilterSection>
        );
      case "storage":
        return (
          <FilterSection key={i} title="Storage">
            {optionsFrom("storage", STORAGE_ORDER).map((s) => (
              <Option key={s} type="checkbox" label={s.replace(/(\d)(GB|TB)/, "$1 $2")} checked={storage.includes(s)} count={countFor("storage", (p) => p.storage.includes(s))} onChange={() => update(setStorage)(toggle(storage, s))} />
            ))}
          </FilterSection>
        );
      case "brands":
        return (
          <FilterSection key={i} title="Brands">
            {[...new Set(pool.map((p) => p.brand))].sort().map((b) => (
              <Option key={b} type="checkbox" label={b} checked={brands.includes(b)} count={countFor("brands", (p) => p.brand === b)} onChange={() => update(setBrands)(toggle(brands, b))} />
            ))}
          </FilterSection>
        );
      case "models":
        return (
          <FilterSection key={i} title={f.title}>
            {f.options.map((m) => (
              <Option key={m} type="checkbox" label={m} checked={models.includes(m)} count={countFor("models", (p) => fits(p, m))} onChange={() => update(setModels)(toggle(models, m))} />
            ))}
          </FilterSection>
        );
      default:
        return null;
    }
  };

  return (
    <div ref={topRef} className="grid scroll-mt-24 grid-cols-1 gap-6 lg:grid-cols-[16rem_minmax(0,1fr)] xl:gap-8">
      <button
        type="button"
        onClick={() => setShowFilters((s) => !s)}
        aria-expanded={showFilters}
        className="flex items-center justify-between rounded-xl bg-white px-5 py-3 text-sm font-semibold text-brand lg:hidden"
      >
        Filter By{activeCount > 0 && ` (${activeCount})`}
        <ChevronDownIcon className={`size-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
      </button>

      <aside
        aria-label="Product filters"
        className={`${showFilters ? "block" : "hidden"} h-fit rounded-xl bg-white p-5 lg:sticky lg:top-24 lg:block`}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-brand">Filter By</h2>
          {activeCount > 0 && (
            <button type="button" onClick={clearAll} className="text-xs text-neutral-500 underline hover:text-ink">
              Clear all
            </button>
          )}
        </div>

        {config.switcher && (
          <>
            <div className="space-y-2.5">
              {config.switcher.map((s) => {
                const active = s.href === config.path;
                return (
                  <Link key={s.href} href={s.href} aria-current={active ? "page" : undefined} className="flex items-center gap-2.5 text-sm text-neutral-600 hover:text-ink">
                    <span className={`size-4 shrink-0 rounded-full border transition ${active ? "border-[5px] border-emerald-500" : "border-neutral-400"}`} aria-hidden />
                    {s.label}
                  </Link>
                );
              })}
            </div>
            <Divider />
          </>
        )}

        {config.filters.map((f, i) => (
          <div key={i}>
            {i > 0 && <Divider />}
            {renderFilter(f, i)}
          </div>
        ))}
      </aside>

      <section aria-labelledby="collection-title" className="min-w-0">
        <h1 id="collection-title" className="text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem]">
          {config.title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-500">{config.intro}</p>
        <p className="mt-4 text-xs text-neutral-500" aria-live="polite">
          {results.length} {results.length === 1 ? "product" : "products"}
          {pages > 1 && ` · page ${current} of ${pages}`}
        </p>

        {shown.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {shown.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-xl bg-white px-6 py-16 text-center">
            {pool.length === 0 ? (
              <>
                <p className="font-semibold text-ink">New stock is on the way.</p>
                <p className="mt-2 text-sm text-neutral-500">Check back soon, or browse our other products.</p>
                <Link href="/categories/phones-and-tablets" className="mt-4 inline-block text-sm font-semibold text-brand hover:underline">
                  Browse all products
                </Link>
              </>
            ) : (
              <>
                <p className="font-semibold text-ink">No products match these filters.</p>
                <button type="button" onClick={clearAll} className="mt-3 text-sm font-semibold text-brand hover:underline">
                  Clear all filters
                </button>
              </>
            )}
          </div>
        )}

        <Pagination page={current} pages={pages} onChange={goToPage} />
      </section>
    </div>
  );
}
