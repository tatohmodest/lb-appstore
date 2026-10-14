import type { Metadata } from "next";
import { Suspense } from "react";
import { StudioNav } from "./studio-nav";

export const metadata: Metadata = { title: { default: "Studio", template: "%s · LB Studio" }, robots: { index: false } };
export const instant = false;

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <Suspense fallback={<div className="h-14 border-b border-line" />}>
        <StudioNav />
      </Suspense>
      <div className="mx-auto max-w-7xl px-4 pt-6 pb-24 sm:px-8">{children}</div>
    </div>
  );
}
