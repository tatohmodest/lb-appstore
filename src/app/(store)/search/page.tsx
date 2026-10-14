import type { Metadata } from "next";
import { SearchClient } from "./search-client";
import { getCategories, getTopApps } from "@/lib/queries";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage() {
  const [categories, trending] = await Promise.all([getCategories(), getTopApps(6)]);
  return (
    <SearchClient
      categories={categories.map((c) => ({ slug: c.slug, name: c.name, icon: c.icon, colorFrom: c.colorFrom, colorTo: c.colorTo }))}
      trending={trending}
    />
  );
}
