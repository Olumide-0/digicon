"use client";

import { useState } from "react";
import ProductImage from "../ui/ProductImage";
import { ChevronRightIcon } from "../icons";

export default function ProductGallery({ images, name }) {
  const [active, setActive] = useState(0);
  const many = images.length > 1;
  const atStart = active === 0;
  const atEnd = active === images.length - 1;

  const arrow =
    "grid size-5 shrink-0 place-items-center rounded-full transition disabled:cursor-default enabled:hover:bg-brand";

  return (
    <div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setActive((i) => i - 1)}
          disabled={!many || atStart}
          aria-label="Previous image"
          className={`${arrow} ${!many || atStart ? "bg-neutral-200 text-neutral-500" : "bg-ink text-white"}`}
        >
          <ChevronRightIcon className="size-3 rotate-180" />
        </button>

        <div className="relative aspect-4/5 flex-1">
          <ProductImage
            src={images[active]}
            name={name}
            alt={`${name}${many ? ` (image ${active + 1} of ${images.length})` : ""}`}
            sizes="(min-width: 1024px) 40vw, 85vw"
          />
        </div>

        <button
          type="button"
          onClick={() => setActive((i) => i + 1)}
          disabled={!many || atEnd}
          aria-label="Next image"
          className={`${arrow} ${!many || atEnd ? "bg-neutral-200 text-neutral-500" : "bg-ink text-white"}`}
        >
          <ChevronRightIcon className="size-3" />
        </button>
      </div>

      {/* Thumbnail strip is always shown, as in the design */}
      {images.length > 0 && (
        <div className="mt-8 flex justify-center gap-4">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === active}
              className={`size-10 rounded-sm border bg-white p-1 transition sm:size-11 ${
                i === active ? "border-ink" : "border-neutral-300 hover:border-neutral-500"
              }`}
            >
              <span className="relative block size-full">
                <ProductImage src={src} name={name} sizes="48px" />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
