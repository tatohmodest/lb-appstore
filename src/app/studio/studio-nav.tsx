"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, LogOut } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { logout } from "./actions";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/studio", label: "Dashboard" },
  { href: "/studio/apps", label: "Apps" },
  { href: "/studio/import", label: "Bulk import" },
  { href: "/studio/categories", label: "Categories" },
];

export function StudioNav() {
  const pathname = usePathname();
  if (pathname === "/studio/login") return null;
  return (
    <header className="glass sticky top-0 z-40 border-b border-line pt-safe">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-8">
        <Link href="/studio" className="flex items-center gap-2 font-semibold">
          <LogoMark className="size-7" />
          <span className="hidden sm:inline">LB Studio</span>
        </Link>
        <nav className="no-scrollbar flex flex-1 gap-1 overflow-x-auto">
          {LINKS.map((l) => {
            const active = l.href === "/studio" ? pathname === "/studio" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn("rounded-full px-3 py-1.5 text-sm font-medium whitespace-nowrap transition", active ? "bg-ink text-bg" : "text-muted hover:text-ink")}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <Link href="/" target="_blank" className="hidden items-center gap-1 text-sm text-muted hover:text-ink sm:flex">
          Store <ExternalLink className="size-3.5" />
        </Link>
        <form action={logout}>
          <button aria-label="Log out" className="grid size-8 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-ink">
            <LogOut className="size-4" />
          </button>
        </form>
      </div>
    </header>
  );
}
