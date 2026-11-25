import { getSession } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/users";

// Who is signed in? Used by the navbar. Returns { user: { firstName } | null }.
export async function GET() {
  const session = await getSession();
  const user = session && (await findUserById(session.userId));
  return Response.json(
    { user: user ? { firstName: user.firstName } : null },
    { headers: { "Cache-Control": "no-store" } }
  );
}
