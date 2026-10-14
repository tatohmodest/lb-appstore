import { Suspense } from "react";
import { AppForm } from "../app-form";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata = { title: "Publish app" };

export default function NewApp(props: PageProps<"/studio/apps/new">) {
  return (
    <Suspense fallback={<div className="skeleton h-[600px] rounded-3xl" />}>
      <Content searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Content({ searchParams }: { searchParams: PageProps<"/studio/apps/new">["searchParams"] }) {
  await requireAdmin();
  const { url } = await searchParams;
  const categories = await db.category.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }], select: { id: true, name: true } });
  return <AppForm categories={categories} initialUrl={typeof url === "string" ? url : undefined} />;
}
