"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { deleteCategory, saveCategory } from "../actions";
import { CATEGORY_ICONS, CategoryIcon } from "@/components/category-icon";
import { cn } from "@/lib/utils";

type Cat = { id?: string; name: string; icon: string; colorFrom: string; colorTo: string; order: number; count?: number };

const BLANK: Cat = { name: "", icon: "sparkles", colorFrom: "#7c3aed", colorTo: "#2563eb", order: 0 };

export function CategoryManager({ categories }: { categories: Cat[] }) {
  const [editing, setEditing] = useState<Cat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const submit = () =>
    editing &&
    start(async () => {
      const res = await saveCategory(editing);
      if (!res.ok) return setError(res.error);
      setError(null);
      setEditing(null);
    });

  return (
    <div>
      <div className="flex items-end justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        <button onClick={() => setEditing({ ...BLANK, order: categories.length })} className="flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white">
          <Plus className="size-4" /> New category
        </button>
      </div>

      {editing && (
        <div className="mt-6 grid gap-5 rounded-3xl bg-surface p-6 elevated lg:grid-cols-[1fr_220px]">
          <div className="flex flex-col gap-4">
            <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Category name" className="rounded-xl bg-surface-2 px-4 py-2.5 outline-none focus:ring-2 focus:ring-brand/40" autoFocus />
            <div className="flex flex-wrap gap-1.5">
              {Object.keys(CATEGORY_ICONS).map((k) => (
                <button key={k} type="button" onClick={() => setEditing({ ...editing, icon: k })} aria-label={k}
                  className={cn("grid size-10 place-items-center rounded-xl transition", editing.icon === k ? "bg-ink text-bg" : "bg-surface-2 text-muted hover:text-ink")}>
                  <CategoryIcon name={k} className="size-5" />
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <label className="flex items-center gap-2">From <input type="color" value={editing.colorFrom} onChange={(e) => setEditing({ ...editing, colorFrom: e.target.value })} className="size-9 rounded-lg" /></label>
              <label className="flex items-center gap-2">To <input type="color" value={editing.colorTo} onChange={(e) => setEditing({ ...editing, colorTo: e.target.value })} className="size-9 rounded-lg" /></label>
              <label className="flex items-center gap-2">Order <input type="number" value={editing.order} onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })} className="w-20 rounded-lg bg-surface-2 px-2 py-1.5" /></label>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex gap-2">
              <button onClick={submit} disabled={pending || !editing.name} className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-bg disabled:opacity-50">Save</button>
              <button onClick={() => setEditing(null)} className="rounded-full px-5 py-2 text-sm font-medium text-muted">Cancel</button>
            </div>
          </div>
          <Tile c={editing} />
        </div>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((c) => (
          <div key={c.id} className="group relative">
            <button onClick={() => setEditing(c)} className="block w-full text-left"><Tile c={c} /></button>
            <button
              onClick={() => confirm(`Delete ${c.name}? Its apps become uncategorized.`) && start(() => deleteCategory(c.id!))}
              aria-label={`Delete ${c.name}`}
              className="absolute top-2 right-2 grid size-8 place-items-center rounded-full bg-black/30 text-white opacity-0 transition group-hover:opacity-100"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Tile({ c }: { c: Cat }) {
  return (
    <div className="relative flex h-28 flex-col justify-between overflow-hidden rounded-2xl p-4 text-white" style={{ backgroundImage: `linear-gradient(135deg, ${c.colorFrom}, ${c.colorTo})` }}>
      <CategoryIcon name={c.icon} className="size-6" />
      <div className="flex items-end justify-between">
        <span className="font-semibold">{c.name || "Name"}</span>
        {c.count !== undefined && <span className="text-xs text-white/70">{c.count} apps</span>}
      </div>
      <CategoryIcon name={c.icon} className="absolute -right-3 -bottom-3 size-16 opacity-20" />
    </div>
  );
}
