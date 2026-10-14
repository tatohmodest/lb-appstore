"use client";

import { Download, Share, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useClientValue } from "@/lib/use-client-value";
import { LogoMark } from "../logo";
import { detectPlatform, isStandalone } from "@/lib/platform";
import { cn } from "@/lib/utils";

// Installing LBStore itself. Captures beforeinstallprompt (Chromium) once,
// app-wide, and falls back to Add-to-Home-Screen hints on iOS.

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

let deferred: BIPEvent | null = null;
const subs = new Set<() => void>();
const notify = () => subs.forEach((s) => s());

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferred = e as BIPEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    notify();
  });
}

function useInstallState() {
  const prompt = useSyncExternalStore(
    (cb) => (subs.add(cb), () => subs.delete(cb)),
    () => deferred,
    () => null,
  );
  const ready = useClientValue(() => true, false);
  const standalone = useClientValue(isStandalone, false);
  const ios = useClientValue(() => detectPlatform().startsWith("ios"), false);
  return { prompt, ready, standalone, ios };
}

async function runPrompt() {
  if (!deferred) return;
  await deferred.prompt();
  await deferred.userChoice;
  deferred = null;
  notify();
}

/** Card in the desktop sidebar. */
export function StoreInstallCard() {
  const { prompt, ready, standalone, ios } = useInstallState();
  const [showIOS, setShowIOS] = useState(false);
  if (!ready || standalone || (!prompt && !ios)) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-surface p-4 elevated">
      <div className="brand-gradient absolute -top-10 -right-10 size-28 rounded-full opacity-30 blur-2xl" />
      <LogoMark className="relative size-9" />
      <p className="relative mt-3 text-sm font-semibold">Install LBStore</p>
      <p className="relative mt-0.5 text-xs text-muted">
        {showIOS ? (
          <>Tap <Share className="inline size-3.5 align-[-2px]" /> Share, then Add to Home Screen.</>
        ) : (
          <>One tap. Every LoopingBinary app, right on your device.</>
        )}
      </p>
      {!showIOS && (
        <button
          onClick={() => (prompt ? runPrompt() : setShowIOS(true))}
          className="relative mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-ink py-2 text-xs font-semibold text-bg"
        >
          <Download className="size-3.5" /> Install
        </button>
      )}
    </div>
  );
}

/** Floating banner on phones, shown after a few seconds and dismissible for a week. */
export function StoreInstallBanner() {
  const { prompt, ready, standalone, ios } = useInstallState();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ready || standalone || (!prompt && !ios)) return;
    try {
      const until = Number(localStorage.getItem("lbstore:banner-dismissed") || 0);
      if (until > Date.now()) return;
    } catch {}
    const t = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(t);
  }, [ready, standalone, prompt, ios]);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem("lbstore:banner-dismissed", String(Date.now() + 7 * 864e5));
    } catch {}
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 300 }}
          className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+76px)] z-40 lg:hidden"
        >
          <div className="glass flex items-center gap-3 rounded-[22px] p-3 pr-2 shadow-xl ring-1 ring-line">
            <LogoMark className="size-11" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Add LBStore to your Home Screen</p>
              <p className="truncate text-xs text-muted">
                {prompt ? "Opens instantly, works offline" : (
                  <>Tap <Share className="inline size-3 align-[-1px]" /> then &ldquo;Add to Home Screen&rdquo;</>
                )}
              </p>
            </div>
            {prompt && (
              <button onClick={runPrompt} className="rounded-full bg-brand px-4 py-1.5 text-[13px] font-bold text-white">
                Install
              </button>
            )}
            <button onClick={dismiss} aria-label="Dismiss" className={cn("grid size-8 place-items-center rounded-full text-muted")}>
              <X className="size-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
