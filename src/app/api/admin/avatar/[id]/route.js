import { getAdmin } from "@/lib/admin/auth";
import { findUserById } from "@/lib/auth/users";
import { readAvatar } from "@/lib/admin/avatars";

// An admin's profile photo. Only visible to signed-in admins.
export async function GET(_request, { params }) {
  if (!(await getAdmin())) return new Response("Not found", { status: 404 });
  const { id } = await params;
  const user = await findUserById(id);
  const data = user?.avatar && (await readAvatar(user.id, user.avatar.ext));
  if (!data) return new Response("Not found", { status: 404 });
  return new Response(data, {
    headers: {
      "Content-Type": user.avatar.ext === "png" ? "image/png" : "image/jpeg",
      "Cache-Control": "private, no-store",
    },
  });
}
