import type { Metadata } from "next";
import { LibraryClient } from "./library-client";
import { PageTitle } from "@/components/ui/page-title";

export const metadata: Metadata = { title: "Library" };

export default function LibraryPage() {
  return (
    <>
      <PageTitle eyebrow="On this device" title="Library" />
      <LibraryClient />
    </>
  );
}
