import { db } from "@/lib/db";

const PLATFORMS = new Set(["ios", "android", "desktop", "other"]);

// Counts a "Get" tap. Counts are refreshed on the public pages with the
// regular cache lifetime, so we don't invalidate on every tap.
export async function POST(req: Request, ctx: RouteContext<"/api/apps/[slug]/get">) {
  const { slug } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const platform = PLATFORMS.has(body?.platform) ? body.platform : "other";

  const app = await db.app.findUnique({ where: { slug }, select: { id: true } });
  if (!app) return Response.json({ ok: false }, { status: 404 });

  await db.$transaction([
    db.app.update({ where: { id: app.id }, data: { installs: { increment: 1 } } }),
    db.installEvent.create({ data: { appId: app.id, platform } }),
  ]);
  return Response.json({ ok: true });
}
