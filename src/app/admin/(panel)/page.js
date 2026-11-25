import Link from "next/link";
import { requireAdmin, isAdmin } from "@/lib/admin/auth";
import { listOrders } from "@/lib/checkout/orders";
import { listUsers } from "@/lib/auth/users";
import { products } from "@/data/products";
import CustomizableDashboard, { actionButton } from "@/components/admin/CustomizableDashboard";

export const metadata = { title: "Dashboard" };

const naira = (n) => `₦${Math.round(n).toLocaleString("en-NG")}`;
const LOW_STOCK = 10; // same limit the shop uses for "N units left"
const RECENT = 6;

const STATUS = {
  awaiting_payment: ["Awaiting payment", "bg-neutral-200 text-ink"],
  paid: ["Paid", "bg-sky-600 text-white"],
  processing: ["Processing", "bg-neutral-400 text-white"],
  shipped: ["Shipped", "bg-brand text-white"],
  delivered: ["Delivered", "bg-teal-700 text-white"],
};

// "Good Morning" etc. in Nigerian time.
function greeting() {
  const h = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: "Africa/Lagos" }).format(new Date()));
  return h < 12 ? "Good Morning," : h < 17 ? "Good Afternoon," : "Good Evening,";
}

// Change in items created this month vs last month (Lagos time).
function monthChange(items) {
  const ym = (d) => new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", timeZone: "Africa/Lagos" }).format(d);
  const now = new Date();
  const thisMonth = ym(now);
  const lastMonth = ym(new Date(now.getFullYear(), now.getMonth() - 1, 15));
  const a = items.filter((x) => ym(new Date(x.createdAt)) === thisMonth).length;
  const b = items.filter((x) => ym(new Date(x.createdAt)) === lastMonth).length;
  if (b === 0) return a ? `+${a} this month` : "None yet this month";
  const pct = Math.round(((a - b) / b) * 100);
  return `${pct >= 0 ? "+" : ""}${pct}% from last month`;
}

const ICONS = {
  bag: <path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8ZM9 10V7a3 3 0 0 1 6 0v3" />,
  file: <path d="M7 3.5h7l4.5 4.5v12.5H7a1.5 1.5 0 0 1-1.5-1.5V5A1.5 1.5 0 0 1 7 3.5ZM14 3.5V8h4.5" />,
  people: <path d="M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5M5 11.5a2 2 0 1 0 0-4M19 11.5a2 2 0 1 0 0-4M2.5 17.5c0-1.8 1-3 2.5-3.3M21.5 17.5c0-1.8-1-3-2.5-3.3" />,
  alarm: <path d="M12 20.5a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM12 10v3.5l2 1.5M5 4.5 3 6.5M19 4.5l2 2" />,
};

function StatCard({ title, value, note, icon }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-[0_1px_6px_rgba(0,0,0,0.06)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="pt-2 text-[11px] font-semibold sm:text-xs">{title}</h2>
        <span className="grid size-8 shrink-0 sm:size-9 place-items-center rounded-md bg-brand text-white">
          <svg viewBox="0 0 24 24" className="size-4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            {ICONS[icon]}
          </svg>
        </span>
      </div>
      <p className="mt-4 text-2xl font-bold">{value.toLocaleString("en-NG")}</p>
      <p className="mt-1.5 text-[10px] text-neutral-600 sm:text-[11px]">{note}</p>
    </div>
  );
}

function ViewMore({ href, label }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 whitespace-nowrap text-green-600 hover:underline" aria-label={label}>
      View More
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </Link>
  );
}

