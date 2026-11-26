import { requireAdmin } from "@/lib/admin/auth";
import { listAllProducts, LOW_STOCK } from "@/lib/catalog/store";
import { countCategories, getCategoryTree } from "@/lib/catalog/categories";
import { CreateCategoryButton } from "@/components/admin/CategoryWizard";
import { PlusIcon, StatCard } from "@/components/admin/AdminTable";
import ProductManager from "@/components/admin/ProductManager";
import { filterValues } from "@/lib/catalog/filters";

export const metadata = { title: "Product Management" };

const PAGE_SIZE = 10;

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-10 text-white" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2.5 3.5h2.2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.9a1.5 1.5 0 0 0 1.5-1.1l1.6-6.3H6" />
      <circle cx="9.5" cy="19.5" r="1.3" />
      <circle cx="17" cy="19.5" r="1.3" />
    </svg>
  );
}

// Shown when the store has no products at all.
function NoProducts({ tree }) {
  return (
    <>
      <div className="min-h-16 border-b border-neutral-200" />
      <div className="flex flex-1 flex-col items-center px-4 pt-20 pb-24 text-center sm:pt-28">
        <span className="grid size-24 place-items-center rounded-full bg-brand sm:size-28">
          <CartIcon />
        </span>
        <h2 className="mt-7 text-2xl font-bold text-black sm:text-[1.75rem]">No Products Added Yet</h2>
        <p className="mt-5 max-w-[22rem] text-sm leading-relaxed text-neutral-600">
          Get started by creating a new category for your product and then proceed to adding new products. You can manage product details, pricing here
        </p>
        <CreateCategoryButton
          tree={tree}
          className="mt-7 inline-flex h-10 items-center gap-2 rounded-md bg-brand px-4 text-[13px] font-medium text-white transition hover:bg-brand-hover"
        >
          <PlusIcon />
          Add New category
        </CreateCategoryButton>
      </div>
    </>
  );
}

// Change in products added this month vs last month (Lagos time).
function monthNote(items) {
  const ym = (d) => new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", timeZone: "Africa/Lagos" }).format(d);
  const now = new Date();
  const a = items.filter((x) => ym(new Date(x.createdAt)) === ym(now)).length;
  const b = items.filter((x) => ym(new Date(x.createdAt)) === ym(new Date(now.getFullYear(), now.getMonth() - 1, 15))).length;
  if (b === 0) return a ? `+${a} added this month` : "None added this month";
  const pct = Math.round(((a - b) / b) * 100);
  return `${pct >= 0 ? "+" : ""}${pct}% from last month`;
}

const pick = (v, allowed) => (typeof v === "string" && allowed.includes(v) ? v : "");

export default async function ProductManagement({ searchParams }) {
  await requireAdmin("products");
  const params = await searchParams;
  const [all, tree] = await Promise.all([listAllProducts(), getCategoryTree()]);
  if (all.length === 0) return <NoProducts tree={tree} />;

  const filters = {
    q: typeof params.q === "string" ? params.q.trim().slice(0, 80) : "",
    category: pick(params.category, filterValues("category")),
    stock: pick(params.stock, filterValues("stock")),
    status: pick(params.status, filterValues("status")),
  };
  const words = filters.q.toLowerCase().split(/\s+/).filter(Boolean);
  const stockOf = (p) => (p.stock === 0 ? "out" : typeof p.stock === "number" && p.stock <= LOW_STOCK ? "low" : "in");
  const matches = all.filter((p) => {
    const text = `${p.name} ${p.sku} ${p.brand} ${p.categoryPath.join(" ")}`.toLowerCase();
    return (
      words.every((w) => text.includes(w)) &&
      (!filters.category || p.category === filters.category) &&
      (!filters.stock || stockOf(p) === filters.stock) &&
      (!filters.status || p.status === filters.status)
    );
  });

  // Just added from Add New Product (?added=<id>): show a confirmation.
  const added = typeof params.added === "string" ? all.find((p) => p.id === params.added) : null;

  const pages = Math.max(1, Math.ceil(matches.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(params.page) || 1), pages);
  const shown = matches.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const active = all.filter((p) => p.status === "active").length;
  const out = all.filter((p) => p.stock === 0).length;
  const low = all.filter((p) => stockOf(p) === "low").length;
  const categories = countCategories(tree);
  const mainCategories = tree.length;

  const stats = (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      <StatCard title="Total Products" value={all.length} note={monthNote(all)} icon="bag" />
      <StatCard title="Active Products" value={active} note={active === all.length ? "All visible in the shop" : `${all.length - active} in drafts`} icon="check" />
      <StatCard title="Out-of-Stock" value={out} note={low ? `${low} more running low` : "Nothing running low"} icon="alarm" />
      <StatCard title="Total Categories" value={categories} note={`Within ${mainCategories} main categories`} icon="folder" />
    </div>
  );

  // Only what the table needs goes to the browser.
  const rows = shown.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    categoryPath: p.categoryPath,
    price: p.price,
    oldPrice: p.oldPrice ?? null,
    stock: p.stock ?? null,
    status: p.status,
    createdAt: p.createdAt,
  }));

  return (
    <ProductManager
      key={`${page}-${filters.q}-${filters.category}-${filters.stock}-${filters.status}`}
      rows={rows}
      stats={stats}
      filters={filters}
      categoryTree={tree}
      notice={added ? `“${added.name}” ${added.status === "active" ? "is now live in the shop" : "was saved as a hidden draft"}.` : params.deleted ? "Product deleted." : null}
      page={page}
      pages={pages}
      total={matches.length}
      from={(page - 1) * PAGE_SIZE + 1}
    />
  );
}
