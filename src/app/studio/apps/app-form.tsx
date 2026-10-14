"use client";

/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, CircleHelp, ExternalLink, ImagePlus, Loader2, Trash2, Wand2, XCircle } from "lucide-react";
import { useRef, useState, useTransition, type ReactNode } from "react";
import { deleteApp, saveApp, type AppInput } from "../actions";
import { AppRow, FeaturedCard } from "@/components/app-cards";
import type { App } from "@/generated/prisma/client";
import type { Check, InspectResult } from "@/lib/inspect";
import type { AppListItem } from "@/lib/queries";
import { cn, slugify } from "@/lib/utils";

const PERMISSIONS = ["Camera", "Microphone", "Location", "Notifications"];

type FormState = Required<Omit<AppInput, "id" | "manifestUrl" | "iconUrl" | "coverUrl" | "categoryId" | "sizeKb">> & {
  sizeKb: number;
  manifestUrl: string;
  iconUrl: string;
  coverUrl: string;
  categoryId: string;
};

function initial(app?: App): FormState {
  return {
    name: app?.name ?? "",
    slug: app?.slug ?? "",
    subtitle: app?.subtitle ?? "",
    headline: app?.headline ?? "",
    description: app?.description ?? "",
    developer: app?.developer ?? "LoopingBinary",
    url: app?.url ?? "",
    manifestUrl: app?.manifestUrl ?? "",
    iconUrl: app?.iconUrl ?? "",
    coverUrl: app?.coverUrl ?? "",
    screenshots: app?.screenshots ?? [],
    accentColor: app?.accentColor ?? "#00b369",
    version: app?.version ?? "1.0.0",
    whatsNew: app?.whatsNew ?? "",
    sizeKb: app?.sizeKb ?? 0,
    ageRating: (app?.ageRating as FormState["ageRating"]) ?? "4+",
    permissions: app?.permissions ?? [],
    tags: app?.tags ?? [],
    categoryId: app?.categoryId ?? "",
    offline: app?.offline ?? true,
    featured: app?.featured ?? false,
    editorsChoice: app?.editorsChoice ?? false,
    published: app?.published ?? true,
  };
}

async function upload(file: File, folder: string) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("folder", folder);
  const res = await fetch("/api/studio/upload", { method: "POST", body: fd });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data.url as string;
}

