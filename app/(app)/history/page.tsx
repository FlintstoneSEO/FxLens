import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { getPersistedRuns, getStudioTypeLabel } from "@/lib/persisted-runs";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium capitalize tracking-wide text-emerald-200">
      {status}
    </span>
  );
}

export default function HistoryPage() {
  const runs = getPersistedRuns();

  return (
    <PageContainer>
      <PageHeader
        title="History"
        description="Browse saved studio runs and open a clean detail view for the original input and generated output."
      />

      <SectionCard
        title="Saved runs"
        description="Each saved run keeps the studio context, request payload, and returned result together for later review."
      >
        <div className="space-y-4">
          {runs.map((run) => (
            <Link
              key={run.id}
              href={`/history/${run.id}`}
              className="group flex flex-col gap-4 rounded-xl border border-border/70 bg-background/60 p-4 transition hover:border-primary/40 hover:bg-background"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      {getStudioTypeLabel(run.studioType)}
                    </span>
                    <StatusBadge status={run.status} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold tracking-tight text-foreground group-hover:text-primary">{run.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Created {formatDate(run.createdAt)}</p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                  View details
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </SectionCard>
    </PageContainer>
  );
}
