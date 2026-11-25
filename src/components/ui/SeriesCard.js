import Link from "next/link";
import ProductImage from "./ProductImage";
import { ChevronRightIcon } from "../icons";

// Dark product-series card with a "View Series" band that appears on hover
// (always visible on touch devices). Images live in /public/images/<imageDir>/.
export default function SeriesCard({ name, image, href, imageDir = "series", ctaLabel = "View Series" }) {
  return (
    <Link
      href={href}
      className="group relative flex h-80 w-[82vw] max-w-sm flex-col items-center overflow-hidden rounded-xl bg-ink text-white sm:h-96 sm:w-72 sm:max-w-none lg:h-104 lg:w-full"
    >
      <h3 className="mt-7 text-lg font-semibold sm:mt-10 sm:text-xl">{name}</h3>

      <div className="relative mt-auto mb-20 h-36 w-4/5 sm:mb-16 transition-transform duration-500 group-hover:scale-105 sm:h-52">
        <ProductImage
          src={`/images/${imageDir}/${image}.png`}
          name={name}
          sizes="(min-width: 1024px) 256px, 220px"
          placeholderClass="bg-white/5 text-white/20"
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 flex h-20 items-center justify-center bg-black/25 sm:h-24 transition-opacity duration-300 group-focus-visible:opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100">
        <span className="inline-flex items-center gap-2 rounded-xl bg-brand/40 px-4 py-2.5 text-sm font-medium text-brand">
          {ctaLabel}
          <ChevronRightIcon className="size-4" />
        </span>
      </div>
    </Link>
  );
}
