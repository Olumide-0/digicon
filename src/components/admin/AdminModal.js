"use client";

import { useEffect } from "react";

// Large white setup modal from the admin designs: orange title, grey subtitle, X in the
// top-right, content, and the main button pinned bottom-right. Full screen on phones.
export default function AdminModal({ title, subtitle, onClose, footer, children, labelledBy = "admin-modal-title" }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose?.();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-neutral-800/55 backdrop-blur-[2px] sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className="flex h-full w-full flex-col overflow-y-auto bg-white px-5 text-left pt-8 pb-6 text-ink sm:h-auto sm:max-h-full sm:min-h-[42.5rem] sm:max-w-[47.5rem] sm:rounded-sm sm:px-8 sm:pt-10 sm:pb-8"
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2 id={labelledBy} className="text-base font-semibold text-brand sm:text-lg">
              {title}
            </h2>
            <p className="mt-4 text-sm text-neutral-600">{subtitle}</p>
          </div>
          {onClose && (
            <button type="button" onClick={onClose} aria-label="Close" className="-mt-1 shrink-0 p-1 text-black transition hover:text-brand">
              <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden>
                <path d="M5 5l14 14M19 5 5 19" />
              </svg>
            </button>
          )}
        </div>
        <div className="mt-10 flex-1 sm:mt-14">{children}</div>
        <div className="mt-10 flex justify-end">{footer}</div>
      </div>
    </div>
  );
}

// Label above the input, plain red message underneath (as in the designs).
export function ModalField({ name, label, type = "text", autoComplete, defaultValue, value, onChange, error, children }) {
  const id = `admin-${name}`;
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-black">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        {...(value !== undefined ? { value } : { defaultValue })}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`mt-4 h-12 w-full rounded-md border bg-white px-4 text-sm text-ink outline-none transition focus:ring-2 ${
          error ? "border-red-500 focus:ring-red-200" : "border-neutral-200 focus:border-brand focus:ring-brand/20"
        }`}
      />
      {error && (
        <p id={`${id}-error`} className="mt-5 text-sm text-red-600">
          {error}
        </p>
      )}
      {children}
    </div>
  );
}

export const modalButton =
  "h-10 min-w-[6.75rem] rounded-md bg-brand px-4 text-sm font-medium text-white transition hover:bg-brand-hover disabled:opacity-70";
