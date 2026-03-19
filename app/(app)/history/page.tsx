import { RunHistoryView } from "@/components/history/run-history-view";
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
        title="Run History"
        description="Browse saved studio runs, scan key status details, and quickly narrow results by studio type."
      />

      <SectionCard
        title="Saved runs"
        description="Phase 3 keeps recent studio activity visible in a lightweight history view without opening full run details."
      >
        <RunHistoryView />
      </SectionCard>
    </PageContainer>
  );
}
