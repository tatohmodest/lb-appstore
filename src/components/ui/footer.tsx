import Link from "next/link";
import { LogoMark } from "../logo";

export function Footer() {
  return (
    <footer className="mx-4 mt-20 border-t border-line pt-8 text-sm text-muted sm:mx-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <LogoMark className="size-7" />
          <p>
            <span className="font-medium text-ink">LBStore</span> is the home of every LoopingBinary app.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/why" className="hover:text-ink">Why LBStore</Link>
          <Link href="/install" className="hover:text-ink">How to install</Link>
          <Link href="/developers" className="hover:text-ink">Developers</Link>
          <Link href="/studio" className="hover:text-ink">Studio</Link>
        </nav>
      </div>
      <p className="mt-6 text-xs">© LoopingBinary. Built independently, shipped to every device.</p>
    </footer>
  );
}
