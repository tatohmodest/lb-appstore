"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { checkPassword, createSession, destroySession, requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";

export async function login(_: unknown, form: FormData) {
  const password = String(form.get("password") || "");
  if (!checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 600));
    return { error: "Wrong password" };
  }
  await createSession();
  redirect("/studio");
}

export async function logout() {
  await destroySession();
  redirect("/studio/login");
}

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a 6-digit hex color");
// Full URL, or a path served by our /media proxy
const assetUrl = z.union([z.url(), z.string().regex(/^\/media\/[\w\-./]+$/)]);
const optionalUrl = z.union([z.literal(""), assetUrl]).transform((v) => v || null);

const appSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, "Name is required").max(60),
  slug: z.string().trim().max(60).optional(),
  subtitle: z.string().trim().max(90).default(""),
  headline: z.string().trim().max(120).default(""),
  description: z.string().trim().max(8000).default(""),
  developer: z.string().trim().max(60).default("LoopingBinary"),
  url: z.url("App URL must be a full https:// link"),
  manifestUrl: z.union([z.literal(""), z.url()]).transform((v) => v || null),
  iconUrl: optionalUrl,
  coverUrl: optionalUrl,
  screenshots: z.array(assetUrl).max(12).default([]),
  accentColor: hex.default("#00b369"),
  version: z.string().trim().max(20).default("1.0.0"),
  whatsNew: z.string().trim().max(4000).default(""),
  sizeKb: z.coerce.number().int().min(0).max(10_000_000).default(0),
  ageRating: z.enum(["4+", "9+", "12+", "17+"]).default("4+"),
  permissions: z.array(z.string().max(30)).max(10).default([]),
  tags: z.array(z.string().max(30)).max(20).default([]),
  categoryId: z.string().nullable().default(null),
  offline: z.boolean().default(true),
  featured: z.boolean().default(false),
  editorsChoice: z.boolean().default(false),
  published: z.boolean().default(true),
});

export type AppInput = z.input<typeof appSchema>;

export async function saveApp(input: AppInput): Promise<{ ok: true; id: string; slug: string } | { ok: false; error: string }> {
  await requireAdmin();
  const parsed = appSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid data" };

  const { id, slug: rawSlug, headline, categoryId, ...data } = parsed.data;
  const slug = slugify(rawSlug || data.name);
  if (!slug) return { ok: false, error: "Slug is empty" };

  const clash = await db.app.findFirst({ where: { slug, ...(id ? { NOT: { id } } : {}) }, select: { id: true } });
  if (clash) return { ok: false, error: `Another app already uses the slug "${slug}"` };

  const record = {
    ...data,
    slug,
    headline: headline || null,
    tags: data.tags.map((t) => t.toLowerCase()),
    category: categoryId ? { connect: { id: categoryId } } : id ? { disconnect: true } : undefined,
  };

  const app = id
    ? await db.app.update({ where: { id }, data: record, select: { id: true, slug: true } })
    : await db.app.create({ data: record, select: { id: true, slug: true } });

  updateTag("store");
  return { ok: true, ...app };
}

export async function deleteApp(id: string) {
  await requireAdmin();
  await db.app.delete({ where: { id } });
  updateTag("store");
  redirect("/studio/apps");
}

export async function togglePublished(id: string, published: boolean) {
  await requireAdmin();
  await db.app.update({ where: { id }, data: { published } });
  updateTag("store");
}

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1).max(40),
  icon: z.string().max(30).default("sparkles"),
  colorFrom: hex,
  colorTo: hex,
  order: z.coerce.number().int().default(0),
});

export async function saveCategory(input: z.input<typeof categorySchema>) {
  await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: parsed.error.issues[0]?.message ?? "Invalid" };
  const { id, ...data } = parsed.data;
  const slug = slugify(data.name);
  if (id) await db.category.update({ where: { id }, data: { ...data, slug } });
  else await db.category.create({ data: { ...data, slug } });
  updateTag("store");
  return { ok: true as const };
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  await db.category.delete({ where: { id } });
  updateTag("store");
}

export async function replyToReview(id: string, reply: string) {
  await requireAdmin();
  await db.review.update({ where: { id }, data: { reply: reply.trim().slice(0, 1000) || null } });
  updateTag("store");
}

export async function deleteReview(id: string) {
  await requireAdmin();
  const review = await db.review.delete({ where: { id } });
  const agg = await db.review.aggregate({ where: { appId: review.appId }, _avg: { rating: true }, _count: true });
  await db.app.update({ where: { id: review.appId }, data: { ratingAvg: agg._avg.rating ?? 0, ratingCount: agg._count } });
  updateTag("store");
}

/** Removes the seeded example.com demo listings. */
export async function removeDemoApps() {
  await requireAdmin();
  const { count } = await db.app.deleteMany({ where: { url: { startsWith: "https://example.com" } } });
  updateTag("store");
  return count;
}
