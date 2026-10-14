import { isAdmin } from "@/lib/auth";
import { inspectPwa } from "@/lib/inspect";

export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { url, importAssets } = await req.json().catch(() => ({}));
  if (typeof url !== "string" || !url.trim()) return Response.json({ error: "Enter a URL" }, { status: 400 });

  try {
    return Response.json(await inspectPwa(url.trim(), !!importAssets));
  } catch (e) {
    const message = e instanceof Error ? e.message : "Could not read that app";
    return Response.json({ error: `Couldn't read that app: ${message}` }, { status: 422 });
  }
}
