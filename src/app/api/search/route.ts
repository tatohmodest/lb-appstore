import { searchApps } from "@/lib/queries";

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.slice(0, 60) ?? "";
  const apps = await searchApps(q);
  return Response.json({ apps });
}
