"use client";

import { type FormEvent, useMemo, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import {
  BackendRecommendationCard,
  PerformanceRecommendationCard,
  RecommendationCard,
  SqlArtifactCard,
  SuggestedComponentCard,
  SuggestedFormulaCard,
  SummaryPanel
} from "@/components/workspace/result-cards";
import { FormInputField } from "@/components/workspace/form-input-field";
import { FormTextareaField } from "@/components/workspace/form-textarea-field";
import { StatusMessage } from "@/components/workspace/status-message";
import type { DataSourceType, RecommendationRequest, RecommendationResponse } from "@/lib/contracts/workspace";

const dataSourceOptions: DataSourceType[] = ["dataverse", "sql", "sharepoint", "api", "mixed", "other"];

const initialForm: RecommendationRequest = {
  scenario: "Field service request management modernization",
  dataSourceMix: "mixed",
  screenCount: 6,
  architectureNotes:
    "Canvas app for technicians and managers with Dataverse transactions, SQL reporting, and approval orchestration.",
  symptoms:
    "Slow startup, duplicated footer actions across screens, and repeated lookups in high-traffic formulas."
};

function toSummaryItems(response: RecommendationResponse) {
  return [
    `${response.recommendations.length} core recommendations identified`,
    `${response.performanceRecommendations.length} performance priorities to address first`,
    `${response.backendRecommendations.length} architecture guidance items for backend design`,
    `${response.suggestedComponents.length} reusable component ideas and ${response.suggestedFormulas.length} implementation formulas suggested`
  ];
}

export default function RecommendPage() {
  const [form, setForm] = useState<RecommendationRequest>(initialForm);
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const summaryItems = useMemo(() => (result ? toSummaryItems(result) : []), [result]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        throw new Error("Recommendations could not be generated right now.");
      }

      const payload = (await response.json()) as RecommendationResponse;
      setResult(payload);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unexpected error.");
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Recommendations"
        description="Turn app context and symptoms into prioritized next steps, architecture ideas, and implementation guidance."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <SectionCard
          title="Recommendation Input"
          description="Capture the scenario, current architecture, and symptoms so the engine can shape targeted guidance."
          className="h-fit"
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormInputField
              label="Scenario"
              value={form.scenario}
              placeholder="Describe the app or modernization effort"
              onChange={(value) => setForm((current) => ({ ...current, scenario: value }))}
            />

            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Data source mix</span>
              <select
                value={form.dataSourceMix}
                onChange={(event) =>
                  setForm((current) => ({ ...current, dataSourceMix: event.target.value as DataSourceType }))
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
              label="Screen count"
              type="number"
              value={String(form.screenCount)}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  screenCount: Number.isNaN(Number(value)) ? 0 : Number(value)
                }))
              }
            />

            <FormTextareaField
              label="Architecture notes"
              rows={4}
              value={form.architectureNotes}
              placeholder="Describe current app patterns, integrations, and constraints"
              onChange={(value) => setForm((current) => ({ ...current, architectureNotes: value }))}
            />

            <FormTextareaField
              label="Symptoms"
              rows={4}
              value={form.symptoms}
              placeholder="List performance, maintainability, or UX issues"
              onChange={(value) => setForm((current) => ({ ...current, symptoms: value }))}
            />

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate Recommendations
              </Button>
              <p className="text-xs text-muted-foreground">Output appears in structured sections on the right.</p>
            </div>
          </form>
        </SectionCard>

        <SectionCard
          title="Recommendation Output"
          description="Review the generated response grouped by priorities, next steps, architecture ideas, and implementation guidance."
        >
          {error ? <StatusMessage message={error} tone="error" /> : null}

          {!result ? (
            <EmptyState
              title="No recommendations yet"
              description="Submit the scenario details to generate a structured response with priorities, backend ideas, reusable implementation guidance, and next steps."
              actionLabel="Generate Recommendations"
              actionIcon={<Sparkles className="h-4 w-4" />}
            />
          ) : (
            <div className="space-y-6">
              <SummaryPanel
                title="Overview"
                subtitle={`Generated ${new Date(result.generatedAt).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short"
                })}`}
                items={summaryItems}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <SummaryPanel
                  title="Priority Focus"
                  items={result.performanceRecommendations.map(
                    (recommendation) => `P${recommendation.priority}: ${recommendation.title}`
                  )}
                />
                <SummaryPanel
                  title="Architecture Ideas"
                  items={result.backendRecommendations.map((recommendation) => recommendation.title)}
                />
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Suggested next steps</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {result.recommendations.map((recommendation) => (
                    <RecommendationCard key={recommendation.id} recommendation={recommendation} />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Architecture guidance</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {result.backendRecommendations.map((recommendation) => (
                    <BackendRecommendationCard key={recommendation.id} recommendation={recommendation} />
                  ))}
                </div>
                {result.sqlArtifacts.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {result.sqlArtifacts.map((artifact) => (
                      <SqlArtifactCard key={artifact.id} artifact={artifact} />
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Implementation guidance</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {result.suggestedComponents.map((component) => (
                    <SuggestedComponentCard key={component.id} component={component} />
                  ))}
                  {result.suggestedFormulas.map((formula) => (
                    <SuggestedFormulaCard key={formula.id} formula={formula} />
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">Performance priorities</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {result.performanceRecommendations.map((recommendation) => (
                    <PerformanceRecommendationCard key={recommendation.id} recommendation={recommendation} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </SectionCard>
      </div>
    </PageContainer>
  );
}
