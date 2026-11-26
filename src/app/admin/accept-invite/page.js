import Link from "next/link";
import PasswordSetupModal from "@/components/admin/PasswordSetupModal";
import { findInviteByToken, findRole } from "@/lib/team/store";

export const metadata = { title: "Join the team" };

// Link from a team invitation email: set a password, then "Tell us your name".
export default async function AcceptInvitePage({ searchParams }) {
  const { token } = await searchParams;
  const invite = typeof token === "string" ? await findInviteByToken(token) : null;

  if (!invite) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16 text-center">
        <div className="max-w-md">
          <h1 className="text-[1.75rem] font-bold text-brand">Invitation expired</h1>
          <p className="mt-4 text-sm leading-relaxed text-neutral-600">
            This invitation link is invalid, has already been used, or has expired (links last 7 days). Ask the person who invited you to send a new one.
          </p>
          <Link href="/admin/signin" className="mt-8 inline-block rounded-md bg-brand px-6 py-2.5 text-xs font-medium text-white transition hover:bg-brand-hover">
            Go to Sign in
          </Link>
        </div>
      </div>
    );
  }
  const role = await findRole(invite.roleId);
  return (
    <div className="flex-1">
      <PasswordSetupModal
        token={token}
        mode="invite"
        intro={`You've been invited to join Digicon as ${role.name} (${invite.email}). First, create a strong password to protect your account`}
      />
    </div>
  );
}
