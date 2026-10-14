"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Upload } from "lucide-react";
import { Suspense, useEffect } from "react";
import { Logo } from "../logo";
import { NAV, SECONDARY, isActive } from "./nav-items";
import { StoreInstallCard } from "./store-install";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const router = useRouter();

  // ⌘K / Ctrl+K / "/" jumps to search from anywhere
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest("input, textarea, [contenteditable]");
      if (((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") || (e.key === "/" && !typing)) {
        e.preventDefault();
        router.push("/search");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <aside className="sticky top-0 hidden h-dvh w-[264px] shrink-0 flex-col gap-6 border-r border-line px-4 py-6 lg:flex">
      <Link href="/" className="px-2">
        <Logo />
      </Link>

      <Link
        href="/search"
        className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2 text-sm text-muted transition hover:text-ink"
      >
        <Search className="size-4" />
        <span className="flex-1">Search</span>
        <kbd className="rounded-md bg-surface px-1.5 py-0.5 font-sans text-[11px] font-medium shadow-sm">⌘K</kbd>
      </Link>

      <Suspense fallback={<SideLinks pathname="" />}>
        <ActiveSideLinks />
      </Suspense>

      <div className="mt-auto flex flex-col gap-4">
        <StoreInstallCard />
        <Link href="/studio" className="flex items-center gap-2 px-2 text-xs text-muted transition hover:text-ink">
          <Upload className="size-3.5" /> Publish an app in LB Studio
        </Link>
      </div>
    </aside>
  );
}

function ActiveSideLinks() {
  return <SideLinks pathname={usePathname()} />;
}

function SideLinks({ pathname }: { pathname: string }) {
  return (
    <nav className="flex flex-col gap-0.5">
      {[...NAV.filter((n) => n.href !== "/search"), ...SECONDARY].map(({ href, label, icon: Icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2 text-[15px] font-medium transition",
              active ? "bg-surface text-ink elevated" : "text-ink-2 hover:bg-surface-2",
            )}
          >
            <Icon className={cn("size-[18px]", active ? "text-brand" : "text-muted group-hover:text-ink")} strokeWidth={2.2} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
