import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionCardProps = {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
};

export function SectionCard({ title, description, children, className }: SectionCardProps) {
  return (
    <section className={cn("rounded-xl border border-border/70 bg-card/80 p-6 shadow-sm", className)}>
      <header className="mb-4 space-y-1.5">
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </header>
      {children}
    </section>
  );
}
