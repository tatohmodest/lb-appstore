import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  BadgeCheck,
  Bell,
  Camera,
  ChevronLeft,
  Globe,
  Laptop,
  Lock,
  MapPin,
  Mic,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Tablet,
  Trash2,
  WifiOff,
  type LucideIcon,
} from "lucide-react";
import { AppIcon } from "@/components/app-icon";
import { AppTile, MockScreens, SectionHeader, toInstallable } from "@/components/app-cards";
import { ExpandableText, ScreenshotGallery, ShareButton, WriteReview } from "@/components/app-detail-client";
import { CategoryIcon } from "@/components/category-icon";
import { GetButton } from "@/components/get-button";
import { Stars } from "@/components/stars";
import { Footer } from "@/components/ui/footer";
import { getApp } from "@/lib/queries";
import { SITE_URL, formatCount, formatDate, formatSize, shade } from "@/lib/utils";

export async function generateMetadata(props: PageProps<"/apps/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const app = await getApp(slug);
  if (!app) return { title: "App not found" };
  return {
    title: `${app.name}: ${app.subtitle || "on LBStore"}`,
    description: app.description.slice(0, 160) || app.subtitle,
    alternates: { canonical: `/apps/${app.slug}` },
    openGraph: { title: app.name, description: app.subtitle, images: app.coverUrl || app.iconUrl ? [app.coverUrl || app.iconUrl!] : undefined },
  };
}

export default function AppPage(props: PageProps<"/apps/[slug]">) {
  return (
    <Suspense fallback={<AppSkeleton />}>
      <AppDetail params={props.params} />
    </Suspense>
  );
}

const PERMISSION_ICONS: Record<string, LucideIcon> = {
  camera: Camera,
  microphone: Mic,
  location: MapPin,
  notifications: Bell,
};

