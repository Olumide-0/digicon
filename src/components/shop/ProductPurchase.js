"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "../cart/CartProvider";
import { colorHex } from "@/data/productDetails";
import { BagIcon } from "../icons";

// Colour picker (controlled by ProductHero), quantity stepper, Add to cart and Buy Now.
export default function ProductPurchase({ id, colors, colorIndex, onColorChange, maxQty = 10, available = true }) {
  const { addItem } = useCart();
  const router = useRouter();
  const color = colors[colorIndex].name;
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const addToCart = () => {
    addItem(id, color, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const buyNow = () => {
    addItem(id, color, qty);
    router.push("/cart");
  };

  return (
    // Phones: [colour | quantity] on one row, buttons centred below.
    // sm and up: everything on one row. ("contents" lets the right-hand group's
    // children join the phone grid directly.)
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-8 sm:flex sm:items-center sm:justify-between">
      <fieldset className="min-w-0">
        <legend className="text-sm text-neutral-600">
          Color :<span className="text-ink">{color}</span>
        </legend>
        <div className="mt-4 flex flex-wrap gap-3">
          {colors.map(({ name, hex }, i) => (
            <label key={name} className="cursor-pointer" title={name}>
              <input
                type="radio"
                name="color"
                value={name}
                checked={i === colorIndex}
                onChange={() => onColorChange(i)}
                className="peer sr-only"
              />
              <span
                className="block size-5 rounded-full border border-black/10 ring-offset-2 transition peer-checked:ring-2 peer-checked:ring-ink/60 peer-focus-visible:ring-2 peer-focus-visible:ring-brand"
                style={{ backgroundColor: hex ?? colorHex[name] ?? "#ccc" }}
              />
              <span className="sr-only">{name}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="contents sm:flex sm:flex-wrap sm:items-center sm:gap-x-8 sm:gap-y-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            aria-label="Decrease quantity"
            className="grid size-6 place-items-center rounded-sm bg-ink text-white transition disabled:bg-neutral-400"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M5 12h14" />
            </svg>
          </button>
          <span aria-live="polite" aria-label={`Quantity ${qty}`} className="w-5 text-center text-base font-semibold">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
            disabled={qty >= maxQty}
            aria-label="Increase quantity"
            className="grid size-6 place-items-center rounded-sm bg-ink text-white transition disabled:bg-neutral-400"
          >
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>

        <div className="col-span-2 flex items-center justify-center gap-3 sm:gap-2">
          <button
            type="button"
            onClick={addToCart}
            disabled={!available}
            className="inline-flex h-8 items-center gap-2 rounded-md border border-neutral-300 px-3 text-xs text-neutral-500 transition hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            <BagIcon className="size-4" />
            {added ? "Added ✓" : "Add to cart"}
          </button>
          <button
            type="button"
            onClick={buyNow}
            disabled={!available}
            className="inline-flex h-8 items-center gap-2 rounded-md bg-brand px-3 text-xs font-semibold text-white transition hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            <BagIcon className="size-4" />
            Buy Now
          </button>
        </div>
      </div>
      <p aria-live="polite" className="sr-only">
        {added ? `Added ${qty} to cart` : ""}
      </p>
    </div>
  );
}
