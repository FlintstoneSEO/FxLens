import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionIcon?: ReactNode;
};

export function EmptyState({ title, description, actionLabel, actionIcon }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/60 p-8 text-center shadow-sm">
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">{description}</p>
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
