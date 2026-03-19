import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionIcon?: ReactNode;
  className?: string;
  eyebrow?: string;
};

export function EmptyState({ title, description, actionLabel, actionIcon, className, eyebrow = "Empty state" }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-border/80 bg-card/50 p-8 text-center shadow-sm",
        className
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>
      <h3 className="mt-3 text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>
      {actionLabel ? (
        <div className="mt-5">
          <Button variant="secondary" disabled>
            {actionIcon}
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
