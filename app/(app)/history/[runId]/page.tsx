import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { RunDetailClient } from "@/components/history/run-detail-client";

export default async function HistoryDetailPage({ params }: { params: Promise<{ runId: string }> }) {
  const { runId } = await params;

  return (
    <PageContainer>
      <PageHeader
        title="Run details"
        description="Review the original input and output for a saved run before sending it back into the studio."
      />
      <RunDetailClient runId={runId} />
    </PageContainer>
  );
}
