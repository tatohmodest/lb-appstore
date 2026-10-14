"use client";

import {
  BadgeCheck,
  Check,
  Copy,
  Ellipsis,
  ExternalLink,
  Laptop,
  MonitorDown,
  RefreshCw,
  Share,
  ShieldCheck,
  Smartphone,
  SquarePlus,
  Zap,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState, type ReactNode } from "react";
import { AppIcon } from "./app-icon";
import { Sheet } from "./sheet";
import { cn, shade } from "@/lib/utils";
import { installUrl, platformFamily, type Platform } from "@/lib/platform";
import { addToLibrary } from "@/lib/library";

export type InstallableApp = {
  slug: string;
  name: string;
  subtitle: string;
  iconUrl: string | null;
  accentColor: string;
  url: string;
};

type View = "ios" | "android" | "desktop" | "in-app";

function viewFor(p: Platform): View {
  if (p === "in-app") return "in-app";
  if (p.startsWith("ios")) return "ios";
  return p as View;
}

function inAppName() {
  const ua = navigator.userAgent;
  if (/Instagram/i.test(ua)) return "Instagram";
  if (/FBAN|FBAV|FB_IAB/i.test(ua)) return "Facebook";
  if (/TikTok|musical_ly|Bytedance/i.test(ua)) return "TikTok";
  if (/Snapchat/i.test(ua)) return "Snapchat";
  if (/Twitter/i.test(ua)) return "X";
  if (/LinkedInApp/i.test(ua)) return "LinkedIn";
  if (/WhatsApp/i.test(ua)) return "WhatsApp";
  return "this app";
}

export function track(slug: string, platform: Platform) {
  try {
    fetch(`/api/apps/${slug}/get`, {
      method: "POST",
      keepalive: true,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ platform: platformFamily(platform) }),
    });
  } catch {}
}

