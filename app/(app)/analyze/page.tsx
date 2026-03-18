"use client";

import { useMemo, useState } from "react";
import { FileCode2, GitBranch, ListChecks, TextSearch } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { AnalyzeResults } from "@/components/workspace/analyze-results";
import { FormInputField } from "@/components/workspace/form-input-field";
import { FormTextareaField } from "@/components/workspace/form-textarea-field";
import { StatusMessage } from "@/components/workspace/status-message";
import type { AnalyzeMode, AnalyzeRequest, AnalyzeResponse, DataSourceType } from "@/lib/contracts/workspace";
import type { ValidationErrorPayload } from "@/lib/validation/workspace";

const analysisUseCases = [
  {
    title: "Pasted code",
    description: "Review Power Fx, TypeScript, SQL, or configuration snippets for correctness, risk, and maintainability.",
    icon: FileCode2
  },
  {
    title: "Architecture notes",
    description: "Inspect solution structure, integration decisions, and data flow notes before implementation starts.",
    icon: GitBranch
  },
  {
    title: "Issue descriptions",
    description: "Break down defects, unexpected behavior, repro steps, and likely root causes for deeper analysis.",
    icon: TextSearch
  },
  {
    title: "Requirements text",
    description: "Evaluate acceptance criteria, edge cases, dependencies, and ambiguity in functional requirements.",
    icon: ListChecks
  }
] as const;

const promptStarters = [
  "Identify likely logic risks, hidden assumptions, and missing edge cases.",
  "Highlight performance, delegation, or maintainability concerns.",
  "Summarize the problem framing and point out any unclear requirements.",
  "Call out follow-up questions that would improve implementation confidence."
] as const;

const dataSourceOptions: Array<{ label: string; value: DataSourceType }> = [
  { label: "Dataverse", value: "dataverse" },
  { label: "SQL", value: "sql" },
  { label: "SharePoint", value: "sharepoint" },
  { label: "API", value: "api" },
  { label: "Mixed", value: "mixed" },
  { label: "Other", value: "other" }
];

const modeOptions: Array<{ label: string; value: AnalyzeMode }> = [
  { label: "Formula analyzer", value: "formula_analyzer" },
  { label: "Screen analyzer", value: "screen_analyzer" },
  { label: "Component analyzer", value: "component_analyzer" },
  { label: "Performance advisor", value: "performance_advisor" }
];

const initialFormState: AnalyzeRequest = {
  mode: "formula_analyzer",
  artifactName: "",
  artifactPurpose: "",
  dataSource: "dataverse",
  symptoms: "",
  inputPayload: "",
  relatedFormulas: ""
};

function getValidationMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "error" in error &&
    typeof error.error === "object" &&
    error.error !== null &&
    "message" in error.error &&
    typeof error.error.message === "string"
  ) {
    return (error as ValidationErrorPayload).error.message;
  }

  return "Unable to submit the analyze request right now. Please try again.";
}

