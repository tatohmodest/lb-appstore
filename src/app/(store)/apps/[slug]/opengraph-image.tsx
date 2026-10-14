import { ImageResponse } from "next/og";
import { getApp } from "@/lib/queries";
import { SITE_URL, shade } from "@/lib/utils";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Get it on LBStore";

export default async function OG({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const app = await getApp(slug);
  const name = app?.name ?? "LBStore";
  const c = app?.accentColor ?? "#00b369";
  const raw = app?.iconUrl && !app.iconUrl.endsWith(".svg") ? app.iconUrl : null;
  const icon = raw?.startsWith("/") ? `${SITE_URL}${raw}` : raw;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", padding: 90, gap: 64, color: "white", background: `linear-gradient(135deg, ${shade(c, -0.55)}, ${shade(c, -0.25)})` }}>
        {icon ? (
          <img src={icon} width={300} height={300} style={{ borderRadius: 68 }} alt="" />
        ) : (
          <div style={{ width: 300, height: 300, borderRadius: 68, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 130, fontWeight: 700, background: `linear-gradient(135deg, ${shade(c, 0.35)}, ${c})` }}>
            {name.replace(/^LB\s*/i, "").slice(0, 1)}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ fontSize: 82, fontWeight: 700, letterSpacing: -2, lineHeight: 1.02 }}>{name}</div>
          <div style={{ fontSize: 34, opacity: 0.75, marginTop: 16 }}>{app?.subtitle ?? ""}</div>
          <div style={{ display: "flex", marginTop: 44, alignSelf: "flex-start", padding: "16px 34px", borderRadius: 999, background: "white", color: "black", fontSize: 30, fontWeight: 700 }}>
            Get it on LBStore
          </div>
        </div>
      </div>
    ),
    size,
  );
}
