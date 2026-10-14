import { Suspense } from "react";
import { CategoryManager } from "./category-manager";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata = { title: "Categories" };

export default function CategoriesPage() {
  return (
    <Suspense fallback={<div className="skeleton h-96 rounded-3xl" />}>
      <Content />
    </Suspense>
  );
}

async function Content() {
  await requireAdmin();
  const categories = await db.category.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }], include: { _count: { select: { apps: true } } } });
  return (
    <CategoryManager
      categories={categories.map((c) => ({ id: c.id, name: c.name, icon: c.icon, colorFrom: c.colorFrom, colorTo: c.colorTo, order: c.order, count: c._count.apps }))}
    />
  );
}