export default function AnalyzePage() {
  const [formState, setFormState] = useState<AnalyzeRequest>(initialFormState);
  const [response, setResponse] = useState<AnalyzeResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSubmitDisabled = useMemo(
    () =>
      isSubmitting ||
      formState.artifactName.trim().length === 0 ||
      formState.artifactPurpose.trim().length === 0 ||
      formState.symptoms.trim().length === 0 ||
      formState.inputPayload.trim().length === 0
    );
  }, [formState, isSubmitting]);

  const updateField = <TKey extends keyof AnalyzeRequest>(field: TKey, value: AnalyzeRequest[TKey]) => {
    setFormState((current) => ({
      ...current,
      [field]: value
    }));
  };

  const resetWorkspace = () => {
    setFormState(initialFormState);
    setResponse(null);
    setErrorMessage(null);
  };

  const updateField = <TKey extends keyof AnalyzeRequest>(field: TKey, value: AnalyzeRequest[TKey]) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formState,
          relatedFormulas: formState.relatedFormulas?.trim() ? formState.relatedFormulas : undefined
        })
      });

      const payload = (await apiResponse.json()) as AnalyzeResponse | ValidationErrorPayload;

      if (!apiResponse.ok) {
        throw payload;
      }

      setResponse(payload as AnalyzeResponse);
    } catch (error) {
      setResponse(null);
      setErrorMessage(getValidationMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Analyze Studio"
        description="Inspect code, notes, issue reports, or requirements in a focused workspace and return structured findings, risks, and recommendations."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.95fr)]">
        <div className="space-y-6">
          <SectionCard
            title="Analysis workspace"
            description="Capture the artifact context, the material to review, and the issues you want the analyzer to focus on."
          >
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium">Analysis focus</span>
                  <select
                    value={formState.mode}
                    onChange={(event) => updateField("mode", event.target.value as AnalyzeMode)}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {modeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-1.5">
                  <span className="text-sm font-medium">Primary data source</span>
                  <select
                    value={formState.dataSource}
                    onChange={(event) => updateField("dataSource", event.target.value as DataSourceType)}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {dataSourceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormInputField
                  label="Artifact name"
                  value={formState.artifactName}
                  placeholder="e.g. Order review formula"
                  onChange={(value) => updateField("artifactName", value)}
                />
                <FormInputField
                  label="Artifact purpose"
                  value={formState.artifactPurpose}
                  placeholder="Describe the business goal or expected behavior"
                  onChange={(value) => updateField("artifactPurpose", value)}
                />
              </div>

              <FormTextareaField
                label="Symptoms or concerns"
                value={formState.symptoms}
                rows={4}
                placeholder="Describe the issues you are seeing, suspected risks, or the questions this analysis should answer."
                onChange={(value) => updateField("symptoms", value)}
              />

              <FormTextareaField
                label="Artifact to analyze"
                value={formState.inputPayload}
                rows={14}
                placeholder="Paste code, architecture notes, issue details, or requirements here. Include relevant constraints, expected behavior, and known pain points."
                onChange={(value) => updateField("inputPayload", value)}
              />

              <FormTextareaField
                label="Related formulas or supporting context"
                value={formState.relatedFormulas ?? ""}
                rows={5}
                placeholder="Optional: add related formulas, helper logic, or nearby implementation details that affect the analysis."
                onChange={(value) => updateField("relatedFormulas", value)}
              />

              {errorMessage ? <StatusMessage message={errorMessage} tone="error" label="Analyze failed" /> : null}

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-border/80 bg-background/30 px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  Submit the current artifact to generate structured findings, issues, and recommendations.
                </p>
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={resetWorkspace} disabled={isSubmitting}>
                    Clear workspace
                  </Button>
                  <Button type="submit" disabled={isSubmitDisabled}>
                    {isSubmitting ? "Analyzing..." : "Analyze input"}
                  </Button>
                </div>
              </div>
            </form>
          </SectionCard>

          <SectionCard
            title="Analysis results"
            description="Structured output is stored in the workspace so you can review findings, risks, and recommendations in one place."
          >
            {isSubmitting ? (
              <StatusMessage
                label="Analysis in progress"
                message="Review is running now. Results will appear here as soon as the analyzer responds."
              />
            ) : null}
            <AnalyzeResults result={response} />
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard
            title="Common analysis inputs"
            description="Start with whichever artifact best represents the problem you need to understand."
          >
            <div className="space-y-3">
              {analysisUseCases.map(({ title, description, icon: Icon }) => (
                <div
                  key={title}
                  className="flex gap-3 rounded-xl border border-border/70 bg-background/70 p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold">{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Performance and maintainability notes</p>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {[...result.performanceNotes, ...result.maintainabilityNotes].map((item) => (
                    <li key={item} className="list-inside list-disc">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </StudioOutputCard>
      </div>
    </PageContainer>
  );
}
