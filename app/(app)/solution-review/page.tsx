import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatusMessage } from "@/components/workspace/status-message";

const reviewOutputs = [
  "Artifact inventory and structure summary",
  "Drift, risk, and review findings",
  "Refactor recommendations for the next pass"
] as const;

export default function SolutionReviewPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Solution Review"
        description="Inventory uploaded artifacts, detect architectural drift, and receive focused refactor recommendations."
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <SectionCard
          title="Artifact Review Queue"
          description="Keep review inputs, findings, and follow-up recommendations together in one consistent workspace."
        >
          <div className="space-y-5">
            <StatusMessage
              label="Workspace status"
              message="Uploaded solution packages, ingestion progress, and review errors will appear inline here when backend processing is connected."
            />
            <EmptyState
              title="No solution uploaded"
              description="Upload a solution export to generate an inventory, surface drift, and capture architecture recommendations in one place."
              actionLabel="Start solution review"
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Expected outputs"
          description="This side panel mirrors the rest of the studios so review outcomes are easier to compare."
        >
          <ul className="space-y-3 text-sm text-muted-foreground">
            {reviewOutputs.map((item) => (
              <li key={item} className="rounded-lg border border-border/70 bg-background/70 px-3 py-3">
                {item}
              </li>
            ))}
          </ul>
        </SectionCard>
      </section>
    </PageContainer>
  );
}
