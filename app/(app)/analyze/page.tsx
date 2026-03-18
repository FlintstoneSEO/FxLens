"use client";

import { type FormEvent, useMemo, useState } from "react";
import { FileCode2, GitBranch, ListChecks, TextSearch } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { AnalyzeResults } from "@/components/workspace/analyze-results";
import { FormInputField } from "@/components/workspace/form-input-field";
import { FormTextareaField } from "@/components/workspace/form-textarea-field";
import { StatusMessage } from "@/components/workspace/status-message";
import {
  STUDIO_ERROR_LABEL,
  STUDIO_LOADING_MESSAGE,
  STUDIO_RUN_LABEL,
  STUDIO_RUNNING_LABEL,
  StudioInputCard,
  StudioOutputCard
} from "@/components/workspace/studio-shell";
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

  return "Unable to run Analyze Studio right now. Please try again.";
}

export default function AnalyzePage() {
  const [formState, setFormState] = useState<AnalyzeRequest>(initialFormState);
  const [response, setResponse] = useState<AnalyzeResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSubmitDisabled = useMemo(
    () =>
      isSubmitting ||
      formState.artifactName.trim().length === 0 ||
      formState.artifactPurpose.trim().length === 0 ||
      formState.symptoms.trim().length === 0 ||
      formState.inputPayload.trim().length === 0,
    [formState, isSubmitting]
  );

  const generatedAtLabel = useMemo(() => {
    if (!response?.generatedAt) {
      return null;
    }

    return `Last run ${new Date(response.generatedAt).toLocaleString()}`;
  }, [response]);

  const updateField = <TKey extends keyof AnalyzeRequest>(field: TKey, value: AnalyzeRequest[TKey]) => {
    setFormState((current) => ({
      ...current,
      [field]: value
    }));

    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const resetWorkspace = () => {
    setFormState(initialFormState);
    setResponse(null);
    setErrorMessage(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const apiResponse = await fetch("/api/analyze", {
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
        description="Inspect code, notes, issue reports, or requirements in a focused workspace and review structured findings in the same studio pattern as the rest of the product."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <StudioInputCard
          title="Input"
          description="Capture the artifact context, the material to review, and the issues the analyzer should focus on."
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            <SectionCard
              title="Analysis brief"
              description="Set the analysis mode, identify the artifact, and describe the behavior or risk you want reviewed."
              className="border-border/60 bg-background/40 p-5 shadow-none"
            >
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block space-y-1.5">
                    <span className="text-sm font-medium">Analysis focus</span>
                    <select
                      value={formState.mode}
                      onChange={(event) => updateField("mode", event.target.value as AnalyzeMode)}
                      className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                    disabled={isSubmitting}
                  />
                  <FormInputField
                    label="Artifact purpose"
                    value={formState.artifactPurpose}
                    placeholder="Describe the business goal or expected behavior"
                    onChange={(value) => updateField("artifactPurpose", value)}
                    disabled={isSubmitting}
                  />
                </div>

                <FormTextareaField
                  label="Symptoms or concerns"
                  value={formState.symptoms}
                  rows={4}
                  placeholder="Describe the issues you are seeing, suspected risks, or the questions this analysis should answer."
                  onChange={(value) => updateField("symptoms", value)}
                  disabled={isSubmitting}
                />

                <FormTextareaField
                  label="Artifact to analyze"
                  value={formState.inputPayload}
                  rows={12}
                  placeholder="Paste code, architecture notes, issue details, or requirements here. Include relevant constraints, expected behavior, and known pain points."
                  onChange={(value) => updateField("inputPayload", value)}
                  disabled={isSubmitting}
                />

                <FormTextareaField
                  label="Related formulas or supporting context"
                  value={formState.relatedFormulas ?? ""}
                  rows={5}
                  placeholder="Optional: add related formulas, helper logic, or nearby implementation details that affect the analysis."
                  onChange={(value) => updateField("relatedFormulas", value)}
                  disabled={isSubmitting}
                />
              </div>
            </SectionCard>

            <SectionCard
              title="Suggested starting points"
              description="Use these examples to frame the kind of artifacts and prompts that work well in Analyze Studio."
              className="border-border/60 bg-background/40 p-5 shadow-none"
            >
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-3">
                  {analysisUseCases.map(({ title, description, icon: Icon }) => (
                    <div key={title} className="flex gap-3 rounded-xl border border-border/70 bg-background/70 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-semibold">{title}</h3>
                        <p className="text-sm text-muted-foreground">{description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-dashed border-border/80 bg-background/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Prompt starters</p>
                  <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                    {promptStarters.map((starter) => (
                      <li key={starter} className="flex gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{starter}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </SectionCard>

            <div className="space-y-3 rounded-2xl border border-border/80 bg-background/40 p-4">
              <StatusMessage
                tone={errorMessage ? "error" : isSubmitting ? "loading" : response ? "success" : "info"}
                label={errorMessage ? STUDIO_ERROR_LABEL : isSubmitting ? "Run in progress" : response ? "Latest run" : "Ready to run"}
                message={
                  errorMessage
                    ? errorMessage
                    : isSubmitting
                      ? STUDIO_LOADING_MESSAGE
                      : response
                        ? "The latest analysis is loaded in the output panel. Update the artifact and run again whenever you need a fresh review."
                        : "Complete the brief to generate findings, risks, recommendations, and optimized output."
                }
              />

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-card/70 px-4 py-3">
                <p className="text-sm text-muted-foreground">Run the analyzer with the current input, or clear the workspace to start a new review.</p>
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={resetWorkspace} disabled={isSubmitting}>
                    Clear
                  </Button>
                  <Button type="submit" disabled={isSubmitDisabled} className="min-w-32">
                    {isSubmitting ? STUDIO_RUNNING_LABEL : STUDIO_RUN_LABEL}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </StudioInputCard>

        <StudioOutputCard
          title="Output"
          description="Review structured findings, risks, and recommendations in the same output pattern used across studios."
          errorMessage={errorMessage}
          errorLabel={STUDIO_ERROR_LABEL}
          emptyMessage="Run Analyze Studio to generate findings, risks, and recommendations for this artifact."
          generatedAtLabel={generatedAtLabel}
          isLoading={isSubmitting}
        >
          <AnalyzeResults result={response} />
        </StudioOutputCard>
      </div>
    </PageContainer>
  );
}
