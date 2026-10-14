import type { Metadata } from "next";
import { Check, Ellipsis, Laptop, MonitorDown, Share, Smartphone, SquarePlus } from "lucide-react";
import type { ReactNode } from "react";
import { Footer } from "@/components/ui/footer";
import { PageTitle } from "@/components/ui/page-title";

export const metadata: Metadata = { title: "How to install", description: "Install LBStore and any LoopingBinary app on iPhone, Android or your computer in seconds." };

export default function InstallPage() {
  return (
    <>
      <PageTitle eyebrow="10 seconds, no download" title="How to install" />
      <p className="max-w-2xl px-4 text-lg text-muted sm:px-8">
        This works for LBStore itself and for every app inside it. Pick your device:
      </p>
      <div className="mt-8 grid gap-4 px-4 sm:px-8 lg:grid-cols-3">
        <Guide icon={<Smartphone />} title="iPhone & iPad" tint="from-zinc-700 to-zinc-900">
          <S n={1} icon={<Share />}>Open the app in Safari and tap <b>Share</b>. On iOS 26, tap <Ellipsis className="inline size-4" /> first.</S>
          <S n={2} icon={<SquarePlus />}>Scroll down and tap <b>Add to Home Screen</b>.</S>
          <S n={3} icon={<Check />}>Tap <b>Add</b>. It opens full-screen like any other app.</S>
          <p className="mt-2 text-xs text-muted">Chrome and Edge on iOS 16.4+ work too. Share is in the address bar.</p>
        </Guide>
        <Guide icon={<Smartphone />} title="Android" tint="from-emerald-500 to-teal-600">
          <S n={1} icon={<MonitorDown />}>Tap <b>Get</b>, then <b>Install</b> on the prompt that pops up.</S>
          <S n={2} icon={<Ellipsis className="rotate-90" />}>No prompt? Tap the <b>⋮</b> menu in Chrome and choose <b>Install app</b>.</S>
          <S n={3} icon={<Check />}>Find it in your app drawer next to everything else.</S>
        </Guide>
        <Guide icon={<Laptop />} title="Mac, Windows & Linux" tint="from-violet-500 to-sky-500">
          <S n={1} icon={<MonitorDown />}>In Chrome or Edge, click the install icon on the right of the address bar.</S>
          <S n={2} icon={<SquarePlus />}>In Safari on Mac, choose <b>File → Add to Dock</b>.</S>
          <S n={3} icon={<Check />}>Launch it from your Dock, Start menu or app launcher.</S>
        </Guide>
      </div>
      <Footer />
    </>
  );
}

function Guide({ icon, title, tint, children }: { icon: ReactNode; title: string; tint: string; children: ReactNode }) {
  return (
    <section className="rounded-[28px] bg-surface p-6 elevated">
      <span className={`grid size-12 place-items-center rounded-2xl bg-gradient-to-br ${tint} text-white [&>svg]:size-6`}>{icon}</span>
      <h2 className="mt-4 text-xl font-semibold">{title}</h2>
      <ol className="mt-4 flex flex-col gap-4">{children}</ol>
    </section>
  );
}

function S({ n, icon, children }: { n: number; icon: ReactNode; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-surface-2 text-brand [&>svg]:size-[18px]">{icon}</span>
      <p className="pt-1.5 text-[15px] text-ink-2"><span className="sr-only">Step {n}: </span>{children}</p>
    </li>
  );
}
