import Link from "next/link";
import OrderViewSwitch from "./OrderViewSwitch";

// Order tab of the account page: side panel (Delivered / Pending), empty state, order table
// and page numbers — as in the design. Server component; pages are plain links.

const PAGE_SIZE = 4;
const INTRO = "Manage your details, orders, and preferences all in one place. It's your hub for staying in control.";

// Which list an order belongs to. Only "delivered" counts as delivered; everything else
// (awaiting payment, paid, processing, shipped…) is still pending.
export const isDelivered = (o) => o.status === "delivered";
const STATUS_LABEL = {
  awaiting_payment: "Awaiting payment",
  paid: "Paid",
  processing: "Processing",
  shipped: "On its way",
  delivered: "Delivered",
};

const naira = (n) => `₦ ${n.toLocaleString("en-NG")}`;
const dateLabel = (iso) => {
  const d = new Date(iso);
  const p = (x) => String(x).padStart(2, "0");
  return `${p(d.getDate())} - ${p(d.getMonth() + 1)} - ${d.getFullYear()}`;
};
const href = (view, page = 1) => `/account?tab=orders&orders=${view}${page > 1 ? `&page=${page}` : ""}`;

function SideNav({ view }) {
  const item = (key, label) => (
    <li>
      <Link
        href={href(key)}
        aria-current={view === key ? "page" : undefined}
        className={`block py-1 text-xs font-semibold ${view === key ? "text-ink" : "text-neutral-500 hover:text-ink"}`}
      >
        {label}
      </Link>
      {view === key && <span aria-hidden className="mt-2.5 block h-1.5 rounded-full bg-brand" />}
    </li>
  );
  return (
    <nav aria-label="Order lists" className="hidden h-fit rounded-xl bg-[#f4f4f6] px-4 py-6 lg:block lg:min-h-58">
      <ul className="space-y-5">
        {item("delivered", "Delivered Orders")}
        {item("pending", "Pending Orders")}
      </ul>
    </nav>
  );
}

function BoxIcon() {
  return (
    <svg viewBox="0 0 48 48" className="size-9" aria-hidden>
      <path d="M24 6 40 14v20L24 42 8 34V14Z" fill="#fff3df" />
      <path d="M24 22v20L8 34V14Z" fill="#ffe2b3" />
      <path d="M8 14 24 6l16 8-16 8Z" fill="#fff8ec" />
      <path d="m15 10.5 16 8v6l-4-2v-6l-16-8Z" fill="#ffd28a" />
    </svg>
  );
}

function Empty({ title, text, action }) {
  return (
    <div className="flex flex-col items-center px-4 pt-8 pb-16 text-center lg:pt-6">
      <div className="grid size-17.5 place-items-center rounded-full bg-brand">
        <BoxIcon />
      </div>
      <h2 className="mt-6 text-xl font-bold text-black sm:text-2xl">{title}</h2>
      <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-600">{text}</p>
      {action}
    </div>
  );
}

function Pages({ view, page, pages }) {
  if (pages <= 1) return null;
  const btn = "grid h-6 min-w-6 place-items-center rounded-sm px-1.5 text-[11px] transition";
  return (
    <nav aria-label="Order pages" className="mt-10 flex items-center justify-center gap-1.5 md:mt-8 md:justify-end">
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          href={href(view, p)}
          aria-current={p === page ? "page" : undefined}
          className={`${btn} ${p === page ? "bg-brand font-semibold text-white" : "border border-neutral-300 text-neutral-600 hover:border-ink"}`}
        >
          {p}
        </Link>
      ))}
      {page < pages ? (
        <Link href={href(view, page + 1)} className={`${btn} bg-brand px-2.5 font-semibold text-white hover:bg-brand-hover`}>
          Next
        </Link>
      ) : (
        <span className={`${btn} bg-brand px-2.5 font-semibold text-white opacity-40`} aria-disabled="true">
          Next
        </span>
      )}
    </nav>
  );
}

// Desktop columns: Order Number | Product Name | Quantity | Price | Total | Date Ordered
const COLS = "md:grid md:grid-cols-[minmax(0,1.15fr)_minmax(0,1.6fr)_minmax(0,0.8fr)_minmax(0,0.95fr)_minmax(0,0.95fr)_minmax(0,0.95fr)] md:gap-4";

