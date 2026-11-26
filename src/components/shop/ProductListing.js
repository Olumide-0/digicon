"use client";

import { useMemo, useState } from "react";
import { productCategories } from "@/data/products";
import ProductCard from "./ProductCard";
import { ChevronDownIcon } from "../icons";
import { Divider, FilterSection, Option, toggle } from "./filters";

export default function ProductListing({ products, initialCategory = null, initialBrands = [] }) {
  const [category, setCategory] = useState(initialCategory);
  const [brands, setBrands] = useState(initialBrands);
  const [colors, setColors] = useState([]);
  const [priceDraft, setPriceDraft] = useState({ min: "", max: "" });
  const [price, setPrice] = useState({ min: null, max: null });
  const [showFilters, setShowFilters] = useState(false);

  // Only offer brands/colours that exist in the current category.
  const pool = useMemo(
    () => (category ? products.filter((p) => p.category === category) : products),
    [category, products]
  );
  const brandOptions = useMemo(() => [...new Set(pool.map((p) => p.brand))].sort(), [pool]);
  const colorOptions = useMemo(() => [...new Set(pool.map((p) => p.color))].sort(), [pool]);

  const results = pool.filter(
    (p) =>
      (brands.length === 0 || brands.includes(p.brand)) &&
      (colors.length === 0 || colors.includes(p.color)) &&
      (price.min == null || p.price >= price.min) &&
      (price.max == null || p.price <= price.max)
  );

  const activeCount =
    (category ? 1 : 0) + brands.length + colors.length + (price.min != null || price.max != null ? 1 : 0);

  const applyPrice = (e) => {
    e.preventDefault();
    const n = (v) => (v === "" ? null : Math.max(0, Number(v)));
    setPrice({ min: n(priceDraft.min), max: n(priceDraft.max) });
  };

  const clearAll = () => {
    setCategory(null);
    setBrands([]);
    setColors([]);
    setPriceDraft({ min: "", max: "" });
    setPrice({ min: null, max: null });
  };

  const title = category === "Tablets" ? "Tablet" : category === "Accessories" ? "Accessory" : category ? "Phone" : "All";

  return (
    <div className="grid gap-6 lg:grid-cols-[16rem_1fr] xl:gap-8">
      {/* Mobile filter toggle */}
      <button
        type="button"
        onClick={() => setShowFilters((s) => !s)}
        aria-expanded={showFilters}
        className="flex items-center justify-between rounded-xl bg-white px-5 py-3 text-sm font-semibold text-brand lg:hidden"
      >
        Filter By{activeCount > 0 && ` (${activeCount})`}
        <ChevronDownIcon className={`size-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
      </button>

      {/* Sidebar */}
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

        <FilterSection title="Phones and tablets">
          {productCategories.map((c) => (
            <Option
              key={c}
              type="radio"
              name="category"
              label={c}
              checked={category === c}
              onChange={() => {
                setCategory(c);
                setBrands([]);
                setColors([]);
              }}
            />
          ))}
        </FilterSection>

        <Divider />

        <form onSubmit={applyPrice}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-ink">Price (₦)</span>
            <button
              type="submit"
              className="rounded-md bg-brand px-3 py-1 text-xs font-semibold text-white transition hover:bg-brand-hover"
            >
              Apply
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              min="0"
              placeholder="Min"
              aria-label="Minimum price"
              value={priceDraft.min}
              onChange={(e) => setPriceDraft((d) => ({ ...d, min: e.target.value }))}
              className="h-9 w-full min-w-0 rounded-md border border-neutral-300 px-3 text-sm text-ink outline-none focus:border-brand"
            />
            <span className="text-neutral-400">–</span>
            <input
              type="number"
              inputMode="numeric"
              min="0"
              placeholder="Max"
              aria-label="Maximum price"
              value={priceDraft.max}
              onChange={(e) => setPriceDraft((d) => ({ ...d, max: e.target.value }))}
              className="h-9 w-full min-w-0 rounded-md border border-neutral-300 px-3 text-sm text-ink outline-none focus:border-brand"
            />
          </div>
        </form>

        <Divider />

        <FilterSection title="Brands">
          {brandOptions.map((b) => (
            <Option
              key={b}
              type="checkbox"
              label={b}
              checked={brands.includes(b)}
              onChange={() => setBrands((l) => toggle(l, b))}
            />
          ))}
        </FilterSection>

        <Divider />

        <FilterSection title="Colors">
          {colorOptions.map((c) => (
            <Option
              key={c}
              type="checkbox"
              label={c}
              checked={colors.includes(c)}
              onChange={() => setColors((l) => toggle(l, c))}
            />
          ))}
        </FilterSection>
      </aside>

      {/* Results */}
      <section aria-labelledby="listing-title" className="min-w-0">
        <h1 id="listing-title" className="text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem]">
          {title} Collections
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-500">
          We&apos;re showcasing African digital innovation across multiple industries, providing
          resources to help teams build products that truly resonate with their users.
        </p>
        <p className="mt-4 text-xs text-neutral-500" aria-live="polite">
          {results.length} {results.length === 1 ? "product" : "products"}
        </p>

        {results.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-xl bg-white px-6 py-16 text-center">
            <p className="font-semibold text-ink">No products match these filters.</p>
            <button type="button" onClick={clearAll} className="mt-3 text-sm font-semibold text-brand hover:underline">
              Clear all filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
