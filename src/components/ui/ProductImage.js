"use client";

import Image from "next/image";
import { useState } from "react";

// next/image in "fill" mode that falls back to a lettered placeholder
// when the file hasn't been added to /public yet.
// fit: "contain" for product cut-outs, "cover" for photos.
export default function ProductImage({
  src,
  name,
  sizes,
  alt = "",
  fit = "contain",
  className = "",
  placeholderClass = "bg-neutral-100 text-neutral-300",
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`grid size-full place-items-center rounded-2xl text-2xl font-semibold ${placeholderClass}`}>
        {name[0]}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      onError={() => setFailed(true)}
      className={`${fit === "cover" ? "object-cover" : "object-contain"} ${className}`}
    />
  );
}
