import { Suspense } from "react";
import { BulkImport } from "./bulk-import";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata = { title: "Bulk import" };

export default function ImportPage() {
  return (
    <Suspense fallback={<div className="skeleton h-96 rounded-3xl" />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  await requireAdmin();
  const [categories, apps] = await Promise.all([
    db.category.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }], select: { id: true, slug: true, name: true } }),
    db.app.findMany({ select: { id: true, url: true, name: true } }),
  ]);
  const demoCount = apps.filter((a) => a.url.startsWith("https://example.com")).length;
  return <BulkImport categories={categories} existing={apps.filter((a) => !a.url.startsWith("https://example.com"))} demoCount={demoCount} />;
}
