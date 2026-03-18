"use client";

import { useMemo, useState } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { CodePanel } from "@/components/ui/code-panel";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { FormInputField } from "@/components/workspace/form-input-field";
import { FormTextareaField } from "@/components/workspace/form-textarea-field";
import { RecommendationCard } from "@/components/workspace/result-cards";
import type { AnalyzeMode, AnalyzeResponse, DataSourceType } from "@/lib/contracts/workspace";

const analyzeModeOptions: { value: AnalyzeMode; label: string }[] = [
  { value: "formula_analyzer", label: "Formula Analyzer" },
  { value: "screen_analyzer", label: "Screen Analyzer" },
  { value: "component_analyzer", label: "Component Analyzer" },
  { value: "performance_advisor", label: "Performance Advisor" }
];

const dataSourceOptions: { value: DataSourceType; label: string }[] = [
  { value: "dataverse", label: "Dataverse" },
  { value: "sql", label: "SQL" },
  { value: "sharepoint", label: "SharePoint" },
  { value: "api", label: "API" },
  { value: "mixed", label: "Mixed" },
  { value: "other", label: "Other" }
];

const sampleFormula = `Filter(
  Orders,
  CustomerId = selectedCustomer.Id &&
  LookUp(Users, Id = User().Email, Role) = "Manager"
)`;

const initialFormState = {
  mode: "formula_analyzer" as AnalyzeMode,
  artifactName: "Order review formula",
  artifactPurpose: "Validate manager-only order review access.",
  dataSource: "dataverse" as DataSourceType,
  symptoms: "Repeated lookups and potential delegation warnings when the dataset grows.",
  inputPayload: sampleFormula,
  relatedFormulas: "Set(varIsManager, LookUp(Users, Id = User().Email, Role = \"Manager\"))"
};

function DetailList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{title}</p>
      <ul className="space-y-1 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="list-inside list-disc">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AnalyzePage() {
  const [formState, setFormState] = useState(initialFormState);
  const [response, setResponse] = useState<AnalyzeResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isSubmitDisabled = useMemo(() => {
    return (
      isSubmitting ||
      formState.artifactName.trim().length === 0 ||
      formState.artifactPurpose.trim().length === 0 ||
      formState.symptoms.trim().length === 0
    );
  }, [formState.artifactName, formState.artifactPurpose, formState.symptoms, isSubmitting]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const apiResponse = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formState,
          relatedFormulas: formState.relatedFormulas.trim() || undefined
        })
      });

      const payload = (await apiResponse.json()) as AnalyzeResponse | { error?: { message?: string } };

      if (!apiResponse.ok) {
        const message = "error" in payload ? payload.error?.message : undefined;
        setResponse(null);
        setErrorMessage(message ?? "Analyze request failed.");
        return;
      }

      setResponse(payload as AnalyzeResponse);
    } catch {
      setResponse(null);
      setErrorMessage("Unable to submit analyze request right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Analyze Studio"
        description="Inspect Power Fx formulas for delegation issues, repeated lookups, and data loading inefficiencies."
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <SectionCard
          title="Formula Inspection"
          description="Submit an artifact to the existing analyzer route and capture the response for follow-up review."
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">Analyze Mode</span>
                <select
                  value={formState.mode}
                  onChange={(event) => setFormState((current) => ({ ...current, mode: event.target.value as AnalyzeMode }))}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {analyzeModeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">Data Source</span>
                <select
                  value={formState.dataSource}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, dataSource: event.target.value as DataSourceType }))
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
            </div>

            <FormInputField
              label="Artifact Name"
              value={formState.artifactName}
              placeholder="Order review formula"
              onChange={(artifactName) => setFormState((current) => ({ ...current, artifactName }))}
            />
            <FormInputField
              label="Artifact Purpose"
              value={formState.artifactPurpose}
              placeholder="Describe the artifact purpose"
              onChange={(artifactPurpose) => setFormState((current) => ({ ...current, artifactPurpose }))}
            />
            <FormTextareaField
              label="Symptoms"
              value={formState.symptoms}
              rows={3}
              placeholder="Describe the performance, delegation, or maintainability issues you are seeing"
              onChange={(symptoms) => setFormState((current) => ({ ...current, symptoms }))}
            />
            <FormTextareaField
              label="Input Payload"
              value={formState.inputPayload}
              rows={8}
              placeholder="Paste the formula, control configuration, or analysis payload"
              onChange={(inputPayload) => setFormState((current) => ({ ...current, inputPayload }))}
            />
            <FormTextareaField
              label="Related Formulas"
              value={formState.relatedFormulas}
              rows={4}
              placeholder="Optional supporting formulas or context"
              onChange={(relatedFormulas) => setFormState((current) => ({ ...current, relatedFormulas }))}
            />

            {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Requests are sent to the existing <code>/api/analyze</code> route.
              </p>
              <Button type="submit" disabled={isSubmitDisabled}>
                {isSubmitting ? "Analyzing..." : "Run Analysis"}
              </Button>
            </div>
          </form>
        </SectionCard>

        <SectionCard
          title="Analysis Results"
          description="Latest response payload stored locally for rendering in Analyze Studio."
        >
          {response ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <SeverityBadge severity={response.severity} />
                <p className="text-sm text-muted-foreground">{response.summary}</p>
              </div>

              <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Root Cause</p>
                <p className="mt-2 text-sm text-muted-foreground">{response.rootCause}</p>
              </div>

              {response.optimizedFormula ? (
                <CodePanel
                  title={response.optimizedFormula.name}
                  language="Power Fx"
                  code={response.optimizedFormula.formula}
                />
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                  <DetailList title="Findings" items={response.findings} />
                </div>
                <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                  <DetailList title="Delegation Considerations" items={response.delegationConsiderations} />
                </div>
                <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                  <DetailList title="Performance Notes" items={response.performanceNotes} />
                </div>
                <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                  <DetailList title="Maintainability Notes" items={response.maintainabilityNotes} />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Recommendations
                </p>
                <div className="grid gap-3">
                  {response.recommendations.map((recommendation) => (
                    <RecommendationCard key={recommendation.id} recommendation={recommendation} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mb-4 flex items-center gap-2">
                <SeverityBadge severity="high" />
                <p className="text-sm text-muted-foreground">Potential repeated LookUp on Users data source.</p>
              </div>
              <CodePanel title="Sample Formula" language="Power Fx" code={sampleFormula} />
            </div>
          )}
        </SectionCard>
      </div>
    </PageContainer>
  );
}
