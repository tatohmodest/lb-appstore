import { Sidebar } from "@/components/shell/sidebar";
import { StoreInstallBanner } from "@/components/shell/store-install";
import { TabBar } from "@/components/shell/tab-bar";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <main className="min-w-0 flex-1 pb-28 lg:pb-16">{children}</main>
      <TabBar />
      <StoreInstallBanner />
    </div>
  );
}
