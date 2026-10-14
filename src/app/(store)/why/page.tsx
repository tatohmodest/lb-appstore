import type { Metadata } from "next";
import Link from "next/link";
import { Check, ChevronDown, Minus, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { LogoMark } from "@/components/logo";
import { Footer } from "@/components/ui/footer";

export const metadata: Metadata = {
  title: "Why LBStore",
  description: "LoopingBinary apps install straight from the web. They're faster, lighter, and safe by design. Here's why we don't need the App Store.",
};

const ROWS: [string, string, string][] = [
  ["Download size", "Usually under 5 MB", "Often 50–300 MB"],
  ["Time to install", "Seconds", "Minutes"],
  ["Updates", "Instant & automatic", "Wait, then download"],
  ["One app for iPhone, Android & computer", "yes", "no"],
  ["Install from any browser link or QR code", "yes", "no"],
  ["Needs a store account to install", "no", "yes"],
  ["Phone shows an “unknown app” warning", "never", "For sideloaded files"],
];

const FAQ = [
  {
    q: "Why aren't these apps on the App Store or Play Store?",
    a: "Because they don't need to be. LoopingBinary builds Progressive Web Apps (PWAs), the same technology behind Starbucks, Uber, Pinterest and X on the web. They install straight from your browser, so we can ship improvements to you the moment they're ready instead of waiting days for store reviews.",
  },
  {
    q: "Will my phone say the app is unsafe?",
    a: "No. Those warnings appear when you download an app file (like an APK) from outside the store. LBStore apps aren't files. Safari or Chrome adds them to your Home Screen, so there's nothing to scan and nothing to warn about.",
  },
  {
    q: "Is my data safe?",
    a: "Yes. Every app runs inside your browser's sandbox, the same isolation that keeps websites from reading each other. An app can't reach your files, photos, contacts or other apps unless you explicitly allow it, and you can take that permission back any time.",
  },
  {
    q: "Do they work offline and send notifications?",
    a: "Most do. Apps marked “Works offline” keep their core features without a connection. Notifications work on Android, desktop, and on iPhone (iOS 16.4 or later) once the app is on your Home Screen.",
  },
  {
    q: "How do I update an app?",
    a: "You don't have to. Every time you open an LBStore app you're on the newest version, with no update queue and no storage-hungry downloads.",
  },
  {
    q: "How do I uninstall?",
    a: "The same way as any app: long-press the icon and choose Remove (iPhone) or Uninstall (Android). On a computer, open the app's menu and choose Uninstall.",
  },
];

export default function WhyPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative isolate overflow-hidden px-4 pt-[calc(env(safe-area-inset-top)+4rem)] pb-16 text-center sm:px-8 lg:pt-24">
        <div className="absolute inset-0 -z-10">
          <div className="animate-aurora absolute top-0 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-brand/30 blur-[110px]" />
          <div className="animate-aurora absolute top-20 left-[20%] h-[300px] w-[400px] rounded-full bg-brand-2/25 blur-[100px] [animation-delay:-5s]" />
          <div className="animate-aurora absolute top-40 right-[15%] h-[260px] w-[360px] rounded-full bg-brand-3/20 blur-[100px] [animation-delay:-11s]" />
        </div>
        <LogoMark className="animate-float mx-auto size-20 drop-shadow-2xl" />
        <h1 className="mx-auto mt-8 max-w-3xl text-[44px] leading-[0.95] font-bold tracking-tighter text-balance sm:text-7xl">
          Not on the App Store.{" "}
          <span className="font-serif font-normal tracking-normal italic">On purpose.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted text-pretty">
          LoopingBinary apps install straight from the web. They&apos;re lighter, faster, always up to date and safe by design. Nobody stands between us and you.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="rounded-full bg-ink px-6 py-3 font-semibold text-bg transition active:scale-95">
            Explore apps
          </Link>
          <Link href="/install" className="rounded-full bg-surface px-6 py-3 font-semibold elevated transition active:scale-95">
            How to install
          </Link>
        </div>
      </section>

      {/* Three pillars */}
      <section className="grid gap-4 px-4 sm:grid-cols-3 sm:px-8">
        {[
          { icon: Zap, c: "from-amber-400 to-orange-500", t: "Instant", d: "Tap Get, add to Home Screen, done. No 200 MB download, no waiting on Wi-Fi." },
          { icon: ShieldCheck, c: "from-emerald-400 to-teal-500", t: "Safe by design", d: "Your browser's sandbox walls every app off from your files, contacts and other apps." },
          { icon: Sparkles, c: "from-violet-500 to-sky-500", t: "Always fresh", d: "Improvements reach you the minute we ship them. No update queue, ever." },
        ].map(({ icon: Icon, c, t, d }) => (
          <div key={t} className="rounded-[28px] bg-surface p-7 elevated">
            <span className={`grid size-12 place-items-center rounded-2xl bg-gradient-to-br ${c} text-white shadow-lg`}>
              <Icon className="size-6" />
            </span>
            <h3 className="mt-5 text-xl font-semibold">{t}</h3>
            <p className="mt-1.5 text-muted">{d}</p>
          </div>
        ))}
      </section>

      {/* The warning explained */}
      <section className="mx-4 mt-16 overflow-hidden rounded-[32px] bg-ink p-8 text-bg sm:mx-8 sm:p-14">
        <p className="text-sm font-semibold tracking-wider uppercase opacity-60">About those scary warnings</p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
          Your phone warns about app <em className="font-serif font-normal">files</em>. LBStore apps aren&apos;t files.
        </h2>
        <p className="mt-5 max-w-2xl text-lg opacity-70">
          When you download an APK or an unsigned installer, your phone can&apos;t vouch for it, so it warns you. LBStore apps are added by
          Safari or Chrome, the same browsers you already trust with your bank. Nothing gets downloaded and run outside the sandbox, so
          there&apos;s nothing to warn about.
        </p>
      </section>

      {/* Comparison */}
      <section className="mt-16 px-4 sm:px-8">
        <h2 className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">Side by side</h2>
        <div className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-[28px] bg-surface elevated">
          <div className="grid grid-cols-[1.4fr_1fr_1fr] items-center gap-2 border-b border-line px-5 py-4 text-sm font-semibold sm:px-7">
            <span />
            <span className="flex items-center gap-2"><LogoMark className="size-6" /> LBStore</span>
            <span className="text-muted">Traditional stores</span>
          </div>
          {ROWS.map(([label, ours, theirs]) => (
            <div key={label} className="grid grid-cols-[1.4fr_1fr_1fr] items-center gap-2 border-b border-line px-5 py-3.5 text-[14px] last:border-0 sm:px-7">
              <span className="text-ink-2">{label}</span>
              <Cell v={ours} good />
              <Cell v={theirs} />
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto mt-16 max-w-3xl px-4 sm:px-8">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Questions, answered</h2>
        <div className="mt-6 divide-y divide-line rounded-[28px] bg-surface px-6 elevated">
          {FAQ.map(({ q, a }) => (
            <details key={q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                {q}
                <ChevronDown className="size-5 shrink-0 text-muted transition group-open:rotate-180" />
              </summary>
              <p className="mt-3 leading-relaxed text-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Cell({ v, good }: { v: string; good?: boolean }) {
  if (v === "yes" || v === "no" || v === "never") {
    const positive = good ? v === "yes" || v === "no" || v === "never" : false;
    const label = v === "never" ? "Never" : v === "yes" ? "Yes" : "No";
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium ${positive ? "text-emerald-500" : "text-muted"}`}>
        {positive ? <Check className="size-4" strokeWidth={3} /> : <Minus className="size-4" />} {label}
      </span>
    );
  }
  return <span className={good ? "font-medium" : "text-muted"}>{v}</span>;
}
