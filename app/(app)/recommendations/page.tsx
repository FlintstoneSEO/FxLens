"use client";

import { useMemo, useState, type FormEvent } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { FormInputField } from "@/components/workspace/form-input-field";
import { FormTextareaField } from "@/components/workspace/form-textarea-field";
import {
  BackendRecommendationCard,
  PerformanceRecommendationCard,
  RecommendationCard,
  SqlArtifactCard,
  SuggestedComponentCard,
  SuggestedFormulaCard
} from "@/components/workspace/result-cards";
import { StatusMessage } from "@/components/workspace/status-message";
import type { DataSourceType, RecommendationRequest, RecommendationResponse } from "@/lib/contracts/workspace";

const dataSourceOptions: readonly DataSourceType[] = ["dataverse", "sql", "sharepoint", "api", "mixed", "other"];

const initialFormState: RecommendationRequest = {
  scenario: "Optimize a request intake and triage app used by operations managers.",
  dataSourceMix: "mixed",
  screenCount: 6,
  architectureNotes:
    "Current solution uses Dataverse for core entities, SQL for reporting, and Power Automate for approval routing.",
  symptoms: "Slow startup, repeated lookup logic, and uncertainty about where backend processing should live."
};

export default function RecommendationsPage() {
  const [formState, setFormState] = useState<RecommendationRequest>(initialFormState);
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSubmitDisabled = useMemo(
    () =>
      isSubmitting ||
      formState.scenario.trim().length === 0 ||
      formState.architectureNotes.trim().length === 0 ||
      formState.symptoms.trim().length === 0 ||
      Number.isNaN(formState.screenCount) ||
      formState.screenCount < 0,
    [formState, isSubmitting]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formState)
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: { message?: string } };

        setResult(null);
        setErrorMessage(payload.error?.message ?? "Unable to generate recommendations right now.");
        return;
      }

      const payload = (await response.json()) as RecommendationResponse;
      setResult(payload);
    } catch {
      setResult(null);
      setErrorMessage("Unable to reach the recommendation service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Recommendations"
        description="Submit architecture context and receive implementation, performance, backend, SQL, component, and formula guidance from the existing recommendation flow."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <SectionCard
          title="Recommendation Inputs"
          description="Provide the scenario details used to call the current recommendation route."
          className="h-fit"
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormTextareaField
              label="Scenario"
              value={formState.scenario}
              rows={4}
              placeholder="Describe the app or workflow that needs recommendations"
              onChange={(scenario) => setFormState((current) => ({ ...current, scenario }))}
            />

            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Data Source Mix</span>
              <select
                value={formState.dataSourceMix}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    dataSourceMix: event.target.value as DataSourceType
                  }))
                }
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
              >
                {dataSourceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <FormInputField
              label="Screen Count"
              type="number"
              value={String(formState.screenCount)}
              placeholder="0"
              onChange={(screenCount) =>
                setFormState((current) => ({
                  ...current,
                  screenCount: Number(screenCount)
                }))
              }
            />

            <FormTextareaField
              label="Architecture Notes"
              value={formState.architectureNotes}
              rows={5}
              placeholder="Share current architecture constraints, backend choices, and integration notes"
              onChange={(architectureNotes) => setFormState((current) => ({ ...current, architectureNotes }))}
            />

            <FormTextareaField
              label="Symptoms"
              value={formState.symptoms}
              rows={4}
              placeholder="Describe performance, maintainability, or scalability concerns"
              onChange={(symptoms) => setFormState((current) => ({ ...current, symptoms }))}
            />

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={isSubmitDisabled}>
                {isSubmitting ? "Generating..." : "Generate Recommendations"}
              </Button>
              {isSubmitting ? <p className="text-sm text-muted-foreground">Submitting to /api/recommend...</p> : null}
            </div>
          </form>
        </SectionCard>

        <div className="space-y-6">
          {errorMessage ? <StatusMessage message={errorMessage} tone="error" /> : null}

          {!result && !errorMessage ? (
            <StatusMessage message="Submit the form to load recommendation output from the current API route." />
          ) : null}

          {result ? (
            <>
              <SectionCard
                title="Response Summary"
                description={`Stored recommendation response from ${new Date(result.generatedAt).toLocaleString()}.`}
              >
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Recommendations</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight">{result.recommendations.length}</p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Performance</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight">{result.performanceRecommendations.length}</p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Backend</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight">{result.backendRecommendations.length}</p>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="Top Recommendations">
                <div className="grid gap-4 lg:grid-cols-2">
                  {result.recommendations.map((recommendation) => (
                    <RecommendationCard key={recommendation.id} recommendation={recommendation} />
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Performance Recommendations">
                <div className="grid gap-4 lg:grid-cols-2">
                  {result.performanceRecommendations.map((recommendation) => (
                    <PerformanceRecommendationCard key={recommendation.id} recommendation={recommendation} />
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Backend Recommendations">
                <div className="grid gap-4 lg:grid-cols-2">
                  {result.backendRecommendations.map((recommendation) => (
                    <BackendRecommendationCard key={recommendation.id} recommendation={recommendation} />
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Suggested SQL Artifacts">
                <div className="grid gap-4 lg:grid-cols-2">
                  {result.sqlArtifacts.map((artifact) => (
                    <SqlArtifactCard key={artifact.id} artifact={artifact} />
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Suggested Components">
                <div className="grid gap-4 lg:grid-cols-2">
                  {result.suggestedComponents.map((component) => (
                    <SuggestedComponentCard key={component.id} component={component} />
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Suggested Formulas">
                <div className="grid gap-4 lg:grid-cols-2">
                  {result.suggestedFormulas.map((formula) => (
                    <SuggestedFormulaCard key={formula.id} formula={formula} />
                  ))}
                </div>
              </SectionCard>
            </>
          ) : null}
        </div>
      </div>
    </PageContainer>
  );
}
