import { readProductImage } from "@/lib/catalog/images";

// Product photos uploaded in the admin. Public: the shop shows them. Each file name is
// unique and never reused, so browsers can cache it forever.
export async function GET(_request, { params }) {
  const { name } = await params;
  const data = await readProductImage(name);
  if (!data) return new Response("Not found", { status: 404 });
  return new Response(data, {
    headers: {
      "Content-Type": name.endsWith(".png") ? "image/png" : "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
