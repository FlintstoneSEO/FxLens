import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";

export default function SettingsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        description="Configure team defaults, workspace preferences, and conventions used across FxLens outputs."
      />
      <SectionCard
        title="Workspace Configuration"
        description="Authentication, environment configuration, and policy controls will be surfaced here next."
      >
        <EmptyState
          title="No configurable settings yet"
          description="Settings controls are intentionally deferred until user management and persistence are in place."
        />
      </SectionCard>
    </PageContainer>
  );
}
