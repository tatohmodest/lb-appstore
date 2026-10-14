"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Read a browser-only value (UA, localStorage, location) without a hydration
 * mismatch: the server and first client render get `server`, then `get()`.
 * `get` must return a primitive or a stable reference.
 */
export function useClientValue<T>(get: () => T, server: T): T {
  return useSyncExternalStore(subscribe, get, () => server);
}
