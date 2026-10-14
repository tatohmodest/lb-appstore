"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, Loader2, Radar, Rocket, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { removeDemoApps, saveApp } from "../actions";
import { AppIcon } from "@/components/app-icon";
import type { InspectResult } from "@/lib/inspect";
import { cn, slugify } from "@/lib/utils";

const LB_APPS = ["zela", "lbpay", "lbvote", "shop", "juniordev", "app", "intellex", "auth"].map((s) => `https://${s}.loopingbinary.com`).join("\n");

// keyword -> category slug, first match wins
const CATEGORY_HINTS: [RegExp, string][] = [
  [/\b(pay|money|wallet|transfer|bank|momo|finance|payment)/i, "finance"],
  [/\b(shop|market|commerce|store|sell|buy|order)/i, "shopping"],
  [/\b(learn|course|training|skill|school|academy|junior|education|class)/i, "education"],
  [/\b(vote|voting|contest|social|chat|community|friends)/i, "social"],
  [/\b(health|fitness|workout)/i, "health"],
  [/\b(game|play)/i, "games"],
  [/\b(auth|account|login|sign.?in|security)/i, "tools"],
  [/\b(platform|infrastructure|dashboard|business|manage|work)/i, "productivity"],
];

type Row = {
  url: string;
  status: "scanning" | "ready" | "failed" | "published";
  error?: string;
  data?: InspectResult & { coverUrl: string | null };
  include: boolean;
  featured: boolean;
  categoryId: string;
  existingId?: string;
};

