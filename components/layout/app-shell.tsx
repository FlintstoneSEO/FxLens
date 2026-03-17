import type { ReactNode } from "react";

import { SidebarNav } from "@/components/layout/sidebar-nav";
import { TopHeader } from "@/components/layout/top-header";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <TopHeader />
      <div className="mx-auto flex w-full max-w-7xl">
        <SidebarNav />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
