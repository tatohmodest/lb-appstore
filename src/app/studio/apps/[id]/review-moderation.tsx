"use client";

import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { deleteReview, replyToReview } from "../../actions";
import { Stars } from "@/components/stars";

type R = { id: string; author: string; rating: number; title: string; body: string; reply: string | null; createdAt: string };

export function ReviewModeration({ reviews }: { reviews: R[] }) {
  return (
    <section id="reviews" className="mt-10 scroll-mt-20">
      <h2 className="text-xl font-semibold">Reviews ({reviews.length})</h2>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {reviews.map((r) => <ReviewItem key={r.id} r={r} />)}
        {!reviews.length && <p className="text-sm text-muted">No reviews yet.</p>}
      </div>
    </section>
  );
}

function ReviewItem({ r }: { r: R }) {
  const [reply, setReply] = useState(r.reply ?? "");
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(false);
  return (
    <div className="rounded-2xl bg-surface p-4 elevated">
      <div className="flex items-start justify-between gap-2">
        <div>
          <Stars value={r.rating} size={12} className="text-star" />
          <p className="mt-1 font-medium">{r.title || "Untitled"}</p>
          <p className="text-xs text-muted">{r.author} · {new Date(r.createdAt).toLocaleDateString()}</p>
        </div>
        <button
          onClick={() => confirm("Delete this review?") && start(() => deleteReview(r.id))}
          className="grid size-8 place-items-center rounded-full text-muted hover:bg-red-500/10 hover:text-red-500"
          aria-label="Delete review"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
      {r.body && <p className="mt-2 text-sm text-ink-2">{r.body}</p>}
      <div className="mt-3 flex gap-2">
        <input
          value={reply}
          onChange={(e) => (setReply(e.target.value), setSaved(false))}
          placeholder="Reply as LoopingBinary…"
          className="min-w-0 flex-1 rounded-xl bg-surface-2 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-brand/40"
        />
        <button
          disabled={pending}
          onClick={() => start(async () => (await replyToReview(r.id, reply), setSaved(true)))}
          className="rounded-xl bg-ink px-3 text-sm font-semibold text-bg disabled:opacity-50"
        >
          {saved ? "Saved" : "Reply"}
        </button>
      </div>
    </div>
  );
}
