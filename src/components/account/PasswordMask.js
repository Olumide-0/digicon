"use client";

import { useState } from "react";

// "●●●●●●●●●●●" with an eye icon, as in the design. Passwords are stored scrambled (hashed),
// so nobody — not even Digicon — can show the real one; the eye explains that instead.
export default function PasswordMask() {
  const [hint, setHint] = useState(false);
  return (
    <div>
      <div className="flex items-center gap-5">
        <span className="text-lg leading-none tracking-[0.25em] text-ink" aria-label="Password hidden">
          ●●●●●●●●●●●
        </span>
        <button
          type="button"
          onClick={() => setHint((h) => !h)}
          aria-expanded={hint}
          aria-label="Why can't I see my password?"
          className="text-neutral-700 transition hover:text-brand"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
            <circle cx="12" cy="12" r="3" />
            <path d="M4 4l16 16" />
          </svg>
        </button>
      </div>
      {hint && (
        <p className="mt-3 max-w-sm text-[11px] leading-relaxed text-neutral-500">
          For your security, passwords are stored scrambled, so they can&apos;t be shown, even to us. Use Change Password to set a new one.
        </p>
      )}
    </div>
  );
}
