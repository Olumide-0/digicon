import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import PageIntro from "@/components/ui/PageIntro";
import ClearCart from "@/components/checkout/ClearCart";
import { getSession } from "@/lib/auth/session";
import { findOrder } from "@/lib/checkout/orders";
import { getAdmin } from "@/lib/admin/auth";
import { formatNaira } from "@/data/products";
import { shippingMethods } from "@/data/shipping";

export const metadata = { title: "Order received" };

// Order confirmation. Only the customer who placed the order (or an admin) can see it.
export default async function OrderPage({ params }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect(`/signin?next=/order/${id}`);
  const order = await findOrder(id);
  if (!order || (order.userId !== session.userId && !(await getAdmin()))) notFound();
  const d = order.delivery;

  return (
    <div className="min-h-[60vh] bg-white px-4 pt-6 pb-20 text-ink sm:px-8 sm:pt-10 lg:px-12 xl:px-16">
      {order.userId === session.userId && <ClearCart />}
      <PageIntro crumbs={[{ label: "Home", href: "/" }, { label: `Order ${order.id}`, href: `/order/${order.id}` }]} title="Thank you, your order is in!">
        Order <span className="font-semibold text-ink">{order.id}</span> was placed on{" "}
        {new Date(order.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}. We&apos;ll be in touch at{" "}
        {order.email}.
      </PageIntro>

      {order.status === "awaiting_payment" && (
        <p role="status" className="mt-6 max-w-2xl rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-900">
          <span className="font-semibold">Awaiting payment.</span> Online payment isn&apos;t connected yet, so this order has been saved but not
          charged. Our team will contact you to arrange payment.
        </p>
      )}

      <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <section aria-label="Items" className="rounded-xl bg-[#f4f4f6] px-5 py-6 sm:px-8">
          <ul className="divide-y divide-neutral-300">
            {order.items.map((it) => (
              <li key={`${it.id}-${it.color}`} className="flex justify-between gap-4 py-4 text-sm">
                <span>
                  <Link href={`/products/${it.id}`} className="font-medium hover:text-brand">
                    {it.name}
                  </Link>
                  <span className="mt-1 block text-xs text-neutral-500">
                    {it.color} · Qty {it.qty} · {formatNaira(it.unitPrice)} each
                  </span>
                </span>
                <span className="shrink-0">{formatNaira(it.lineTotal)}</span>
              </li>
            ))}
          </ul>
        </section>

        <aside className="h-fit space-y-6 rounded-xl bg-[#f4f4f6] px-5 py-6 text-xs">
          <dl className="space-y-2">
            <div className="flex justify-between"><dt className="text-neutral-600">Subtotal</dt><dd>{formatNaira(order.subtotal)}</dd></div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700"><dt>Discount ({order.discountCode})</dt><dd>−{formatNaira(order.discountAmount)}</dd></div>
            )}
            <div className="flex justify-between"><dt className="text-neutral-600">{shippingMethods[d.shipping]?.label}</dt><dd>{order.deliveryFee ? formatNaira(order.deliveryFee) : "Free"}</dd></div>
            <div className="flex justify-between border-t border-neutral-300 pt-2 text-sm font-semibold"><dt>Total</dt><dd>{formatNaira(order.total)}</dd></div>
          </dl>
          <div>
            <p className="font-semibold text-neutral-600">{d.shipping === "pickup" ? "Contact details" : "Delivering to"}</p>
            <p className="mt-2 leading-relaxed text-neutral-700">
              {d.firstName} {d.lastName}
              {d.company && <><br />{d.company}</>}
              <br />{d.address}
              <br />{d.city}, {d.state}, {d.country}
              <br />{d.phone}
            </p>
          </div>
          <Link href="/" className="block rounded-md bg-brand py-2.5 text-center font-semibold text-white hover:bg-brand-hover">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