export function InstallSheet({
  app,
  open,
  onClose,
  platform,
}: {
  app: InstallableApp;
  open: boolean;
  onClose: () => void;
  platform: Platform;
}) {
  const [view, setView] = useState<View>(() => viewFor(platform));
  const [tracked, setTracked] = useState(false);

  const launch = (withInstall = true) => {
    if (!tracked) {
      track(app.slug, platform);
      setTracked(true);
    }
    addToLibrary({
      slug: app.slug,
      name: app.name,
      subtitle: app.subtitle,
      iconUrl: app.iconUrl,
      accentColor: app.accentColor,
      url: app.url,
    });
    window.open(withInstall ? installUrl(app.url) : app.url, "_blank", "noopener");
  };

  return (
    <Sheet open={open} onClose={onClose} label={`Install ${app.name}`}>
      {/* Hero */}
      <div
        className="relative overflow-hidden px-6 pt-10 pb-6 sm:pt-8"
        style={{
          backgroundImage: `radial-gradient(90% 120% at 50% -20%, ${shade(app.accentColor, 0.1)}55, transparent 70%)`,
        }}
      >
        <div className="flex items-center gap-4">
          <AppIcon name={app.name} iconUrl={app.iconUrl} accentColor={app.accentColor} size={68} />
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold tracking-tight">{app.name}</h2>
            <p className="truncate text-sm text-muted">{app.subtitle}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-brand">
              <BadgeCheck className="size-3.5" /> Verified by LoopingBinary
            </p>
          </div>
        </div>

        {/* Device switcher */}
        <div className="mt-6 grid grid-cols-3 gap-1 rounded-2xl bg-surface-2 p-1 text-[13px] font-medium">
          {(
            [
              ["ios", "iPhone", Smartphone],
              ["android", "Android", Smartphone],
              ["desktop", "Computer", Laptop],
            ] as const
          ).map(([v, label, Icon]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 transition",
                view === v ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink",
              )}
            >
              <Icon className="size-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 pb-6">
        {view === "in-app" && <InAppGuide app={app} onSwitch={() => setView(/iPhone|iPad/.test(navigator.userAgent) ? "ios" : "android")} />}
        {view === "ios" && <IOSGuide app={app} onOpen={() => launch()} chrome={platform === "ios-other"} />}
        {view === "android" && <AndroidGuide app={app} onOpen={() => launch()} />}
        {view === "desktop" && <DesktopGuide app={app} onOpen={() => launch()} />}

        <button
          onClick={() => launch(false)}
          className="mt-4 flex w-full items-center justify-center gap-1.5 text-sm font-medium text-muted transition hover:text-ink"
        >
          Just try it in the browser first <ExternalLink className="size-3.5" />
        </button>

        <div className="mt-6 grid grid-cols-3 gap-2 border-t border-line pt-5 text-center text-[11px] leading-tight text-muted">
          <span className="flex flex-col items-center gap-1.5">
            <ShieldCheck className="size-4 text-emerald-500" /> Sandboxed &amp; safe
          </span>
          <span className="flex flex-col items-center gap-1.5">
            <Zap className="size-4 text-amber-500" /> Nothing to download
          </span>
          <span className="flex flex-col items-center gap-1.5">
            <RefreshCw className="size-4 text-sky-500" /> Always up to date
          </span>
        </div>
      </div>
    </Sheet>
  );
}

function Step({ n, title, children, visual }: { n: number; title: ReactNode; children?: ReactNode; visual?: ReactNode }) {
  return (
    <li className="flex gap-4 py-3">
      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-ink text-[13px] font-semibold text-bg">{n}</span>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="font-medium leading-snug">{title}</p>
        {children && <div className="mt-1 text-sm text-muted">{children}</div>}
      </div>
      {visual}
    </li>
  );
}

function TapVisual({ children }: { children: ReactNode }) {
  return (
    <span className="relative grid size-12 shrink-0 place-items-center rounded-2xl bg-surface-2 text-brand">
      {children}
      <span className="animate-tap absolute inset-1 rounded-xl border-2 border-brand/60" />
    </span>
  );
}

function PrimaryButton({ onClick, children, color }: { onClick: () => void; children: ReactNode; color: string }) {
  return (
    <button
      onClick={onClick}
      style={{ backgroundImage: `linear-gradient(135deg, ${shade(color, 0.15)}, ${shade(color, -0.2)})` }}
      className="flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-black/10 transition active:scale-[.98]"
    >
      {children}
    </button>
  );
}

function IOSGuide({ app, onOpen, chrome }: { app: InstallableApp; onOpen: () => void; chrome: boolean }) {
  return (
    <div>
      <p className="mb-2 text-sm text-muted">
        Apple installs web apps straight from the browser. It takes about 10 seconds:
      </p>
      <ol className="divide-y divide-line">
        <Step n={1} title={<>Open {app.name}</>} visual={<TapVisual><ExternalLink className="size-5" /></TapVisual>}>
          It opens in {chrome ? "your browser" : "Safari"}.
        </Step>
        <Step n={2} title="Tap the Share button" visual={<TapVisual><Share className="size-5" /></TapVisual>}>
          {chrome ? (
            <>It&apos;s in the address bar at the top right.</>
          ) : (
            <>
              At the bottom of Safari. On iOS 26, tap <Ellipsis className="inline size-4 align-[-3px]" /> first.
            </>
          )}
        </Step>
        <Step n={3} title={<>Choose &ldquo;Add to Home Screen&rdquo;</>} visual={<TapVisual><SquarePlus className="size-5" /></TapVisual>}>
          Scroll the menu down a little if you don&apos;t see it.
        </Step>
        <Step n={4} title="Tap Add, and you're done" visual={<TapVisual><Check className="size-5" /></TapVisual>}>
          {app.name} sits on your Home Screen and opens full-screen like any other app.
        </Step>
      </ol>
      <div className="mt-4">
        <PrimaryButton onClick={onOpen} color={app.accentColor}>
          Open {app.name}
        </PrimaryButton>
      </div>
    </div>
  );
}

function AndroidGuide({ app, onOpen }: { app: InstallableApp; onOpen: () => void }) {
  return (
    <div>
      <PrimaryButton onClick={onOpen} color={app.accentColor}>
        <MonitorDown className="size-5" /> Install {app.name}
      </PrimaryButton>
      <ol className="mt-3 divide-y divide-line">
        <Step n={1} title={<>Tap Install above</>}>{app.name} opens and an install prompt pops up.</Step>
        <Step n={2} title="Confirm Install">
          No prompt? Tap <Ellipsis className="inline size-4 rotate-90 align-[-3px]" /> in Chrome, then <b>Install app</b> or <b>Add to Home screen</b>.
        </Step>
        <Step n={3} title="Find it in your app drawer">It shows up next to your other apps.</Step>
      </ol>
    </div>
  );
}

function DesktopGuide({ app, onOpen }: { app: InstallableApp; onOpen: () => void }) {
  const [href] = useState(() => `${window.location.origin}/apps/${app.slug}?get=1`);
  const safari = /Safari/.test(navigator.userAgent) && !/Chrome|Chromium|Edg/.test(navigator.userAgent);
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex flex-col items-center rounded-3xl bg-surface-2 p-5 text-center">
        <div className="rounded-2xl bg-white p-3">
          <QRCodeSVG value={href} size={132} level="M" fgColor="#0a0a12" />
        </div>
        <p className="mt-3 text-sm font-semibold">Get it on your phone</p>
        <p className="text-xs text-muted">Point your camera at the code</p>
      </div>
      <div className="flex flex-col justify-between rounded-3xl bg-surface-2 p-5">
        <div>
          <Laptop className="size-6 text-brand" />
          <p className="mt-3 text-sm font-semibold">Install on this computer</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            {safari ? (
              <>In Safari, choose File then Add to Dock.</>
            ) : (
              <>Click the install icon at the right of the address bar, or accept the prompt that appears.</>
            )}
          </p>
        </div>
        <button
          onClick={onOpen}
          className="mt-4 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-bg transition active:scale-[.98]"
        >
          Install now
        </button>
      </div>
    </div>
  );
}

function InAppGuide({ app, onSwitch }: { app: InstallableApp; onSwitch: () => void }) {
  const [copied, setCopied] = useState(false);
  const host = inAppName();
  const copy = async () => {
    const link = `${window.location.origin}/apps/${app.slug}?get=1`;
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      window.prompt("Copy this link", link);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-5">
      <p className="font-semibold">You&apos;re browsing inside {host}</p>
      <p className="mt-1 text-sm text-muted">
        In-app browsers can&apos;t install apps. Open this page in Safari or Chrome. Tap{" "}
        <Ellipsis className="inline size-4 align-[-3px]" /> and pick <b>Open in browser</b>, or copy the link.
      </p>
      <div className="mt-4 flex gap-2">
        <button onClick={copy} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-bg">
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />} {copied ? "Copied" : "Copy link"}
        </button>
        <button onClick={onSwitch} className="rounded-xl bg-surface px-4 py-2.5 text-sm font-medium">
          Show steps
        </button>
      </div>
    </div>
  );
}
