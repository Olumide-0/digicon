"use client";

import Link from "next/link";
import { useActionState } from "react";
import { adminRequestPasswordReset } from "@/lib/admin/actions";
import AuthField from "@/components/auth/AuthField";

export default function AdminForgotForm() {
  const [state, action, pending] = useActionState(adminRequestPasswordReset, undefined);

  if (state?.sent) {
    return (
      <div className="mt-8 text-center">
        <p className="text-sm leading-relaxed text-neutral-600">
          If <span className="font-medium text-ink">{state.email}</span> belongs to an admin account, we&apos;ve sent a link to set a new password.
          It expires in 30 minutes.
        </p>
        {state.devLink && (
          <p className="mt-6 rounded-md border border-dashed border-brand bg-brand/10 px-4 py-3 text-left text-xs text-ink">
            <span className="font-semibold">Development only:</span> emails aren&apos;t sent yet, so here is the link:{" "}
            <Link href={state.devLink.replace(/^https?:\/\/[^/]+/, "")} className="whitespace-nowrap text-brand underline">
              Set new password
            </Link>
          </p>
        )}
        <Link href="/admin/signin" className="mt-10 inline-block text-xs text-neutral-500 hover:text-ink hover:underline">
          Back to Sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={action} noValidate className="mt-10 sm:mt-12">
      <AuthField name="email" label="Email address" type="email" inputMode="email" autoComplete="username" size="lg" defaultValue={state?.values?.email} error={state?.errors?.email} />
      <div className="mt-12 flex flex-col items-center gap-5">
        <button
          type="submit"
          disabled={pending}
          className="h-10.5 w-full max-w-[14.75rem] rounded-md bg-brand text-xs font-medium text-white transition hover:bg-brand-hover disabled:opacity-70"
        >
          {pending ? "Sending…" : "Send reset link"}
        </button>
        <Link href="/admin/signin" className="text-xs text-neutral-500 hover:text-ink hover:underline">
          Back to Sign in
        </Link>
      </div>
    </form>
  );
}
