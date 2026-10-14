"use client";

import { useState } from "react";
import { InstallSheet, type InstallableApp } from "./install-sheet";
import { detectPlatform } from "@/lib/platform";
import { useClientValue } from "@/lib/use-client-value";
import { useLibrary } from "@/lib/library";
import { cn } from "@/lib/utils";

type Props = {
  app: InstallableApp;
  size?: "sm" | "lg";
  /** Auto-open the sheet when the page URL has ?get=1 (QR codes, shared links). */
  autoOpen?: boolean;
  className?: string;
  tone?: "default" | "light";
};

export function GetButton({ app, size = "sm", autoOpen, className, tone = "default" }: Props) {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const platform = useClientValue(detectPlatform, "desktop");
  const fromLink = useClientValue(() => new URLSearchParams(window.location.search).get("get") === "1", false);
  const library = useLibrary();
  const owned = library.some((a) => a.slug === app.slug);
  const isOpen = open || (!!autoOpen && fromLink && !dismissed);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (owned && size === "sm") {
      window.open(app.url, "_blank", "noopener");
      return;
    }
    setOpen(true);
  };

  return (
    <>
      <button
        onClick={onClick}
        aria-label={`${owned ? "Open" : "Get"} ${app.name}`}
        className={cn(
          "relative shrink-0 overflow-hidden font-bold tracking-wide transition active:scale-95",
          size === "sm" && "min-w-[72px] rounded-full px-4 py-[7px] text-[13px]",
          size === "lg" && "min-w-[120px] rounded-full px-7 py-2.5 text-[15px]",
          tone === "light"
            ? "bg-white/90 text-black backdrop-blur hover:bg-white"
            : "bg-surface-2 text-brand hover:bg-surface-3 dark:bg-surface-3 dark:hover:bg-white/15",
          size === "lg" && tone === "default" && "!bg-brand !text-white shadow-lg shadow-brand/30 hover:brightness-110",
          className,
        )}
      >
        {owned ? "OPEN" : "GET"}
      </button>
      <InstallSheet key={platform} app={app} open={isOpen} onClose={() => (setOpen(false), setDismissed(true))} platform={platform} />
    </>
  );
}
