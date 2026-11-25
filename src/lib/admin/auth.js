// Admin access (server only). Admins are ordinary accounts with role "admin" in the
// user store; the role is re-read on every request, so removing it takes effect at once.
// Make an account an admin with:  node scripts/make-admin.mjs you@example.com
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/users";

export const isAdmin = (user) => user?.role === "admin";

// The signed-in admin, or null.
export async function getAdmin() {
  const session = await getSession();
  if (!session) return null;
  const user = await findUserById(session.userId);
  return isAdmin(user) ? user : null;
}

// Use at the top of every admin page.
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/signin");
  return admin;
}
