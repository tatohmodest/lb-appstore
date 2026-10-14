// The service worker is served from a route so its cache version changes with
// every build: each deploy installs a fresh worker that drops stale pages and assets.
const BUILD = process.env.NEXT_PUBLIC_BUILD_ID ?? "dev";

const SOURCE = `/* LBStore service worker */
const VERSION = "lbstore-__BUILD__";
const SHELL = \`\${VERSION}-shell\`;
const RUNTIME = \`\${VERSION}-runtime\`;
const IMAGES = \`\${VERSION}-images\`;
const PRECACHE = ["/", "/offline", "/icons/192", "/icons/512"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // Pages: network first, fall back to the last copy, then the offline screen.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok && url.origin === location.origin && !url.pathname.startsWith("/studio")) {
            const copy = res.clone();
            caches.open(RUNTIME).then((c) => c.put(request, copy)).then(() => trim(RUNTIME, 60));
          }
          return res;
        })
        .catch(async () => (await caches.match(request)) || (await caches.match("/offline"))),
    );
    return;
  }

  // Hashed build assets and icons never change: cache first.
  if (url.origin === location.origin && (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/"))) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            const copy = res.clone();
            caches.open(SHELL).then((c) => c.put(request, copy));
            return res;
          }),
      ),
    );
    return;
  }

  // App icons & screenshots from the CDN: stale while revalidate.
  if (request.destination === "image") {
    event.respondWith(
      caches.open(IMAGES).then(async (cache) => {
        const hit = await cache.match(request);
        const network = fetch(request)
          .then((res) => {
            if (res.ok || res.type === "opaque") cache.put(request, res.clone()).then(() => trim(IMAGES, 200));
            return res;
          })
          .catch(() => hit);
        return hit || network;
      }),
    );
  }
});
`;

export function GET() {
  return new Response(SOURCE.replace("__BUILD__", BUILD), {
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "no-cache",
      "service-worker-allowed": "/",
    },
  });
}
