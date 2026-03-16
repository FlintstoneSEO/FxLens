"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Command } from "lucide-react";

const routeLabels: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/scope": "Scope Studio",
  "/build": "Build Studio",
  "/analyze": "Analyze Studio",
  "/solution-review": "Solution Review",
  "/history": "History",
  "/prompts": "Recommendations",
  "/settings": "Settings"
};

export function TopHeader() {
  const pathname = usePathname();
  const pageTitle = routeLabels[pathname] ?? "Workspace";

  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">FxLens Workspace</p>
          <h1 className="truncate text-base font-semibold tracking-tight">{pageTitle}</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground shadow-sm"
          >
            <Command className="h-3.5 w-3.5" />
            K
          </button>
          <button
            type="button"
            className="rounded-lg border border-border bg-card p-2 text-muted-foreground shadow-sm transition-colors hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
          </button>
          <Link
            href="/"
            className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground shadow-sm transition-colors hover:text-foreground"
          >
            Landing
          </Link>
        </div>
      </div>
    </header>
  );
}
