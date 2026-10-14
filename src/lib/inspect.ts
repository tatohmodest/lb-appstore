import "server-only";
import { ALLOWED_IMAGE_TYPES, uploadToR2 } from "./r2";

// Reads a live PWA (HTML + manifest), scores it against our install
// checklist and, optionally, copies its icon and screenshots into R2.

type ManifestIcon = { src: string; sizes?: string; type?: string; purpose?: string };
type Manifest = {
  name?: string;
  short_name?: string;
  description?: string;
  start_url?: string;
  display?: string;
  theme_color?: string;
  background_color?: string;
  icons?: ManifestIcon[];
  screenshots?: (ManifestIcon & { form_factor?: string })[];
  categories?: string[];
};

export type Check = { id: string; label: string; ok: boolean | null; hint: string };

export type InspectResult = {
  url: string;
  manifestUrl: string | null;
  name: string;
  subtitle: string;
  description: string;
  themeColor: string | null;
  iconUrl: string | null;
  coverUrl: string | null;
  screenshots: string[];
  tags: string[];
  checks: Check[];
  score: number;
};

const UA = "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Mobile Safari/537.36 LBStoreBot/1.0";

async function get(url: string, ms = 20_000, retries = 1): Promise<Response> {
  try {
    return await fetch(url, { headers: { "user-agent": UA }, redirect: "follow", signal: AbortSignal.timeout(ms), cache: "no-store" });
  } catch (e) {
    // Cold-starting hosts sometimes stall on the first hit; one retry fixes most of them.
    if (retries > 0) return get(url, ms, retries - 1);
    throw e;
  }
}

function tags(html: string, name: string) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map((m) => {
    const attrs: Record<string, string> = {};
    for (const a of m[0].matchAll(/([a-zA-Z:-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
      attrs[a[1].toLowerCase()] = a[3] ?? a[4] ?? a[5] ?? "";
    }
    return attrs;
  });
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
function decode(s: string) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m)
    .trim();
}

/** "LBPay | Send money in Cameroon" -> ["LBPay", "Send money in Cameroon"] */
function splitTitle(title: string): [string, string] {
  const parts = title.split(/\s+[|–—:-]\s+/).map((p) => p.trim()).filter(Boolean);
  if (parts.length < 2) return [title.trim(), ""];
  // The brand is usually the shortest part ("Long tagline | LBvote")
  const words = (s: string) => s.split(/\s+/).length;
  const brand = parts.reduce((a, b) => (words(b) < words(a) ? b : a));
  const i = words(brand) <= 3 && words(parts[0]) > 4 ? parts.indexOf(brand) : 0;
  return [parts[i], parts.filter((_, j) => j !== i).join(" · ")];
}

const largest = (sizes?: string) =>
  Math.max(0, ...(sizes ?? "").split(/\s+/).map((s) => (s === "any" ? 1024 : Number(s.split("x")[0]) || 0)));

async function copyToR2(src: string, folder: string) {
  try {
    const res = await get(src, 15_000);
    if (!res.ok) return null;
    const type = (res.headers.get("content-type") || "").split(";")[0].trim();
    if (!ALLOWED_IMAGE_TYPES.includes(type)) return null;
    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.byteLength > 8 * 1024 * 1024) return null;
    return await uploadToR2(buf, type, folder);
  } catch {
    return null;
  }
}

