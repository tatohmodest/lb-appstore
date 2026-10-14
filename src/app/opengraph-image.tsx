import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "LBStore: every LoopingBinary app, installed instantly";

export default function OG() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#040806", color: "white", position: "relative" }}>
        <div style={{ position: "absolute", top: -200, right: -100, width: 700, height: 700, borderRadius: 700, background: "radial-gradient(circle, rgba(0,179,105,.55), transparent 65%)" }} />
        <div style={{ position: "absolute", bottom: -260, left: 200, width: 700, height: 700, borderRadius: 700, background: "radial-gradient(circle, rgba(31,224,189,.3), transparent 65%)" }} />
        <div style={{ display: "flex", width: 120, height: 120, borderRadius: 28, alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#3bef9f,#00b369 50%,#006b3f)" }}>
          <svg width="84" height="56" viewBox="8 16 48 32"><path d="M32 32c-4-5-7-8-11-8a8 8 0 0 0 0 16c4 0 7-3 11-8s7-8 11-8a8 8 0 0 1 0 16c-4 0-7-3-11-8Z" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" /></svg>
        </div>
        <div style={{ fontSize: 88, fontWeight: 700, letterSpacing: -3, marginTop: 48, lineHeight: 1 }}>LBStore</div>
        <div style={{ fontSize: 40, opacity: 0.7, marginTop: 18 }}>Every LoopingBinary app. Installed in seconds.</div>
      </div>
    ),
    size,
  );
}
