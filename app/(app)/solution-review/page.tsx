"use client";

import { useMemo, useState } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { FormTextareaField } from "@/components/workspace/form-textarea-field";
import { PerformanceRecommendationCard } from "@/components/workspace/result-cards";
import type { SolutionReviewRequest, SolutionReviewResponse } from "@/lib/contracts/workspace";

const initialReviewInput = JSON.stringify(
  {
    metadata: {
      solutionName: "Field Service Ops",
      environmentName: "Contoso Production",
      uploadedBy: "alex@contoso.com",
      uploadedAt: "2026-03-18T09:30:00.000Z",
      version: "1.4.2"
    },
    artifacts: [
      {
        id: "screen-dashboard",
        artifactType: "screen",
        fileFormat: "yaml",
        name: "Operations Dashboard",
        summary: "Tracks work order status, SLA breaches, and technician utilization.",
        sourcePath: "src/screens/OperationsDashboard.fx.yaml"
      },
      {
        id: "formula-priority",
        artifactType: "formula",
        fileFormat: "txt",
        name: "Priority Escalation Logic",
        summary: "Assigns escalation flags for overdue high-priority work orders.",
        sourcePath: "src/formulas/PriorityEscalation.txt"
      }
    ]
  },
  null,
  2
);

export default function SolutionReviewPage() {
  const [reviewInput, setReviewInput] = useState(initialReviewInput);
  const [result, setResult] = useState<SolutionReviewResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSubmitDisabled = isSubmitting || reviewInput.trim().length === 0;

  const inventoryCountLabel = useMemo(() => {
    if (!result) {
      return null;
    }

    return `${result.performanceRecommendations.length} performance recommendation${
      result.performanceRecommendations.length === 1 ? "" : "s"
    } returned`;
  }, [result]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setResult(null);

    let payload: SolutionReviewRequest;

    try {
      payload = JSON.parse(reviewInput) as SolutionReviewRequest;
    } catch {
      setErrorMessage("Review input must be valid JSON before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/solution-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const responseBody = (await response.json()) as SolutionReviewResponse | {
        error?: { message?: string };
      };

      if (!response.ok) {
        const message = "error" in responseBody ? responseBody.error?.message : undefined;
        setErrorMessage(message ?? "Solution review submission failed.");
        return;
      }

      setResult(responseBody as SolutionReviewResponse);
    } catch {
      setErrorMessage("Solution review request could not be completed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Solution Review"
        description="Inventory uploaded artifacts, detect architectural drift, and receive focused refactor recommendations."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <SectionCard
          title="Artifact Review Queue"
          description="Paste the existing Solution Review request payload and submit it to the current API route."
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormTextareaField
              label="Solution Review payload"
              value={reviewInput}
              rows={18}
              placeholder="Paste Solution Review request JSON"
              onChange={setReviewInput}
            />

            {errorMessage ? (
              <div className="rounded-lg border border-rose-300/70 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {errorMessage}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" disabled={isSubmitDisabled}>
                {isSubmitting ? "Submitting Review..." : "Submit Solution Review"}
              </Button>
              <p className="text-sm text-muted-foreground">
                {isSubmitting
                  ? "Calling /api/solution-review and waiting for the response."
                  : "Response data is stored locally after a successful submission for immediate review."}
              </p>
            </div>
          </form>
        </SectionCard>

        <SectionCard
          title="Review Response"
          description="Stored response data is rendered here after the Solution Review flow completes."
        >
          {result ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-border/70 bg-background/60 p-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">{result.inventorySummary}</p>
                  <p className="text-sm text-muted-foreground">Generated at {result.generatedAt}</p>
                </div>
                <div className="space-y-2 text-right">
                  <SeverityBadge severity={result.riskLevel} />
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{inventoryCountLabel}</p>
                </div>
              </div>

              <div className="grid gap-5 xl:grid-cols-2">
                <div className="space-y-3 rounded-xl border border-border/70 bg-background/60 p-4">
                  <h3 className="text-sm font-semibold tracking-tight">Architectural Findings</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {result.architecturalFindings.map((finding) => (
                      <li key={finding} className="list-inside list-disc">
                        {finding}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3 rounded-xl border border-border/70 bg-background/60 p-4">
                  <h3 className="text-sm font-semibold tracking-tight">Recommended Refactors</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {result.recommendedRefactors.map((refactor) => (
                      <li key={refactor} className="list-inside list-disc">
                        {refactor}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold tracking-tight">Performance Recommendations</h3>
                <div className="grid gap-4">
                  {result.performanceRecommendations.map((recommendation) => (
                    <PerformanceRecommendationCard
                      key={recommendation.id}
                      recommendation={recommendation}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-card/60 p-8 text-center shadow-sm">
              <h3 className="text-lg font-semibold tracking-tight">No review submitted yet</h3>
              <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
                Submit the Solution Review payload to store the response state and render review findings here.
              </p>
            </div>
          )}
        </SectionCard>
      </div>
    </PageContainer>
  );
}
