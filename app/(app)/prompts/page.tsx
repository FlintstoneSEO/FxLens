import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";

export default function PromptsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Prompts"
        description="Manage reusable prompt templates for scoping, generation, and optimization workflows."
      />
      <SectionCard
        title="Prompt Library"
        description="Template management and versioning controls will be added here in a later phase."
      >
        <EmptyState
          title="No prompt templates yet"
          description="Create team-approved prompts to standardize output quality across all studios."
          actionLabel="New Prompt"
        />
      </SectionCard>
    </PageContainer>
  );
}
