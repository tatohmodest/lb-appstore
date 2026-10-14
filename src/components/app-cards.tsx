/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { ChevronRight, Star } from "lucide-react";
import type { ReactNode } from "react";
import { AppIcon } from "./app-icon";
import { GetButton } from "./get-button";
import type { AppListItem } from "@/lib/queries";
import { cn, formatCount, shade } from "@/lib/utils";

export function toInstallable(a: Pick<AppListItem, "slug" | "name" | "subtitle" | "iconUrl" | "accentColor" | "url">) {
  return { slug: a.slug, name: a.name, subtitle: a.subtitle, iconUrl: a.iconUrl, accentColor: a.accentColor, url: a.url };
}

export function SectionHeader({ title, eyebrow, href, className }: { title: ReactNode; eyebrow?: string; href?: string; className?: string }) {
  return (
    <div className={cn("flex items-end justify-between gap-4 px-4 sm:px-8", className)}>
      <div>
        {eyebrow && <p className="mb-1 text-xs font-semibold tracking-wider text-muted uppercase">{eyebrow}</p>}
        <h2 className="text-[22px] font-semibold tracking-tight sm:text-2xl">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="flex shrink-0 items-center text-[15px] font-medium text-brand hover:opacity-80">
          See all <ChevronRight className="size-4" />
        </Link>
      )}
    </div>
  );
}

export function AppRow({ app, rank, divider = true }: { app: AppListItem; rank?: number; divider?: boolean }) {
  return (
    <div className="group relative flex min-w-0 items-center gap-3.5 py-2.5">
      <AppIcon name={app.name} iconUrl={app.iconUrl} accentColor={app.accentColor} size={60} className="transition group-hover:scale-[1.03]" />
      {rank !== undefined && <span className="w-5 shrink-0 text-center text-lg font-semibold text-ink-2 tabular-nums">{rank}</span>}
      <div className={cn("flex min-w-0 flex-1 items-center gap-3 self-stretch", divider && "border-b border-line")}>
        <div className="min-w-0 flex-1">
          <Link href={`/apps/${app.slug}`} className="block truncate text-[15px] font-medium after:absolute after:inset-0">
            {app.name}
          </Link>
          <p className="truncate text-[13px] text-muted">{app.subtitle || app.category?.name}</p>
          {app.ratingCount > 0 && (
            <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted">
              <Star className="size-3 fill-current" /> {app.ratingAvg.toFixed(1)}
              <span className="opacity-60">· {formatCount(app.installs)} gets</span>
            </p>
          )}
        </div>
        <GetButton app={toInstallable(app)} className="relative z-10" />
      </div>
    </div>
  );
}

