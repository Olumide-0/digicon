import Link from "next/link";
import PageIntro from "@/components/ui/PageIntro";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { findUserByResetToken } from "@/lib/auth/users";

export const metadata = { title: "Reset password" };

export default async function ResetPasswordPage({ searchParams }) {
  const { token } = await searchParams;
  const user = typeof token === "string" ? await findUserByResetToken(token) : null;

  return (
    <div className="min-h-[70vh] bg-white px-4 pt-6 pb-24 text-ink sm:px-8 sm:pt-10 lg:px-12 xl:px-16">
      <PageIntro
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Sign in", href: "/signin" },
          { label: "Reset password", href: "/reset-password" },
        ]}
        title="Set a new password"
      >
        {user ? `Choose a new password for ${user.email}.` : "This password reset link can't be used."}
      </PageIntro>

      {user ? (
        <ResetPasswordForm token={token} />
      ) : (
        <div className="mx-auto mt-14 max-w-md text-center sm:mt-24">
          <p className="text-sm leading-relaxed text-neutral-600">
            The link is invalid, has already been used, or has expired (links last 30 minutes).
          </p>
          <Link
            href="/forgot-password"
            className="mt-6 inline-block rounded-md bg-brand px-6 py-2.5 text-xs font-medium text-white transition hover:bg-brand-hover"
          >
            Request a new link
          </Link>
        </div>
      )}
    </div>
  );
}
