"use client";

import Link from "next/link";
import { useState } from "react";
import { itemHref } from "@/data/categories";

// Desktop "Shop by Categories" panel: orange category rail + white link panel.
export default function MegaMenu({ onNavigate, categories }) {
  const [active, setActive] = useState(0);
  const category = categories[active] ?? categories[0];
  if (!category) return null;

  return (
    <div className="flex items-start gap-3">
      {/* Category rail */}
      <ul
        role="tablist"
        aria-orientation="vertical"
        className="min-h-96 w-56 shrink-0 rounded-lg bg-brand p-6 xl:w-64"
      >
        {categories.map((c, i) => (
          <li key={c.name}>
            <button
              type="button"
              role="tab"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              className={`w-full py-3 text-left text-base font-semibold transition ${
                i === active ? "text-ink" : "text-white hover:text-ink/70"
              }`}
            >
              {c.name}
            </button>
          </li>
        ))}
      </ul>

      {/* Links panel */}
      <div
        role="tabpanel"
        className="grid min-h-[30rem] flex-1 grid-cols-3 gap-8 rounded-lg bg-[#f4f4f6] px-10 py-8 text-ink shadow-2xl"
      >
        {category.columns.map((column, ci) => (
          <div key={ci} className="flex flex-col gap-10">
            {column.map((group) => (
              <div key={group.title}>
                <h3 className="text-base font-semibold">{group.title}</h3>
                <ul className="mt-6 space-y-4">
                  {group.items.map((item) => (
                    <li key={item}>
                      <Link
                        href={itemHref(category.name, group.title, item)}
                        onClick={onNavigate}
                        className="text-sm text-ink/80 transition hover:text-brand"
                      >
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
