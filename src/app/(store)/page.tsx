import Link from "next/link";
import { ArrowUpRight, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { AppRowGrid, AppTile, FeaturedCard, SectionHeader } from "@/components/app-cards";
import { CategoryIcon } from "@/components/category-icon";
import { Footer } from "@/components/ui/footer";
import { PageTitle } from "@/components/ui/page-title";
import { TodayDate } from "@/components/ui/today-date";
import { getTodayData } from "@/lib/queries";

export default async function TodayPage() {
  const { featured, editorsChoice, newest, top, categories } = await getTodayData();
  const [hero, ...more] = featured.length ? featured : newest.slice(0, 3);

  return (
    <>
      <PageTitle eyebrow={<TodayDate />} title="Today" />

      {!hero ? (
        <EmptyStore />
      ) : (
        <div className="flex flex-col gap-12">
          <section className="flex flex-col gap-4 px-4 sm:px-8">
            <FeaturedCard app={hero} eyebrow={hero.editorsChoice ? "Editors' Choice" : "Featured"} large />
            {more.length > 0 && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {more.slice(0, 4).map((app) => (
                  <FeaturedCard key={app.id} app={app} eyebrow={app.editorsChoice ? "Editors' Choice" : "Spotlight"} />
                ))}
              </div>
            )}
          </section>

          <TrustRibbon />

          {top.length > 0 && (
            <section className="flex flex-col gap-3">
              <SectionHeader eyebrow="Most installed" title="Top Charts" href="/apps" />
              <AppRowGrid apps={top} ranked />
            </section>
          )}

          {editorsChoice.length > 0 && (
            <section className="flex flex-col gap-4">
              <SectionHeader eyebrow="Hand-picked" title={<>Editors&apos; <span className="font-serif text-[1.15em] font-normal italic">Choice</span></>} />
              <div className="rail gap-4 [--rail-pad:1rem] sm:[--rail-pad:2rem]">
                {editorsChoice.map((app) => (
                  <AppTile key={app.id} app={app} />
                ))}
              </div>
            </section>
          )}

          {categories.length > 0 && (
            <section className="flex flex-col gap-4">
              <SectionHeader title="Browse by category" href="/apps" />
              <div className="rail gap-3 [--rail-pad:1rem] sm:[--rail-pad:2rem]">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/categories/${c.slug}`}
                    className="group relative flex h-24 w-40 flex-col justify-between overflow-hidden rounded-2xl p-3.5 text-white transition active:scale-[.98]"
                    style={{ backgroundImage: `linear-gradient(135deg, ${c.colorFrom}, ${c.colorTo})` }}
                  >
                    <CategoryIcon name={c.icon} className="size-6 opacity-90 transition group-hover:scale-110" />
                    <span className="text-[15px] font-semibold">{c.name}</span>
                    <CategoryIcon name={c.icon} className="absolute -right-3 -bottom-3 size-16 opacity-15" />
                  </Link>
                ))}
              </div>
            </section>
          )}

          {newest.length > 0 && (
            <section className="flex flex-col gap-3">
              <SectionHeader eyebrow="Fresh drops" title="New & Updated" href="/apps" />
              <AppRowGrid apps={newest} />
            </section>
          )}
        </div>
      )}
      <Footer />
    </>
  );
}

function TrustRibbon() {
  const items = [
    { icon: Zap, title: "Installs in seconds", body: "No 200 MB downloads. Apps open instantly and stay tiny.", tint: "text-amber-500" },
    { icon: ShieldCheck, title: "Safe by design", body: "Every app runs in your browser's sandbox and asks before using anything.", tint: "text-emerald-500" },
    { icon: Sparkles, title: "Always the latest", body: "No update queues. You get the newest version every time you open it.", tint: "text-sky-500" },
  ];
  return (
    <section className="px-4 sm:px-8">
      <Link href="/why" className="group relative block overflow-hidden rounded-[28px] bg-surface p-6 elevated sm:p-8">
        <div className="brand-gradient absolute -top-24 -right-24 size-64 rounded-full opacity-20 blur-3xl transition group-hover:opacity-30" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wider text-muted uppercase">Not on the App Store. On purpose.</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              A better way to get <span className="brand-text">apps</span>.
            </h2>
          </div>
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-2 transition group-hover:rotate-45">
            <ArrowUpRight className="size-5" />
          </span>
        </div>
        <div className="relative mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {items.map(({ icon: Icon, title, body, tint }) => (
            <div key={title}>
              <Icon className={`size-6 ${tint}`} />
              <p className="mt-2 font-semibold">{title}</p>
              <p className="mt-0.5 text-sm text-muted">{body}</p>
            </div>
          ))}
        </div>
      </Link>
    </section>
  );
}

function EmptyStore() {
  return (
    <div className="mx-4 grid place-items-center rounded-[28px] bg-surface px-6 py-24 text-center elevated sm:mx-8">
      <Sparkles className="size-10 text-brand" />
      <h2 className="mt-4 text-2xl font-semibold">The shelves are being stocked</h2>
      <p className="mt-2 max-w-sm text-muted">New LoopingBinary apps are landing soon. Publish the first one from Studio.</p>
      <Link href="/studio" className="mt-6 rounded-full bg-brand px-5 py-2.5 font-semibold text-white">
        Open Studio
      </Link>
    </div>
  );
}
