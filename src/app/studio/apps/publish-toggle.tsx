"use client";

import { useOptimistic, useTransition } from "react";
import { togglePublished } from "../actions";
import { cn } from "@/lib/utils";

export function PublishToggle({ id, published }: { id: string; published: boolean }) {
  const [value, setValue] = useOptimistic(published);
  const [, start] = useTransition();
  return (
    <button
      role="switch"
      aria-checked={value}
      aria-label={value ? "Published" : "Hidden"}
      onClick={() =>
        start(async () => {
          setValue(!value);
          await togglePublished(id, !value);
        })
      }
      className={cn("relative h-7 w-12 shrink-0 rounded-full transition", value ? "bg-emerald-500" : "bg-surface-3")}
    >
      <span className={cn("absolute top-0.5 left-0.5 size-6 rounded-full bg-white shadow transition", value && "translate-x-5")} />
    </button>
  );
}