async function AppDetail({ params }: { params: PageProps<"/apps/[slug]">["params"] }) {
  const { slug } = await params;
  const app = await getApp(slug);
  if (!app) notFound();

  const c = app.accentColor;
  const totalReviews = app.histogram.reduce((a, b) => a + b, 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: app.name,
    description: app.description || app.subtitle,
    url: app.url,
    applicationCategory: app.category?.name ?? "Application",
    operatingSystem: "Any (web browser)",
    image: app.iconUrl ?? undefined,
    author: { "@type": "Organization", name: app.developer },
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    ...(app.ratingCount > 0 && {
      aggregateRating: { "@type": "AggregateRating", ratingValue: app.ratingAvg.toFixed(1), ratingCount: app.ratingCount },
    }),
    sameAs: `${SITE_URL}/apps/${app.slug}`,
  };

  return (
    <article className="relative">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Ambient glow from the app's own color */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[480px] w-[900px] -translate-x-1/2 rounded-full opacity-35 blur-[100px] dark:opacity-25" style={{ background: c }} />
        <div className="absolute -top-20 right-0 h-[300px] w-[400px] rounded-full opacity-25 blur-[90px]" style={{ background: shade(c, 0.4) }} />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg" />
      </div>

      <div className="px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] sm:px-8 lg:pt-6">
        <Link href="/apps" className="inline-flex items-center gap-0.5 text-[15px] font-medium text-brand">
          <ChevronLeft className="size-5" /> Apps
        </Link>
      </div>

      {/* Header */}
      <header className="flex gap-5 px-4 pt-5 sm:gap-7 sm:px-8 sm:pt-8">
        <AppIcon name={app.name} iconUrl={app.iconUrl} accentColor={c} size={120} className="sm:!size-[168px]" />
        <div className="flex min-w-0 flex-1 flex-col">
          <h1 className="text-[24px] leading-tight font-bold tracking-tight text-balance sm:text-[40px]">{app.name}</h1>
          <p className="mt-0.5 line-clamp-2 text-[15px] text-muted sm:text-lg">{app.subtitle}</p>
          <p className="mt-1 inline-flex items-center gap-1 text-[13px] font-medium text-brand">
            {app.developer} <BadgeCheck className="size-3.5" />
          </p>
          <div className="mt-auto flex items-center gap-3 pt-4">
            <GetButton app={toInstallable(app)} size="lg" autoOpen />
            <ShareButton title={app.name} text={app.subtitle} />
          </div>
        </div>
      </header>

      {/* Stats strip */}
      <div className="no-scrollbar mt-7 overflow-x-auto px-4 sm:px-8">
        <dl className="flex min-w-max divide-x divide-line border-y border-line py-3 text-center">
          <Stat label={`${formatCount(app.ratingCount)} ratings`} value={app.ratingCount ? app.ratingAvg.toFixed(1) : "New"} sub={<Stars value={app.ratingAvg} size={11} className="text-muted" />} />
          <Stat label="Gets" value={formatCount(app.installs)} sub="installs" />
          <Stat label="Age" value={app.ageRating} sub="Years old" />
          {app.category && (
            <Stat label="Category" value={<CategoryIcon name={app.category.icon} className="mx-auto size-6" />} sub={app.category.name} />
          )}
          <Stat label="Download" value={formatSize(app.sizeKb)} sub={app.sizeKb ? "on first open" : "No download"} />
          <Stat label="Offline" value={app.offline ? <WifiOff className="mx-auto size-6" /> : "No"} sub={app.offline ? "Works offline" : "Needs internet"} />
          <Stat label="Version" value={app.version} sub={formatDate(app.updatedAt)} />
        </dl>
      </div>

      {/* Screenshots */}
      <section className="mt-8">
        {app.screenshots.length > 0 ? (
          <ScreenshotGallery shots={app.screenshots} name={app.name} />
        ) : (
          <div className="rail gap-3 [--rail-pad:1rem] sm:[--rail-pad:2rem]">
            <MockScreens name={app.name} color={c} iconUrl={app.iconUrl} />
          </div>
        )}
        <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 px-4 text-[13px] text-muted sm:px-8">
          <span className="font-medium text-ink-2">Runs on</span>
          <span className="flex items-center gap-1"><Smartphone className="size-4" /> iPhone</span>
          <span className="flex items-center gap-1"><Smartphone className="size-4" /> Android</span>
          <span className="flex items-center gap-1"><Tablet className="size-4" /> iPad</span>
          <span className="flex items-center gap-1"><Laptop className="size-4" /> Mac, Windows &amp; Linux</span>
        </p>
      </section>

      <div className="mt-10 grid gap-10 px-4 sm:px-8 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-10">
          {app.description && (
            <section>
              <ExpandableText text={app.description} />
            </section>
          )}

          {app.whatsNew && (
            <section>
              <div className="flex items-baseline justify-between">
                <h2 className="text-[22px] font-semibold tracking-tight">What&apos;s New</h2>
                <span className="text-sm text-muted">Version {app.version}</span>
              </div>
              <p className="mt-1 text-xs text-muted">{formatDate(app.updatedAt)} · You get it automatically</p>
              <p className="mt-3 text-[15px] leading-relaxed whitespace-pre-line text-ink-2">{app.whatsNew}</p>
            </section>
          )}

          {/* Ratings */}
          <section>
            <div className="flex items-baseline justify-between">
              <h2 className="text-[22px] font-semibold tracking-tight">Ratings &amp; Reviews</h2>
              <WriteReview appId={app.id} appName={app.name} />
            </div>
            <div className="mt-4 flex items-center gap-6">
              <div className="text-center">
                <p className="text-6xl font-bold tracking-tighter tabular-nums">{app.ratingCount ? app.ratingAvg.toFixed(1) : "–"}</p>
                <p className="text-sm font-medium text-muted">out of 5</p>
              </div>
              <div className="flex-1">
                {app.histogram.map((count, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Stars value={5 - i} size={8} className="w-14 justify-end text-muted" />
                    <span className="h-1 flex-1 overflow-hidden rounded-full bg-surface-3">
                      <span className="block h-full rounded-full bg-muted" style={{ width: `${totalReviews ? (count / totalReviews) * 100 : 0}%` }} />
                    </span>
                  </div>
                ))}
                <p className="mt-1 text-right text-sm text-muted">{formatCount(app.ratingCount)} ratings</p>
              </div>
            </div>
            {app.reviews.length > 0 ? (
              <div className="rail -mx-4 mt-5 gap-3 [--rail-pad:1rem] sm:-mx-8 sm:[--rail-pad:2rem]" style={{ gridAutoColumns: "min(85%, 340px)" }}>
                {app.reviews.map((r) => (
                  <figure key={r.id} className="flex flex-col rounded-2xl bg-surface p-5 elevated">
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-1 font-semibold">{r.title || `${r.rating} star${r.rating > 1 ? "s" : ""}`}</p>
                      <span className="shrink-0 text-xs text-muted">{formatDate(r.createdAt)}</span>
                    </div>
                    <div className="mt-0.5 flex items-center justify-between">
                      <Stars value={r.rating} size={12} className="text-star" />
                      <span className="text-xs text-muted">{r.author}</span>
                    </div>
                    {r.body && <blockquote className="mt-3 line-clamp-5 text-[14px] leading-relaxed text-ink-2">{r.body}</blockquote>}
                    {r.reply && (
                      <div className="mt-3 rounded-xl bg-surface-2 p-3 text-[13px]">
                        <p className="font-semibold">Developer response</p>
                        <p className="mt-0.5 text-muted">{r.reply}</p>
                      </div>
                    )}
                  </figure>
                ))}
              </div>
            ) : (
              <p className="mt-5 rounded-2xl bg-surface-2 p-5 text-sm text-muted">No reviews yet. Be the first to tell people what you think.</p>
            )}
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <SafetyCard permissions={app.permissions} offline={app.offline} />
          <section className="rounded-3xl bg-surface p-6 elevated">
            <h2 className="text-lg font-semibold">Information</h2>
            <dl className="mt-3 divide-y divide-line text-[14px]">
              <Info k="Developer" v={app.developer} />
              <Info k="Category" v={app.category?.name ?? "–"} />
              <Info k="Version" v={app.version} />
              <Info k="Released" v={formatDate(app.releasedAt)} />
              <Info k="Updated" v={formatDate(app.updatedAt)} />
              <Info k="Download size" v={formatSize(app.sizeKb)} />
              <Info k="Age rating" v={app.ageRating} />
              <Info k="Price" v="Free" />
              <Info k="Works on" v="Any modern browser" />
            </dl>
            <a href={app.url} target="_blank" rel="noopener" className="mt-4 flex items-center gap-1.5 text-sm font-medium text-brand">
              <Globe className="size-4" /> {new URL(app.url).host}
            </a>
          </section>
        </aside>
      </div>

      {app.related.length > 0 && (
        <section className="mt-14 flex flex-col gap-4">
          <SectionHeader title="You might also like" />
          <div className="rail gap-4 [--rail-pad:1rem] sm:[--rail-pad:2rem]">
            {app.related.map((r) => (
              <AppTile key={r.id} app={r} />
            ))}
          </div>
        </section>
      )}
      <Footer />
    </article>
  );
}

