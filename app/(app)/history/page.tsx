import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { RunHistoryClient } from "@/components/history/run-history-client";

export default function HistoryPage() {
  return (
    <PageContainer>
      <PageHeader
        title="History"
        description="Browse saved studio runs, inspect the payload that produced them, and send the same input back through the matching workflow."
      />
      <RunHistoryClient />
    </PageContainer>
  );
}
