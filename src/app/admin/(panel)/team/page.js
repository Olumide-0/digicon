import { requireAdmin } from "@/lib/admin/auth";
import ComingSoon from "@/components/admin/ComingSoon";

export const metadata = { title: "Team Management" };

export default async function Page() {
  await requireAdmin();
  return <ComingSoon title="Team Management" text="Managing admins is the next screen to build. Send the design and it will appear here." />;
}
