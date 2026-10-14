import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AppForm } from "../app-form";
import { ReviewModeration } from "./review-moderation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata = { title: "Edit app" };

export default function EditApp(props: PageProps<"/studio/apps/[id]">) {
  return (
    <Suspense fallback={<div className="skeleton h-[600px] rounded-3xl" />}>
      <Content params={props.params} />
    </Suspense>
  );
}

async function Content({ params }: { params: PageProps<"/studio/apps/[id]">["params"] }) {
  await requireAdmin();
  const { id } = await params;
  const [app, categories] = await Promise.all([
    db.app.findUnique({ where: { id }, include: { reviews: { orderBy: { createdAt: "desc" }, take: 100 } } }),
    db.category.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }], select: { id: true, name: true } }),
  ]);
  if (!app) notFound();
  const { reviews, ...rest } = app;
  return (
    <>
      <AppForm categories={categories} app={rest} />
      <ReviewModeration reviews={reviews.map((r) => ({ id: r.id, author: r.author, rating: r.rating, title: r.title, body: r.body, reply: r.reply, createdAt: r.createdAt.toISOString() }))} />
    </>
  );
}
