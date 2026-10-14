import { Compass, LayoutGrid, Library, Search, ShieldCheck } from "lucide-react";

export const NAV = [
  { href: "/", label: "Today", icon: Compass },
  { href: "/apps", label: "Apps", icon: LayoutGrid },
  { href: "/library", label: "Library", icon: Library },
  { href: "/search", label: "Search", icon: Search },
] as const;

export const SECONDARY = [{ href: "/why", label: "Why LBStore", icon: ShieldCheck }] as const;

export function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`) || (href === "/apps" && pathname.startsWith("/categories"));
}
