import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";

export default function BuildPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Build Studio"
        description="Generate implementation-ready screen blueprints, reusable components, and starter Power Fx output."
      />
      <SectionCard
        title="Blueprint Generator"
        description="Build workflows will be connected here once project configuration and persistence are added."
      >
        <EmptyState
          title="No generated assets yet"
          description="Start with a scoped solution to generate screen structures and reusable component recommendations."
          actionLabel="Generate Blueprint"
        />
      </SectionCard>
    </PageContainer>
  );
}
