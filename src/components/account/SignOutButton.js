"use client";

import { useRef } from "react";
import { useFormStatus } from "react-dom";
import { signOut } from "@/lib/auth/actions";

function YesButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="h-10 min-w-28 rounded-md bg-brand px-5 text-sm font-semibold text-white transition hover:bg-brand-hover disabled:opacity-70"
    >
      {pending ? "Signing out…" : "Yes"}
    </button>
  );
}

// "Sign out" link that asks for confirmation first.
// Uses the native <dialog>: Esc, clicking outside, or "I'm kidding" all cancel.
export default function SignOutButton({ className = "" }) {
  const dialogRef = useRef(null);
  const close = () => dialogRef.current?.close();

  return (
    <>
      <button type="button" onClick={() => dialogRef.current?.showModal()} className={className}>
        Sign out
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="signout-title"
        onClick={(e) => e.target === dialogRef.current && close()}
        className="m-auto w-[min(24rem,calc(100vw-2rem))] rounded-xl bg-white p-0 text-ink shadow-2xl backdrop:bg-neutral-800/55 backdrop:backdrop-blur-[2px]"
      >
        <div className="px-6 pt-8 pb-6 text-center sm:px-8">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand/15 text-brand" aria-hidden>
            <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
              <path d="M10 17l-5-5 5-5M5 12h11" />
            </svg>
          </span>
          <h2 id="signout-title" className="mt-4 text-lg font-semibold">
            Are you sure you want to log out?
          </h2>
          <p className="mt-2 text-sm text-neutral-600">You&apos;ll need to sign in again to check out or see your orders.</p>

          <form action={signOut} className="mt-7 flex justify-center gap-3">
            <button
              type="button"
              autoFocus
              onClick={close}
              className="h-10 min-w-28 rounded-md border border-neutral-300 px-5 text-sm text-neutral-700 transition hover:border-ink hover:text-ink"
            >
              I&apos;m kidding
            </button>
            <YesButton />
          </form>
        </div>
      </dialog>
    </>
  );
}
