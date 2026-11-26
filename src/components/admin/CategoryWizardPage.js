"use client";

import { useRouter } from "next/navigation";
import CategoryWizard from "./CategoryWizard";

// /admin/categories/new opened directly: show the wizard, then go to Product Management.
export default function CategoryWizardPage({ tree }) {
  const router = useRouter();
  return <CategoryWizard tree={tree} onClose={() => router.push("/admin/products")} />;
}
