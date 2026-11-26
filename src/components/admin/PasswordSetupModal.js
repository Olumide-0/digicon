"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { adminResetPassword } from "@/lib/admin/actions";
import { acceptInviteAction } from "@/lib/team/actions";
import AdminModal, { ModalField, modalButton } from "./AdminModal";

const BARS = 7;
// 0–7: one point each for length 8+, 12+, 16+, lowercase, uppercase, number, symbol.
// Anything under 8 characters stays at 1 bar ("Weak").
export function passwordScore(pw) {
  if (!pw) return 0;
  const points = [pw.length >= 8, pw.length >= 12, pw.length >= 16, /[a-z]/.test(pw), /[A-Z]/.test(pw), /\d/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
  return pw.length < 8 ? 1 : Math.max(2, points);
}
const strengthLabel = (s) => (s <= 2 ? "Weak" : s <= 4 ? "Fair" : s <= 6 ? "Good" : "Strong");

function Strength({ score }) {
  return (
    <div className="mt-4" aria-live="polite">
      <div className="grid grid-cols-7 gap-2 sm:gap-4" aria-hidden>
        {Array.from({ length: BARS }, (_, i) => (
          <span key={i} className={`h-1.5 rounded-full transition-colors ${i < score ? "bg-ink" : "bg-neutral-200"}`} />
        ))}
      </div>
      <p className="mt-4 text-sm text-neutral-600">
        <span className="sr-only">Password strength: </span>
        {strengthLabel(score)}
      </p>
    </div>
  );
}

// mode "reset": forgot-password link. mode "invite": a new team member setting their first password.
export default function PasswordSetupModal({ token, mode = "reset", intro }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(mode === "invite" ? acceptInviteAction : adminResetPassword, undefined);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touched, setTouched] = useState(false);

  const short = password.length > 0 && password.length < 8;
  const passwordError = (touched || state) && short ? "Password must be at least 8 characters" : (!password && state?.errors?.password) || undefined;
  const confirmError = confirm && confirm !== password ? "Passwords don't match" : state?.errors?.confirmPassword && confirm !== password ? state.errors.confirmPassword : undefined;

  return (
    <form action={action} noValidate>
      <input type="hidden" name="token" value={token} />
      <AdminModal
        title="Welcome ! Let's secure your account"
        subtitle={intro ?? "First, create a strong password to protect your account"}
        onClose={() => router.push("/admin/signin")}
        footer={
          <button type="submit" disabled={pending} className={modalButton}>
            {pending ? "Saving…" : "Continue"}
          </button>
        }
      >
        {state?.errors?.form && (
          <p role="alert" className="mb-6 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
            {state.errors.form}
          </p>
        )}
        <ModalField
          name="password"
          label="New Password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setTouched(true);
          }}
          error={passwordError}
        >
          {password && <Strength score={passwordScore(password)} />}
        </ModalField>
        <div className="mt-8">
          <ModalField
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={confirmError}
          />
        </div>
      </AdminModal>
    </form>
  );
}
