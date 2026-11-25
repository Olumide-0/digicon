import { requireAdmin } from "@/lib/admin/auth";
import ComingSoon from "@/components/admin/ComingSoon";

export const metadata = { title: "Add New Categories" };

export default async function Page() {
  await requireAdmin();
  return <ComingSoon title="Add New Categories" text="Adding categories is the next screen to build. Send the design and it will appear here." />;
}