function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub: React.ReactNode }) {
  return (
    <div className="flex w-[118px] flex-col items-center gap-1 px-3">
      <dt className="text-[10.5px] font-semibold tracking-wider text-muted uppercase">{label}</dt>
      <dd className="text-[22px] leading-none font-bold tracking-tight text-ink-2">{value}</dd>
      <dd className="text-[11px] text-muted">{sub}</dd>
    </div>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 py-2.5">
      <dt className="text-muted">{k}</dt>
      <dd className="text-right font-medium">{v}</dd>
    </div>
  );
}

function SafetyCard({ permissions, offline }: { permissions: string[]; offline: boolean }) {
  const points = [
    { icon: Lock, t: "Runs in a secure sandbox", d: "Your browser isolates it. It can't touch your files, contacts or other apps." },
    { icon: RefreshCw, t: "Always the latest version", d: "Security fixes land the moment we ship them. No update to install." },
    { icon: Trash2, t: "Remove it in one tap", d: "Long-press the icon and delete. Nothing is left behind." },
    ...(offline ? [{ icon: WifiOff, t: "Works offline", d: "Core features keep working without a connection." }] : []),
  ];
  return (
    <section className="relative overflow-hidden rounded-3xl bg-surface p-6 elevated">
      <div className="absolute -top-16 -right-16 size-40 rounded-full bg-emerald-500/20 blur-3xl" />
      <div className="relative flex items-center gap-2">
        <ShieldCheck className="size-6 text-emerald-500" />
        <h2 className="text-lg font-semibold">Safety &amp; Privacy</h2>
      </div>
      <ul className="relative mt-4 flex flex-col gap-4">
        {points.map(({ icon: Icon, t, d }) => (
          <li key={t} className="flex gap-3">
            <Icon className="mt-0.5 size-[18px] shrink-0 text-muted" />
            <div>
              <p className="text-[14px] font-medium">{t}</p>
              <p className="text-[13px] text-muted">{d}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="relative mt-5 rounded-2xl bg-surface-2 p-4">
        <p className="text-[12px] font-semibold tracking-wider text-muted uppercase">May ask permission for</p>
        {permissions.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {permissions.map((p) => {
              const Icon = PERMISSION_ICONS[p.toLowerCase()] ?? ShieldCheck;
              return (
                <span key={p} className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-[13px] font-medium">
                  <Icon className="size-3.5" /> {p}
                </span>
              );
            })}
          </div>
        ) : (
          <p className="mt-1 text-[14px] font-medium">Nothing. It needs no special access.</p>
        )}
        <p className="mt-2 text-[12px] text-muted">You decide each time, and you can change it in your browser settings.</p>
      </div>
    </section>
  );
}

function AppSkeleton() {
  return (
    <div className="px-4 pt-14 sm:px-8">
      <div className="flex gap-5">
        <div className="skeleton app-icon size-[120px] sm:size-[168px]" />
        <div className="flex-1 space-y-3 pt-2">
          <div className="skeleton h-7 w-2/3 rounded-lg" />
          <div className="skeleton h-4 w-1/2 rounded-lg" />
          <div className="skeleton mt-8 h-10 w-32 rounded-full" />
        </div>
      </div>
      <div className="skeleton mt-8 h-20 rounded-2xl" />
      <div className="mt-8 flex gap-3 overflow-hidden">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton aspect-[9/19.5] w-[220px] shrink-0 rounded-[22px]" />
        ))}
      </div>
    </div>
  );
}
