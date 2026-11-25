import { requireAdmin } from "@/lib/admin/auth";
import ComingSoon from "@/components/admin/ComingSoon";

export const metadata = { title: "Add New Product" };

export default async function Page() {
  await requireAdmin();
  return <ComingSoon title="Add New Product" text="Adding products is the next screen to build. Send the design and it will appear here." />;
}
