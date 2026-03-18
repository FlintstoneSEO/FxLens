import { PerformanceRecommendationCard } from "@/components/workspace/result-cards";
import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { createSolutionReviewMockResponse } from "@/lib/mocks/api";
import type { SolutionReviewRequest, SolutionReviewResponse } from "@/lib/contracts/workspace";

const sampleReviewRequest: SolutionReviewRequest = {
  metadata: {
    solutionName: "Field Ops Accelerator",
    environmentName: "Production",
    uploadedBy: "Avery Chen",
    uploadedAt: "2026-03-18T09:30:00.000Z",
    version: "v4.2.1"
  },
  artifacts: [
    {
      id: "screen-1",
      artifactType: "screen",
      fileFormat: "zip",
      name: "Dispatch Overview",
      summary: "Coordinator dashboard for crew assignments and exception handling.",
      sourcePath: "/apps/dispatch/overview"
    },
    {
      id: "component-1",
      artifactType: "component",
      fileFormat: "yaml",
      name: "Status Card",
      summary: "Reusable badge and summary card used across dispatch and service screens.",
      sourcePath: "/components/status-card"
    },
    {
      id: "formula-1",
      artifactType: "formula",
      fileFormat: "txt",
      name: "LoadAssignments",
      summary: "Startup formula that joins crew, ticket, and SLA data before initial render.",
      sourcePath: "/formulas/load-assignments.fx"
    }
  ]
};

const sampleReviewResponse = createSolutionReviewMockResponse(sampleReviewRequest);

function MetadataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-background/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function ArtifactItem({
  artifact
}: {
  artifact: SolutionReviewRequest["artifacts"][number];
}) {
  return (
    <article className="rounded-xl border border-border/70 bg-background/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">{artifact.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{artifact.summary}</p>
        </div>
        <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {artifact.artifactType}
        </span>
      </div>
      <dl className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
        <div>
          <dt className="font-medium text-foreground">Format</dt>
          <dd>{artifact.fileFormat ?? "N/A"}</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Source Path</dt>
          <dd className="break-all">{artifact.sourcePath ?? "N/A"}</dd>
        </div>
      </dl>
    </article>
  );
}

function FindingsList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="rounded-xl border border-border/70 bg-background/60 p-4">
      <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="list-inside list-disc">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function SolutionReviewFindings({ response }: { response: SolutionReviewResponse | null }) {
  if (!response) {
    return (
      <EmptyState
        title="No review results yet"
        description="Run a solution review to populate findings, strengths, concerns, and recommended follow-up actions."
      />
    );
  }

  const strengths = [response.inventorySummary];
  const concerns = response.architecturalFindings;
  const recommendations = response.recommendedRefactors;
  const findings = response.performanceRecommendations.map(
    (recommendation) => `${recommendation.title}: ${recommendation.expectedImpact}`
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/70 bg-background/60 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Review Status</p>
          <p className="mt-1 text-sm font-medium text-foreground">Complete</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Generated</p>
          <p className="mt-1 text-sm text-foreground">{new Date(response.generatedAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Review Score</p>
          <SeverityBadge severity={response.riskLevel} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <FindingsList title="Strengths" items={strengths} />
        <FindingsList title="Concerns" items={concerns} />
        <FindingsList title="Findings" items={findings} />
        <FindingsList title="Recommendations" items={recommendations} />
      </div>

      {response.performanceRecommendations.length > 0 ? (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold tracking-tight">Detailed Performance Recommendations</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Targeted follow-up actions generated from the latest solution review response.
            </p>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {response.performanceRecommendations.map((recommendation) => (
              <PerformanceRecommendationCard key={recommendation.id} recommendation={recommendation} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function SolutionReviewPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Solution Review"
        description="Inventory uploaded artifacts, detect architectural drift, and receive focused refactor recommendations."
      />
      <div className="grid gap-6 xl:grid-cols-[1.05fr_1.35fr]">
        <SectionCard
          title="Review Input"
          description="Uploaded solution metadata and artifacts that define the scope for the current review run."
        >
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <MetadataItem label="Solution" value={sampleReviewRequest.metadata.solutionName} />
              <MetadataItem label="Environment" value={sampleReviewRequest.metadata.environmentName} />
              <MetadataItem label="Uploaded By" value={sampleReviewRequest.metadata.uploadedBy} />
              <MetadataItem label="Version" value={sampleReviewRequest.metadata.version} />
            </div>
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold tracking-tight">Artifacts in Scope</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Inputs are listed separately from review results so teams can verify what was assessed.
                </p>
              </div>
              <div className="space-y-3">
                {sampleReviewRequest.artifacts.map((artifact) => (
                  <ArtifactItem key={artifact.id} artifact={artifact} />
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Review Output"
          description="Structured findings from the latest Solution Review response, including findings, strengths, concerns, and next-step guidance."
        >
          <SolutionReviewFindings response={sampleReviewResponse} />
        </SectionCard>
      </div>
    </PageContainer>
  );
}
