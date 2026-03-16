import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";

export default function HistoryPage() {
  return (
    <PageContainer>
      <PageHeader
        title="History"
        description="Browse prior generation runs, analysis snapshots, and recommendation history across your workspace."
      />
      <SectionCard
        title="Timeline"
        description="Historical records and saved outputs will appear here once persistent storage is connected."
      >
        <EmptyState
          title="No history available"
          description="As your team generates architectures and analyses, this timeline will keep a searchable activity trail."
        />
      </SectionCard>
    </PageContainer>
  );
}
