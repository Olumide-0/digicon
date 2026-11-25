import AdminForgotForm from "@/components/admin/AdminForgotForm";

export const metadata = { title: "Forgot password" };

export default function AdminForgotPasswordPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16 sm:px-8">
      <div className="w-full max-w-[33rem] -translate-y-[6vh]">
        <h1 className="text-center text-[1.75rem] font-bold text-brand sm:text-[2rem]">Forgot Password</h1>
        <p className="mt-4 text-center text-sm text-neutral-600">Enter your admin email and we&apos;ll send you a link to set a new password.</p>
        <AdminForgotForm />
      </div>
    </div>
  );
}
