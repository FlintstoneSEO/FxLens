"use client";

import { type FormEvent, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, SearchCode } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { StatusMessage } from "@/components/workspace/status-message";
import { AnalyzeResults } from "@/components/workspace/analyze-results";
import { FormInputField } from "@/components/workspace/form-input-field";
import { FormTextareaField } from "@/components/workspace/form-textarea-field";
import { StudioTemplatePicker } from "@/components/workspace/studio-template-picker";
import { StudioInputCard, StudioOutputCard } from "@/components/workspace/studio-shell";
import type { AnalyzeMode, AnalyzeRequest, AnalyzeResponse, DataSourceType } from "@/lib/contracts/workspace";
import type { StudioTemplate } from "@/lib/studio-templates";
import type { ValidationErrorPayload } from "@/lib/validation/workspace";

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

const fieldClassName =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-70";

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

function FormSection({
  eyebrow,
  title,
  description,
  children
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-border/70 bg-background/40 p-5">
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{eyebrow}</p>
        <div>
          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function AnalyzePage() {
  const [formState, setFormState] = useState<AnalyzeRequest>(initialFormState);
  const [response, setResponse] = useState<AnalyzeResponse | null>(null);
  const [submittedRequest, setSubmittedRequest] = useState<AnalyzeRequest | null>(null);
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

    const parsedDate = new Date(response.generatedAt);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Generated just now";
    }

    return `Generated ${parsedDate.toLocaleString()}`;
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
    setSubmittedRequest(null);
    setErrorMessage(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const requestPayload: AnalyzeRequest = {
      ...formState,
      relatedFormulas: formState.relatedFormulas?.trim() ? formState.relatedFormulas.trim() : undefined
    };

    try {
      const apiResponse = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload)
      });

      const payload = (await apiResponse.json()) as AnalyzeResponse | ValidationErrorPayload;

      if (!apiResponse.ok) {
        throw payload;
      }

      setSubmittedRequest(requestPayload);
      setResponse(payload as AnalyzeResponse);
    } catch (error) {
      setResponse(null);
      setSubmittedRequest(null);
      setErrorMessage(getValidationMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyTemplate = (template: StudioTemplate) => {
    setFormState((current) => ({
      ...current,
      ...(template.payload as Partial<AnalyzeRequest>)
    }));
    setErrorMessage(null);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Analyze Studio"
        description="Submit an artifact, route it through the existing Analyze API, and review structured findings, risks, and recommendations in one workspace."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
        <StudioInputCard
          title="Analysis brief"
          description="Capture what should be reviewed, the suspected issues, and the supporting context. Every field remains editable between runs."
          accent="input"
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            <StudioTemplatePicker area="analyze" disabled={isSubmitting} onApplyTemplate={applyTemplate} />

            <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <SearchCode className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
                <p>
                  Use Analyze Studio to move from artifact input to a structured review. The latest successful API response stays visible in the results panel while you refine the next submission.
                </p>
              </div>
            </div>

            <FormSection
              eyebrow="Analysis setup"
              title="Focus and artifact details"
              description="Set the analyzer mode, identify the artifact, and explain the intended behavior before submitting."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium">Analysis focus</span>
                  <select
                    value={formState.mode}
                    onChange={(event) => updateField("mode", event.target.value as AnalyzeMode)}
                    className={fieldClassName}
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
                    className={fieldClassName}
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
            </FormSection>

            <FormSection
              eyebrow="Analysis input"
              title="Observed issues and material to review"
              description="Describe the symptoms clearly, then provide the code, notes, or requirements text the analyzer should inspect."
            >
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
                rows={14}
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
            </FormSection>

            <div className="space-y-3 rounded-2xl border border-border/80 bg-background/40 p-4">
              <StatusMessage
                tone={errorMessage ? "error" : isSubmitting ? "loading" : response ? "success" : "info"}
                label={errorMessage ? "Submission status" : isSubmitting ? "Analyzing" : response ? "Latest result" : "Ready"}
                message={
                  errorMessage
                    ? errorMessage
                    : isSubmitting
                      ? "Submitting the current artifact to /api/analyze and waiting for structured findings, risks, and recommendations."
                      : response
                        ? "The latest successful response is loaded in the results panel. Update the brief and submit again whenever you need a new pass."
                        : "Complete the brief and submit to generate a structured review for the current artifact."
                }
              />

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-card/70 px-4 py-3">
                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                  {isSubmitting ? (
                    <Loader2 className="mt-0.5 h-4 w-4 animate-spin text-primary" aria-hidden="true" />
                  ) : response ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" aria-hidden="true" />
                  ) : (
                    <AlertCircle className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
                  )}
                  <p>
                    {isSubmitting
                      ? "We are validating the request body and generating the latest analysis response."
                      : response
                        ? "Results remain visible so you can compare findings, refine context, and rerun without losing the previous review flow."
                        : "Provide enough context for the analyzer to separate findings, risks, and recommended next steps."}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={resetWorkspace} disabled={isSubmitting}>
                    Clear
                  </Button>
                  <Button type="submit" disabled={isSubmitDisabled} className="min-w-40">
                    {isSubmitting ? "Analyzing..." : "Analyze artifact"}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </StudioInputCard>

        <StudioOutputCard
          title="Structured output"
          description="Review the submitted context, returned severity, and structured findings in clearly separated sections aligned with the other studios."
          errorMessage={errorMessage}
          emptyMessage="Submit an analysis brief to generate a structured review for this studio."
          accent="output"
          generatedAtLabel={generatedAtLabel}
          isLoading={isSubmitting}
        >
          <AnalyzeResults result={response} request={submittedRequest} isLoading={isSubmitting} />
        </StudioOutputCard>
      </div>
    </PageContainer>
  );
}
