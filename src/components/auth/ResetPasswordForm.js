"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { resetPassword } from "@/lib/auth/actions";
import AuthField from "./AuthField";

export default function ResetPasswordForm({ token }) {
  const [state, action, pending] = useActionState(resetPassword, undefined);
  const errors = state?.errors ?? {};
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const liveMismatch = confirm.length > 0 && confirm !== pw ? "Passwords don't match" : undefined;

  return (
    <form action={action} noValidate className="mx-auto mt-14 max-w-[26.25rem] sm:mt-24">
      <input type="hidden" name="token" value={token} />

      {errors.form && (
        <p role="alert" className="mb-6 rounded-md bg-red-50 px-4 py-3 text-center text-xs text-red-700">
          {errors.form}{" "}
          <Link href="/forgot-password" className="font-semibold underline">
            Request a new link
          </Link>
        </p>
      )}

      <div className="space-y-5">
        <AuthField
          name="password"
          label="New password"
          type="password"
          autoComplete="new-password"
          error={errors.password}
          onChange={(e) => setPw(e.target.value)}
        />
        <AuthField
          name="confirmPassword"
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          error={liveMismatch ?? errors.confirmPassword}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>
      <p className="mt-3 text-[11px] text-neutral-500">Use at least 8 characters.</p>

      <div className="mt-10 flex flex-col items-center">
        <button
          type="submit"
          disabled={pending}
          className="h-10 w-full max-w-[11.5rem] rounded-md bg-brand text-xs font-medium text-white transition hover:bg-brand-hover disabled:opacity-70"
        >
          {pending ? "Saving…" : "Reset password"}
        </button>
      </div>
    </form>
  );
}
