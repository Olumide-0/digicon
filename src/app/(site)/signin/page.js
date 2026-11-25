import { redirect } from "next/navigation";
import PageIntro from "@/components/ui/PageIntro";
import SignInForm from "@/components/auth/SignInForm";
import { getSession } from "@/lib/auth/session";

export const metadata = { title: "Sign in" };

const safeNext = (v) => (typeof v === "string" && v.startsWith("/") && !v.startsWith("//") ? v : "/");

export default async function SignInPage({ searchParams }) {
  const params = await searchParams;
  const next = safeNext(params.next);
  if (await getSession()) redirect(next);
  const notice =
    params.reset === "1"
      ? "Your password has been updated. Sign in with your new password."
      : next === "/checkout"
        ? "Please sign in or create an account to check out."
        : undefined;

  return (
    <div className="min-h-[70vh] bg-white px-4 pt-6 pb-24 text-ink sm:px-8 sm:pt-10 lg:px-12 xl:px-16">
      <PageIntro crumbs={[{ label: "Home", href: "/" }, { label: "Sign in", href: "/signin" }]} title="Sign in to Digicon for faster checkout">
        Access your account to save time, track orders, and enjoy exclusive deals.
      </PageIntro>
      <SignInForm next={next} notice={notice} />
    </div>
  );
}
