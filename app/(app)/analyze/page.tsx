"use client";

import { useMemo, useState, type FormEvent } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { FormInputField } from "@/components/workspace/form-input-field";
import { FormTextareaField } from "@/components/workspace/form-textarea-field";
import { StudioInputCard, StudioOutputCard } from "@/components/workspace/studio-shell";
import type { AnalyzeMode, AnalyzeRequest, AnalyzeResponse, DataSourceType } from "@/lib/contracts/workspace";

const initialFormState: AnalyzeRequest = {
  mode: "formula_analyzer",
  artifactName: "Order review formula",
  artifactPurpose: "Validate manager-only order review access.",
  dataSource: "dataverse",
  symptoms: "Repeated lookups and potential delegation warnings when the dataset grows.",
  inputPayload: `If(\n  varIsManager,\n  Filter(Orders, ManagerId = varCurrentUserId),\n  Filter(Orders, CreatedById = varCurrentUserId)\n)`,
  relatedFormulas: 'Set(varIsManager, LookUp(Users, Id = User().Email, Role = "Manager"))'
};

const modeOptions: Array<{ label: string; value: AnalyzeMode }> = [
  { label: "Formula analyzer", value: "formula_analyzer" },
  { label: "Screen analyzer", value: "screen_analyzer" },
  { label: "Component analyzer", value: "component_analyzer" },
  { label: "Performance advisor", value: "performance_advisor" }
];

const dataSourceOptions: Array<{ label: string; value: DataSourceType }> = [
  { label: "Dataverse", value: "dataverse" },
  { label: "SQL", value: "sql" },
  { label: "SharePoint", value: "sharepoint" },
  { label: "API", value: "api" },
  { label: "Mixed", value: "mixed" },
  { label: "Other", value: "other" }
];

export default function AnalyzePage() {
  const [formState, setFormState] = useState<AnalyzeRequest>(initialFormState);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSubmitDisabled = useMemo(
    () =>
      isSubmitting ||
      formState.artifactName.trim().length === 0 ||
      formState.artifactPurpose.trim().length === 0 ||
      formState.symptoms.trim().length === 0 ||
      formState.inputPayload.trim().length === 0,
    [formState, isSubmitting]
  );

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
          relatedFormulas: formState.relatedFormulas?.trim() || undefined
        })
      });

      const payload = (await response.json()) as AnalyzeResponse | { error?: { message?: string } };

      if (!response.ok) {
        setResult(null);
        setErrorMessage(("error" in payload ? payload.error?.message : undefined) ?? "Something went wrong while preparing output. Please try again.");
        return;
      }

      setResult(payload as AnalyzeResponse);
    } catch {
      setResult(null);
      setErrorMessage("Something went wrong while preparing output. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Analyze Studio"
        description="Paste the artifact, add the context, and generate a focused analysis output with the same polished experience as the other studios."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <StudioInputCard
          title="Input"
          description="Capture the analysis target, the surrounding context, and the exact payload that should be reviewed."
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">Analysis mode</span>
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
                <span className="text-sm font-medium">Data source</span>
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
                placeholder="e.g. Order screen delegation investigation"
                onChange={(value) => updateField("artifactName", value)}
              />
              <FormInputField
                label="Artifact purpose"
                value={formState.artifactPurpose}
                placeholder="Describe the expected behavior or intent"
                onChange={(value) => updateField("artifactPurpose", value)}
              />
            </div>

            <FormTextareaField
              label="What needs analysis"
              value={formState.inputPayload}
              rows={12}
              placeholder="Paste code, architecture notes, issue details, or requirements here"
              onChange={(value) => updateField("inputPayload", value)}
            />
            <div className="grid gap-4 lg:grid-cols-2">
              <FormTextareaField
                label="Symptoms"
                value={formState.symptoms}
                rows={4}
                placeholder="Describe the problem, risks, or pain points to investigate"
                onChange={(value) => updateField("symptoms", value)}
              />
              <FormTextareaField
                label="Related formulas or context"
                value={formState.relatedFormulas ?? ""}
                rows={4}
                placeholder="Include supporting formulas, dependencies, or implementation notes"
                onChange={(value) => updateField("relatedFormulas", value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-border/70 pt-4">
              <Button type="submit" disabled={isSubmitDisabled}>
                {isSubmitting ? "Generating output..." : "Generate output"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setFormState(initialFormState);
                  setResult(null);
                  setErrorMessage(null);
                }}
              >
                Reset input
              </Button>
            </div>
          </form>
        </StudioInputCard>

        <StudioOutputCard
          title="Output"
          description="Review the summary, findings, and recommended follow-up steps in a consistent output panel."
          errorMessage={errorMessage}
          emptyMessage="Submit the input to generate an analysis summary for this studio."
        >
          {result ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/80">Summary</p>
                <p className="mt-2 text-sm text-foreground">{result.summary}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Findings</p>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {result.findings.map((item) => (
                      <li key={item} className="list-inside list-disc">{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Recommendations</p>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {result.recommendations.map((item) => (
                      <li key={item.id} className="list-inside list-disc">{item.title}</li>
                    ))}
                  </ul>
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
