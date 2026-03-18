"use client";

import { useMemo, useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, LoaderCircle, Sparkles } from "lucide-react";

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

const dataSourceOptions: readonly { label: string; value: DataSourceType }[] = [
  { label: "Dataverse", value: "dataverse" },
  { label: "SQL", value: "sql" },
  { label: "SharePoint", value: "sharepoint" },
  { label: "API", value: "api" },
  { label: "Mixed", value: "mixed" },
  { label: "Other", value: "other" }
];

const initialFormState: RecommendationRequest = {
  scenario: "Optimize a request intake and triage app used by operations managers.",
  dataSourceMix: "mixed",
  screenCount: 6,
  architectureNotes:
    "Current solution uses Dataverse for core entities, SQL for reporting, and Power Automate for approval routing.",
  symptoms: "Slow startup, repeated lookup logic, and uncertainty about where backend processing should live."
};

function getSummaryMetrics(result: RecommendationResponse) {
  return [
    { label: "Priority recommendations", value: result.recommendations.length },
    { label: "Performance actions", value: result.performanceRecommendations.length },
    { label: "Backend ideas", value: result.backendRecommendations.length },
    { label: "Build assets", value: result.sqlArtifacts.length + result.suggestedComponents.length + result.suggestedFormulas.length }
  ];
}

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

  const responseSections = useMemo(() => {
    if (!result) {
      return [];
    }

    return [
      {
        key: "priorities",
        title: "Priority recommendations",
        description: "The highest-value improvements to align the solution approach, simplify implementation, and reduce near-term risk.",
        count: result.recommendations.length,
        content: (
          <div className="grid gap-4 lg:grid-cols-2">
            {result.recommendations.map((recommendation) => (
              <RecommendationCard key={recommendation.id} recommendation={recommendation} />
            ))}
          </div>
        )
      },
      {
        key: "actions",
        title: "Performance actions",
        description: "Specific changes to reduce startup cost, improve responsiveness, and avoid scale-related regressions.",
        count: result.performanceRecommendations.length,
        content: (
          <div className="grid gap-4 lg:grid-cols-2">
            {result.performanceRecommendations.map((recommendation) => (
              <PerformanceRecommendationCard key={recommendation.id} recommendation={recommendation} />
            ))}
          </div>
        )
      },
      {
        key: "architecture",
        title: "Backend and data ideas",
        description: "Recommended architecture boundaries and SQL support patterns for the current scenario.",
        count: result.backendRecommendations.length + result.sqlArtifacts.length,
        content: (
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {result.backendRecommendations.map((recommendation) => (
                <BackendRecommendationCard key={recommendation.id} recommendation={recommendation} />
              ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {result.sqlArtifacts.map((artifact) => (
                <SqlArtifactCard key={artifact.id} artifact={artifact} />
              ))}
            </div>
          </div>
        )
      },
      {
        key: "build-assets",
        title: "Implementation ideas",
        description: "Reusable components and formulas that support the recommendation set and keep delivery consistent across screens.",
        count: result.suggestedComponents.length + result.suggestedFormulas.length,
        content: (
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              {result.suggestedComponents.map((component) => (
                <SuggestedComponentCard key={component.id} component={component} />
              ))}
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {result.suggestedFormulas.map((formula) => (
                <SuggestedFormulaCard key={formula.id} formula={formula} />
              ))}
            </div>
          </div>
        )
      }
    ];
  }, [result]);

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

      const payload = (await response.json()) as RecommendationResponse | { error?: { message?: string } };

      if (!response.ok) {
        setResult(null);
        setErrorMessage("error" in payload ? payload.error?.message ?? "Unable to generate recommendations right now." : "Unable to generate recommendations right now.");
        return;
      }

      setResult(payload as RecommendationResponse);
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
        description="Submit architecture context and receive structured priorities, actions, and implementation ideas from the existing recommendation flow."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <SectionCard
          title="Recommendation Inputs"
          description="Capture the scenario, architecture shape, and pain points the current recommendation route should evaluate."
          className="h-fit"
        >
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="rounded-xl border border-border/70 bg-background/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Scenario brief</p>
              <div className="mt-4 space-y-4">
                <FormTextareaField
                  label="Scenario"
                  value={formState.scenario}
                  rows={4}
                  placeholder="Describe the app or workflow that needs recommendations"
                  onChange={(scenario) => setFormState((current) => ({ ...current, scenario }))}
                />

                <div className="grid gap-4 sm:grid-cols-2">
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
                        <option key={option.value} value={option.value}>
                          {option.label}
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
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-background/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Architecture context</p>
              <div className="mt-4 space-y-4">
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
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-border/80 bg-background/30 px-4 py-3">
              <Button type="submit" disabled={isSubmitDisabled}>
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Generating recommendations...
                  </span>
                ) : (
                  "Generate Recommendations"
                )}
              </Button>
              <p className="text-sm text-muted-foreground">
                The page submits directly to <code className="rounded bg-muted px-1 py-0.5 text-xs">/api/recommend</code> and renders the structured response below.
              </p>
            </div>
          </form>
        </SectionCard>

        <div className="space-y-6">
          {errorMessage ? <StatusMessage message={errorMessage} tone="error" label="Request failed" /> : null}

          {isSubmitting ? (
            <SectionCard
              title="Generating recommendation set"
              description="Loading the current recommendation response and organizing it into delivery-focused sections."
            >
              <div className="space-y-3">
                {[
                  "Reviewing scenario and architecture notes",
                  "Prioritizing implementation recommendations",
                  "Grouping backend, SQL, component, and formula ideas"
                ].map((step) => (
                  <div key={step} className="flex items-center gap-3 rounded-xl border border-border/70 bg-background/50 p-4 text-sm text-muted-foreground">
                    <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : null}

          {!result && !errorMessage && !isSubmitting ? (
            <SectionCard
              title="Recommendations Studio output"
              description="Run the current flow to review the structured recommendation response in the same workspace."
            >
              <StatusMessage message="Submit the form to load priority recommendations, performance actions, backend ideas, and implementation assets." />
            </SectionCard>
          ) : null}

          {result ? (
            <>
              <SectionCard
                title="Response Summary"
                description={`Recommendation response generated ${new Date(result.generatedAt).toLocaleString()}.`}
              >
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {getSummaryMetrics(result).map((metric) => (
                    <div key={metric.label} className="rounded-xl border border-border/70 bg-background/60 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{metric.label}</p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight">{metric.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
                  <div className="rounded-xl border border-emerald-300/60 bg-emerald-50/70 p-4 text-sm text-emerald-900">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      <div>
                        <p className="font-semibold">Submission flow confirmed</p>
                        <p className="mt-1 text-emerald-800/90">
                          Inputs were accepted, the page handled the response successfully, and results were grouped into delivery-ready sections.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-xl border border-amber-300/60 bg-amber-50/70 p-4 text-sm text-amber-900">
                    <div className="flex items-start gap-3">
                      <Sparkles className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      <div>
                        <p className="font-semibold">Focus areas</p>
                        <p className="mt-1 text-amber-800/90">
                          Review priorities first, then move through actions and implementation ideas to shape the next delivery pass.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="How to use this response" description="Read the output in the same order other studios present decision-ready guidance.">
                <div className="grid gap-3 md:grid-cols-3">
                  {[
                    {
                      title: "1. Priorities",
                      description: "Start with the most important recommendations and next steps to frame the solution direction.",
                      icon: AlertCircle
                    },
                    {
                      title: "2. Actions",
                      description: "Review performance actions next so the plan addresses responsiveness and scale early.",
                      icon: CheckCircle2
                    },
                    {
                      title: "3. Ideas",
                      description: "Use backend, SQL, component, and formula ideas to translate the guidance into implementation work.",
                      icon: Sparkles
                    }
                  ].map(({ title, description, icon: Icon }) => (
                    <div key={title} className="rounded-xl border border-border/70 bg-background/60 p-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <p className="mt-3 text-sm font-semibold text-foreground">{title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                    </div>
                  ))}
                </div>
              </SectionCard>

              {responseSections.map((section) => (
                <SectionCard key={section.key} title={section.title} description={section.description}>
                  <div className="mb-4 inline-flex rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    {section.count} item{section.count === 1 ? "" : "s"}
                  </div>
                  {section.content}
                </SectionCard>
              ))}
            </>
          ) : null}
        </div>
      </div>
    </PageContainer>
  );
}
