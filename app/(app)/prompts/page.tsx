import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { TemplatesWorkspace } from "@/components/workspace/templates-workspace";

export default function PromptsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Templates"
        description="Create and review reusable starter templates for Scope, Build, Analyze, and Recommendations work without leaving the workspace."
      />
      <TemplatesWorkspace />
    </PageContainer>
  );
}
