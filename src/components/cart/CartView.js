"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useCart } from "./CartProvider";
import { formatNaira } from "@/data/products";
import { productDetails } from "@/data/productDetails";
import { DELIVERY_FEE } from "@/data/shipping";
import ProductImage from "../ui/ProductImage";
import { LAST_VIEWED_KEY } from "../shop/ProductHero";



const noopSubscribe = () => () => {};
// true in the browser, false while server-rendering: avoids flashing
// "Your cart is empty" before the saved cart has been read.
const useIsClient = () => useSyncExternalStore(noopSubscribe, () => true, () => false);

const shortNaira = (n) => `₦${n.toLocaleString("en-NG")}`;

function readLastViewed() {
  try {
    return sessionStorage.getItem(LAST_VIEWED_KEY);
  } catch {
    return null;
  }
}

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5 text-brand" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path d="m9 6 6 6-6 6" />
    </svg>
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

function EmptyCart() {
  return (
    <div className="mx-auto mt-20 flex max-w-md flex-col items-center pb-24 text-center sm:mt-24 sm:pb-40">
      <div className="grid size-17.5 place-items-center rounded-full bg-brand">
        <BoxIcon />
      </div>
      <h2 className="mt-6 text-xl font-bold text-black sm:text-2xl">Your Cart is Empty</h2>
      <p className="mt-5 text-sm leading-relaxed text-neutral-600">
        Looks like you haven&apos;t added anything to your cart yet.
        <br />
        Start exploring and find something you love!
      </p>
      <Link
        href="/categories/phones-and-tablets"
        className="mt-6 rounded-md bg-brand px-3 py-2.5 text-xs font-medium text-white transition hover:bg-brand-hover"
      >
        Start Shopping
      </Link>
    </div>
  );
}

function QtyStepper({ qty, onChange, label }) {
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => onChange(qty - 1)}
        disabled={qty <= 1}
        aria-label={`Decrease quantity of ${label}`}
        className="grid size-4.5 place-items-center rounded-sm bg-brand text-white transition disabled:bg-neutral-400"
      >
        <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M5 12h14" />
        </svg>
      </button>
      <span aria-label={`Quantity ${qty}`} className="w-3 text-center text-sm font-semibold">
        {qty}
      </span>
      <button
        type="button"
        onClick={() => onChange(qty + 1)}
        disabled={qty >= 10}
        aria-label={`Increase quantity of ${label}`}
        className="grid size-4.5 place-items-center rounded-sm bg-brand text-white transition hover:bg-brand-hover disabled:bg-neutral-400"
      >
        <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  );
}

// Desktop: 4-column table (Product Name | Price | Quantity | Action).
// Phones: each row stacks into a compact card.
const cols = "md:grid md:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center md:gap-4";

