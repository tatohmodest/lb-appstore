"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { NAV, isActive } from "./nav-items";
import { cn } from "@/lib/utils";

export function TabBar() {
  return (
    <Suspense fallback={<Tabs pathname="" />}>
      <ActiveTabs />
    </Suspense>
  );
}

function ActiveTabs() {
  return <Tabs pathname={usePathname()} />;
}

function Tabs({ pathname }: { pathname: string }) {
  return (
    <nav className="glass fixed inset-x-0 bottom-0 z-50 border-t border-line pb-safe lg:hidden">
      <ul className="mx-auto grid max-w-lg grid-cols-4">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 pt-2 pb-1.5 text-[10.5px] font-medium transition active:scale-90",
                  active ? "text-brand" : "text-muted",
                )}
              >
                <Icon className="size-[23px]" strokeWidth={active ? 2.4 : 1.9} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
