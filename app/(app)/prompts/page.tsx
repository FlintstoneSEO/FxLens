"use client";

import { useState } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import {
  BackendRecommendationCard,
  PerformanceRecommendationCard,
  RecommendationCard,
  SqlArtifactCard,
  SuggestedComponentCard,
  SuggestedFormulaCard
} from "@/components/workspace/result-cards";
import { FormInputField } from "@/components/workspace/form-input-field";
import { FormTextareaField } from "@/components/workspace/form-textarea-field";
import { StatusMessage } from "@/components/workspace/status-message";
import type { DataSourceType, RecommendationRequest, RecommendationResponse } from "@/lib/contracts/workspace";

type RecommendationFormState = {
  scenario: string;
  dataSourceMix: DataSourceType;
  screenCount: string;
  architectureNotes: string;
  symptoms: string;
};

const initialState: RecommendationFormState = {
  scenario: "Field operations request lifecycle with multi-role approvals",
  dataSourceMix: "mixed",
  screenCount: "18",
  architectureNotes:
    "Dataverse for transactions, SQL for reporting, and flows for integrations. Some formulas duplicated across screens.",
  symptoms: "Slow startup load on manager screens and occasional gallery lag during peak usage"
};

export default function RecommendationsPage() {
  const [formState, setFormState] = useState<RecommendationFormState>(initialState);
  const [response, setResponse] = useState<RecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = <K extends keyof RecommendationFormState>(key: K, value: RecommendationFormState[K]) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    const parsedScreenCount = Number.parseInt(formState.screenCount, 10);

    if (Number.isNaN(parsedScreenCount) || parsedScreenCount < 0) {
      setIsLoading(false);
      setError("Screen count must be a valid non-negative number.");
      return;
    }

    const payload: RecommendationRequest = {
      scenario: formState.scenario,
      dataSourceMix: formState.dataSourceMix,
      screenCount: parsedScreenCount,
      architectureNotes: formState.architectureNotes,
      symptoms: formState.symptoms,
      context: {
        workspaceId: "workspace-demo",
        correlationId: crypto.randomUUID()
      }
    };

    try {
      const result = await fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!result.ok) {
        throw new Error("Unable to generate architecture recommendations.");
      }

      const data = (await result.json()) as RecommendationResponse;
      setResponse(data);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unexpected error while generating architecture recommendations."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Recommendations Workspace"
        description="Use FxLens as an architecture advisor to decide when to use Power Fx, SQL assets, backend orchestration, and reusable components."
        actions={
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Advising..." : "Run Advisor"}
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1.18fr]">
        <SectionCard
          title="Architecture Context Inputs"
          description="Provide your app context and symptoms to receive structured recommendations from the mock recommendation engine."
        >
          <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
            <FormInputField
              label="App Scenario"
              value={formState.scenario}
              onChange={(value) => handleChange("scenario", value)}
            />

            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Data Source Mix</span>
              <select
                value={formState.dataSourceMix}
                onChange={(event) => handleChange("dataSourceMix", event.target.value as DataSourceType)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="dataverse">Dataverse</option>
                <option value="sql">SQL</option>
                <option value="sharepoint">SharePoint</option>
                <option value="api">API</option>
                <option value="mixed">Mixed</option>
                <option value="other">Other</option>
              </select>
            </label>

            <FormInputField
              label="Screen Count"
              value={formState.screenCount}
              onChange={(value) => handleChange("screenCount", value)}
            />

            <FormTextareaField
              label="Architecture Notes"
              value={formState.architectureNotes}
              onChange={(value) => handleChange("architectureNotes", value)}
              rows={5}
            />

            <FormTextareaField
              label="Symptoms"
              value={formState.symptoms}
              onChange={(value) => handleChange("symptoms", value)}
              rows={4}
            />

            <div className="flex justify-end pt-2">
              <Button type="button" variant="secondary" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Running..." : "Run with Current Inputs"}
              </Button>
            </div>
          </form>
        </SectionCard>

        <SectionCard
          title="Architecture Recommendations"
          description="Structured output from /api/recommend rendered with shared FxLens result cards."
        >
          {error ? <StatusMessage tone="error" message={error} /> : null}

          {!response && !error ? (
            <StatusMessage
              tone="info"
              message="Run advisor to view architecture, performance, backend, SQL, component, and formula recommendations."
            />
          ) : null}

          {response ? (
            <div className="space-y-4">
              <section className="space-y-3">
                <h3 className="text-sm font-semibold tracking-tight">General Recommendations</h3>
                {response.recommendations.map((recommendation) => (
                  <RecommendationCard key={recommendation.id} recommendation={recommendation} />
                ))}
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold tracking-tight">Performance Recommendations</h3>
                {response.performanceRecommendations.map((recommendation) => (
                  <PerformanceRecommendationCard key={recommendation.id} recommendation={recommendation} />
                ))}
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold tracking-tight">Backend Recommendations</h3>
                {response.backendRecommendations.map((recommendation) => (
                  <BackendRecommendationCard key={recommendation.id} recommendation={recommendation} />
                ))}
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold tracking-tight">SQL Artifact Suggestions</h3>
                {response.sqlArtifacts.map((artifact) => (
                  <SqlArtifactCard key={artifact.id} artifact={artifact} />
                ))}
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold tracking-tight">Suggested Components</h3>
                {response.suggestedComponents.map((component) => (
                  <SuggestedComponentCard key={component.id} component={component} />
                ))}
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold tracking-tight">Suggested Formulas</h3>
                {response.suggestedFormulas.map((formula) => (
                  <SuggestedFormulaCard key={formula.id} formula={formula} />
                ))}
              </section>
            </div>
          ) : null}
        </SectionCard>
      </div>
    </PageContainer>
  );
}
