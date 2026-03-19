import { RunHistoryView } from "@/components/history/run-history-view";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";

export default function HistoryPage() {
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
