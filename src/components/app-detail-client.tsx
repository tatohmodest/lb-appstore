"use client";

/* eslint-disable @next/next/no-img-element */
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronLeft, ChevronRight, Share2, Star, X } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { Sheet } from "./sheet";
import { submitReview } from "@/app/actions/reviews";
import { getDeviceId } from "@/lib/library";
import { useClientValue } from "@/lib/use-client-value";
import { cn } from "@/lib/utils";

export function ShareButton({ title, text }: { title: string; text: string }) {
  const [copied, setCopied] = useState(false);
  const share = async () => {
    const url = window.location.href.split("?")[0];
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        return;
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={share}
      aria-label="Share"
      className="grid size-10 place-items-center rounded-full bg-surface-2 text-brand transition hover:bg-surface-3 active:scale-95"
    >
      {copied ? <Check className="size-[18px]" /> : <Share2 className="size-[18px]" />}
    </button>
  );
}

export function ExpandableText({ text, lines = 4 }: { text: string; lines?: number }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 280 || text.split("\n").length > lines;
  return (
    <div>
      <p className={cn("text-[15px] leading-relaxed whitespace-pre-line text-ink-2", !open && long && "line-clamp-4")}>{text}</p>
      {long && !open && (
        <button onClick={() => setOpen(true)} className="mt-1 text-[15px] font-medium text-brand">
          more
        </button>
      )}
    </div>
  );
}

export function ScreenshotGallery({ shots, name }: { shots: string[]; name: string }) {
  const [index, setIndex] = useState<number | null>(null);

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIndex(null);
      if (e.key === "ArrowRight") setIndex((i) => (i === null ? i : Math.min(shots.length - 1, i + 1)));
      if (e.key === "ArrowLeft") setIndex((i) => (i === null ? i : Math.max(0, i - 1)));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, shots.length]);

  return (
    <>
      <div className="rail gap-3 [--rail-pad:1rem] sm:[--rail-pad:2rem]">
        {shots.map((src, i) => (
          <button
            key={src}
            onClick={() => setIndex(i)}
            className="overflow-hidden rounded-[22px] bg-surface-2 elevated transition hover:brightness-95"
          >
            <img
              src={src}
              alt={`${name} screenshot ${i + 1}`}
              loading={i < 2 ? "eager" : "lazy"}
              className="h-[420px] w-auto max-w-none object-cover sm:h-[480px]"
            />
          </button>
        ))}
      </div>
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {index !== null && (
              <motion.div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIndex(null)}
              >
                <motion.img
                  key={shots[index]}
                  src={shots[index]}
                  alt=""
                  initial={{ scale: 0.94, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="max-h-[88dvh] max-w-full rounded-3xl object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
                <button className="absolute top-5 right-5 grid size-10 place-items-center rounded-full bg-white/15 text-white" aria-label="Close">
                  <X className="size-5" />
                </button>
                {index > 0 && (
                  <button
                    onClick={(e) => (e.stopPropagation(), setIndex(index - 1))}
                    className="absolute left-4 grid size-11 place-items-center rounded-full bg-white/15 text-white"
                    aria-label="Previous"
                  >
                    <ChevronLeft />
                  </button>
                )}
                {index < shots.length - 1 && (
                  <button
                    onClick={(e) => (e.stopPropagation(), setIndex(index + 1))}
                    className="absolute right-4 grid size-11 place-items-center rounded-full bg-white/15 text-white"
                    aria-label="Next"
                  >
                    <ChevronRight />
                  </button>
                )}
                <p className="absolute bottom-6 text-sm text-white/70 tabular-nums">
                  {index + 1} / {shots.length}
                </p>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}

export function WriteReview({ appId, appName }: { appId: string; appName: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  const onSubmit = (form: FormData) => {
    if (!rating) return setError("Tap a star to rate");
    setError(null);
    start(async () => {
      const res = await submitReview({
        appId,
        deviceId: getDeviceId(),
        rating,
        author: String(form.get("author") || ""),
        title: String(form.get("title") || ""),
        body: String(form.get("body") || ""),
      });
      if (!res.ok) return setError(res.error);
      try {
        localStorage.setItem("lbstore:author", String(form.get("author")));
      } catch {}
      setDone(true);
      setTimeout(() => {
        setOpen(false);
        setDone(false);
      }, 1400);
    });
  };

  const savedName = useClientValue(() => {
    try {
      return localStorage.getItem("lbstore:author") || "";
    } catch {
      return "";
    }
  }, "");

  return (
    <>
      <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-[15px] font-medium text-brand">
        <Star className="size-4" /> Write a review
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} label="Write a review">
        <div className="p-6 pt-10 sm:pt-7">
          {done ? (
            <div className="grid place-items-center py-12 text-center">
              <span className="grid size-14 place-items-center rounded-full bg-emerald-500/15 text-emerald-500">
                <Check className="size-7" />
              </span>
              <p className="mt-4 text-lg font-semibold">Thanks for the review!</p>
            </div>
          ) : (
            <form action={onSubmit} className="flex flex-col gap-4">
              <div>
                <h2 className="text-xl font-semibold">Rate {appName}</h2>
                <p className="text-sm text-muted">Your review helps other people and the LoopingBinary team.</p>
              </div>
              <div className="flex gap-1.5" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-label={`${n} star${n > 1 ? "s" : ""}`}
                    onMouseEnter={() => setHover(n)}
                    onClick={() => setRating(n)}
                    className="transition active:scale-90"
                  >
                    <Star className={cn("size-9", (hover || rating) >= n ? "fill-star text-star" : "text-surface-3")} />
                  </button>
                ))}
              </div>
              <input name="author" defaultValue={savedName} key={savedName} required maxLength={40} placeholder="Your name" className="rounded-xl bg-surface-2 px-4 py-3 outline-none focus:ring-2 focus:ring-brand/50" />
              <input name="title" maxLength={80} placeholder="Title (optional)" className="rounded-xl bg-surface-2 px-4 py-3 outline-none focus:ring-2 focus:ring-brand/50" />
              <textarea name="body" rows={4} maxLength={1500} placeholder="What did you love? What could be better?" className="resize-none rounded-xl bg-surface-2 px-4 py-3 outline-none focus:ring-2 focus:ring-brand/50" />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button disabled={pending} className="rounded-2xl bg-brand py-3.5 font-semibold text-white transition disabled:opacity-60">
                {pending ? "Sending…" : "Submit review"}
              </button>
            </form>
          )}
        </div>
      </Sheet>
    </>
  );
}
