import Link from "next/link";
import { LogoMark } from "@/components/logo";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center p-6 text-center">
      <div>
        <LogoMark className="mx-auto size-16" />
        <p className="mt-8 font-mono text-sm text-muted">404</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight">This page looped away</h1>
        <p className="mt-2 text-muted">The app or page you&apos;re after isn&apos;t here.</p>
        <Link href="/" className="mt-6 inline-block rounded-full bg-brand px-5 py-2.5 font-semibold text-white">Back to Today</Link>
      </div>
    </main>
  );
}
