"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

// "Customize Dashboard": choose which dashboard sections show. Saved in this browser.
const KEY = "digicon-admin-dashboard-hidden";
const listeners = new Set();
const subscribe = (fn) => {
  listeners.add(fn);
  window.addEventListener("storage", fn);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", fn);
  };
};
const read = () => {
  try {
    return localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
};
const write = (hidden) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(hidden));
  } catch {}
  listeners.forEach((fn) => fn());
};

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export const actionButton =
  "inline-flex h-10 items-center gap-2 rounded-md border border-neutral-300 bg-white px-3.5 text-[13px] text-neutral-600 transition hover:border-ink hover:text-ink";

// sections: [{ key, label, content }]. actions: the other buttons in the row.
export default function CustomizableDashboard({ greeting, sections, actions }) {
  const raw = useSyncExternalStore(subscribe, read, () => "[]");
  let hidden = [];
  try {
    hidden = JSON.parse(raw);
  } catch {}
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

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

  const toggle = (key) => write(hidden.includes(key) ? hidden.filter((k) => k !== key) : [...hidden, key]);
  const shown = sections.filter((s) => !hidden.includes(s.key));

  return (
    <>
      <div className="flex flex-wrap justify-end gap-2 border-b border-neutral-200 px-4 py-3 sm:px-6 lg:px-9">
        <div ref={ref} className="relative">
          <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="dialog" className={actionButton}>
            <PlusIcon />
            Customize Dashboard
          </button>
          {open && (
            <div role="dialog" aria-label="Customize dashboard" className="absolute top-full right-0 z-20 mt-2 w-64 rounded-lg border border-neutral-200 bg-white p-4 shadow-xl sm:left-0 sm:right-auto">
              <p className="text-sm font-semibold">Show on dashboard</p>
              <ul className="mt-3 space-y-2.5">
                {sections.map((s) => (
                  <li key={s.key}>
                    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700">
                      <input type="checkbox" checked={!hidden.includes(s.key)} onChange={() => toggle(s.key)} className="size-4 accent-[#ffb13b]" />
                      {s.label}
                    </label>
                  </li>
                ))}
              </ul>
              {hidden.length > 0 && (
                <button type="button" onClick={() => write([])} className="mt-4 text-xs font-medium text-brand hover:underline">
                  Show everything
                </button>
              )}
            </div>
          )}
        </div>
        {actions}
      </div>

      <div className="space-y-6 px-4 pt-6 pb-12 sm:px-6 lg:px-9 lg:pt-7">
        {greeting}
        {shown.map((s) => (
          <div key={s.key}>{s.content}</div>
        ))}
        {shown.length === 0 && (
          <p className="rounded-lg border border-dashed border-neutral-300 px-4 py-10 text-center text-sm text-neutral-500">
            Every section is hidden. Use Customize Dashboard to bring them back.
          </p>
        )}
      </div>
    </>
  );
}
