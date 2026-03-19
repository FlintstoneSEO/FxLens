import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { getPersistedRunById, getStudioTypeLabel } from "@/lib/persisted-runs";

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

function JsonPanel({ value }: { value: unknown }) {
  return (
    <pre className="overflow-x-auto rounded-xl border border-border/70 bg-slate-950/90 p-4 text-sm leading-6 text-slate-100">
      <code>{JSON.stringify(value, null, 2)}</code>
    </pre>
  );
}

type RunDetailPageProps = {
  params: Promise<{
    runId: string;
  }>;
};

export default async function RunDetailPage({ params }: RunDetailPageProps) {
  const { runId } = await params;
  const run = getPersistedRunById(runId);

  if (!run) {
    notFound();
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <Link href="/history" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Run History
        </Link>
      </div>

      <PageHeader title={run.title} description="Inspect the saved request and output without leaving the workspace shell." />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-6">
          <SectionCard title="Run details" description="Saved metadata for this studio run.">
            <dl className="space-y-4 text-sm">
              <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-4">
                <dt className="text-muted-foreground">Studio type</dt>
                <dd className="text-right font-medium text-foreground">{getStudioTypeLabel(run.studioType)}</dd>
              </div>
              <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-4">
                <dt className="text-muted-foreground">Title</dt>
                <dd className="text-right font-medium text-foreground">{run.title}</dd>
              </div>
              <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-4">
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <StatusBadge status={run.status} />
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">Created</dt>
                <dd className="text-right font-medium text-foreground">{formatDate(run.createdAt)}</dd>
              </div>
            </dl>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Original input" description="The request payload that was saved for this run.">
            <JsonPanel value={run.input} />
          </SectionCard>

          <SectionCard title="Saved output" description="The generated result captured when the run completed.">
            <JsonPanel value={run.output} />
          </SectionCard>
        </div>
      </div>
    </PageContainer>
  );
}
