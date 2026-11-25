import Link from "next/link";
import PasswordSetupModal from "@/components/admin/PasswordSetupModal";
import { findUserByResetToken } from "@/lib/auth/users";
import { isAdmin } from "@/lib/admin/auth";

export const metadata = { title: "Secure your account" };

export default async function AdminResetPasswordPage({ searchParams }) {
  const { token } = await searchParams;
  const user = typeof token === "string" ? await findUserByResetToken(token) : null;

  if (!isAdmin(user)) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16 text-center">
        <div className="max-w-md">
          <h1 className="text-[1.75rem] font-bold text-brand">Link expired</h1>
          <p className="mt-4 text-sm leading-relaxed text-neutral-600">
            This link is invalid, has already been used, or has expired (links last 30 minutes).
          </p>
          <Link href="/admin/forgot-password" className="mt-8 inline-block rounded-md bg-brand px-6 py-2.5 text-xs font-medium text-white transition hover:bg-brand-hover">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="flex-1">
      <PasswordSetupModal token={token} />
    </div>
  );
}
