import PageIntro from "@/components/ui/PageIntro";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-[70vh] bg-white px-4 pt-6 pb-24 text-ink sm:px-8 sm:pt-10 lg:px-12 xl:px-16">
      <PageIntro
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Sign in", href: "/signin" },
          { label: "Forgot password", href: "/forgot-password" },
        ]}
        title="Forgot your password?"
      >
        Enter the email address you use for your Digicon account and we&apos;ll send you a link to reset your password.
      </PageIntro>
      <ForgotPasswordForm />
    </div>
  );
}
