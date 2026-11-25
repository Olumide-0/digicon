"use client";

import { useEffect, useState } from "react";

export const LAST_VIEWED_KEY = "digicon-last-viewed";
import ProductGallery from "./ProductGallery";
import ProductPurchase from "./ProductPurchase";

// Top of the product page. Holds the selected colour so the colour swatches
// (right column) can swap the photos shown in the gallery (left column).
// variants: [{ color: "Midnight", hex: "#232a31", images: ["/images/products/....png", ...] }]
export default function ProductHero({
  id,
  name,
  spec,
  priceLabel,
  oldPriceLabel,
  discount,
  stock,
  available,
  maxQty,
  description,
  variants,
  initialColor,
}) {
  // Open on the colour shown on the product card, so the two match.
  const [colorIndex, setColorIndex] = useState(() =>
    Math.max(0, variants.findIndex((v) => v.color === initialColor))
  );
  const variant = variants[colorIndex];

  // Remember this product for the cart page breadcrumb (Home › <product> › My Cart).
  useEffect(() => {
    try {
      sessionStorage.setItem(LAST_VIEWED_KEY, JSON.stringify({ id, name }));
    } catch {
      /* storage unavailable */
    }
  }, [id, name]);

  return (
    <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,28rem)_1fr] lg:gap-12 xl:grid-cols-[minmax(0,33rem)_1fr] xl:gap-16">
      {/* key: start from the first photo whenever the colour changes */}
      <ProductGallery key={variant.color} images={variant.images} name={`${name} in ${variant.color}`} />

      <div className="flex flex-col">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h1 className="text-lg font-medium tracking-tight sm:text-xl">{name}</h1>
          <span className={`text-xs ${stock.low ? "text-red-600" : "text-emerald-600"}`}>{stock.text}</span>
        </div>
        <p className="mt-4 text-sm text-neutral-600">{spec}</p>
        <p className="mt-3 flex flex-wrap items-baseline gap-x-3 text-base font-semibold text-neutral-600">
          {oldPriceLabel && (
            <span className="text-sm font-normal text-red-500 line-through">
              <span className="sr-only">Was </span>
              {oldPriceLabel}
            </span>
          )}
          <span>
            {oldPriceLabel && <span className="sr-only">Now </span>}
            {priceLabel}
          </span>
          {discount && <span className="rounded-sm bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">-{discount}%</span>}
        </p>

        <div aria-hidden className="mt-6 h-3.5 bg-brand" />

        <p className="mt-10 max-w-2xl text-sm leading-relaxed text-neutral-600 sm:mt-12">{description}</p>

        <div className="mt-10 lg:mt-auto lg:pt-10">
          <ProductPurchase
            id={id}
            colors={variants.map((v) => ({ name: v.color, hex: v.hex }))}
            colorIndex={colorIndex}
            onColorChange={setColorIndex}
            available={available}
            maxQty={maxQty}
          />
        </div>
      </div>
    </div>
  );
}
