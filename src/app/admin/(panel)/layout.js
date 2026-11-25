import { requireAdmin } from "@/lib/admin/auth";
import AdminShell from "@/components/admin/AdminShell";
import ProfileSetupModal from "@/components/admin/ProfileSetupModal";

// Signed-in admin area: sidebar + top bar. Each page also calls requireAdmin() itself,
// because layouts aren't re-run on every navigation.
export default async function AdminPanelLayout({ children }) {
  const admin = await requireAdmin();
  const me = {
    name: `${admin.firstName} ${admin.lastName}`.trim(),
    avatarUrl: admin.avatar ? `/api/admin/avatar/${admin.id}?v=${admin.avatar.updatedAt}` : null,
  };
  return (
    <AdminShell admin={me}>
      {children}
      {!admin.profileCompletedAt && <ProfileSetupModal firstName={admin.firstName} lastName={admin.lastName} />}
    </AdminShell>
  );
}
