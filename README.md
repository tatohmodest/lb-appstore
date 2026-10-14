# LBStore

The home of every LoopingBinary app. A PWA app store: apps install straight from the browser on iPhone, Android and desktop, with no App Store or Play Store involved and no "unknown app" warnings. The store is installable too.

## Stack
Next.js 16 (App Router, Cache Components) · Prisma 7 + Supabase Postgres · Cloudflare R2 · Tailwind 4 · Motion

## Run it
```bash
npm install
npm run dev            # http://localhost:3000
```
Database: `npm run db:migrate` (schema changes) · `npm run db:seed` (categories + demo listings) · `npm run db:studio`.

## What's where
| Path | What |
|---|---|
| `/` | Today: editorial featured cards, top charts, editors' choice, categories |
| `/apps`, `/categories/[slug]` | Browse & charts |
| `/apps/[slug]` | App page: smart Get button, screenshots, safety panel, reviews, JSON-LD, share image |
| `/search`, `/library` | Live search · apps this device got (localStorage) |
| `/why`, `/install`, `/developers` | Trust page for clients · install guide · how to ship to the store |
| `/studio` | Admin (password = `ADMIN_PASSWORD`): dashboard, publish/edit apps, **bulk import**, categories, review replies |
| `public/sdk/lb-install.js` | **LB Install SDK.** Add to every LB app so Get opens a branded install sheet |
| `src/app/sw.js/route.ts` | Store service worker, versioned per build so deploys never serve stale pages |

## How "Get" works
A browser can only install a PWA from the app's own origin, so the store can't install another site's app itself. Instead:
1. **Get** opens a sheet tailored to the device: the Android/desktop native prompt, a step-by-step guide on iPhone, a QR code on desktop, and an "open in your browser" escape from Instagram/TikTok in-app browsers.
2. It opens the app with `?lbstore=1`. The **LB Install SDK** in the app sees that and shows the install prompt or guide right there.
3. The Get is counted (`InstallEvent`) for the Studio dashboard.

Add to each LoopingBinary app's `<head>`:
```html
<script src="https://YOUR-STORE-DOMAIN/sdk/lb-install.js" defer></script>
```

## Theme
Brand green is `#00b369`. Light and dark follow the device setting automatically (pure CSS `prefers-color-scheme`, no toggle).

## Bulk import
Studio → **Bulk import** comes pre-filled with every `*.loopingbinary.com` app. Scan them all, check the auto-guessed categories, and publish in one click. Re-scanning an app that's already listed updates it.

## Publishing an app
Studio → **Publish app** → paste the app URL → **Import**. It reads the manifest, copies the icon and screenshots to R2, scores the app against the PWA checklist, and fills the form. Adjust it, then Publish. It goes live immediately.

## Images / R2
Uploads go to `R2_BUCKET` under `R2_PREFIX/`. If `R2_PUBLIC_URL` is empty, files are served through the app at `/media/...` (immutable cached). Once the bucket has public access or a custom domain (e.g. `cdn.loopingbinary.com`), set `R2_PUBLIC_URL` and new uploads link straight to Cloudflare.

## Deploy checklist
- Set every var from `.env.example` on the host. Generate `SESSION_SECRET` with `openssl rand -hex 32`, set a strong `ADMIN_PASSWORD`, and set `NEXT_PUBLIC_SITE_URL` to the real domain.
- `shop.` and `auth.loopingbinary.com` return HTTP 402 (hosting paused). Re-run Bulk import once they're back.
