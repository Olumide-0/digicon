"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn } from "@/lib/auth/actions";
import AuthField from "./AuthField";

export default function SignInForm({ next, notice }) {
  const [state, action, pending] = useActionState(signIn, undefined);
  const error = state?.errors?.form;
  const signUpHref = next !== "/" ? `/signup?next=${encodeURIComponent(next)}` : "/signup";

  return (
    <form action={action} noValidate className="mx-auto mt-14 max-w-[26.25rem] sm:mt-24">
      <input type="hidden" name="next" value={next} />

      {notice && !error && (
        <p className="mb-6 rounded-md bg-brand/10 px-4 py-3 text-center text-xs text-ink">{notice}</p>
      )}

      <div className="space-y-5">
        <AuthField
          name="email"
          label="Email address"
          type="email"
          inputMode="email"
          autoComplete="email"
          defaultValue={state?.values?.email}
          error={error ? " " : undefined}
        />
        <AuthField name="password" label="Password" type="password" autoComplete="current-password" error={error} />
      </div>

      <div className="mt-5 flex items-center justify-between text-xs text-neutral-500">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            name="remember"
            className="size-4 cursor-pointer appearance-none rounded-sm border border-neutral-400 bg-white transition checked:border-brand checked:bg-brand checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22><path d=%22M4 8.5l2.5 2.5L12 5.5%22 fill=%22none%22 stroke=%22white%22 stroke-width=%222%22/></svg>')]"
          />
          Remember me
        </label>
        <Link href="/forgot-password" className="hover:text-ink hover:underline">
          Forgot Password ?
        </Link>
      </div>

      <div className="mt-10 flex flex-col items-center">
        <button
          type="submit"
          disabled={pending}
          className="h-10 w-full max-w-[11.5rem] rounded-md bg-brand text-xs font-medium text-white transition hover:bg-brand-hover disabled:opacity-70"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
        <p className="mt-4 text-[11px] text-ink">
          New Customer ?{" "}
          <Link href={signUpHref} className="font-semibold underline underline-offset-2 hover:text-brand">
            Sign up
          </Link>
        </p>
      </div>
    </form>
  );
}
