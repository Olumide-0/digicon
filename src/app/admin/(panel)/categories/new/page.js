import { requireAdmin } from "@/lib/admin/auth";
import { getCategoryTree } from "@/lib/catalog/categories";
import CategoryWizardPage from "@/components/admin/CategoryWizardPage";

export const metadata = { title: "Create New Category" };

export default async function NewCategoryPage() {
  await requireAdmin("products");
  return <CategoryWizardPage tree={await getCategoryTree()} />;
}
