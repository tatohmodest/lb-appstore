import Link from "next/link";
import { Suspense } from "react";
import { Download, LayoutGrid, MessageSquare, Plus, Radar, Star } from "lucide-react";
import { GetsChart } from "./gets-chart";
import { AppIcon } from "@/components/app-icon";
import { Stars } from "@/components/stars";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatCount } from "@/lib/utils";

export const metadata = { title: { absolute: "Dashboard · LB Studio" } };

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="skeleton h-96 rounded-3xl" />}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  await requireAdmin();
  const since = daysAgo(30);

  const [apps, events, reviews, totals] = await Promise.all([
    db.app.findMany({ orderBy: { installs: "desc" }, take: 8, include: { category: true } }),
    db.installEvent.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true, platform: true } }),
    db.review.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { app: { select: { name: true, id: true } } } }),
    db.app.aggregate({ _sum: { installs: true, ratingCount: true }, _count: true, _avg: { ratingAvg: true } }),
  ]);

  const days = Array.from({ length: 30 }, (_, i) => ({ date: daysAgo(29 - i).toISOString().slice(0, 10), count: 0 }));
  const byDay = new Map(days.map((d) => [d.date, d]));
  const platforms: Record<string, number> = { ios: 0, android: 0, desktop: 0, other: 0 };
  for (const e of events) {
    const d = byDay.get(e.createdAt.toISOString().slice(0, 10));
    if (d) d.count++;
    platforms[e.platform] = (platforms[e.platform] ?? 0) + 1;
  }
  const last7 = days.slice(-7).reduce((a, d) => a + d.count, 0);
  const prev7 = days.slice(-14, -7).reduce((a, d) => a + d.count, 0);
  const delta = prev7 ? Math.round(((last7 - prev7) / prev7) * 100) : null;
  const maxPlatform = Math.max(1, ...Object.values(platforms));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Welcome back</p>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <div className="flex gap-2">
        <Link href="/studio/import" className="flex items-center gap-1.5 rounded-full bg-surface px-4 py-2 text-sm font-semibold elevated">
          <Radar className="size-4" /> Bulk import
        </Link>
        <Link href="/studio/apps/new" className="flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand/25">
          <Plus className="size-4" /> Publish app
        </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi icon={LayoutGrid} label="Apps" value={String(totals._count)} />
        <Kpi icon={Download} label="All-time gets" value={formatCount(totals._sum.installs ?? 0)} />
        <Kpi icon={Download} label="Gets, last 7 days" value={formatCount(last7)} sub={delta === null ? undefined : `${delta >= 0 ? "+" : ""}${delta}% vs previous week`} />
        <Kpi icon={Star} label="Average rating" value={totals._avg.ratingAvg ? totals._avg.ratingAvg.toFixed(2) : "–"} sub={`${formatCount(totals._sum.ratingCount ?? 0)} ratings`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="rounded-3xl bg-surface p-6 elevated">
          <h2 className="font-semibold">Gets per day</h2>
          <GetsChart days={days} />
        </section>
        <section className="rounded-3xl bg-surface p-6 elevated">
          <h2 className="font-semibold">By device, last 30 days</h2>
          <ul className="mt-4 flex flex-col gap-4">
            {Object.entries(platforms).map(([p, n]) => (
              <li key={p}>
                <div className="flex justify-between text-sm">
                  <span>{PLATFORM_LABELS[p] ?? p}</span>
                  <span className="font-semibold tabular-nums">{n}</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-surface-2">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${(n / maxPlatform) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-3xl bg-surface p-6 elevated">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Top apps</h2>
            <Link href="/studio/apps" className="text-sm font-medium text-brand">All apps</Link>
          </div>
          <ul className="mt-3 divide-y divide-line">
            {apps.map((a) => (
              <li key={a.id}>
                <Link href={`/studio/apps/${a.id}`} className="flex items-center gap-3 py-2.5">
                  <AppIcon name={a.name} iconUrl={a.iconUrl} accentColor={a.accentColor} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{a.name}</p>
                    <p className="truncate text-xs text-muted">{a.category?.name ?? "Uncategorized"}{!a.published && " · Hidden"}</p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">{formatCount(a.installs)}</span>
                </Link>
              </li>
            ))}
            {!apps.length && <li className="py-6 text-sm text-muted">No apps yet.</li>}
          </ul>
        </section>
        <section className="rounded-3xl bg-surface p-6 elevated">
          <h2 className="flex items-center gap-2 font-semibold"><MessageSquare className="size-4" /> Latest reviews</h2>
          <ul className="mt-3 divide-y divide-line">
            {reviews.map((r) => (
              <li key={r.id} className="py-3">
                <div className="flex items-center justify-between gap-2">
                  <Link href={`/studio/apps/${r.app.id}#reviews`} className="truncate text-sm font-medium">{r.app.name}</Link>
                  <Stars value={r.rating} size={11} className="text-star" />
                </div>
                <p className="mt-0.5 line-clamp-2 text-sm text-muted">
                  <span className="text-ink-2">{r.author}:</span> {r.title || r.body || "No comment"}
                </p>
              </li>
            ))}
            {!reviews.length && <li className="py-6 text-sm text-muted">No reviews yet.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}

const PLATFORM_LABELS: Record<string, string> = { ios: "iPhone / iPad", android: "Android", desktop: "Desktop", other: "Other" };

function daysAgo(n: number) {
  return new Date(Date.now() - n * 864e5);
}

function Kpi({ icon: Icon, label, value, sub }: { icon: typeof Star; label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-3xl bg-surface p-5 elevated">
      <Icon className="size-5 text-muted" />
      <p className="mt-3 text-3xl font-bold tracking-tight tabular-nums">{value}</p>
      <p className="text-sm text-muted">{label}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  );
}