function OrderRow({ order, showStatus }) {
  const status = showStatus && (
    <span className="mt-1.5 block w-fit rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
      {STATUS_LABEL[order.status] ?? order.status}
    </span>
  );
  return (
    <li>
      {/* Phone: card (Order Number / Date, Product / Quantity, Total) */}
      <article className="rounded-xl bg-white px-5 pt-6 pb-7 text-xs shadow-[0_0_14px_rgba(0,0,0,0.09)] md:hidden">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <span className="text-sm font-semibold text-ink">Order Number</span>
          <span className="text-right text-sm font-semibold text-ink">Date Ordered</span>
          <span className="min-w-0">
            <Link href={`/order/${order.id}`} className="break-all text-neutral-700 hover:text-brand hover:underline">
              #{order.id}
            </Link>
            {status}
          </span>
          <span className="text-right text-neutral-700">{dateLabel(order.createdAt)}</span>
        </div>
        <div className="mt-7 flex justify-between text-sm font-semibold text-ink">
          <span>Product Name</span>
          <span>Quantity</span>
        </div>
        <ul className="mt-5 space-y-4">
          {order.items.map((it) => (
            <li key={`${it.id}-${it.color}`} className="flex justify-between gap-4 text-neutral-700">
              <Link href={`/products/${it.id}`} className="min-w-0 truncate hover:text-brand">
                {it.name}
              </Link>
              <span className="shrink-0">{it.qty}</span>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex items-baseline justify-between">
          <span className="text-sm font-semibold text-ink">Total</span>
          <span className="text-lg font-semibold text-ink">{naira(order.total)}</span>
        </div>
      </article>

      {/* Tablet & desktop: table row */}
      <div className={`hidden border-b border-neutral-200 px-2.5 py-7 text-sm ${COLS}`}>
        <div>
          <Link href={`/order/${order.id}`} className="text-neutral-700 hover:text-brand hover:underline">
            #{order.id}
          </Link>
          {status}
        </div>
        <ul className="space-y-5 md:col-span-3">
          {order.items.map((it) => (
            <li key={`${it.id}-${it.color}`} className="grid grid-cols-[minmax(0,1.6fr)_minmax(0,0.8fr)_minmax(0,0.95fr)] gap-4 text-neutral-600">
              <Link href={`/products/${it.id}`} className="truncate hover:text-brand" title={`${it.name} · ${it.color}`}>
                {it.name}
              </Link>
              <span>{it.qty}</span>
              <span>{naira(it.unitPrice)}</span>
            </li>
          ))}
        </ul>
        <p className="text-base font-semibold text-ink">{naira(order.total)}</p>
        <p className="text-neutral-700">{dateLabel(order.createdAt)}</p>
      </div>
    </li>
  );
}

export default function OrderHistory({ orders, view: requested, page: requestedPage }) {
  const delivered = orders.filter(isDelivered);
  const pending = orders.filter((o) => !isDelivered(o));
  // Default list: Delivered (as in the design), unless only pending orders exist yet.
  const view = requested === "pending" || requested === "delivered" ? requested : delivered.length || !pending.length ? "delivered" : "pending";
  const list = view === "delivered" ? delivered : pending;
  const pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(requestedPage) || 1), pages);
  const shown = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const title = view === "delivered" ? "Delivered Orders" : "Pending Orders";

  const shopButton = (
    <Link href="/categories/phones-and-tablets" className="mt-6 rounded-md bg-brand px-3 py-2.5 text-xs font-medium text-white transition hover:bg-brand-hover">
      Start Shopping
    </Link>
  );

  const switcher = (
    <OrderViewSwitch
      current={view}
      options={[
        { key: "delivered", label: "Delivered", href: href("delivered") },
        { key: "pending", label: "Pending", href: href("pending") },
      ]}
    />
  );
  // Phones have no side panel, so empty lists still get the title + switch.
  const phoneHeader = (
    <div className="mb-2 flex items-center justify-between gap-4 lg:hidden">
      <h2 className="text-xl font-semibold">{title}</h2>
      {switcher}
    </div>
  );

  let content;
  if (orders.length === 0) {
    content = <Empty title="No Orders Yet" text="It looks like you haven't placed any orders. When you do, your order history will appear here." action={shopButton} />;
  } else if (list.length === 0) {
    content =
      view === "delivered" ? (
        <>
          {phoneHeader}
          <Empty
          title="No Delivered Orders Yet"
          text="Your orders will appear here once they've been delivered. You can follow the ones on their way under Pending Orders."
          action={
            <Link href={href("pending")} className="mt-6 rounded-md bg-brand px-3 py-2.5 text-xs font-medium text-white transition hover:bg-brand-hover">
              View Pending Orders
            </Link>
          }
          />
        </>
      ) : (
        <>
          {phoneHeader}
          <Empty title="No Pending Orders" text="Everything you've ordered has been delivered. Fancy something new?" action={shopButton} />
        </>
      );
  } else {
    content = (
      <section aria-labelledby="orders-title">
        <div className="flex items-center justify-between gap-4">
          <h2 id="orders-title" className="text-xl font-semibold lg:text-base">
            {title}
          </h2>
          <div className="lg:hidden">{switcher}</div>
        </div>
        <p className="mt-3 text-sm text-neutral-600">{INTRO}</p>

        <div className={`mt-9 hidden rounded-xl bg-[#f4f4f6] px-2.5 py-5 text-sm font-medium text-ink ${COLS}`} aria-hidden>
          <span>Order Number</span>
          <span>Product Name</span>
          <span>Quantity</span>
          <span>Price</span>
          <span>Total</span>
          <span>Date Ordered</span>
        </div>
        <ul className="mt-8 space-y-6 md:mt-0 md:space-y-0">
          {shown.map((o) => (
            <OrderRow key={o.id} order={o} showStatus={view === "pending"} />
          ))}
        </ul>
        <Pages view={view} page={page} pages={pages} />
      </section>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[11.5rem_minmax(0,1fr)] lg:gap-5">
      <SideNav view={view} />
      <div className="min-w-0 lg:px-1">{content}</div>
    </div>
  );
}