export async function inspectPwa(input: string, importAssets: boolean): Promise<InspectResult> {
  const url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Only http(s) URLs");

  const pageRes = await get(url.toString());
  if (!pageRes.ok) throw new Error(`The page returned ${pageRes.status}`);
  const finalUrl = pageRes.url || url.toString();
  const html = (await pageRes.text()).slice(0, 2_000_000);

  const links = tags(html, "link");
  const metas = tags(html, "meta");
  const metaContent = (n: string) => {
    const v = metas.find((m) => m.name?.toLowerCase() === n || m.property?.toLowerCase() === n)?.content;
    return v ? decode(v) : undefined;
  };
  const manifestHref = links.find((l) => l.rel?.toLowerCase().split(/\s+/).includes("manifest"))?.href;
  const appleIcon = links.find((l) => l.rel?.toLowerCase().includes("apple-touch-icon"))?.href;
  const title = decode(html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? "");
  const ogImage = metaContent("og:image") || metaContent("twitter:image");
  const hasSdk = /lb-install\.js/.test(html);

  let manifest: Manifest = {};
  let manifestUrl: string | null = null;
  if (manifestHref) {
    manifestUrl = new URL(manifestHref, finalUrl).toString();
    try {
      const r = await get(manifestUrl);
      if (r.ok) manifest = await r.json();
    } catch {}
  }

  const icons = (manifest.icons ?? []).map((i) => ({ ...i, src: new URL(i.src, manifestUrl ?? finalUrl).toString() }));
  const anyIcons = icons.filter((i) => !i.purpose || i.purpose.includes("any"));
  const bestIcon = [...(anyIcons.length ? anyIcons : icons)].sort((a, b) => largest(b.sizes) - largest(a.sizes))[0];
  const shots = (manifest.screenshots ?? [])
    .map((s) => ({ ...s, src: new URL(s.src, manifestUrl ?? finalUrl).toString() }))
    .sort((a, b) => (a.form_factor === "narrow" ? -1 : 0) - (b.form_factor === "narrow" ? -1 : 0));

  // Service worker: we can't execute JS, so look for a registration hint or a common sw file.
  let sw: boolean | null = /serviceWorker\s*\.\s*register/.test(html) ? true : null;
  if (sw === null) {
    for (const p of ["/sw.js", "/service-worker.js", "/serviceworker.js"]) {
      try {
        const r = await get(new URL(p, finalUrl).toString(), 5000, 0);
        if (r.ok && /javascript/.test(r.headers.get("content-type") || "")) {
          sw = true;
          break;
        }
      } catch {}
    }
  }

  const display = manifest.display ?? "";
  const checks: Check[] = [
    { id: "https", label: "Served over HTTPS", ok: finalUrl.startsWith("https://"), hint: "Browsers only install apps served over HTTPS." },
    { id: "manifest", label: "Web app manifest", ok: !!manifestUrl && !!manifest.name, hint: 'Add <link rel="manifest" href="/manifest.webmanifest">.' },
    { id: "name", label: "name & short_name", ok: !!manifest.name && !!manifest.short_name, hint: "Both appear on the Home Screen and install dialog." },
    { id: "display", label: "Opens full-screen (standalone)", ok: ["standalone", "fullscreen", "minimal-ui"].includes(display), hint: 'Set "display": "standalone".' },
    { id: "start", label: "start_url", ok: !!manifest.start_url, hint: "Tells the OS which page to open." },
    { id: "icon192", label: "192 px icon", ok: icons.some((i) => largest(i.sizes) >= 192), hint: "Required for Android install." },
    { id: "icon512", label: "512 px icon", ok: icons.some((i) => largest(i.sizes) >= 512), hint: "Used for splash screens and the store." },
    { id: "maskable", label: "Maskable icon", ok: icons.some((i) => i.purpose?.includes("maskable")), hint: "Lets Android shape the icon without white borders." },
    { id: "apple", label: "apple-touch-icon", ok: !!appleIcon, hint: "Without it, iPhone shows a page screenshot as the icon." },
    { id: "theme", label: "theme_color", ok: !!manifest.theme_color || !!metaContent("theme-color"), hint: "Colors the status bar and title bar." },
    { id: "screens", label: "Screenshots in manifest", ok: shots.length > 0, hint: "Chrome shows them in the rich install dialog." },
    { id: "sw", label: "Service worker", ok: sw, hint: "Needed for offline support and installability in Chrome." },
    { id: "sdk", label: "LB Install SDK", ok: hasSdk, hint: "Add /sdk/lb-install.js so Get opens a branded install sheet." },
  ];
  const scored = checks.filter((c) => c.ok !== null);
  const score = Math.round((scored.filter((c) => c.ok).length / Math.max(1, scored.length)) * 100);

  const fallbackIcon = links.find((l) => /\bicon\b/i.test(l.rel ?? "") && /png|svg|webp/i.test(l.href ?? ""))?.href;
  let iconUrl = bestIcon?.src ?? (appleIcon || fallbackIcon ? new URL((appleIcon || fallbackIcon)!, finalUrl).toString() : null);
  let coverUrl = ogImage ? new URL(ogImage, finalUrl).toString() : null;
  let screenshots = shots.slice(0, 8).map((s) => s.src);

  if (importAssets) {
    const [icon, cover, shotUrls] = await Promise.all([
      iconUrl ? copyToR2(iconUrl, "icons") : null,
      coverUrl ? copyToR2(coverUrl, "covers") : null,
      Promise.all(screenshots.map((s) => copyToR2(s, "screenshots"))),
    ]);
    iconUrl = icon ?? iconUrl;
    coverUrl = cover;
    screenshots = shotUrls.filter((s): s is string => !!s);
  }

  const rawName = decode(manifest.short_name && (manifest.name ?? "").length > 24 ? manifest.short_name : manifest.name || manifest.short_name || title);
  const [name, titleTail] = splitTitle(rawName);
  const [, pageTail] = splitTitle(title);
  const description = decode(manifest.description || metaContent("description") || metaContent("og:description") || "");

  const launch = new URL(manifest.start_url ? new URL(manifest.start_url, manifestUrl ?? finalUrl) : finalUrl);
  for (const k of [...launch.searchParams.keys()]) if (k.startsWith("utm_")) launch.searchParams.delete(k);

  return {
    url: launch.toString(),
    manifestUrl,
    name,
    subtitle: (titleTail || pageTail || description.split(/(?<=[.!?])\s/)[0] || "").slice(0, 90),
    description,
    themeColor: manifest.theme_color || metaContent("theme-color") || null,
    iconUrl,
    coverUrl,
    screenshots,
    tags: (manifest.categories ?? []).map((c) => c.toLowerCase()),
    checks,
    score,
  };
}
