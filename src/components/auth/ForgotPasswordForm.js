"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset } from "@/lib/auth/actions";
import AuthField from "./AuthField";

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-8 text-white" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 6 8.5-6" />
    </svg>
  );
}

export default function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined);

  if (state?.sent) {
    return (
      <div className="mx-auto mt-14 flex max-w-md flex-col items-center text-center sm:mt-24">
        <div className="grid size-[70px] place-items-center rounded-full bg-brand">
          <MailIcon />
        </div>
        <h2 className="mt-6 text-xl font-bold text-black sm:text-2xl">Check your email</h2>
        <p className="mt-4 text-sm leading-relaxed text-neutral-600">
          If an account exists for <span className="font-medium text-ink">{state.email}</span>, we&apos;ve sent a link to
          reset your password. The link expires in 30 minutes.
        </p>
        {state.devLink && (
          <p className="mt-6 w-full rounded-md border border-dashed border-brand bg-brand/10 px-4 py-3 text-left text-xs text-ink">
            <span className="font-semibold">Development only:</span> emails aren&apos;t sent yet, so here is the link:{" "}
            <Link href={state.devLink.replace(/^https?:\/\/[^/]+/, "")} className="whitespace-nowrap text-brand underline">
              Reset password
            </Link>
          </p>
        )}
        <Link
          href="/signin"
          className="mt-8 rounded-md bg-brand px-6 py-2.5 text-xs font-medium text-white transition hover:bg-brand-hover"
        >
          Back to Sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={action} noValidate className="mx-auto mt-14 max-w-[26.25rem] sm:mt-24">
      <AuthField
        name="email"
        label="Email address"
        type="email"
        inputMode="email"
        autoComplete="email"
        defaultValue={state?.values?.email}
        error={state?.errors?.email}
      />
      <div className="mt-10 flex flex-col items-center">
        <button
          type="submit"
          disabled={pending}
          className="h-10 w-full max-w-[11.5rem] rounded-md bg-brand text-xs font-medium text-white transition hover:bg-brand-hover disabled:opacity-70"
        >
          {pending ? "Sending…" : "Send reset link"}
        </button>
        <p className="mt-4 text-[11px] text-ink">
          Remember your password ?{" "}
          <Link href="/signin" className="font-semibold underline underline-offset-2 hover:text-brand">
            Sign in
          </Link>
        </p>
      </div>
    </form>
  );
}
