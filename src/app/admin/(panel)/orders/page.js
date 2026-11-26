import { requireAdmin } from "@/lib/admin/auth";
import ComingSoon from "@/components/admin/ComingSoon";

export const metadata = { title: "Orders" };

export default async function Page() {
  await requireAdmin("orders");
  return <ComingSoon title="Orders" text="The full orders list is the next screen to build. Send the design and it will appear here." />;
}
