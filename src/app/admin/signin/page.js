import { redirect } from "next/navigation";
import AdminSignInForm from "@/components/admin/AdminSignInForm";
import { getAdmin } from "@/lib/admin/auth";

export const metadata = { title: "Sign in" };

export default async function AdminSignInPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16 sm:px-8">
      <div className="w-full max-w-[33rem] -translate-y-[6vh]">
        <h1 className="text-center text-[1.75rem] font-bold text-brand sm:text-[2rem]">Welcome Back</h1>
        <AdminSignInForm />
      </div>
    </div>
  );
}
