"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { deleteProductsAction, duplicateProductsAction } from "@/lib/catalog/actions";
import { ShopLink } from "./adminReturn";

const naira = (n) => `₦${Math.round(n).toLocaleString("en-NG")}`;
const GROUPS_PER_PAGE = 4;
const btn =
  "inline-flex h-9 items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 text-xs text-neutral-600 transition hover:border-ink hover:text-ink disabled:opacity-50";

const icons = {
  edit: "M20 13.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19V6a1.5 1.5 0 0 1 1.5-1.5H11M17.5 3.5l3 3L12 15l-4 1 1-4Z",
  copy: "M8.5 8.5h12v12h-12ZM15.5 5.5v-1a1 1 0 0 0-1-1h-10a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1",
  trash: "M4 7h16M10 11v6M14 11v6M6 7l1 12.5A1.5 1.5 0 0 0 8.5 21h7a1.5 1.5 0 0 0 1.5-1.5L18 7M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7",
};
const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
);

function Card({ title, children }) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-[0_1px_6px_rgba(0,0,0,0.04)] sm:p-6">
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-5">{children}</dl>
    </section>
  );
}
function Item({ label, children }) {
  return (
    <div className="min-w-0">
      <dt className="text-sm font-semibold text-ink">{label}</dt>
      <dd className="mt-1.5 text-sm break-words text-neutral-500">{children}</dd>
    </div>
  );
}

