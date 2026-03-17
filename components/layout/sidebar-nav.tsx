"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Blocks,
  ClipboardCheck,
  FileClock,
  Home,
  Search,
  Settings,
  Sparkles,
  type LucideIcon
} from "lucide-react";

import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const navItems: readonly NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/scope", label: "Scope Studio", icon: Sparkles },
  { href: "/build", label: "Build Studio", icon: Blocks },
  { href: "/analyze", label: "Analyze Studio", icon: Search },
  { href: "/solution-review", label: "Solution Review", icon: ClipboardCheck },
  { href: "/history", label: "History", icon: FileClock },
  { href: "/prompts", label: "Recommendations", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 border-r border-border/70 bg-white/70 px-4 py-6 backdrop-blur-xl md:block">
      <div className="mb-8 rounded-xl border border-border/70 bg-background/70 p-4 shadow-sm">
        <p className="text-lg font-semibold tracking-tight">FxLens</p>
        <p className="text-xs text-muted-foreground">AI workspace for Power Apps teams</p>
      </div>
      <nav className="space-y-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
