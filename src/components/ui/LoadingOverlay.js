"use client";

import { useEffect } from "react";

// Full-screen overlay (dimmed page + orange message), as in the designs.
//   variant "loading" (default): spinner — e.g. Pay Now, saving account changes.
//   variant "success": white tile with an orange tick — e.g. "Password updated successfully".
// Blocks clicks and scrolling while it's showing. onDismiss (optional) closes it on click.
export default function LoadingOverlay({ message, variant = "loading", onDismiss }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      role="status"
      aria-live="assertive"
      onClick={onDismiss}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-neutral-800/55 backdrop-blur-[2px]"
    >
      {variant === "success" ? (
        <span className="grid size-20 place-items-center rounded-xl bg-white shadow-lg" aria-hidden>
          <svg viewBox="0 0 24 24" className="size-12 text-brand" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m4.5 12.5 5 5L20 6.5" />
          </svg>
        </span>
      ) : (
        <svg viewBox="0 0 50 50" className="size-14 animate-spin text-brand" aria-hidden>
          <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeDasharray="90 126" />
        </svg>
      )}
      <p className="px-6 text-center text-base font-semibold text-brand [text-shadow:0_1px_2px_rgba(0,0,0,0.55),0_0_14px_rgba(0,0,0,0.45)] sm:text-lg">{message}</p>
    </div>
  );
}