export function AppForm({ categories, app, initialUrl }: { categories: { id: string; name: string }[]; app?: App; initialUrl?: string }) {
  const router = useRouter();
  const [f, setF] = useState<FormState>(() => ({ ...initial(app), ...(initialUrl && !app ? { url: initialUrl } : {}) }));
  const [slugTouched, setSlugTouched] = useState(!!app);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, startSave] = useTransition();
  const [importUrl, setImportUrl] = useState(app?.url ?? initialUrl ?? "");
  const [inspecting, setInspecting] = useState(false);
  const [report, setReport] = useState<{ score: number; checks: Check[] } | null>(null);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setF((s) => {
      const next = { ...s, [k]: v };
      if (k === "name" && !slugTouched) next.slug = slugify(String(v));
      return next;
    });

  const runImport = async () => {
    setError(null);
    setInspecting(true);
    try {
      const res = await fetch("/api/studio/inspect", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: importUrl, importAssets: true }),
      });
      const data: InspectResult & { error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error);
      setReport({ score: data.score, checks: data.checks });
      setF((s) => ({
        ...s,
        name: s.name || data.name,
        coverUrl: s.coverUrl || data.coverUrl || "",
        slug: s.slug || slugify(data.name),
        subtitle: s.subtitle || data.subtitle,
        description: s.description || data.description,
        url: data.url,
        manifestUrl: data.manifestUrl ?? "",
        iconUrl: data.iconUrl || s.iconUrl,
        screenshots: data.screenshots.length ? data.screenshots : s.screenshots,
        accentColor: /^#[0-9a-f]{6}$/i.test(data.themeColor ?? "") ? data.themeColor! : s.accentColor,
        tags: s.tags.length ? s.tags : data.tags,
      }));
      setNotice("Imported from the manifest. Review the details below.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setInspecting(false);
    }
  };

  const save = () => {
    setError(null);
    startSave(async () => {
      const res = await saveApp({ ...f, id: app?.id, categoryId: f.categoryId || null });
      if (!res.ok) return setError(res.error);
      setNotice("Saved. Live on the store now.");
      if (!app) router.replace(`/studio/apps/${res.id}`);
      else router.refresh();
    });
  };

  const preview: AppListItem = {
    id: "preview",
    slug: f.slug || "preview",
    name: f.name || "App name",
    subtitle: f.subtitle || "Subtitle",
    headline: f.headline || null,
    iconUrl: f.iconUrl || null,
    coverUrl: f.coverUrl || null,
    accentColor: /^#[0-9a-f]{6}$/i.test(f.accentColor) ? f.accentColor : "#00b369",
    url: f.url || "https://example.com",
    ratingAvg: app?.ratingAvg ?? 0,
    ratingCount: app?.ratingCount ?? 0,
    installs: app?.installs ?? 0,
    featured: f.featured,
    editorsChoice: f.editorsChoice,
    releasedAt: new Date(),
    updatedAt: new Date(),
    category: categories.find((c) => c.id === f.categoryId) ? { slug: "", name: categories.find((c) => c.id === f.categoryId)!.name } : null,
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button onClick={() => router.push("/studio/apps")} className="mb-1 flex items-center gap-1 text-sm text-muted hover:text-ink">
            <ArrowLeft className="size-4" /> Apps
          </button>
          <h1 className="text-3xl font-bold tracking-tight">{app ? app.name : "Publish a new app"}</h1>
        </div>
        <div className="flex items-center gap-2">
          {app && (
            <a href={`/apps/${app.slug}`} target="_blank" className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-muted hover:text-ink">
              View <ExternalLink className="size-3.5" />
            </a>
          )}
          <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/25 disabled:opacity-60">
            {saving && <Loader2 className="size-4 animate-spin" />} {app ? "Save changes" : "Publish"}
          </button>
        </div>
      </div>

      {(error || notice) && (
        <p className={cn("mt-4 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm", error ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400")}>
          {error ? <AlertCircle className="size-4" /> : <CheckCircle2 className="size-4" />} {error ?? notice}
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="flex flex-col gap-6">
          {/* Import */}
          <Card className="relative overflow-hidden">
            <div className="brand-gradient absolute -top-16 -right-16 size-40 rounded-full opacity-20 blur-3xl" />
            <h2 className="relative flex items-center gap-2 font-semibold"><Wand2 className="size-5 text-brand" /> Import from your live app</h2>
            <p className="relative mt-1 text-sm text-muted">Paste the PWA&apos;s URL. We read its manifest, copy the icon and screenshots to our CDN, and run the install checklist.</p>
            <div className="relative mt-4 flex gap-2">
              <input
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), runImport())}
                placeholder="https://pay.loopingbinary.com"
                className="min-w-0 flex-1 rounded-xl bg-surface-2 px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand/40"
              />
              <button onClick={runImport} disabled={inspecting || !importUrl} className="flex items-center gap-2 rounded-xl bg-ink px-4 text-sm font-semibold text-bg disabled:opacity-50">
                {inspecting ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />} Import
              </button>
            </div>
            {report && <HealthReport {...report} />}
          </Card>

          <Card>
            <h2 className="font-semibold">Listing</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Name"><input value={f.name} onChange={(e) => set("name", e.target.value)} className={input} /></Field>
              <Field label="Slug" hint={`/apps/${f.slug || "…"}`}>
                <input value={f.slug} onChange={(e) => (setSlugTouched(true), set("slug", slugify(e.target.value)))} className={input} />
              </Field>
              <Field label="Subtitle" className="sm:col-span-2"><input value={f.subtitle} maxLength={90} onChange={(e) => set("subtitle", e.target.value)} className={input} placeholder="Pay anyone, instantly" /></Field>
              <Field label="Featured headline" hint="Big text on the Today card" className="sm:col-span-2">
                <input value={f.headline} maxLength={120} onChange={(e) => set("headline", e.target.value)} className={input} placeholder="Money moves at the speed of a text" />
              </Field>
              <Field label="App URL" className="sm:col-span-2"><input value={f.url} onChange={(e) => set("url", e.target.value)} className={input} placeholder="https://…" /></Field>
              <Field label="Category">
                <select value={f.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={input}>
                  <option value="">None</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Developer"><input value={f.developer} onChange={(e) => set("developer", e.target.value)} className={input} /></Field>
              <Field label="Description" className="sm:col-span-2">
                <textarea value={f.description} rows={6} onChange={(e) => set("description", e.target.value)} className={cn(input, "resize-y")} />
              </Field>
              <Field label="Tags" hint="Comma separated, helps search" className="sm:col-span-2">
                <input value={f.tags.join(", ")} onChange={(e) => set("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))} className={input} placeholder="payments, wallet, transfer" />
              </Field>
            </div>
          </Card>

          <Card>
            <h2 className="font-semibold">Artwork</h2>
            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-[auto_1fr]">
              <Field label="Icon" hint="Square, 512 px+">
                <ImageDrop value={f.iconUrl} folder="icons" onChange={(v) => set("iconUrl", v)} onError={setError} className="size-32 rounded-[28px]" />
              </Field>
              <Field label="Today cover" hint="Optional, 16:10 landscape. A gradient is generated if empty.">
                <ImageDrop value={f.coverUrl} folder="covers" onChange={(v) => set("coverUrl", v)} onError={setError} className="aspect-[16/10] w-full max-w-sm rounded-2xl" />
              </Field>
            </div>
            <div className="mt-5 flex items-center gap-3">
              <input type="color" value={preview.accentColor} onChange={(e) => set("accentColor", e.target.value)} className="size-10 cursor-pointer rounded-xl border-0 bg-transparent" />
              <input value={f.accentColor} onChange={(e) => set("accentColor", e.target.value)} className={cn(input, "w-32 font-mono")} />
              <span className="text-sm text-muted">Accent color: tints the app page, cards and install sheet</span>
            </div>
            <div className="mt-6">
              <p className="mb-2 text-sm font-medium">Screenshots <span className="font-normal text-muted">(phone portrait works best, up to 12)</span></p>
              <Screenshots value={f.screenshots} onChange={(v) => set("screenshots", v)} onError={setError} />
            </div>
          </Card>

          <Card>
            <h2 className="font-semibold">Release</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Version"><input value={f.version} onChange={(e) => set("version", e.target.value)} className={input} /></Field>
              <Field label="Download size (KB)" hint="0 = shows “Instant”"><input type="number" min={0} value={f.sizeKb} onChange={(e) => set("sizeKb", Number(e.target.value))} className={input} /></Field>
              <Field label="Age rating">
                <select value={f.ageRating} onChange={(e) => set("ageRating", e.target.value as FormState["ageRating"])} className={input}>
                  {["4+", "9+", "12+", "17+"].map((a) => <option key={a}>{a}</option>)}
                </select>
              </Field>
              <Field label="What's new" className="sm:col-span-3">
                <textarea value={f.whatsNew} rows={3} onChange={(e) => set("whatsNew", e.target.value)} className={cn(input, "resize-y")} placeholder="• Faster checkout&#10;• Dark mode" />
              </Field>
            </div>
            <p className="mt-5 mb-2 text-sm font-medium">May ask permission for</p>
            <div className="flex flex-wrap gap-2">
              {PERMISSIONS.map((p) => {
                const on = f.permissions.includes(p);
                return (
                  <button key={p} type="button" onClick={() => set("permissions", on ? f.permissions.filter((x) => x !== p) : [...f.permissions, p])}
                    className={cn("rounded-full px-3.5 py-1.5 text-sm font-medium transition", on ? "bg-ink text-bg" : "bg-surface-2 text-muted")}>
                    {p}
                  </button>
                );
              })}
            </div>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Toggle label="Published" sub="Visible on the store" on={f.published} set={(v) => set("published", v)} />
              <Toggle label="Works offline" sub="Shows the offline badge" on={f.offline} set={(v) => set("offline", v)} />
              <Toggle label="Featured on Today" sub="Big editorial card" on={f.featured} set={(v) => set("featured", v)} />
              <Toggle label="Editors' Choice" sub="Hand-picked shelf" on={f.editorsChoice} set={(v) => set("editorsChoice", v)} />
            </div>
          </Card>

          {app && (
            <button
              onClick={() => confirm(`Delete ${app.name} forever? Reviews and stats go with it.`) && deleteApp(app.id)}
              className="flex items-center gap-2 self-start rounded-full px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10"
            >
              <Trash2 className="size-4" /> Delete app
            </button>
          )}
        </div>

        {/* Live preview */}
        <aside className="xl:sticky xl:top-20 xl:self-start">
          <p className="mb-2 text-xs font-semibold tracking-wider text-muted uppercase">Live preview</p>
          <div className="pointer-events-none flex flex-col gap-4 select-none">
            <FeaturedCard app={preview} eyebrow={f.editorsChoice ? "Editors' Choice" : "Featured"} />
            <div className="rounded-3xl bg-surface px-4 elevated">
              <AppRow app={preview} divider={false} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

const input = "w-full rounded-xl bg-surface-2 px-3.5 py-2.5 text-[15px] outline-none focus:ring-2 focus:ring-brand/40";

function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("rounded-3xl bg-surface p-6 elevated", className)}>{children}</section>;
}

function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-sm font-medium">{label} {hint && <span className="font-normal text-muted">· {hint}</span>}</span>
      {children}
    </label>
  );
}

function Toggle({ label, sub, on, set }: { label: string; sub: string; on: boolean; set: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={on} onClick={() => set(!on)} className="flex items-center justify-between gap-3 rounded-2xl bg-surface-2 p-3.5 text-left">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-muted">{sub}</span>
      </span>
      <span className={cn("relative h-7 w-12 shrink-0 rounded-full transition", on ? "bg-emerald-500" : "bg-surface-3")}>
        <span className={cn("absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow transition", on && "translate-x-5")} />
      </span>
    </button>
  );
}

function HealthReport({ score, checks }: { score: number; checks: Check[] }) {
  const tone = score >= 85 ? "text-emerald-500" : score >= 60 ? "text-amber-500" : "text-red-500";
  return (
    <div className="relative mt-5 rounded-2xl bg-surface-2 p-4">
      <div className="flex items-center gap-4">
        <div className="relative size-16">
          <svg viewBox="0 0 36 36" className="size-16 -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--surface-3)" strokeWidth="3.5" />
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeDasharray={`${(score / 100) * 97.4} 97.4`} className={tone} />
          </svg>
          <span className="absolute inset-0 grid place-items-center text-lg font-bold tabular-nums">{score}</span>
        </div>
        <div>
          <p className="font-semibold">PWA health</p>
          <p className="text-sm text-muted">{score >= 85 ? "Ready to ship. Installs will feel native." : "Fix the red items for the smoothest install."}</p>
        </div>
      </div>
      <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {checks.map((c) => (
          <li key={c.id} className="flex gap-2 text-sm" title={c.hint}>
            {c.ok === true ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" /> : c.ok === false ? <XCircle className="mt-0.5 size-4 shrink-0 text-red-500" /> : <CircleHelp className="mt-0.5 size-4 shrink-0 text-muted" />}
            <span>
              {c.label}
              {c.ok !== true && <span className="block text-xs text-muted">{c.hint}</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ImageDrop({ value, folder, onChange, onError, className }: { value: string; folder: string; onChange: (v: string) => void; onError: (e: string) => void; className?: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const handle = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      onChange(await upload(file, folder));
    } catch (e) {
      onError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div
      onDragOver={(e) => (e.preventDefault(), setOver(true))}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => (e.preventDefault(), setOver(false), handle(e.dataTransfer.files[0]))}
      onClick={() => ref.current?.click()}
      className={cn("group relative grid cursor-pointer place-items-center overflow-hidden border-2 border-dashed border-line bg-surface-2 transition hover:border-brand/50", over && "border-brand", className)}
    >
      {value ? <img src={value} alt="" className="absolute inset-0 size-full object-cover" /> : <ImagePlus className="size-6 text-muted" />}
      {busy && <span className="absolute inset-0 grid place-items-center bg-black/40"><Loader2 className="size-6 animate-spin text-white" /></span>}
      {value && !busy && (
        <button type="button" onClick={(e) => (e.stopPropagation(), onChange(""))} className="absolute top-1.5 right-1.5 grid size-7 place-items-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100" aria-label="Remove">
          <Trash2 className="size-3.5" />
        </button>
      )}
      <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => handle(e.target.files?.[0])} />
    </div>
  );
}

function Screenshots({ value, onChange, onError }: { value: string[]; onChange: (v: string[]) => void; onError: (e: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(0);
  const add = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = [...files].slice(0, 12 - value.length);
    setBusy(list.length);
    const urls: string[] = [];
    for (const file of list) {
      try {
        urls.push(await upload(file, "screenshots"));
      } catch (e) {
        onError(e instanceof Error ? e.message : "Upload failed");
      }
      setBusy((b) => b - 1);
    }
    onChange([...value, ...urls]);
  };
  const move = (i: number, d: number) => {
    const next = [...value];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
      {value.map((src, i) => (
        <div key={src} className="group relative h-64 shrink-0 overflow-hidden rounded-2xl bg-surface-2">
          <img src={src} alt="" className="h-full w-auto" />
          <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-gradient-to-t from-black/60 p-2 opacity-0 transition group-hover:opacity-100">
            {i > 0 && <IconBtn onClick={() => move(i, -1)} label="Move left"><ArrowLeft className="size-3.5" /></IconBtn>}
            <IconBtn onClick={() => onChange(value.filter((_, j) => j !== i))} label="Remove"><Trash2 className="size-3.5" /></IconBtn>
            {i < value.length - 1 && <IconBtn onClick={() => move(i, 1)} label="Move right"><ArrowRight className="size-3.5" /></IconBtn>}
          </div>
        </div>
      ))}
      {[...Array(busy)].map((_, i) => <div key={i} className="skeleton h-64 w-32 shrink-0 rounded-2xl" />)}
      {value.length < 12 && (
        <button type="button" onClick={() => ref.current?.click()} className="grid h-64 w-32 shrink-0 place-items-center rounded-2xl border-2 border-dashed border-line text-muted hover:border-brand/50">
          <span className="flex flex-col items-center gap-1 text-sm"><ImagePlus className="size-6" /> Add</span>
        </button>
      )}
      <input ref={ref} type="file" accept="image/*" multiple hidden onChange={(e) => add(e.target.files)} />
    </div>
  );
}

function IconBtn({ onClick, label, children }: { onClick: () => void; label: string; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} className="grid size-7 place-items-center rounded-full bg-white/90 text-black">
      {children}
    </button>
  );
}
