import { requireAdmin } from "@/lib/admin/auth";
import ComingSoon from "@/components/admin/ComingSoon";

export const metadata = { title: "Inventory Management" };

export default async function Page() {
  await requireAdmin("inventory");
  return <ComingSoon title="Inventory Management" text="Inventory management is the next screen to build. Send the design and it will appear here." />;
}
