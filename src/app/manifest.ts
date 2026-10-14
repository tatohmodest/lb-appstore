import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "LBStore by LoopingBinary",
    short_name: "LBStore",
    description: "Every LoopingBinary app. Install instantly on any device.",
    start_url: "/?source=pwa",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone"],
    orientation: "any",
    background_color: "#040806",
    theme_color: "#040806",
    categories: ["utilities", "productivity", "shopping"],
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Search apps", short_name: "Search", url: "/search", icons: [{ src: "/icons/96", sizes: "96x96" }] },
      { name: "My library", short_name: "Library", url: "/library", icons: [{ src: "/icons/96", sizes: "96x96" }] },
      { name: "Top charts", short_name: "Charts", url: "/apps", icons: [{ src: "/icons/96", sizes: "96x96" }] },
    ],
  };
}
