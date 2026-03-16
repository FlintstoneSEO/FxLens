import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description: string;
  actions?: ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-4 rounded-xl border border-border/70 bg-card/80 p-6 shadow-sm sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">{description}</p>
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </header>
  );
}
