import { ImageResponse } from "next/og";

// PNG app icons generated from the LBStore mark: /icons/192, /icons/512, /icons/maskable-512 ...
const SIZES = [96, 180, 192, 512];

export function generateStaticParams() {
  return [...SIZES.map((s) => ({ variant: String(s) })), { variant: "maskable-512" }];
}

export async function GET(_req: Request, ctx: RouteContext<"/icons/[variant]">) {
  const { variant } = await ctx.params;
  const maskable = variant.startsWith("maskable-");
  const size = Number(variant.replace("maskable-", ""));
  if (!SIZES.includes(size)) return new Response("Not found", { status: 404 });

  // Maskable icons need the glyph inside the 80% safe zone and a full-bleed background.
  const glyph = maskable ? size * 0.5 : size * 0.68;
  const radius = maskable ? 0 : size * 0.225;

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: radius,
          background: "linear-gradient(135deg, #3bef9f 0%, #00b369 50%, #006b3f 100%)",
        }}
      >
        <svg width={glyph} height={glyph} viewBox="8 16 48 32">
          <path
            d="M32 32c-4-5-7-8-11-8a8 8 0 0 0 0 16c4 0 7-3 11-8s7-8 11-8a8 8 0 0 1 0 16c-4 0-7-3-11-8Z"
            fill="none"
            stroke="#fff"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { width: size, height: size },
  );
}
