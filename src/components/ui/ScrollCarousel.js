"use client";

import { useEffect, useRef, useState } from "react";

// Horizontally scrollable, snapping row with progress dots underneath.
// Each child is rendered as a list item.
// fill: on lg+ screens, stop scrolling and stretch the items into equal columns.
export default function ScrollCarousel({ children, label, dots = 4, gap = "gap-6 sm:gap-10", fill = false, className = "" }) {
  const trackRef = useRef(null);
  const [page, setPage] = useState(0);
  const [scrollable, setScrollable] = useState(true);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const update = () => {
      const max = el.scrollWidth - el.clientWidth;
      setScrollable(max > 1);
      setPage(max > 0 ? Math.round((el.scrollLeft / max) * (dots - 1)) : 0);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [dots]);

  const goTo = (i) => {
    const el = trackRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    el.scrollTo({ left: (max * i) / (dots - 1), behavior: "smooth" });
  };

  const items = Array.isArray(children) ? children : [children];

  return (
    <div className={className}>
      <ul
        ref={trackRef}
        aria-label={label}
        className={`no-scrollbar flex snap-x snap-mandatory overflow-x-auto scroll-px-4 px-4 pb-2 sm:scroll-px-8 sm:px-8 lg:scroll-px-12 lg:px-12 xl:scroll-px-16 xl:px-16 ${gap} ${
          fill ? "lg:grid lg:auto-cols-fr lg:grid-flow-col lg:overflow-visible" : ""
        }`}
      >
        {items.map((child, i) => (
          <li key={child?.key ?? i} className="shrink-0 snap-start">
            {child}
          </li>
        ))}
      </ul>

      {scrollable && (
        <div className="mt-10 flex justify-center gap-1.5">
          {Array.from({ length: dots }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Scroll to position ${i + 1}`}
              aria-current={i === page}
              className={`h-1.5 rounded-full transition-all ${
                i === page ? "w-5 bg-ink" : "w-2.5 bg-neutral-400 hover:bg-neutral-500"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
