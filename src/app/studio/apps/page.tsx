import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { AppIcon } from "@/components/app-icon";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatCount, formatDate } from "@/lib/utils";
import { PublishToggle } from "./publish-toggle";

export const metadata = { title: "Apps" };

export default function StudioApps() {
  return (
    <Suspense fallback={<div className="skeleton h-96 rounded-3xl" />}>
      <AppsList />
    </Suspense>
  );
}

async function AppsList() {
  await requireAdmin();
  const apps = await db.app.findMany({ orderBy: { updatedAt: "desc" }, include: { category: true } });
  return (
    <div>
      <div className="flex items-end justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Apps</h1>
        <Link href="/studio/apps/new" className="flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white">
          <Plus className="size-4" /> Publish app
        </Link>
      </div>
      <div className="mt-6 overflow-hidden rounded-3xl bg-surface elevated">
        {apps.map((a) => (
          <div key={a.id} className="flex items-center gap-4 border-b border-line px-5 py-3 last:border-0">
            <AppIcon name={a.name} iconUrl={a.iconUrl} accentColor={a.accentColor} size={48} />
            <Link href={`/studio/apps/${a.id}`} className="min-w-0 flex-1">
              <p className="truncate font-medium">
                {a.name}
                {a.featured && <span className="ml-2 rounded-full bg-brand/15 px-2 py-0.5 text-[11px] font-semibold text-brand">Featured</span>}
                {a.editorsChoice && <span className="ml-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-600">Editors&apos; Choice</span>}
              </p>
              <p className="truncate text-sm text-muted">
                {a.category?.name ?? "Uncategorized"} · v{a.version} · updated {formatDate(a.updatedAt)}
              </p>
            </Link>
            <span className="hidden w-20 text-right text-sm tabular-nums sm:block">{formatCount(a.installs)} gets</span>
            <PublishToggle id={a.id} published={a.published} />
          </div>
        ))}
        {!apps.length && <p className="p-10 text-center text-muted">No apps yet. Publish your first one!</p>}
      </div>
    </div>
  );
}
