"use client";

import { useSyncExternalStore } from "react";

// "Library" = apps this device has tapped Get on. Lives in localStorage
// because the store can't see other origins' installs.

export type LibraryApp = {
  slug: string;
  name: string;
  subtitle: string;
  iconUrl: string | null;
  accentColor: string;
  url: string;
  addedAt: number;
};

const KEY = "lbstore:library";
const listeners = new Set<() => void>();
let cache: LibraryApp[] | null = null;
const EMPTY: LibraryApp[] = [];

function read(): LibraryApp[] {
  if (cache) return cache;
  try {
    cache = JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    cache = [];
  }
  return cache!;
}

function write(apps: LibraryApp[]) {
  cache = apps;
  try {
    localStorage.setItem(KEY, JSON.stringify(apps));
  } catch {}
  listeners.forEach((l) => l());
}

export function addToLibrary(app: Omit<LibraryApp, "addedAt">) {
  write([{ ...app, addedAt: Date.now() }, ...read().filter((a) => a.slug !== app.slug)]);
}

export function removeFromLibrary(slug: string) {
  write(read().filter((a) => a.slug !== slug));
}

export function useLibrary() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      const onStorage = (e: StorageEvent) => {
        if (e.key === KEY) {
          cache = null;
          cb();
        }
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(cb);
        window.removeEventListener("storage", onStorage);
      };
    },
    read,
    () => EMPTY,
  );
}

export function getDeviceId() {
  try {
    let id = localStorage.getItem("lbstore:device");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("lbstore:device", id);
    }
    return id;
  } catch {
    return crypto.randomUUID();
  }
}
