import { cacheLife, cacheTag } from "next/cache";
import { db } from "./db";

// Every public read is cached and tagged "store". Studio mutations and new
// reviews call updateTag("store") so changes show up immediately.

const listSelect = {
  id: true,
  slug: true,
  name: true,
  subtitle: true,
  headline: true,
  iconUrl: true,
  coverUrl: true,
  accentColor: true,
  url: true,
  ratingAvg: true,
  ratingCount: true,
  installs: true,
  featured: true,
  editorsChoice: true,
  releasedAt: true,
  updatedAt: true,
  category: { select: { slug: true, name: true } },
} as const;

export type AppListItem = Awaited<ReturnType<typeof getTopApps>>[number];

export async function getTodayData() {
  "use cache";
  cacheTag("store");
  cacheLife("hours");

  const [featured, editorsChoice, newest, top, categories] = await Promise.all([
    db.app.findMany({
      where: { published: true, featured: true },
      orderBy: { updatedAt: "desc" },
      take: 6,
      select: listSelect,
    }),
    db.app.findMany({
      where: { published: true, editorsChoice: true },
      orderBy: { ratingAvg: "desc" },
      take: 10,
      select: listSelect,
    }),
    db.app.findMany({
      where: { published: true },
      orderBy: { releasedAt: "desc" },
      take: 10,
      select: listSelect,
    }),
    db.app.findMany({
      where: { published: true },
      orderBy: [{ installs: "desc" }, { ratingAvg: "desc" }],
      take: 9,
      select: listSelect,
    }),
    getCategories(),
  ]);

  return { featured, editorsChoice, newest, top, categories };
}

export async function getTopApps(take = 50) {
  "use cache";
  cacheTag("store");
  cacheLife("hours");

  return db.app.findMany({
    where: { published: true },
    orderBy: [{ installs: "desc" }, { ratingAvg: "desc" }],
    take,
    select: listSelect,
  });
}

export async function getCategories() {
  "use cache";
  cacheTag("store");
  cacheLife("hours");

  return db.category.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: { _count: { select: { apps: { where: { published: true } } } } },
  });
}

export async function getCategory(slug: string) {
  "use cache";
  cacheTag("store");
  cacheLife("hours");

  return db.category.findUnique({
    where: { slug },
    include: {
      apps: {
        where: { published: true },
        orderBy: [{ installs: "desc" }, { ratingAvg: "desc" }],
        select: listSelect,
      },
    },
  });
}

export async function getApp(slug: string) {
  "use cache";
  cacheTag("store");
  cacheLife("hours");

  const app = await db.app.findFirst({
    where: { slug, published: true },
    include: {
      category: true,
      reviews: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!app) return null;

  const [histogram, related] = await Promise.all([
    db.review.groupBy({
      by: ["rating"],
      where: { appId: app.id },
      _count: { rating: true },
    }),
    db.app.findMany({
      where: {
        published: true,
        id: { not: app.id },
        ...(app.categoryId ? { OR: [{ categoryId: app.categoryId }, { developer: app.developer }] } : {}),
      },
      orderBy: { installs: "desc" },
      take: 8,
      select: listSelect,
    }),
  ]);

  const counts = [5, 4, 3, 2, 1].map(
    (stars) => histogram.find((h) => h.rating === stars)?._count.rating ?? 0,
  );

  return { ...app, histogram: counts, related };
}

export async function searchApps(q: string) {
  "use cache";
  cacheTag("store");
  cacheLife("minutes");

  const term = q.trim();
  if (!term) return [];
  return db.app.findMany({
    where: {
      published: true,
      OR: [
        { name: { contains: term, mode: "insensitive" } },
        { subtitle: { contains: term, mode: "insensitive" } },
        { tags: { has: term.toLowerCase() } },
        { category: { name: { contains: term, mode: "insensitive" } } },
      ],
    },
    orderBy: [{ installs: "desc" }],
    take: 30,
    select: listSelect,
  });
}

export async function getAllSlugs() {
  "use cache";
  cacheTag("store");
  cacheLife("hours");

  return db.app.findMany({ where: { published: true }, select: { slug: true, updatedAt: true } });
}
