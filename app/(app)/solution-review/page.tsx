import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";

export default function SolutionReviewPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Solution Review"
        description="Inventory uploaded artifacts, detect architectural drift, and receive focused refactor recommendations."
      />
      <SectionCard
        title="Artifact Review Queue"
        description="Solution packages and exported metadata checks will appear here after backend ingestion is wired in."
      >
        <EmptyState
          title="No solution uploaded"
          description="Upload a solution export to begin structure inventory and architecture diagnostics."
          actionLabel="Upload Solution"
        />
      </SectionCard>
    </PageContainer>
  );
}
