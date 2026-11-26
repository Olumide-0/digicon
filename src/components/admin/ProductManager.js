"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { deleteProductsAction, duplicateProductsAction, setProductStatusAction } from "@/lib/catalog/actions";
import { PlusIcon } from "./AdminTable";
import { CreateCategoryButton } from "./CategoryWizard";
import { ShopLink } from "./adminReturn";
import { PRODUCT_FILTERS as FILTERS } from "@/lib/catalog/filters";

const naira = (n) => `₦${Math.round(n).toLocaleString("en-NG")}`;
const LOW_STOCK = 10;


const button =
  "inline-flex h-10 items-center gap-2 rounded-md border border-neutral-300 bg-white px-3.5 text-[13px] text-neutral-600 transition hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-neutral-300 disabled:hover:text-neutral-600";

function useOutside(open, close) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => !ref.current?.contains(e.target) && close();
    const onKey = (e) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  return ref;
}

function Checkbox({ checked, onChange, label, indeterminate = false }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      aria-label={label}
      className="size-4 cursor-pointer appearance-none rounded-[3px] border border-current bg-transparent align-middle transition checked:border-brand checked:bg-brand checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22><path d=%22M4 8.5l2.5 2.5L12 5.5%22 fill=%22none%22 stroke=%22white%22 stroke-width=%222%22/></svg>')] indeterminate:border-brand indeterminate:bg-brand"
    />
  );
}

function stockStatus(stock) {
  if (stock === 0) return <span className="text-red-600">Out of Stock</span>;
  if (typeof stock === "number" && stock <= LOW_STOCK) return <span className="text-amber-600">Low Stock ({stock})</span>;
  return <span>In Stock</span>;
}

const dateLabel = (iso) =>
  new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Africa/Lagos" }).format(new Date(iso));

