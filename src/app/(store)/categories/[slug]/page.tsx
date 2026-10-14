import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChevronLeft } from "lucide-react";
import { AppRow } from "@/components/app-cards";
import { CategoryIcon } from "@/components/category-icon";
import { Footer } from "@/components/ui/footer";
import { getCategory } from "@/lib/queries";

export async function generateMetadata(props: PageProps<"/categories/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const c = await getCategory(slug);
  return { title: c ? `${c.name} apps` : "Category" };
}

export default function CategoryPage(props: PageProps<"/categories/[slug]">) {
  return (
    <Suspense fallback={<div className="skeleton m-4 h-48 rounded-[28px] sm:m-8" />}>
      <Category params={props.params} />
    </Suspense>
  );
}

async function Category({ params }: { params: PageProps<"/categories/[slug]">["params"] }) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  return (
    <>
      <div className="px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] sm:px-8 lg:pt-6">
        <Link href="/apps" className="inline-flex items-center gap-0.5 text-[15px] font-medium text-brand">
          <ChevronLeft className="size-5" /> Apps
        </Link>
      </div>
      <header
        className="relative mx-4 mt-4 overflow-hidden rounded-[28px] p-7 text-white sm:mx-8 sm:p-10 grain"
        style={{ backgroundImage: `linear-gradient(135deg, ${category.colorFrom}, ${category.colorTo})` }}
      >
        <CategoryIcon name={category.icon} className="absolute -right-6 -bottom-8 size-48 opacity-20" />
        <CategoryIcon name={category.icon} className="relative size-9" />
        <h1 className="relative mt-6 text-4xl font-bold tracking-tight sm:text-5xl">{category.name}</h1>
        <p className="relative mt-1 text-white/75">
          {category.apps.length} app{category.apps.length === 1 ? "" : "s"}
        </p>
      </header>
      <div className="mt-6 grid gap-x-8 px-4 sm:px-8 md:grid-cols-2">
        {category.apps.map((app, i) => (
          <AppRow key={app.id} app={app} rank={i + 1} />
        ))}
      </div>
      {category.apps.length === 0 && <p className="px-4 py-10 text-muted sm:px-8">Nothing here yet. Check back soon.</p>}
      <Footer />
    </>
  );
}