function usableColor(hex: string | null) {
  if (!hex || !/^#[0-9a-f]{6}$/i.test(hex)) return "#00b369";
  const n = parseInt(hex.slice(1), 16);
  const lum = (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
  return lum > 0.9 || lum < 0.06 ? "#00b369" : hex.toLowerCase();
}

export function BulkImport({
  categories,
  existing,
  demoCount,
}: {
  categories: { id: string; slug: string; name: string }[];
  existing: { id: string; url: string; name: string }[];
  demoCount: number;
}) {
  const router = useRouter();
  const [text, setText] = useState(LB_APPS);
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [demos, setDemos] = useState(demoCount);
  const [done, setDone] = useState<number | null>(null);

  const guessCategory = (d: InspectResult) => {
    const hay = `${d.name} ${d.subtitle} ${d.description} ${d.tags.join(" ")} ${d.url}`;
    const slug = CATEGORY_HINTS.find(([re]) => re.test(hay))?.[1];
    return categories.find((c) => c.slug === slug)?.id ?? "";
  };

  const update = (url: string, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.url === url ? { ...r, ...patch } : r)));

  const scan = async () => {
    const urls = [...new Set(text.split(/\s+/).map((u) => u.trim()).filter(Boolean))];
    setDone(null);
    setRows(urls.map((url) => ({ url, status: "scanning", include: true, featured: true, categoryId: "" })));
    setBusy(true);
    const host = (u: string) => {
      try {
        return new URL(u).host;
      } catch {
        return u;
      }
    };
    // three at a time keeps it quick without hammering anything
    const queue = [...urls];
    await Promise.all(
      [0, 1, 2].map(async () => {
        for (let url = queue.shift(); url; url = queue.shift()) {
          try {
            const res = await fetch("/api/studio/inspect", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ url, importAssets: true }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            const match = existing.find((e) => host(e.url) === host(data.url));
            update(url, { status: "ready", data, categoryId: guessCategory(data), existingId: match?.id, include: !match });
          } catch (e) {
            update(url, { status: "failed", include: false, error: e instanceof Error ? e.message : "Unreachable" });
          }
        }
      }),
    );
    setBusy(false);
  };

  const publish = async () => {
    setPublishing(true);
    let count = 0;
    for (const r of rows) {
      if (r.status !== "ready" || !r.include || !r.data) continue;
      const d = r.data;
      const res = await saveApp({
        id: r.existingId,
        name: d.name.slice(0, 60),
        slug: slugify(d.name),
        subtitle: d.subtitle.slice(0, 90),
        description: d.description.slice(0, 8000),
        url: d.url,
        manifestUrl: d.manifestUrl ?? "",
        iconUrl: d.iconUrl ?? "",
        coverUrl: d.coverUrl ?? "",
        screenshots: d.screenshots,
        accentColor: usableColor(d.themeColor),
        tags: d.tags,
        categoryId: r.categoryId || null,
        featured: r.featured,
        published: true,
      });
      if (res.ok) {
        count++;
        update(r.url, { status: "published", existingId: res.id });
      } else update(r.url, { status: "failed", error: res.error });
    }
    setPublishing(false);
    setDone(count);
    router.refresh();
  };

  const selected = rows.filter((r) => r.status === "ready" && r.include).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-muted">Studio</p>
        <h1 className="text-3xl font-bold tracking-tight">Bulk import</h1>
        <p className="mt-1 max-w-2xl text-muted">
          Paste app URLs, one per line. We scan each one, pull its name, icon, screenshots and cover into R2, score its PWA health, and file it under a category.
        </p>
      </div>

      {demos > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-amber-500/10 p-4 text-sm">
          <span className="flex items-center gap-2"><Sparkles className="size-4 text-amber-500" /> {demos} demo listings are still on the store.</span>
          <button
            onClick={async () => (await removeDemoApps(), setDemos(0), router.refresh())}
            className="flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 font-semibold text-bg"
          >
            <Trash2 className="size-3.5" /> Remove demos
          </button>
        </div>
      )}

      <div className="rounded-3xl bg-surface p-6 elevated">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          spellCheck={false}
          className="w-full resize-y rounded-2xl bg-surface-2 p-4 font-mono text-sm outline-none focus:ring-2 focus:ring-brand/40"
        />
        <button onClick={scan} disabled={busy} className="mt-4 flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-bg disabled:opacity-60">
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Radar className="size-4" />} {busy ? "Scanning…" : "Scan apps"}
        </button>
      </div>

      {rows.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {rows.map((r) => (
              <ImportCard key={r.url} row={r} categories={categories} onChange={(p) => update(r.url, p)} />
            ))}
          </div>

          <div className="glass sticky bottom-4 flex flex-wrap items-center justify-between gap-3 rounded-3xl p-4 shadow-xl ring-1 ring-line">
            <p className="text-sm">
              {done !== null ? (
                <span className="flex items-center gap-2 font-medium text-brand"><Check className="size-4" /> {done} app{done === 1 ? "" : "s"} live on the store.</span>
              ) : (
                <><b>{selected}</b> selected</>
              )}
            </p>
            <div className="flex gap-2">
              {done !== null && <Link href="/" target="_blank" className="rounded-full px-4 py-2.5 text-sm font-semibold text-muted hover:text-ink">View store</Link>}
              <button
                onClick={publish}
                disabled={publishing || busy || !selected}
                className="flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/30 disabled:opacity-50"
              >
                {publishing ? <Loader2 className="size-4 animate-spin" /> : <Rocket className="size-4" />} Publish {selected || ""}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ImportCard({ row: r, categories, onChange }: { row: Row; categories: { id: string; name: string }[]; onChange: (p: Partial<Row>) => void }) {
  const host = r.url.replace(/^https?:\/\//, "");
  if (r.status === "scanning")
    return (
      <div className="flex items-center gap-4 rounded-3xl bg-surface p-5 elevated">
        <div className="skeleton app-icon size-16" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-1/2 rounded" />
          <p className="flex items-center gap-1.5 text-xs text-muted"><Loader2 className="size-3 animate-spin" /> Scanning {host}</p>
        </div>
      </div>
    );

  if (r.status === "failed" || !r.data)
    return (
      <div className="flex items-start gap-4 rounded-3xl bg-surface p-5 opacity-80 elevated">
        <span className="grid size-16 shrink-0 place-items-center rounded-[22%] bg-red-500/10 text-red-500"><AlertTriangle className="size-6" /></span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{host}</p>
          <p className="mt-0.5 text-sm text-muted">{r.error}</p>
          <Link href={`/studio/apps/new?url=${encodeURIComponent(r.url)}`} className="mt-2 inline-block text-sm font-medium text-brand">Add manually instead</Link>
        </div>
      </div>
    );

  const d = r.data;
  const tone = d.score >= 85 ? "text-emerald-500" : d.score >= 60 ? "text-amber-500" : "text-red-500";
  const published = r.status === "published";
  return (
    <div className={cn("relative overflow-hidden rounded-3xl bg-surface p-5 transition elevated", !r.include && !published && "opacity-55")}>
      {d.coverUrl && <img src={d.coverUrl} alt="" className="absolute inset-x-0 top-0 h-20 w-full object-cover opacity-25 [mask-image:linear-gradient(black,transparent)]" />}
      <div className="relative flex items-start gap-4">
        <AppIcon name={d.name} iconUrl={d.iconUrl} accentColor={usableColor(d.themeColor)} size={64} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-lg font-semibold">{d.name}</p>
            {r.existingId && !published && <span className="shrink-0 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-muted">On store</span>}
            {published && <span className="flex shrink-0 items-center gap-1 rounded-full bg-brand/15 px-2 py-0.5 text-[11px] font-semibold text-brand"><Check className="size-3" /> Live</span>}
          </div>
          <p className="truncate text-sm text-muted">{d.subtitle || host}</p>
          <p className="mt-1 text-xs text-muted">{host} · {d.screenshots.length} screenshots{d.coverUrl ? " · cover" : ""}</p>
        </div>
        <div className={cn("text-right", tone)}>
          <p className="text-2xl font-bold tabular-nums">{d.score}</p>
          <p className="text-[10px] font-semibold tracking-wider uppercase">PWA</p>
        </div>
      </div>
      {!published && (
        <div className="relative mt-4 flex flex-wrap items-center gap-2">
          <select value={r.categoryId} onChange={(e) => onChange({ categoryId: e.target.value })} className="rounded-xl bg-surface-2 px-3 py-1.5 text-sm outline-none">
            <option value="">No category</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <Chip on={r.featured} onClick={() => onChange({ featured: !r.featured })}>Feature on Today</Chip>
          <Chip on={r.include} onClick={() => onChange({ include: !r.include })}>{r.existingId ? "Update listing" : "Include"}</Chip>
        </div>
      )}
      {d.checks.some((c) => c.ok === false) && !published && (
        <p className="relative mt-3 text-xs text-muted">
          To fix: {d.checks.filter((c) => c.ok === false).map((c) => c.label).join(", ")}
        </p>
      )}
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn("flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition", on ? "bg-ink text-bg" : "bg-surface-2 text-muted")}>
      {on && <Check className="size-3.5" />} {children}
    </button>
  );
}
