"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRightIcon } from "./icons";

// Export each slide image from Figma into /public/images/hero/.
// Add or swap slides here — the dots update automatically.
const slides = [
  {
    eyebrow: "Discover the Latest Tech Deals",
    title: "20%  Fresh Deals on Every Gadget This week",
    subtitle:
      "Your premier destination for the latest gadgets, computers and tech accessories.",
    cta: { label: "Get 20% Off", href: "/deals" },
    image: { src: "/images/hero/iphones.png", alt: "Lineup of the latest smartphones in five colours" },
  },
];

const AUTOPLAY_MS = 6000;

export default function Hero() {
  const [active, setActive] = useState(0);
  const slide = slides[active];

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(() => setActive((i) => (i + 1) % slides.length), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [active]);

  // Show 4 dots like the design even with a single slide, until more slides are added.
  const dotCount = Math.max(slides.length, 4);

  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 pt-14 text-center sm:px-8 sm:pt-20">
        <p className="text-base font-semibold sm:text-lg">{slide.eyebrow}</p>

        <h1 className="mt-4  text-3xl font-bold leading-tight tracking-tight whitespace-pre-wrap sm:text-4xl lg:text-[2.5rem]">
          {slide.title}
        </h1>

        <p className="mt-4  text-sm font-medium text-white/90 sm:text-base">
          {slide.subtitle}
        </p>

        <Link
          href={slide.cta.href}
          className="mt-8 inline-flex items-center gap-4 rounded-xl bg-brand px-7 py-3.5 text-sm font-bold text-white transition hover:bg-brand-hover hover:shadow-lg hover:shadow-brand/20 sm:text-base"
        >
          {slide.cta.label}
          <ChevronRightIcon className="size-5" />
        </Link>

        <div className="relative mt-12 w-full max-w-md sm:mt-16 sm:max-w-xl">
          <Image
            key={slide.image.src}
            src={slide.image.src}
            alt={slide.image.alt}
            width={2224}
            height={1160}
            sizes="(min-width: 640px) 576px, 100vw"
            preload
            className="h-auto w-full object-contain"
          />

          <div className="absolute inset-x-0 bottom-6 flex justify-center gap-1.5">
            {Array.from({ length: dotCount }).map((_, i) => {
              const isActive = i === active;
              const enabled = i < slides.length;
              return (
                <button
                  key={i}
                  type="button"
                  disabled={!enabled}
                  onClick={() => setActive(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={isActive}
                  className={`h-1.5 rounded-full transition-all ${
                    isActive ? "w-5 bg-white" : "w-2.5 bg-white/40"
                  } ${enabled ? "cursor-pointer" : "cursor-default"}`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