// Specifications tab: one card per group (Attribute), rows of Type / Type Name / Value.
function SpecTable({ specs }) {
  const groups = Object.entries(specs);
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(groups.length / GROUPS_PER_PAGE));
  const shown = groups.slice((page - 1) * GROUPS_PER_PAGE, page * GROUPS_PER_PAGE);
  if (!groups.length) return <p className="text-sm text-neutral-500">No specifications yet. Use Edit Product to add them.</p>;
  const pbtn = "grid h-6 min-w-6 place-items-center rounded-sm px-1.5 text-[11px] transition";
  return (
    <>
      <div className="overflow-x-auto">
        <div className="min-w-[36rem]">
          <div className="grid grid-cols-[1fr_0.8fr_1fr_2fr] gap-4 px-3 pb-3 text-xs font-semibold text-ink">
            <span>Attribute</span>
            <span>Type</span>
            <span>Type Name</span>
            <span>Value</span>
          </div>
          <div className="space-y-3">
            {shown.map(([group, rows]) => (
              <div key={group} className="rounded-lg border border-neutral-200 px-3 py-2">
                {Object.entries(rows).map(([label, value], i) => (
                  <div key={label} className="grid grid-cols-[1fr_0.8fr_1fr_2fr] gap-4 py-2.5 text-xs text-neutral-500">
                    <span className="font-medium text-neutral-600">{i === 0 ? group : ""}</span>
                    <span>{Array.isArray(value) ? "List" : "Text"}</span>
                    <span>{label}</span>
                    <span className="break-words text-neutral-700">
                      {Array.isArray(value) ? value.filter(Boolean).map((l, j) => <span key={j} className="block">{l}</span>) : value}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      {pages > 1 && (
        <nav aria-label="Specification pages" className="mt-5 flex items-center justify-end gap-1.5">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              aria-current={p === page ? "page" : undefined}
              className={`${pbtn} ${p === page ? "bg-brand font-semibold text-white" : "border border-neutral-300 text-neutral-600 hover:border-ink"}`}
            >
              {p}
            </button>
          ))}
          <button type="button" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className={`${pbtn} bg-brand px-2.5 font-semibold text-white disabled:opacity-40`}>
            Next
          </button>
        </nav>
      )}
    </>
  );
}

// Admin "Product Information" page. product: plain data prepared by the server page.
export default function ProductDetailView({ product, notice }) {
  const router = useRouter();
  const [main, setMain] = useState(0);
  const [tab, setTab] = useState("description");
  const [confirm, setConfirm] = useState(false);
  const [toast, setToast] = useState(notice ? { text: notice } : null);
  const [pending, startTransition] = useTransition();
  const images = product.images;

  useEffect(() => {
    if (!notice) return;
    const url = new URL(window.location.href);
    url.search = "";
    window.history.replaceState(null, "", url.pathname);
  }, [notice]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    if (!confirm) return;
    const onKey = (e) => e.key === "Escape" && setConfirm(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [confirm]);

  const duplicate = () =>
    startTransition(async () => {
      const res = await duplicateProductsAction([product.id]);
      if (res.error) return setToast({ error: true, text: res.error });
      router.push(`/admin/products/${res.made[0]}?notice=copied`);
    });
  const remove = () =>
    startTransition(async () => {
      const res = await deleteProductsAction([product.id]);
      if (res.error) return setToast({ error: true, text: res.error });
      router.push("/admin/products?deleted=1");
    });

  const stock =
    product.stock === null ? "Not tracked" : product.stock === 0 ? "Out of Stock" : product.stock <= 10 ? `Low Stock (${product.stock} left)` : `In Stock (${product.stock})`;
  const [mainCat, subCat, subSubCat] = product.categoryPath;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3 sm:px-6 lg:px-9">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs">
          <Link href="/admin/products" className="font-medium text-neutral-700 hover:text-ink hover:underline">
            Product Management
          </Link>
          <svg viewBox="0 0 24 24" className="size-3.5 text-neutral-500" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="m9 6 6 6-6 6" />
          </svg>
          <span aria-current="page" className="font-medium text-brand">
            Product Information
          </span>
        </nav>
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/products/${product.id}/edit`} className={btn}>
            <Icon d={icons.edit} />
            Edit Product
          </Link>
          <button type="button" onClick={duplicate} disabled={pending} className={btn}>
            <Icon d={icons.copy} />
            Duplicate Product
          </button>
          <button type="button" onClick={() => setConfirm(true)} disabled={pending} className={btn}>
            <Icon d={icons.trash} />
            Delete Product
          </button>
        </div>
      </div>

      <div className="px-4 pt-7 pb-14 sm:px-6 lg:px-9">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <h1 className="text-xl font-semibold text-black">{product.name}</h1>
          {product.status === "draft" && <span className="rounded-full bg-neutral-200 px-2.5 py-0.5 text-[11px] font-medium text-neutral-700">Draft — hidden from the shop</span>}
          <ShopLink href={`/products/${product.id}`} className="text-xs font-medium text-brand hover:underline">
            {product.status === "draft" ? "Preview in shop" : "View in shop"} ↗
          </ShopLink>
        </div>

        <h2 className="mt-9 text-xs font-semibold text-ink">Images</h2>
        <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-10">
          <div className="grid aspect-square w-full max-w-80 shrink-0 place-items-center overflow-hidden rounded-lg bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element -- admin preview of the product's own photos */}
            <img src={images[main]?.src} alt={`${product.name}${images[main]?.color ? ` — ${images[main].color}` : ""}`} className="size-full object-contain" />
          </div>
          {images.length > 1 && (
            <ul className="flex flex-wrap gap-4 sm:gap-6" aria-label="All photos">
              {images.map((img, i) => (
                <li key={img.src}>
                  <button
                    type="button"
                    onClick={() => setMain(i)}
                    aria-label={`Show photo ${i + 1}${img.color ? ` (${img.color})` : ""}`}
                    aria-pressed={i === main}
                    className={`grid size-24 place-items-center overflow-hidden rounded-md border-2 bg-white transition ${i === main ? "border-brand" : "border-transparent hover:border-neutral-300"}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- thumbnail */}
                    <img src={img.src} alt="" className="size-full object-contain" />
                  </button>
                  {img.color && <p className="mt-1 max-w-24 truncate text-center text-[10px] text-neutral-500">{img.color}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <Card title="Product Description">
            <Item label="Price">
              {naira(product.price)}
              {product.oldPrice && <span className="ml-2 text-xs text-neutral-400 line-through">{naira(product.oldPrice)}</span>}
            </Item>
            <Item label="SKU">{product.sku}</Item>
            <Item label="Stock">{stock}</Item>
            <Item label="Brand">{product.brand}</Item>
          </Card>
          <Card title="Category">
            <Item label="Main Category">{mainCat ?? "—"}</Item>
            <Item label="Sub- Category">{subCat ?? "—"}</Item>
            <Item label="Sub-subcategory">{subSubCat ?? "—"}</Item>
            <Item label="Colour">{product.colors.join(", ")}</Item>
          </Card>
        </div>

        <div role="tablist" aria-label="Product details" className="mt-10 flex gap-2 rounded-md bg-neutral-200/80 p-2">
          {[
            ["description", "Description"],
            ["specs", "Specifications"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`h-8 rounded-md px-5 text-[11px] transition ${tab === key ? "bg-white text-ink shadow-sm" : "border border-neutral-400 text-neutral-600 hover:bg-white/60"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <section role="tabpanel" className="mt-5 rounded-lg border border-neutral-200 bg-white p-5 shadow-[0_1px_6px_rgba(0,0,0,0.04)] sm:p-6">
          <h2 className="text-base font-semibold text-ink">{tab === "description" ? "Product Description" : "Product Specifications"}</h2>
          <div className="mt-4">
            {tab === "description" ? (
              <p className="text-sm leading-relaxed whitespace-pre-line text-neutral-500">{product.description || "No description yet. Use Edit Product to add one."}</p>
            ) : (
              <SpecTable specs={product.specs} />
            )}
          </div>
        </section>
      </div>

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-800/55 p-4 backdrop-blur-[2px]">
          <div role="alertdialog" aria-modal="true" aria-labelledby="del-title" className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-2xl">
            <h2 id="del-title" className="text-lg font-semibold">
              Delete “{product.name}”?
            </h2>
            <p className="mt-3 text-sm text-neutral-600">It will be removed from the shop. This can&apos;t be undone.</p>
            <div className="mt-6 flex justify-center gap-3">
              <button type="button" onClick={() => setConfirm(false)} className="h-10 rounded-md border border-neutral-300 px-5 text-sm hover:border-ink">
                Cancel
              </button>
              <button type="button" onClick={remove} disabled={pending} className="h-10 rounded-md bg-red-600 px-5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60">
                {pending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <p role="status" className={`fixed right-4 bottom-4 z-50 max-w-xs rounded-lg px-4 py-3 text-sm text-white shadow-xl ${toast.error ? "bg-red-600" : "bg-ink"}`}>
          {toast.text}
        </p>
      )}
    </>
  );
}
