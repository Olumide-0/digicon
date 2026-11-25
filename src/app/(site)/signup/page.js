import { redirect } from "next/navigation";
import PageIntro from "@/components/ui/PageIntro";
import SignUpForm from "@/components/auth/SignUpForm";
import { getSession } from "@/lib/auth/session";

export const metadata = { title: "Create account" };

const safeNext = (v) => (typeof v === "string" && v.startsWith("/") && !v.startsWith("//") ? v : "/");

export default async function SignUpPage({ searchParams }) {
  const next = safeNext((await searchParams).next);
  if (await getSession()) redirect(next);

  return (
    <div className="min-h-[70vh] bg-white px-4 pt-6 pb-24 text-ink sm:px-8 sm:pt-10 lg:px-12 xl:px-16">
      <PageIntro
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Sign in", href: next !== "/" ? `/signin?next=${encodeURIComponent(next)}` : "/signin" },
          { label: "Sign up", href: "/signup" },
        ]}
        title="Create New Digicon Account"
      >
        Let&apos;s make shopping for your favorite gadgets easier. Create an account to save your details, track your
        orders, and grab exclusive deals.
      </PageIntro>
      <SignUpForm next={next} />
    </div>
  );
}
