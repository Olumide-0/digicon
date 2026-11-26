import Link from "next/link";
import { requireAdmin, isTeamMember, can } from "@/lib/admin/auth";
import { listOrders } from "@/lib/checkout/orders";
import { listUsers } from "@/lib/auth/users";
import { listAllProducts, LOW_STOCK } from "@/lib/catalog/store";
import { getCategoryTree } from "@/lib/catalog/categories";
import { CreateCategoryButton } from "@/components/admin/CategoryWizard";
import CustomizableDashboard, { actionButton } from "@/components/admin/CustomizableDashboard";
import { naira, PencilIcon, PlusIcon, StatCard, TableCard, ViewMore } from "@/components/admin/AdminTable";

export const metadata = { title: "Dashboard" };

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

const DENIED = { products: "Products", orders: "Orders", inventory: "Inventory", team: "Team Management" };

export default async function AdminDashboard({ searchParams }) {
  const admin = await requireAdmin();
  const { denied } = await searchParams;
  const canProducts = can(admin, "products");
  const canOrders = can(admin, "orders");
  const [orders, users, products, tree] = await Promise.all([listOrders(), listUsers(), listAllProducts(), getCategoryTree()]);
  const customers = users.filter((u) => !isTeamMember(u));
  const customerName = Object.fromEntries(users.map((u) => [u.id, `${u.firstName} ${u.lastName}`.trim()]));
  const lowStock = products.filter((p) => typeof p.stock === "number" && p.stock <= LOW_STOCK);

  // Newest first (the imported samples share one date, so catalogue order breaks ties).
  const recentProducts = products
    .map((p, i) => [p, i])
    .sort((a, b) => b[0].createdAt.localeCompare(a[0].createdAt) || b[1] - a[1])
    .slice(0, RECENT)
    .map(([p]) => p);
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
        <ViewMore key="v" href={`/admin/products/${p.id}`} label={`View ${p.name}`} />,
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
        canProducts ? (
          <>
            <Link href="/admin/products/new" className={actionButton}>
              <PlusIcon />
              Add New Product
            </Link>
            <CreateCategoryButton tree={tree} className={actionButton}>
              <PencilIcon />
              Add New Categories
            </CreateCategoryButton>
          </>
        ) : null
      }
      greeting={
        <div>
          {DENIED[denied] && (
            <p role="alert" className="mb-5 rounded-md bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Your role ({admin.teamRole.name}) doesn&apos;t include {DENIED[denied]}. Ask a Super Admin if you need access.
            </p>
          )}
          <p className="text-sm">{greeting()}</p>
          <p className="mt-2 text-base font-semibold">
            {admin.firstName} {admin.lastName} ({admin.teamRole.name})
          </p>
        </div>
      }
      sections={[
        { key: "stats", label: "Summary cards", content: stats },
        ...(canProducts ? [{ key: "products", label: "Recent uploaded products", content: productsTable }] : []),
        ...(canOrders ? [{ key: "orders", label: "Recent orders", content: ordersTable }] : []),
      ]}
    />
  );
}
