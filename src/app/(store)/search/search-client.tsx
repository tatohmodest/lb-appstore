"use client";

import Link from "next/link";
import { Search, TrendingUp, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AppRow } from "@/components/app-cards";
import { CategoryIcon } from "@/components/category-icon";
import type { AppListItem } from "@/lib/queries";

type Cat = { slug: string; name: string; icon: string; colorFrom: string; colorTo: string };

export function SearchClient({ categories, trending }: { categories: Cat[]; trending: AppListItem[] }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<AppListItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const shown = q.trim() ? results : null;

  useEffect(() => {
    // Desktop: focus right away. Phones: don't pop the keyboard uninvited.
    if (matchMedia("(min-width: 1024px)").matches) input.current?.focus();
  }, []);

  useEffect(() => {
    const term = q.trim();
    if (!term) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        const data = await res.json();
        setResults(data.apps);
      } catch {}
      setLoading(false);
    }, 180);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  return (
    <div>
      <header className="glass sticky top-0 z-30 px-4 pt-[calc(env(safe-area-inset-top)+1.25rem)] pb-3 sm:px-8 lg:pt-8">
        <h1 className="mb-3 text-[34px] leading-none font-bold tracking-tight sm:text-[42px]">Search</h1>
        <label className="flex items-center gap-2.5 rounded-2xl bg-surface-2 px-4 py-3 ring-brand/40 focus-within:ring-2">
          <Search className="size-5 text-muted" />
          <input
            ref={input}
            value={q}
            onChange={(e) => (setQ(e.target.value), setLoading(!!e.target.value.trim()))}
            type="search"
            enterKeyHint="search"
            placeholder="Apps, categories, anything…"
            className="min-w-0 flex-1 bg-transparent text-[17px] outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
          />
          {q && (
            <button onClick={() => setQ("")} aria-label="Clear" className="grid size-5 place-items-center rounded-full bg-muted/40 text-bg">
              <X className="size-3" strokeWidth={3} />
            </button>
          )}
        </label>
      </header>

      <div className="px-4 pt-4 sm:px-8">
        {shown === null ? (
          <>
            {trending.length > 0 && (
              <section>
                <h2 className="flex items-center gap-2 text-lg font-semibold"><TrendingUp className="size-5 text-brand" /> Trending</h2>
                <div className="mt-1 grid gap-x-8 md:grid-cols-2">
                  {trending.map((a) => <AppRow key={a.id} app={a} />)}
                </div>
              </section>
            )}
            {categories.length > 0 && (
              <section className="mt-8">
                <h2 className="text-lg font-semibold">Categories</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/categories/${c.slug}`}
                      className="flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm font-medium elevated transition hover:-translate-y-0.5"
                    >
                      <span className="grid size-6 place-items-center rounded-full text-white" style={{ backgroundImage: `linear-gradient(135deg, ${c.colorFrom}, ${c.colorTo})` }}>
                        <CategoryIcon name={c.icon} className="size-3.5" />
                      </span>
                      {c.name}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : shown.length ? (
          <div className="grid gap-x-8 md:grid-cols-2">
            {shown.map((a) => <AppRow key={a.id} app={a} />)}
          </div>
        ) : (
          !loading && (
            <div className="py-20 text-center">
              <p className="text-lg font-semibold">No results for &ldquo;{q}&rdquo;</p>
              <p className="mt-1 text-muted">Try a different word, or browse categories.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
