"use client";

import Link from "next/link";
import { useActionState } from "react";
import { adminSignIn } from "@/lib/admin/actions";
import AuthField from "@/components/auth/AuthField";

const CHECK =
  "checked:bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22><path d=%22M4 8.5l2.5 2.5L12 5.5%22 fill=%22none%22 stroke=%22white%22 stroke-width=%222%22/></svg>')]";

export default function AdminSignInForm() {
  const [state, action, pending] = useActionState(adminSignIn, undefined);
  const errors = state?.errors ?? {};

  return (
    <form action={action} noValidate className="mt-10 sm:mt-12">
      {errors.form && (
        <p role="alert" className="mb-6 rounded-md bg-red-50 px-4 py-3 text-center text-xs text-red-700">
          {errors.form}
        </p>
      )}

      <div className="space-y-6">
        <AuthField
          name="email"
          label="Email address"
          type="email"
          inputMode="email"
          autoComplete="username"
          size="lg"
          defaultValue={state?.values?.email}
          error={errors.email ?? (errors.form ? " " : undefined)}
        />
        <AuthField name="password" label="Password" type="password" autoComplete="current-password" size="lg" error={errors.password ?? (errors.form ? " " : undefined)} />
      </div>

      <div className="mt-5 flex items-center justify-between text-xs text-neutral-500 sm:text-[13px]">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            name="remember"
            className={`size-4.5 cursor-pointer appearance-none rounded-sm border border-neutral-400 bg-white transition checked:border-brand checked:bg-brand ${CHECK}`}
          />
          Remember me
        </label>
        <Link href="/admin/forgot-password" className="hover:text-ink hover:underline">
          Forgot Password ?
        </Link>
      </div>

      <div className="mt-12 flex justify-center">
        <button
          type="submit"
          disabled={pending}
          className="h-10.5 w-full max-w-[14.75rem] rounded-md bg-brand text-xs font-medium text-white transition hover:bg-brand-hover disabled:opacity-70"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </div>
    </form>
  );
}
