export type Platform = "ios-safari" | "ios-other" | "android" | "desktop" | "in-app";

const IN_APP = /FBAN|FBAV|FB_IAB|Instagram|Line\/|TikTok|musical_ly|Bytedance|Snapchat|Twitter|LinkedInApp|Pinterest|WhatsApp|GSA\/|; wv\)/i;

export function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);

  if (IN_APP.test(ua)) return "in-app";
  if (isIOS) return /CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/.test(ua) ? "ios-other" : "ios-safari";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

/** Collapsed platform name for analytics. */
export function platformFamily(p: Platform) {
  return p.startsWith("ios") ? "ios" : p === "in-app" ? "other" : p;
}

export function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** URL we open when someone taps Get – the LB Install SDK in each app reacts to `lbstore=1`. */
export function installUrl(url: string) {
  try {
    const u = new URL(url);
    u.searchParams.set("lbstore", "1");
    return u.toString();
  } catch {
    return url;
  }
}