/** Three rows per column, columns scroll horizontally - App Store style. */
export function AppRowGrid({ apps, ranked }: { apps: AppListItem[]; ranked?: boolean }) {
  const cols: AppListItem[][] = [];
  for (let i = 0; i < apps.length; i += 3) cols.push(apps.slice(i, i + 3));
  return (
    <div className="rail gap-x-6 [--rail-pad:1rem] sm:[--rail-pad:2rem]" style={{ gridAutoColumns: "min(86%, 380px)" }}>
      {cols.map((col, ci) => (
        <div key={ci}>
          {col.map((app, i) => (
            <AppRow key={app.id} app={app} rank={ranked ? ci * 3 + i + 1 : undefined} divider={i < col.length - 1} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function AppTile({ app }: { app: AppListItem }) {
  return (
    <div className="group relative flex w-[132px] flex-col gap-2 sm:w-[148px]">
      <AppIcon name={app.name} iconUrl={app.iconUrl} accentColor={app.accentColor} size={132} className="transition duration-300 group-hover:-translate-y-1 sm:!size-[148px]" />
      <div>
        <Link href={`/apps/${app.slug}`} className="line-clamp-1 text-[14px] font-medium after:absolute after:inset-0">
          {app.name}
        </Link>
        <p className="line-clamp-1 text-[12px] text-muted">{app.category?.name ?? app.subtitle}</p>
      </div>
    </div>
  );
}

export function FeaturedCard({ app, eyebrow, large }: { app: AppListItem; eyebrow?: string; large?: boolean }) {
  const c = app.accentColor;

  const body = (
    <>
      {eyebrow && <p className="text-[12px] font-semibold tracking-[.14em] text-white/70 uppercase">{eyebrow}</p>}
      <h3 className={cn("mt-1.5 max-w-xl font-semibold tracking-tight text-balance", large ? "text-[28px] leading-[1.05] sm:text-5xl" : "text-2xl sm:text-3xl", !large && !app.coverUrl && "pr-24 sm:pr-28")}>
        <Link href={`/apps/${app.slug}`} className="after:absolute after:inset-0">
          {app.headline || app.name}
        </Link>
      </h3>
      <div className="mt-5 flex items-center gap-3 rounded-2xl bg-white/10 p-2.5 pr-3 ring-1 ring-white/15 backdrop-blur-xl sm:max-w-sm">
        <AppIcon name={app.name} iconUrl={app.iconUrl} accentColor={c} size={44} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{app.name}</p>
          <p className="truncate text-xs text-white/70">{app.subtitle}</p>
        </div>
        <GetButton app={toInstallable(app)} tone="light" className="relative z-10" />
      </div>
    </>
  );

  // Cover art often carries its own text, so it is laid out next to the copy, never under it.
  if (app.coverUrl) {
    return (
      <article className="group relative isolate flex h-full flex-col overflow-hidden rounded-[28px] text-white elevated" style={{ background: shade(c, -0.62) }}>
        <div className={cn("relative overflow-hidden", large ? "aspect-[16/9] sm:absolute sm:inset-y-0 sm:right-0 sm:aspect-auto sm:w-[60%]" : "aspect-[2/1]")}>
          <img src={app.coverUrl} alt="" className="size-full object-cover transition duration-700 group-hover:scale-[1.04]" />
          <div
            className={cn("absolute inset-0", large && "sm:hidden")}
            style={{ background: `linear-gradient(to bottom, transparent 55%, ${shade(c, -0.62)})` }}
          />
          {large && (
            <div className="absolute inset-0 hidden sm:block" style={{ background: `linear-gradient(to right, ${shade(c, -0.62)}, transparent 45%)` }} />
          )}
        </div>
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: `radial-gradient(70% 60% at 0% 100%, ${shade(c, -0.25)}, transparent)` }}
        />
        <div className={cn("relative mt-auto p-5 sm:p-7", large && "sm:flex sm:min-h-[440px] sm:w-[48%] sm:flex-col sm:justify-end sm:p-10")}>{body}</div>
      </article>
    );
  }

  return (
    <article
      className={cn(
        "group relative isolate flex h-full flex-col justify-end overflow-hidden rounded-[28px] text-white elevated grain",
        large ? "aspect-[4/5] sm:aspect-[16/10] lg:aspect-[21/10]" : "aspect-[4/5] sm:aspect-[4/3]",
      )}
    >
      <div className="absolute inset-0 -z-10" style={{ background: shade(c, -0.55) }}>
        <div className="animate-aurora absolute -top-1/4 -left-1/4 size-[90%] rounded-full blur-3xl" style={{ background: c, opacity: 0.85 }} />
        <div
          className="animate-aurora absolute -right-1/4 -bottom-1/3 size-[80%] rounded-full blur-3xl [animation-delay:-6s]"
          style={{ background: shade(c, 0.45), opacity: 0.6 }}
        />
        <div className={cn("absolute inset-0 flex", large ? "items-start justify-center pt-10 sm:items-center sm:justify-end sm:pt-0 sm:pr-[10%]" : "items-start justify-end p-6 sm:p-8")}>
          <div className="animate-float [--r:-6deg]">
            <AppIcon
              name={app.name}
              iconUrl={app.iconUrl}
              accentColor={c}
              size={large ? 168 : 92}
              className={cn("shadow-2xl shadow-black/40 transition duration-500 group-hover:scale-105", large && "max-sm:!size-[112px]")}
            />
          </div>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
      <div className="p-5 sm:p-8">{body}</div>
    </article>
  );
}

/** Stylised phone screens for apps that haven't uploaded screenshots yet. */
export function MockScreens({ name, color, iconUrl }: { name: string; color: string; iconUrl?: string | null }) {
  const variants = [0, 1, 2, 3];
  return (
    <>
      {variants.map((v) => (
        <div
          key={v}
          className="relative aspect-[9/19.5] w-[200px] shrink-0 overflow-hidden rounded-[26px] p-3 elevated sm:w-[230px]"
          style={{ background: `linear-gradient(160deg, ${shade(color, v === 0 ? 0.15 : 0.92)}, ${shade(color, v === 0 ? -0.35 : 0.8)})` }}
        >
          <div className={cn("flex h-full flex-col gap-2", v === 0 ? "text-white" : "text-black/80")}>
            <div className="mx-auto mb-2 h-4 w-16 rounded-full bg-black/80" />
            {v === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
                <AppIcon name={name} iconUrl={iconUrl} accentColor={color} size={72} className="shadow-xl" />
                <p className="text-lg font-semibold">{name}</p>
                <div className="h-2 w-24 rounded-full bg-white/40" />
              </div>
            ) : (
              <>
                <div className="h-3 w-1/2 rounded-full" style={{ background: shade(color, -0.2) }} />
                <div className="h-20 rounded-2xl" style={{ background: shade(color, v === 2 ? 0.3 : 0.55) }} />
                {[...Array(v === 3 ? 6 : 4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-xl bg-white/70 p-2">
                    <div className="size-7 rounded-lg" style={{ background: shade(color, 0.2 + i * 0.1) }} />
                    <div className="flex-1 space-y-1">
                      <div className="h-2 w-3/4 rounded-full bg-black/20" />
                      <div className="h-2 w-1/2 rounded-full bg-black/10" />
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      ))}
    </>
  );
}
