"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// Phone-only "Delivered ⌄" switch next to the heading (replaces the side panel on small screens).
// options: [{ key, label, href }]
export default function OrderViewSwitch({ current, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const active = options.find((o) => o.key === current) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Showing ${active.label} orders. Change list`}
        className="flex items-center gap-2 text-sm font-semibold text-neutral-600"
      >
        {active.label}
        <svg viewBox="0 0 24 24" className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <ul role="menu" className="absolute top-full right-0 z-30 mt-2 w-40 rounded-md border border-neutral-200 bg-white py-1.5 shadow-xl">
          {options.map((o) => (
            <li key={o.key} role="none">
              <Link
                role="menuitem"
                href={o.href}
                onClick={() => setOpen(false)}
                aria-current={o.key === current ? "page" : undefined}
                className={`flex items-center justify-between px-4 py-2.5 text-sm ${o.key === current ? "bg-brand/10 font-semibold text-ink" : "text-neutral-700"}`}
              >
                {o.label}
                {o.key === current && (
                  <svg viewBox="0 0 24 24" className="size-4 text-brand" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                    <path d="m5 12 5 5 9-10" />
                  </svg>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
