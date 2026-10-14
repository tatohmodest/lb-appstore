"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";

const schema = z.object({
  appId: z.string().min(1),
  deviceId: z.string().uuid(),
  author: z.string().trim().min(1, "Add your name").max(40),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(80).default(""),
  body: z.string().trim().max(1500).default(""),
});

export type ReviewInput = z.input<typeof schema>;

export async function submitReview(input: ReviewInput): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid review" };
  const { appId, deviceId, ...data } = parsed.data;

  const app = await db.app.findUnique({ where: { id: appId }, select: { id: true } });
  if (!app) return { ok: false, error: "App not found" };

  await db.review.upsert({
    where: { appId_deviceId: { appId, deviceId } },
    create: { appId, deviceId, ...data },
    update: data,
  });

  const agg = await db.review.aggregate({ where: { appId }, _avg: { rating: true }, _count: true });
  await db.app.update({
    where: { id: appId },
    data: { ratingAvg: agg._avg.rating ?? 0, ratingCount: agg._count },
  });

  updateTag("store");
  return { ok: true };
}
