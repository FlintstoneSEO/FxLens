"use client";

import { useMemo, useState, type FormEvent } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { FormInputField } from "@/components/workspace/form-input-field";
import { FormTextareaField } from "@/components/workspace/form-textarea-field";
import { StudioInputCard, StudioOutputCard } from "@/components/workspace/studio-shell";
import type { DataSourceType, ScopeRequest, ScopeResponse } from "@/lib/contracts/workspace";
import type { ValidationErrorPayload } from "@/lib/validation/workspace";

const dataSourceOptions: Array<{ label: string; value: DataSourceType }> = [
  { label: "Dataverse", value: "dataverse" },
  { label: "SQL", value: "sql" },
  { label: "SharePoint", value: "sharepoint" },
  { label: "API", value: "api" },
  { label: "Mixed", value: "mixed" },
  { label: "Other", value: "other" }
];

const initialFormState: ScopeRequest = {
  projectName: "Vendor onboarding portal",
  businessObjective: "Reduce cycle time for onboarding new vendors and standardize approvals.",
  targetUsersRoles: "Procurement coordinators, approvers, compliance reviewers, and finance analysts.",
  requirementsText:
    "Track intake, review, approvals, compliance checks, and handoff to finance with clear statuses and notifications.",
  meetingNotes:
    "Current process lives across email, spreadsheets, and Teams. Teams need a single operational workspace.",
  preferredDataSource: "dataverse",
  integrationNeeds: "ERP vendor master sync, Teams notifications, and document storage.",
  desiredOutputs: "Suggested screens, data entities, backend guidance, risks, and an MVP plan."
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

  return "Something went wrong while preparing output. Please try again.";
}

export default function ScopePage() {
  const [formState, setFormState] = useState<ScopeRequest>(initialFormState);
  const [result, setResult] = useState<ScopeResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSubmitDisabled = useMemo(
    () =>
      isSubmitting ||
      Object.entries(formState).some(([key, value]) => key !== "context" && String(value).trim().length === 0),
    [formState, isSubmitting]
  );

  const updateField = <TKey extends keyof ScopeRequest>(field: TKey, value: ScopeRequest[TKey]) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/scope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState)
      });

      const payload = (await response.json()) as ScopeResponse | ValidationErrorPayload;

      if (!response.ok) {
        throw payload;
      }

      setResult(payload as ScopeResponse);
    } catch (error) {
      setResult(null);
      setErrorMessage(getValidationMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Scope Studio"
        description="Capture the project context, align on the ask, and generate a polished scoping output for the next team discussion."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <StudioInputCard
          title="Input"
          description="Capture the core project details, delivery constraints, and desired outcome before generating a scoping pass."
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <FormInputField
                label="Project name"
                value={formState.projectName}
                placeholder="e.g. Vendor onboarding portal"
                onChange={(projectName) => updateField("projectName", projectName)}
              />
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">Preferred data source</span>
                <select
                  value={formState.preferredDataSource}
                  onChange={(event) => updateField("preferredDataSource", event.target.value as DataSourceType)}
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

            <FormTextareaField
              label="Business objective"
              value={formState.businessObjective}
              rows={3}
              placeholder="Describe the business problem and outcome this studio should solve"
              onChange={(businessObjective) => updateField("businessObjective", businessObjective)}
            />
            <FormTextareaField
              label="Target users and roles"
              value={formState.targetUsersRoles}
              rows={3}
              placeholder="List the users, approvers, and stakeholders that shape the experience"
              onChange={(targetUsersRoles) => updateField("targetUsersRoles", targetUsersRoles)}
            />
            <FormTextareaField
              label="Requirements"
              value={formState.requirementsText}
              rows={5}
              placeholder="Summarize the workflows, statuses, records, and must-have behaviors"
              onChange={(requirementsText) => updateField("requirementsText", requirementsText)}
            />
            <div className="grid gap-4 lg:grid-cols-2">
              <FormTextareaField
                label="Meeting notes"
                value={formState.meetingNotes}
                rows={4}
                placeholder="Capture stakeholder notes, assumptions, and current process pain points"
                onChange={(meetingNotes) => updateField("meetingNotes", meetingNotes)}
              />
              <FormTextareaField
                label="Integrations and dependencies"
                value={formState.integrationNeeds}
                rows={4}
                placeholder="Note ERP, API, approval, notification, or storage dependencies"
                onChange={(integrationNeeds) => updateField("integrationNeeds", integrationNeeds)}
              />
            </div>
            <FormTextareaField
              label="Desired output"
              value={formState.desiredOutputs}
              rows={3}
              placeholder="Describe what a useful scoping output should include"
              onChange={(desiredOutputs) => updateField("desiredOutputs", desiredOutputs)}
            />

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
          description="Review the generated scoping summary, recommended structure, and downstream delivery notes in one place."
          errorMessage={errorMessage}
          emptyMessage="Submit the input to generate a scoping summary for this studio."
        >
          {result ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/80">Summary</p>
                <p className="mt-2 text-sm text-foreground">{result.appSummary}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Recommended modules</p>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {result.recommendedModules.map((item) => (
                      <li key={item} className="list-inside list-disc">{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Data entities</p>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {result.dataEntities.map((item) => (
                      <li key={item} className="list-inside list-disc">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Risks and assumptions</p>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {result.risksAndAssumptions.map((item) => (
                      <li key={item} className="list-inside list-disc">{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">MVP plan</p>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {result.mvpPlan.map((item) => (
                      <li key={item} className="list-inside list-disc">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : null}
        </StudioOutputCard>
      </div>
    </PageContainer>
  );
}
