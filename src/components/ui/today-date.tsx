"use client";

import { useClientValue } from "@/lib/use-client-value";

export function TodayDate() {
  const label = useClientValue(
    () => new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
    " ",
  );
  return <span>{label}</span>;
}
