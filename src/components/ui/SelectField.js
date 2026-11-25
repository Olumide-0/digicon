"use client";

import { useEffect, useId, useRef, useState } from "react";

// Custom dropdown styled like AuthField (WAI-ARIA "select-only combobox" pattern).
// - Mouse: click to open, click an option to choose, click outside to close.
// - Keyboard: ↓/↑/Enter/Space open; ↑/↓/Home/End move; Enter/Space choose; Esc/Tab close;
//   typing letters jumps to the first option that starts with them.
// - Submits with the form through a hidden input called `name`.
// options: [{ value, label, meta?, description? }]   meta = right-aligned extra (e.g. a price)
// onChange is called like a native select: onChange({ target: { name, value } })
export default function SelectField({ name, label, value, onChange, onBlur, options, placeholder, error }) {
  const id = `field-${name}`;
  const listId = `${useId()}-list`;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const wrapRef = useRef(null);
  const buttonRef = useRef(null);
  const listRef = useRef(null);
  const typed = useRef({ text: "", timer: 0 });

  const selectedIndex = options.findIndex((o) => o.value === value);
  const selected = options[selectedIndex];

  const openList = (index = selectedIndex >= 0 ? selectedIndex : 0) => {
    setActive(index);
    setOpen(true);
  };
  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  };
  const choose = (i) => {
    const o = options[i];
    if (o) onChange?.({ target: { name, value: o.value } });
    close();
  };

  // Close when clicking anywhere else.
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Keep the highlighted option in view.
  useEffect(() => {
    if (open) listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const typeAhead = (key) => {
    const t = typed.current;
    clearTimeout(t.timer);
    t.text += key.toLowerCase();
    t.timer = setTimeout(() => (t.text = ""), 600);
    const start = open ? active : selectedIndex;
    const order = [...options.keys()].map((k) => (k + Math.max(start, 0) + (t.text.length === 1 ? 1 : 0)) % options.length);
    const hit = order.find((i) => options[i].label.toLowerCase().startsWith(t.text));
    if (hit === undefined) return;
    if (open) setActive(hit);
    else onChange?.({ target: { name, value: options[hit].value } });
  };

  const onKeyDown = (e) => {
    const last = options.length - 1;
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        openList(e.key === "ArrowUp" ? Math.max(selectedIndex, 0) : undefined);
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        typeAhead(e.key);
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActive((i) => Math.min(last, i + 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
        break;
      case "Home":
        e.preventDefault();
        setActive(0);
        break;
      case "End":
        e.preventDefault();
        setActive(last);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        choose(active);
        break;
      case "Escape":
        e.preventDefault();
        close();
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) typeAhead(e.key);
    }
  };

  // "Blur" = focus has left the whole dropdown (not just moved into its list).
  const onWrapBlur = (e) => {
    if (!wrapRef.current?.contains(e.relatedTarget)) {
      setOpen(false);
      onBlur?.();
    }
  };

  return (
    <div ref={wrapRef} className="relative" onBlur={onWrapBlur}>
      <input type="hidden" name={name} value={value ?? ""} />
      <span id={`${id}-label`} className="sr-only">
        {label}
      </span>

      <button
        ref={buttonRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={`${id}-label ${id}`}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onKeyDown}
        className={`flex h-12 w-full items-center gap-3 rounded-md border bg-white pr-4 pl-4 text-left text-sm outline-none transition focus-visible:ring-2 sm:h-11.5 ${
          error
            ? "border-red-600 focus-visible:ring-red-200"
            : open
              ? "border-brand ring-2 ring-brand/20"
              : "border-neutral-300 focus-visible:border-brand focus-visible:ring-brand/20"
        }`}
      >
        <span className={`min-w-0 flex-1 truncate ${selected ? "text-ink" : "text-neutral-400"}`}>
          {selected ? selected.label : placeholder}
        </span>
        {selected?.meta && <span className="shrink-0 text-xs text-neutral-500">{selected.meta}</span>}
        <svg
          viewBox="0 0 24 24"
          className={`size-4 shrink-0 text-neutral-500 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      <ul
        ref={listRef}
        id={listId}
        role="listbox"
        aria-labelledby={`${id}-label`}
        tabIndex={-1}
        hidden={!open}
        className="absolute inset-x-0 top-full z-30 mt-1.5 max-h-64 overflow-y-auto rounded-md border border-neutral-200 bg-white py-1.5 shadow-xl"
      >
        {options.map((o, i) => {
          const isSelected = o.value === value;
          const isActive = i === active;
          return (
            <li
              key={o.value}
              id={`${listId}-${i}`}
              data-index={i}
              role="option"
              aria-selected={isSelected}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()} // keep focus on the button
              onClick={() => choose(i)}
              className={`flex cursor-pointer items-start gap-3 px-4 py-2.5 text-sm ${isActive ? "bg-brand/10" : ""}`}
            >
              <span className="min-w-0 flex-1">
                <span className={`block ${isSelected ? "font-semibold text-ink" : "text-neutral-700"}`}>{o.label}</span>
                {o.description && <span className="mt-0.5 block text-[11px] text-neutral-500">{o.description}</span>}
              </span>
              {o.meta && <span className={`shrink-0 text-xs ${isSelected ? "text-ink" : "text-neutral-500"}`}>{o.meta}</span>}
              <svg
                viewBox="0 0 24 24"
                className={`mt-0.5 size-4 shrink-0 text-brand ${isSelected ? "" : "invisible"}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden
              >
                <path d="m5 12 5 5 9-10" />
              </svg>
            </li>
          );
        })}
      </ul>

      {error && (
        <p id={`${id}-error`} className="mt-2 flex items-center gap-1.5 text-[11px] text-red-600">
          <svg viewBox="0 0 24 24" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16h.01" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}
