import { R2_PREFIX, getFromR2 } from "@/lib/r2";

// Streams store uploads out of R2. Keys are content-addressed (never
// overwritten), so responses are cached forever by browsers and CDNs.
export async function GET(_req: Request, ctx: RouteContext<"/media/[...key]">) {
  const { key: parts } = await ctx.params;
  const key = parts.join("/");
  if (!key.startsWith(`${R2_PREFIX}/`) || key.includes("..")) return new Response("Not found", { status: 404 });

  try {
    const obj = await getFromR2(key);
    if (!obj.Body) return new Response("Not found", { status: 404 });
    return new Response(obj.Body.transformToWebStream(), {
      headers: {
        "content-type": obj.ContentType ?? "application/octet-stream",
        "cache-control": "public, max-age=31536000, immutable",
        ...(obj.ContentLength ? { "content-length": String(obj.ContentLength) } : {}),
        ...(obj.ETag ? { etag: obj.ETag } : {}),
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
