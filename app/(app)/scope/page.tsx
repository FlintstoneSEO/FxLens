import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { ScopeStudio } from "@/components/workspace/scope-studio";

export default function ScopePage() {
  return (
    <PageContainer>
      <PageHeader
        title="Scope Studio"
        description="Transform requirements into app structure recommendations including screens, entities, roles, SQL artifacts, and flows."
      />
      <ScopeStudio />
    </PageContainer>
  );
}