// Card with a title bar, a black "View all" button and a table (scrolls sideways on phones).
function TableCard({ id, title, viewAll, columns, widths, rows, empty }) {
  return (
    <section aria-labelledby={id} className="rounded-lg border border-neutral-200 bg-white shadow-[0_1px_6px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between gap-3 border-b border-neutral-200 px-2.5 py-2.5 sm:px-3">
        <h2 id={id} className="flex items-center gap-2 text-xs font-medium text-neutral-700">
          <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M4 20V4M9 20v-8M14 20v-5M19 20V9" />
          </svg>
          {title}
        </h2>
        <Link href={viewAll.href} className="rounded-md bg-black px-3 py-2 text-[11px] font-medium text-white transition hover:bg-ink">
          {viewAll.label}
        </Link>
      </div>
      <div className="overflow-x-auto px-2 pt-4 pb-2 sm:px-2.5">
        <table className="w-full min-w-[40rem] table-fixed border-separate border-spacing-0 text-left text-xs">
          <colgroup>
            {widths.map((w, i) => (
              <col key={i} style={{ width: w }} />
            ))}
          </colgroup>
          <thead>
            <tr className="text-white">
              {columns.map((c, i) => (
                <th
                  key={c}
                  scope="col"
                  className={`bg-[#606169] py-3.5 font-normal ${i === 0 ? "rounded-l-lg pl-6" : ""} ${i === columns.length - 1 ? "rounded-r-lg" : ""}`}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((cells, r) => (
                <tr key={r} className="text-neutral-800">
                  {cells.map((cell, i) => (
                    <td key={i} className={`py-4 pr-3 ${i === 0 ? "truncate pl-6" : ""} ${r < rows.length - 1 ? "border-b border-neutral-200" : ""}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-10 text-center text-neutral-500">
                  {empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

const PencilIcon = () => (
  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M20 13.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19V6a1.5 1.5 0 0 1 1.5-1.5H11" />
    <path d="m17.5 3.5 3 3L12 15l-4 1 1-4Z" />
  </svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export default async function AdminDashboard() {
  const admin = await requireAdmin();
  const [orders, users] = await Promise.all([listOrders(), listUsers()]);
  const customers = users.filter((u) => !isAdmin(u));
  const customerName = Object.fromEntries(users.map((u) => [u.id, `${u.firstName} ${u.lastName}`.trim()]));
  const lowStock = products.filter((p) => typeof p.stock === "number" && p.stock <= LOW_STOCK);

  // The catalogue has no upload dates yet, so the latest entries in the list count as most recent.
  const recentProducts = products.slice(-RECENT).reverse();
  const recentOrders = orders.slice(0, 4);

  const stats = (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      <StatCard title="Total Products" value={products.length} note={`Across ${new Set(products.map((p) => p.category)).size} categories`} icon="bag" />
      <StatCard title="Total Orders" value={orders.length} note={monthChange(orders)} icon="file" />
      <StatCard title="Total Customers" value={customers.length} note={monthChange(customers)} icon="people" />
      <StatCard title="Low Stock Alerts" value={lowStock.length} note={lowStock.length ? "Items need restocking" : "Everything is well stocked"} icon="alarm" />
    </div>
  );

  const productsTable = (
    <TableCard
      id="recent-products"
      title="Recent Uploaded Products"
      viewAll={{ href: "/admin/products", label: "View all products" }}
      columns={["Product name", "Category", "Stock", "Price", "Actions"]}
      widths={["28%", "20%", "18%", "18%", "16%"]}
      empty="No products yet."
      rows={recentProducts.map((p) => [
        p.name,
        p.category,
        typeof p.stock === "number" ? (
          <span className={p.stock <= LOW_STOCK ? "font-medium text-red-600" : undefined}>{p.stock}</span>
        ) : (
          <span className="text-neutral-500">Not set</span>
        ),
        naira(p.price),
        <ViewMore key="v" href={`/products/${p.id}`} label={`View ${p.name}`} />,
      ])}
    />
  );

  const ordersTable = (
    <TableCard
      id="recent-orders"
      title="Recent Orders"
      viewAll={{ href: "/admin/orders", label: "View all orders" }}
      columns={["Product Name", "Customer", "Status", "Total", "Actions"]}
      widths={["28%", "20%", "18%", "18%", "16%"]}
      empty="No orders yet. New orders will show up here."
      rows={recentOrders.map((o) => {
        const [label, tone] = STATUS[o.status] ?? [o.status, "bg-neutral-200 text-ink"];
        const extra = o.items.length - 1;
        return [
          <span key="n">
            {o.items[0]?.name}
            {extra > 0 && <span className="text-neutral-500"> +{extra} more</span>}
          </span>,
          customerName[o.userId] ?? o.email,
          <span key="s" className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-medium whitespace-nowrap ${tone}`}>
            {label}
          </span>,
          naira(o.total),
          <ViewMore key="v" href={`/order/${o.id}`} label={`View order ${o.id}`} />,
        ];
      })}
    />
  );

  return (
    <CustomizableDashboard
      actions={
        <>
          <Link href="/admin/products/new" className={actionButton}>
            <PlusIcon />
            Add New Product
          </Link>
          <Link href="/admin/categories/new" className={actionButton}>
            <PencilIcon />
            Add New Categories
          </Link>
        </>
      }
      greeting={
        <div>
          <p className="text-sm">{greeting()}</p>
          <p className="mt-2 text-base font-semibold">
            {admin.firstName} {admin.lastName} (Admin)
          </p>
        </div>
      }
      sections={[
        { key: "stats", label: "Summary cards", content: stats },
        { key: "products", label: "Recent uploaded products", content: productsTable },
        { key: "orders", label: "Recent orders", content: ordersTable },
      ]}
    />
  );
}
