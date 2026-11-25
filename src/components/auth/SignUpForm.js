"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signUp } from "@/lib/auth/actions";
import AuthField from "./AuthField";

export default function SignUpForm({ next }) {
  const [state, action, pending] = useActionState(signUp, undefined);
  const errors = state?.errors ?? {};
  const values = state?.values ?? {};

  // Live "Passwords don't match" check while typing, as in the design.
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const liveMismatch = confirm.length > 0 && confirm !== pw ? "Passwords don't match" : undefined;

  const signInHref = next !== "/" ? `/signin?next=${encodeURIComponent(next)}` : "/signin";

  return (
    <form action={action} noValidate className="mx-auto mt-12 max-w-4xl sm:mt-16">
      <input type="hidden" name="next" value={next} />

      <div className="grid gap-10 md:grid-cols-2 md:gap-6 lg:gap-6">
        <fieldset className="space-y-3 sm:space-y-4">
          <legend className="mb-4 text-sm font-semibold text-neutral-600">Personal Information</legend>
          <AuthField name="firstName" label="First Name" autoComplete="given-name" defaultValue={values.firstName} error={errors.firstName} />
          <AuthField name="lastName" label="Last Name" autoComplete="family-name" defaultValue={values.lastName} error={errors.lastName} />
          <AuthField name="phone" label="Phone Number" type="tel" inputMode="tel" autoComplete="tel" defaultValue={values.phone} error={errors.phone} />
        </fieldset>

        <fieldset className="space-y-3 sm:space-y-4">
          <legend className="mb-4 text-sm font-semibold text-neutral-600">Sign- in Information</legend>
          <AuthField name="email" label="Email address" type="email" inputMode="email" autoComplete="email" defaultValue={values.email} error={errors.email} />
          <AuthField
            name="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            error={errors.password}
            onChange={(e) => setPw(e.target.value)}
          />
          <AuthField
            name="confirmPassword"
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            error={liveMismatch ?? errors.confirmPassword}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </fieldset>
      </div>

      <div className="mt-12 flex flex-col items-center sm:mt-14">
        <button
          type="submit"
          disabled={pending}
          className="h-10 w-full max-w-[11.5rem] rounded-md bg-brand text-xs font-medium text-white transition hover:bg-brand-hover disabled:opacity-70"
        >
          {pending ? "Creating account…" : "Sign up"}
        </button>
        <p className="mt-4 text-[11px] text-ink">
          I have an account ?{" "}
          <Link href={signInHref} className="font-semibold underline underline-offset-2 hover:text-brand">
            Sign in
          </Link>
        </p>
      </div>
    </form>
  );
}
