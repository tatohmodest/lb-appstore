import { WifiOff } from "lucide-react";
import { LogoMark } from "@/components/logo";

export const metadata = { title: "Offline" };

export default function Offline() {
  return (
    <main className="grid min-h-dvh place-items-center p-6 text-center">
      <div>
        <LogoMark className="mx-auto size-16" />
        <WifiOff className="mx-auto mt-8 size-8 text-muted" />
        <h1 className="mt-3 text-2xl font-semibold">You&apos;re offline</h1>
        <p className="mt-1 max-w-xs text-muted">Your installed LoopingBinary apps still work. The store will be back when you reconnect.</p>
      </div>
    </main>
  );
}
