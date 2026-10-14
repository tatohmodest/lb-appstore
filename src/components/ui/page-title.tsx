import Link from "next/link";
import type { ReactNode } from "react";
import { LogoMark } from "../logo";

export function PageTitle({ eyebrow, title, action }: { eyebrow?: ReactNode; title: ReactNode; action?: ReactNode }) {
  return (
    <header className="flex items-end justify-between gap-4 px-4 pt-[calc(env(safe-area-inset-top)+1.75rem)] pb-5 sm:px-8 lg:pt-10">
      <div>
        {eyebrow && <p className="text-[13px] font-semibold tracking-wide text-muted uppercase">{eyebrow}</p>}
        <h1 className="text-[34px] leading-none font-bold tracking-tight sm:text-[42px]">{title}</h1>
      </div>
      {action ?? (
        <Link href="/" aria-label="LBStore home" className="lg:hidden">
          <LogoMark className="size-9" />
        </Link>
      )}
    </header>
  );
}
