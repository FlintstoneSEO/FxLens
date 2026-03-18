import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionIcon?: ReactNode;
  className?: string;
};

export function EmptyState({ title, description, actionLabel, actionIcon, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-border bg-card/60 p-8 text-center shadow-sm",
        className
      )}
    >
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Ready when you are</p>
      <h3 className="mt-3 text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>
      {actionLabel ? (
        <div className="mt-5">
          <Button variant="secondary">
            {actionIcon}
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
