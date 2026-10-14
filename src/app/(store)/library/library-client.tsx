"use client";

import Link from "next/link";
import { Library, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { AppIcon } from "@/components/app-icon";
import { removeFromLibrary, useLibrary } from "@/lib/library";

export function LibraryClient() {
  const apps = useLibrary();

  if (!apps.length) {
    return (
      <div className="mx-4 grid place-items-center rounded-[28px] bg-surface px-6 py-20 text-center elevated sm:mx-8">
        <span className="grid size-16 place-items-center rounded-3xl bg-surface-2">
          <Library className="size-8 text-brand" />
        </span>
        <h2 className="mt-5 text-xl font-semibold">Your apps will live here</h2>
        <p className="mt-1 max-w-xs text-muted">Every app you get from LBStore shows up here so you can jump back in any time.</p>
        <Link href="/" className="mt-6 rounded-full bg-brand px-5 py-2.5 font-semibold text-white">
          Discover apps
        </Link>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-3 px-4 sm:grid-cols-2 sm:px-8 xl:grid-cols-3">
      <AnimatePresence initial={false}>
        {apps.map((a) => (
          <motion.li
            key={a.slug}
            layout
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative flex items-center gap-3.5 rounded-2xl bg-surface p-3 elevated"
          >
            <AppIcon name={a.name} iconUrl={a.iconUrl} accentColor={a.accentColor} size={56} />
            <div className="min-w-0 flex-1">
              <Link href={`/apps/${a.slug}`} className="block truncate font-medium after:absolute after:inset-0">
                {a.name}
              </Link>
              <p className="truncate text-[13px] text-muted">{a.subtitle}</p>
            </div>
            <a
              href={a.url}
              target="_blank"
              rel="noopener"
              className="relative z-10 rounded-full bg-surface-2 px-4 py-1.5 text-[13px] font-bold text-brand dark:bg-surface-3"
            >
              OPEN
            </a>
            <button
              onClick={() => removeFromLibrary(a.slug)}
              aria-label={`Remove ${a.name}`}
              className="relative z-10 grid size-8 place-items-center rounded-full text-muted hover:text-red-500"
            >
              <Trash2 className="size-4" />
            </button>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
