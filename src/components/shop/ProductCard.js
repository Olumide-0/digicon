"use client";

import Link from "next/link";
import { useState } from "react";
import ProductImage from "../ui/ProductImage";
import { formatNaira } from "@/data/products";

// cardImages: [{ color, src }] — dots under the photo switch between colours.
export default function ProductCard({ id, name, spec, price, oldPrice, image, cardImages }) {
  const photos = cardImages?.length ? cardImages : [{ color: "", src: image }];
  const [active, setActive] = useState(0);
  const href = `/products/${id}`;

  return (
    <article className="group flex flex-col rounded-xl bg-[#e9e9eb] p-4 transition-shadow hover:shadow-lg sm:p-5">
      <Link href={href} className="relative block aspect-square">
        <ProductImage
          key={photos[active].src}
          src={photos[active].src}
          name={name}
          alt={photos[active].color ? `${name} in ${photos[active].color}` : name}
          sizes="(min-width: 1280px) 22vw, (min-width: 640px) 40vw, 90vw"
          placeholderClass="bg-white/60 text-neutral-300"
        />
      </Link>

      {photos.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5">
          {photos.map((p, i) => (
            <button
              key={p.src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show ${name} in ${p.color}`}
              aria-pressed={i === active}
              className="grid size-4 place-items-center"
            >
              <span className={`block size-1.5 rounded-full transition ${i === active ? "bg-ink" : "bg-neutral-400"}`} />
            </button>
          ))}
        </div>
      )}

      <h3 className="mt-4 text-sm font-semibold text-ink">
        <Link href={href} className="hover:text-brand">
          {name}
        </Link>
      </h3>
      <p className="mt-1 text-xs text-neutral-500">{spec}</p>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div>
          {oldPrice && (
            <p className="text-[11px] text-red-500 line-through">
              <span className="sr-only">Was </span>
              {formatNaira(oldPrice)}
            </p>
          )}
          <p className="text-sm font-semibold text-ink">
            {oldPrice && <span className="sr-only">Now </span>}
            {formatNaira(price)}
          </p>
        </div>
        <Link
          href={href}
          className="shrink-0 rounded-md bg-brand px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-hover"
        >
          Buy Now
        </Link>
      </div>
    </article>
  );
}