// "Filter by" dropdown: category, stock status and visibility. Filters live in the URL.
function FilterMenu({ filters, buildHref }) {
  const [open, setOpen] = useState(false);
  const ref = useOutside(open, () => setOpen(false));
  const active = Object.keys(FILTERS).filter((k) => filters[k]).length;
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="inline-flex h-10 items-center gap-3 rounded-md bg-black px-4 text-xs font-medium text-white transition hover:bg-ink"
      >
        Filter by{active > 0 && <span className="grid size-4.5 place-items-center rounded-full bg-brand text-[10px]">{active}</span>}
        <svg viewBox="0 0 24 24" className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div role="dialog" aria-label="Filter products" className="absolute top-full left-0 z-20 mt-2 w-64 rounded-lg border border-neutral-200 bg-white p-4 shadow-xl">
          {Object.entries(FILTERS).map(([key, f]) => (
            <fieldset key={key} className="mb-4 last:mb-0">
              <legend className="mb-2 text-xs font-semibold text-ink">{f.label}</legend>
              <div className="flex flex-wrap gap-1.5">
                {[["", "All"], ...f.options].map(([value, label]) => {
                  const on = (filters[key] ?? "") === value;
                  return (
                    <Link
                      key={value || "all"}
                      href={buildHref({ [key]: value, page: "" })}
                      onClick={() => setOpen(false)}
                      aria-current={on ? "true" : undefined}
                      className={`rounded-full border px-2.5 py-1 text-[11px] transition ${on ? "border-brand bg-brand text-white" : "border-neutral-300 text-neutral-700 hover:border-ink"}`}
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>
            </fieldset>
          ))}
          {active > 0 && (
            <Link href={buildHref({ category: "", stock: "", status: "", page: "" })} onClick={() => setOpen(false)} className="mt-1 inline-block text-xs font-medium text-brand hover:underline">
              Clear filters
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function RowMenu({ product, onAction }) {
  const [open, setOpen] = useState(false);
  const ref = useOutside(open, () => setOpen(false));
  const item = "block w-full px-4 py-2 text-left text-xs transition hover:bg-neutral-100";
  const run = (fn) => () => {
    setOpen(false);
    fn();
  };
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-label={`Actions for ${product.name}`} aria-expanded={open} aria-haspopup="menu" className="grid size-7 place-items-center rounded hover:bg-neutral-100">
        <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
          <circle cx="12" cy="5" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="12" cy="19" r="1.8" />
        </svg>
      </button>
      {open && (
        <div role="menu" className="absolute top-full right-0 z-20 mt-1 w-44 rounded-md border border-neutral-200 bg-white py-1.5 shadow-xl">
          <Link role="menuitem" href={`/admin/products/${product.id}`} className={item}>
            View details
          </Link>
          <Link role="menuitem" href={`/admin/products/${product.id}/edit`} className={item}>
            Edit
          </Link>
          <ShopLink role="menuitem" href={`/products/${product.id}`} className={item}>
            {product.status === "draft" ? "Preview" : "View in shop"}
          </ShopLink>
          <button role="menuitem" type="button" onClick={run(() => onAction("status", [product.id], product.status === "draft" ? "active" : "draft"))} className={item}>
            {product.status === "draft" ? "Publish" : "Move to drafts"}
          </button>
          <button role="menuitem" type="button" onClick={run(() => onAction("duplicate", [product.id]))} className={item}>
            Duplicate
          </button>
          <button role="menuitem" type="button" onClick={run(() => onAction("delete", [product.id]))} className={`${item} text-red-600`}>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

function ConfirmDelete({ names, onCancel, onConfirm, pending }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-800/55 p-4 backdrop-blur-[2px]">
      <div role="alertdialog" aria-modal="true" aria-labelledby="del-title" className="w-full max-w-sm rounded-xl bg-white p-6 text-center shadow-2xl">
        <h2 id="del-title" className="text-lg font-semibold">
          Delete {names.length === 1 ? `“${names[0]}”` : `${names.length} products`}?
        </h2>
        <p className="mt-3 text-sm text-neutral-600">{names.length === 1 ? "It" : "They"} will be removed from the shop. This can&apos;t be undone.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button type="button" onClick={onCancel} className="h-10 rounded-md border border-neutral-300 px-5 text-sm hover:border-ink">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={pending} className="h-10 rounded-md bg-red-600 px-5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60">
            {pending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Pages({ page, pages, total, from, to, buildHref }) {
  const btn = "grid h-7 min-w-7 place-items-center rounded-sm px-2 text-xs transition";
  return (
    <div className="flex flex-col items-center justify-between gap-3 px-4 py-3 text-xs text-neutral-600 sm:flex-row">
      <p>
        Showing {from}–{to} of {total} {total === 1 ? "product" : "products"}
      </p>
      {pages > 1 && (
        <nav aria-label="Product pages" className="flex flex-wrap items-center justify-center gap-1.5">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildHref({ page: p > 1 ? String(p) : "" })}
              aria-current={p === page ? "page" : undefined}
              className={`${btn} ${p === page ? "bg-brand font-semibold text-white" : "border border-neutral-300 hover:border-ink"}`}
            >
              {p}
            </Link>
          ))}
          {page < pages ? (
            <Link href={buildHref({ page: String(page + 1) })} className={`${btn} bg-brand font-semibold text-white hover:bg-brand-hover`}>
              Next
            </Link>
          ) : (
            <span aria-disabled="true" className={`${btn} bg-brand font-semibold text-white opacity-40`}>
              Next
            </span>
          )}
        </nav>
      )}
    </div>
  );
}

// Product Management list: toolbar, quick stats, filter + search, selectable table with row menus.
// rows: the products on this page. filters: { q, category, stock, status }.
export default function ProductManager({ rows, stats, filters, page, pages, total, from, categoryTree, notice }) {
  const router = useRouter();
  const [selected, setSelected] = useState([]);
  const [confirm, setConfirm] = useState(null); // ids waiting for delete confirmation
  const [toast, setToast] = useState(notice ? { text: notice } : null);
  const [pending, startTransition] = useTransition();

  // Keep only selections that are still on screen (after deletes / page changes).
  const visibleIds = rows.map((r) => r.id);
  const picked = selected.filter((id) => visibleIds.includes(id));
  const allOn = rows.length > 0 && picked.length === rows.length;

  // Shown once after adding a product: drop ?added= so a refresh doesn't repeat it.
  useEffect(() => {
    if (!notice) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("added");
    url.searchParams.delete("deleted");
    window.history.replaceState(null, "", url.pathname + url.search);
  }, [notice]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const buildHref = (change) => {
    const next = { ...filters, page: page > 1 ? String(page) : "", ...change };
    const qs = new URLSearchParams(Object.entries(next).filter(([, v]) => v));
    return `/admin/products${qs.size ? `?${qs}` : ""}`;
  };

  const run = (kind, ids, status) => {
    if (kind === "delete") return setConfirm(ids);
    startTransition(async () => {
      const res = kind === "duplicate" ? await duplicateProductsAction(ids) : await setProductStatusAction(ids, status);
      setToast(res.error ? { error: true, text: res.error } : { text: res.message });
      if (!res.error) setSelected([]);
      router.refresh();
    });
  };
  const doDelete = () =>
    startTransition(async () => {
      const res = await deleteProductsAction(confirm);
      setToast(res.error ? { error: true, text: res.error } : { text: res.message });
      setConfirm(null);
      setSelected([]);
      router.refresh();
    });

  return (
    <>
      <div className="flex min-h-16 flex-wrap items-center justify-end gap-2 border-b border-neutral-200 px-4 py-3 sm:px-6 lg:px-9">
        <CreateCategoryButton tree={categoryTree} className={button}>
          <PlusIcon />
          Create New Category
        </CreateCategoryButton>
        <Link href="/admin/products/new" className={button}>
          <PlusIcon />
          Add New Product
        </Link>
        <button
          type="button"
          onClick={() => run("duplicate", picked)}
          disabled={picked.length === 0 || pending}
          title={picked.length ? undefined : "Tick one or more products to duplicate"}
          className={button}
        >
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden>
            <rect x="8.5" y="8.5" width="12" height="12" rx="2" />
            <path d="M15.5 5.5v-1a1 1 0 0 0-1-1h-10a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h1" />
          </svg>
          Duplicate Product{picked.length > 1 ? `s (${picked.length})` : ""}
        </button>
      </div>

      <div className="px-4 pt-7 pb-12 sm:px-6 lg:px-9">
        <h2 className="text-xl font-semibold">Quick Stats</h2>
        <div className="mt-5">{stats}</div>

        <div className="mt-10 flex flex-col gap-3 sm:mt-14 sm:flex-row sm:items-center sm:justify-between">
          <FilterMenu filters={filters} buildHref={buildHref} />
          <form action="/admin/products" role="search" className="flex w-full items-center gap-2 sm:w-auto">
            {["category", "stock", "status"].map((k) => filters[k] && <input key={k} type="hidden" name={k} value={filters[k]} />)}
            <label htmlFor="product-search" className="sr-only">
              Search products
            </label>
            <input
              id="product-search"
              name="q"
              type="search"
              defaultValue={filters.q}
              placeholder="Search by product name, SKU, or category."
              className="h-10 min-w-0 flex-1 rounded-md bg-neutral-200/80 px-4 text-xs text-ink placeholder:text-neutral-500 outline-none focus:ring-2 focus:ring-brand/30 sm:w-80 sm:flex-none lg:w-[19.5rem]"
            />
            <button type="submit" aria-label="Search" className="grid h-10 w-14 shrink-0 place-items-center rounded-full bg-brand text-white transition hover:bg-brand-hover">
              <svg viewBox="0 0 24 24" className="size-4.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                <circle cx="11" cy="11" r="6.5" />
                <path d="m16 16 4 4" />
              </svg>
            </button>
          </form>
        </div>

        {(filters.q || filters.category || filters.stock || filters.status) && (
          <p className="mt-4 text-xs text-neutral-600">
            {total} {total === 1 ? "result" : "results"}
            {filters.q && (
              <>
                {" "}
                for “<span className="font-medium text-ink">{filters.q}</span>”
              </>
            )}
            {" · "}
            <Link href="/admin/products" className="font-medium text-brand hover:underline">
              Clear search & filters
            </Link>
          </p>
        )}

        <div className="mt-8 overflow-hidden border border-neutral-200 bg-white sm:mt-10">
          <div className="relative overflow-x-auto">
            <table className="w-full min-w-[56rem] table-fixed text-left text-xs">
              <colgroup>
                <col className="w-16" />
                <col className="w-[18%]" />
                <col className="w-[12%]" />
                <col className="w-[22%]" />
                <col className="w-[12%]" />
                <col className="w-[14%]" />
                <col className="w-[12%]" />
                <col className="w-12" />
              </colgroup>
              <thead className="bg-[#606169] text-white">
                <tr>
                  <th scope="col" className="py-5 pl-5">
                    <Checkbox checked={allOn} indeterminate={picked.length > 0 && !allOn} onChange={() => setSelected(allOn ? [] : visibleIds)} label="Select all products on this page" />
                  </th>
                  {["Product Name", "SKU", "Category/Subcategory", "Price", "Stock Status", "Date added"].map((h) => (
                    <th key={h} scope="col" className="py-5 pr-3 font-normal">
                      {h}
                    </th>
                  ))}
                  <th scope="col">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-14 text-center text-sm text-neutral-500">
                      No products match. Try another search or clear the filters.
                    </td>
                  </tr>
                ) : (
                  rows.map((p) => {
                    const on = picked.includes(p.id);
                    return (
                      <tr key={p.id} className={`border-b border-neutral-200 text-neutral-800 ${on ? "bg-brand/5" : ""}`}>
                        <td className="py-5 pl-5 text-neutral-700">
                          <Checkbox checked={on} onChange={() => setSelected(on ? picked.filter((x) => x !== p.id) : [...picked, p.id])} label={`Select ${p.name}`} />
                        </td>
                        <td className="py-5 pr-3">
                          <Link href={`/admin/products/${p.id}`} className="line-clamp-2 hover:text-brand hover:underline" title={p.name}>
                            {p.name}
                          </Link>
                          {p.status === "draft" && <span className="mt-1 inline-block rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-medium text-neutral-700">Draft</span>}
                        </td>
                        <td className="py-5 pr-3">{p.sku}</td>
                        <td className="py-5 pr-3 leading-relaxed">{p.categoryPath.join(" > ")}</td>
                        <td className="py-5 pr-3">
                          {naira(p.price)}
                          {p.oldPrice && <span className="block text-[10px] text-neutral-400 line-through">{naira(p.oldPrice)}</span>}
                        </td>
                        <td className="py-5 pr-3">{stockStatus(p.stock)}</td>
                        <td className="py-5 pr-3">{dateLabel(p.createdAt)}</td>
                        <td className="py-5 pr-3">
                          <RowMenu product={p} onAction={run} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <Pages page={page} pages={pages} total={total} from={from} to={from + rows.length - 1} buildHref={buildHref} />
        </div>
      </div>

      {confirm && <ConfirmDelete names={rows.filter((r) => confirm.includes(r.id)).map((r) => r.name)} onCancel={() => setConfirm(null)} onConfirm={doDelete} pending={pending} />}
      {toast && (
        <p role="status" className={`fixed right-4 bottom-4 z-50 max-w-xs rounded-lg px-4 py-3 text-sm text-white shadow-xl ${toast.error ? "bg-red-600" : "bg-ink"}`}>
          {toast.text}
        </p>
      )}
    </>
  );
}
