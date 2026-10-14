import type { Metadata } from "next";
import Link from "next/link";
import { AppRow, SectionHeader } from "@/components/app-cards";
import { CategoryIcon } from "@/components/category-icon";
import { Footer } from "@/components/ui/footer";
import { PageTitle } from "@/components/ui/page-title";
import { getCategories, getTopApps } from "@/lib/queries";

export const metadata: Metadata = { title: "Apps" };

export default async function AppsPage() {
  const [apps, categories] = await Promise.all([getTopApps(60), getCategories()]);

  return (
    <>
      <PageTitle eyebrow="Every LoopingBinary app" title="Apps" />

      {categories.length > 0 && (
        <section className="px-4 sm:px-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/categories/${c.slug}`}
                className="group relative flex h-[88px] items-end overflow-hidden rounded-2xl p-3.5 text-white transition active:scale-[.98]"
                style={{ backgroundImage: `linear-gradient(135deg, ${c.colorFrom}, ${c.colorTo})` }}
              >
                <span className="relative z-10 font-semibold">{c.name}</span>
                <span className="relative z-10 ml-auto text-xs font-medium text-white/70">{c._count.apps}</span>
                <CategoryIcon name={c.icon} className="absolute -top-2 -right-2 size-16 opacity-25 transition duration-500 group-hover:scale-110 group-hover:rotate-6" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-12">
        <SectionHeader eyebrow="Ranked by installs" title="Top Charts" />
        {apps.length ? (
          <div className="mt-2 grid grid-cols-1 gap-x-8 px-4 sm:px-8 md:grid-cols-2 2xl:grid-cols-3">
            {apps.map((app, i) => (
              <AppRow key={app.id} app={app} rank={i + 1} />
            ))}
          </div>
        ) : (
          <p className="px-4 py-10 text-muted sm:px-8">No apps published yet.</p>
        )}
      </section>
      <Footer />
    </>
  );
}
