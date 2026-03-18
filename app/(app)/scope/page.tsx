import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";

export default function ScopePage() {
  return (
    <PageContainer>
      <PageHeader
        title="Scope Studio"
        description="Transform requirements into app structure recommendations including screens, entities, roles, SQL artifacts, and flows."
      />
      <SectionCard
        title="Scoping Workspace"
        description="This placeholder area will host requirement ingestion and AI-assisted architecture generation in the next phase."
      >
        <EmptyState
          title="No scope draft yet"
          description="Upload meeting notes or paste requirements to generate your first architecture outline."
          actionLabel="Create Scope Draft"
        />
      </SectionCard>
    </PageContainer>
  );
}
