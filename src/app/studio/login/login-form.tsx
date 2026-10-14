"use client";

import { useActionState } from "react";
import { LogoMark } from "@/components/logo";
import { login } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="relative w-full max-w-sm overflow-hidden rounded-[32px] bg-surface p-8 elevated">
      <div className="brand-gradient absolute -top-20 -right-20 size-48 rounded-full opacity-25 blur-3xl" />
      <LogoMark className="relative size-14" />
      <h1 className="relative mt-6 text-2xl font-semibold tracking-tight">LB Studio</h1>
      <p className="relative text-sm text-muted">Publish and manage LoopingBinary apps.</p>
      <input
        name="password"
        type="password"
        required
        autoFocus
        autoComplete="current-password"
        placeholder="Studio password"
        className="relative mt-6 w-full rounded-xl bg-surface-2 px-4 py-3 outline-none focus:ring-2 focus:ring-brand/50"
      />
      {state?.error && <p className="relative mt-2 text-sm text-red-500">{state.error}</p>}
      <button disabled={pending} className="relative mt-4 w-full rounded-xl bg-ink py-3 font-semibold text-bg disabled:opacity-60">
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
