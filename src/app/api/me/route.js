import { getSession } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/users";
import { isAdmin } from "@/lib/admin/auth";

// Who is signed in? Used by the navbar. Returns { user: { firstName, isAdmin } | null }.
export async function GET() {
  const session = await getSession();
  const user = session && (await findUserById(session.userId));
  return Response.json(
    { user: user ? { firstName: user.firstName, isAdmin: isAdmin(user) } : null },
    { headers: { "Cache-Control": "no-store" } }
  );
}
