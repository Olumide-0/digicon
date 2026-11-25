"use client";

import { useState } from "react";
import { ChevronDownIcon } from "../icons";

// Shared building blocks for the product listing sidebars.

const optionInput =
  "size-4 shrink-0 cursor-pointer appearance-none rounded-full border border-neutral-400 transition checked:border-[5px] checked:border-emerald-500 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-emerald-500/40 focus-visible:outline-none";

export function FilterSection({ title, children, collapsible = true }) {
  if (!collapsible) {
    return <div className="space-y-2.5">{children}</div>;
  }
  return (
    <details open className="group">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDownIcon className="size-4 transition-transform group-open:rotate-180" />
      </summary>
      <div className="mt-3 space-y-2.5">{children}</div>
    </details>
  );
}

// count: optional number shown after the label; 0 disables the option.
export function Option({ type, name, label, checked, onChange, count }) {
  const disabled = count === 0 && !checked;
  return (
    <label
      className={`flex items-center gap-2.5 text-sm ${
        disabled ? "cursor-not-allowed text-neutral-300" : "cursor-pointer text-neutral-600 hover:text-ink"
      }`}
    >
      <input type={type} name={name} checked={checked} onChange={onChange} disabled={disabled} className={optionInput} />
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="text-[11px] text-neutral-400">{count}</span>}
    </label>
  );
}

export const Divider = () => <div aria-hidden className="my-5 h-1 rounded-full bg-brand" />;

export const toggle = (list, value) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

// Max-price slider with an editable value box and an Apply button, as in the design.
// `max` is the top of the slider (the priciest product shown, rounded up).
// onApply({ min: null, max: number | null }) — max is null when the slider is at the top.
export function PriceFilter({ max, onApply }) {
  const [value, setValue] = useState(max);
  const step = 10000;
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 100;

  const apply = (e) => {
    e.preventDefault();
    onApply({ min: null, max: value >= max ? null : value });
  };

  const thumb =
    "[&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-ink [&::-moz-range-thumb]:size-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-ink";

  return (
    <form onSubmit={apply}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-ink">Price (₦)</span>
        <button type="submit" className="rounded-md bg-brand px-3 py-1 text-xs font-semibold text-white transition hover:bg-brand-hover">
          Apply
        </button>
      </div>

      <input
        type="range"
        min="0"
        max={max}
        step={step}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        aria-label="Maximum price"
        className={`mt-4 block h-1 w-full cursor-pointer appearance-none rounded-full ${thumb}`}
        style={{ background: `linear-gradient(to right, #1e1e20 ${pct}%, #d4d4d8 ${pct}%)` }}
      />

      <label className="mt-3 flex h-9 items-center gap-1 rounded-md border border-neutral-300 bg-white px-3 text-sm text-ink focus-within:border-brand">
        <span aria-hidden className="text-neutral-500">₦</span>
        <input
          type="text"
          inputMode="numeric"
          value={value.toLocaleString("en-NG")}
          onChange={(e) => setValue(Math.min(max, Number(e.target.value.replace(/D/g, "")) || 0))}
          aria-label="Maximum price in naira"
          className="w-full min-w-0 bg-transparent outline-none"
        />
      </label>
    </form>
  );
}

// 1 2 3 4 Next — current page in orange.
export function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  const btn = "grid h-7 min-w-7 place-items-center rounded-sm px-2 text-xs transition";
  return (
    <nav aria-label="Pages" className="mt-10 flex items-center justify-center gap-1.5">
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          aria-current={p === page ? "page" : undefined}
          className={`${btn} ${p === page ? "bg-brand font-semibold text-white" : "border border-neutral-300 text-neutral-600 hover:border-ink"}`}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= pages}
        className={`${btn} bg-brand px-3 font-semibold text-white hover:bg-brand-hover disabled:opacity-40`}
      >
        Next
      </button>
    </nav>
  );
}