function CartItems({ items, products }) {
  const { setQty, removeItem } = useCart();
  const lines = items
    .map((it) => {
      const product = products.find((p) => p.id === it.id);
      if (!product) return null;
      const variant = (product.variants ?? productDetails[product.detailsId]?.variants)?.find((v) => v.color === it.color);
      return { ...it, product, image: variant?.images[0] ?? product.image };
    })
    .filter(Boolean);
  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  const total = subtotal + DELIVERY_FEE;

  return (
    <div className="mt-10 grid grid-cols-1 gap-4 pb-16 lg:grid-cols-[minmax(0,1fr)_19rem] xl:grid-cols-[minmax(0,1fr)_19.5rem]">
      {/* Items */}
      <section aria-label="Items in your cart" className="rounded-xl bg-[#f4f4f6] px-4 py-4 sm:px-5 sm:py-8 lg:min-h-152">
        <div className={`hidden border-b border-neutral-300 px-2 pb-4 text-sm font-semibold ${cols}`} aria-hidden>
          <span>Product Name</span>
          <span className="text-center">Price</span>
          <span>Quantity</span>
          <span>Action</span>
        </div>

        <ul className="divide-y divide-neutral-300 md:border-b md:border-neutral-300">
          {lines.map((l) => (
            <li key={`${l.id}-${l.color}`} className={`flex flex-wrap items-center gap-x-4 gap-y-4 px-2 py-6 md:py-7 ${cols}`}>
              <div className="flex min-w-0 basis-full items-center gap-3 md:basis-auto">
                <Link href={`/products/${l.id}`} className="relative h-12 w-10 shrink-0 overflow-hidden rounded-md">
                  <ProductImage src={l.image} name={l.product.name} alt={`${l.product.name} in ${l.color}`} sizes="48px" />
                </Link>
                <div className="min-w-0">
                  <Link href={`/products/${l.id}`} className="block truncate text-xs font-medium hover:text-brand sm:text-sm">
                    {l.product.name}
                  </Link>
                  <p className="mt-1.5 truncate text-xs text-neutral-600">{l.product.spec}</p>
                  <p className="mt-0.5 truncate text-[11px] text-neutral-500">{l.color}</p>
                </div>
              </div>

              <p className="text-xs md:text-center">
                <span className="sr-only">Price: </span>
                {shortNaira(l.product.price)}
              </p>

              <div className="ml-auto md:ml-0">
                <QtyStepper qty={l.qty} label={l.product.name} onChange={(q) => setQty(l.id, l.color, Math.min(10, q))} />
              </div>

              <div className="basis-full md:basis-auto">
                <button
                  type="button"
                  onClick={() => removeItem(l.id, l.color)}
                  className="h-8 whitespace-nowrap rounded-md border border-neutral-300 bg-white px-2 text-[10px] text-neutral-500 transition hover:border-red-400 hover:text-red-600 sm:text-[11px]"
                >
                  Remove from Cart
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Summary */}
      <aside aria-labelledby="summary-title" className="flex flex-col rounded-xl bg-[#f4f4f6] px-5 py-8">
        <h2 id="summary-title" className="border-b border-neutral-300 pb-6 text-sm font-semibold">
          Order Summary
        </h2>
        <dl className="text-xs">
          {[
            ["Delivery charges", formatNaira(DELIVERY_FEE)],
            ["Subtotal", formatNaira(subtotal)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between border-b border-neutral-300 py-6">
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
          <div className="flex items-center justify-between py-6">
            <dt>Total</dt>
            <dd>{formatNaira(total)}</dd>
          </div>
        </dl>

        <Link
          href="/checkout"
          className="mt-6 block rounded-md bg-brand py-3 text-center text-xs font-semibold text-white transition hover:bg-brand-hover lg:mt-auto"
        >
          Proceed to Checkout
        </Link>
      </aside>
    </div>
  );
}

export default function CartView({ products }) {
  const { items } = useCart();
  const isClient = useIsClient();
  const lastViewedRaw = useSyncExternalStore(noopSubscribe, readLastViewed, () => null);
  let lastViewed = null;
  try {
    lastViewed = lastViewedRaw ? JSON.parse(lastViewedRaw) : null;
  } catch {
    /* ignore */
  }

  return (
    <div className="bg-white px-4 pt-6 text-ink sm:px-8 sm:pt-10 lg:px-12 xl:px-16">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] sm:text-xs">
          <li className="flex items-center gap-2">
            <Link href="/" className="text-brand hover:underline">
              Home
            </Link>
            <Chevron />
          </li>
          {lastViewed && (
            <li className="flex items-center gap-2">
              <Link href={`/products/${lastViewed.id}`} className="text-brand hover:underline">
                {lastViewed.name}
              </Link>
              <Chevron />
            </li>
          )}
          <li aria-current="page" className="text-neutral-700">
            My Cart
          </li>
        </ol>
      </nav>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight">My Cart</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-600">
        Review your selections and get ready to complete your order. Your next favorite product is just a few
        clicks away!
      </p>

      {!isClient ? (
        <div className="min-h-96" aria-busy="true" />
      ) : items.length === 0 ? (
        <EmptyCart />
      ) : (
        <CartItems items={items} products={products} />
      )}
    </div>
  );
}
