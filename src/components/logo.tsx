import { useId } from "react";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  // Unique gradient ids: a hidden copy of the logo elsewhere would otherwise blank this one.
  const id = useId();
  return (
    <svg viewBox="0 0 64 64" className={cn("shrink-0", className)} aria-hidden>
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3bef9f" />
          <stop offset=".5" stopColor="#00b369" />
          <stop offset="1" stopColor="#006b3f" />
        </linearGradient>
        <radialGradient id={`${id}h`} cx=".3" cy=".2" r=".9">
          <stop offset="0" stopColor="#fff" stopOpacity=".35" />
          <stop offset=".6" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="64" height="64" rx="15" fill={`url(#${id}g)`} />
      <rect width="64" height="64" rx="15" fill={`url(#${id}h)`} />
      <path
        d="M32 32c-4-5-7-8-11-8a8 8 0 0 0 0 16c4 0 7-3 11-8s7-8 11-8a8 8 0 0 1 0 16c-4 0-7-3-11-8Z"
        fill="none"
        stroke="#fff"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <LogoMark className="size-9" />
      <span className="leading-none">
        <span className="block text-[17px] font-semibold tracking-tight">LBStore</span>
        <span className="block text-[10.5px] font-medium tracking-wide text-muted uppercase">by LoopingBinary</span>
      </span>
    </span>
  );
}
