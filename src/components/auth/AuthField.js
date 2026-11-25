"use client";

import { useState } from "react";

function EyeIcon({ open }) {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
      {!open && <path d="M4 4l16 16" />}
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16h.01" />
    </svg>
  );
}

// Text input matching the auth designs: placeholder-only label (kept for screen
// readers), red border + message on error, and a show/hide toggle for passwords.
export default function AuthField({ id: idProp, name, label, type = "text", error, autoComplete, defaultValue, value, onChange, onBlur, maxLength, inputMode, size }) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const id = idProp ?? `field-${name}`;

  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={isPassword && visible ? "text" : type}
          placeholder={label}
          autoComplete={autoComplete}
          inputMode={inputMode}
          {...(value !== undefined ? { value } : { defaultValue })}
          onChange={onChange}
          onBlur={onBlur}
          maxLength={maxLength}
          aria-invalid={Boolean(error)}
          aria-describedby={error?.trim() ? `${id}-error` : undefined}
          className={`h-12 w-full rounded-md border bg-white px-4 text-sm text-ink placeholder:text-neutral-400 outline-none transition focus:ring-2 ${size === "lg" ? "sm:h-14" : "sm:h-11.5"} ${
            isPassword ? "pr-12" : ""
          } ${error ? "border-red-600 focus:ring-red-200" : "border-neutral-300 focus:border-brand focus:ring-brand/20"}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
            aria-pressed={visible}
            className={`absolute top-1/2 right-4 -translate-y-1/2 transition ${error ? "text-red-600" : "text-neutral-500 hover:text-ink"}`}
          >
            <EyeIcon open={visible} />
          </button>
        )}
      </div>
      {error?.trim() && (
        <p id={`${id}-error`} className="mt-2 flex items-center gap-1.5 text-[11px] text-red-600">
          <AlertIcon />
          {error}
        </p>
      )}
    </div>
  );
}
