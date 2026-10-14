import type { Metadata } from "next";
import { CheckCircle2, Code2 } from "lucide-react";
import { Footer } from "@/components/ui/footer";
import { PageTitle } from "@/components/ui/page-title";
import { SITE_URL } from "@/lib/utils";

export const metadata: Metadata = { title: "Developers", description: "Ship a LoopingBinary PWA to LBStore." };

const CHECKLIST = [
  ["Served over HTTPS", "Required by every browser to install."],
  ["Web app manifest", "name, short_name, start_url, display: \"standalone\", theme_color, background_color."],
  ["Icons 192 & 512 px", "Plus a 512 px maskable icon so Android can shape it."],
  ["apple-touch-icon", "180 px PNG for the iPhone Home Screen."],
  ["Service worker", "With a fetch handler. Cache the app shell so it opens offline."],
  ["Screenshots in the manifest", "Chrome shows these in its rich install dialog, and Studio imports them automatically."],
];

export default function DevelopersPage() {
  const snippet = `<script src="${SITE_URL}/sdk/lb-install.js" defer></script>`;
  return (
    <>
      <PageTitle eyebrow="For the LoopingBinary team" title="Ship to LBStore" />
      <div className="grid gap-6 px-4 sm:px-8 xl:grid-cols-2">
        <section className="rounded-[28px] bg-surface p-7 elevated">
          <Code2 className="size-7 text-brand" />
          <h2 className="mt-4 text-xl font-semibold">1. Add the LB Install SDK</h2>
          <p className="mt-1 text-muted">
            One tag in your app&apos;s <code>&lt;head&gt;</code>. When someone taps Get in LBStore, your app opens with a branded install sheet: the
            native prompt on Android and desktop, a guided Add to Home Screen on iPhone.
          </p>
          <pre className="mt-4 overflow-x-auto rounded-2xl bg-ink p-4 font-mono text-[13px] text-bg">{snippet}</pre>
          <p className="mt-4 text-sm text-muted">
            Want your own install button? Call <code className="rounded bg-surface-2 px-1.5 py-0.5">window.LBInstall.open()</code>. Use{" "}
            <code className="rounded bg-surface-2 px-1.5 py-0.5">data-color=&quot;#hex&quot;</code> on the tag to set the accent color.
          </p>
        </section>
        <section className="rounded-[28px] bg-surface p-7 elevated">
          <h2 className="text-xl font-semibold">2. Pass the PWA checklist</h2>
          <ul className="mt-4 flex flex-col gap-3.5">
            {CHECKLIST.map(([t, d]) => (
              <li key={t} className="flex gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" />
                <div>
                  <p className="font-medium">{t}</p>
                  <p className="text-sm text-muted">{d}</p>
                </div>
              </li>
            ))}
          </ul>
          <h2 className="mt-8 text-xl font-semibold">3. Publish from Studio</h2>
          <p className="mt-1 text-muted">
            Paste your app&apos;s URL in Studio. It reads your manifest, imports the icon and screenshots into our CDN, runs the checklist, and
            fills in the listing for you.
          </p>
        </section>
      </div>
      <Footer />
    </>
  );
}
