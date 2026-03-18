import type { ReactNode } from "react";

import { SectionCard } from "@/components/ui/section-card";
import { StatusMessage } from "@/components/workspace/status-message";

export function StudioInputCard({
  title = "Input",
  description,
  children,
  className
}: {
  title?: string;
  description: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <SectionCard title={title} description={description} className={className}>
      {children}
    </SectionCard>
  );
}

export function StudioOutputCard({
  title = "Output",
  description,
  children,
  emptyMessage,
  errorMessage,
  className
}: {
  title?: string;
  description: string;
  children?: ReactNode;
  emptyMessage: string;
  errorMessage?: string | null;
  className?: string;
}) {
  return (
    <SectionCard title={title} description={description} className={className}>
      <div className="space-y-4">
        {errorMessage ? <StatusMessage tone="error" label="Error" message={errorMessage} /> : null}
        {children ?? <StatusMessage label="Empty state" message={emptyMessage} />}
      </div>
    </SectionCard>
  );
}
