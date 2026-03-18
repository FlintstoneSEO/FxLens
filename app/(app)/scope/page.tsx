"use client";

import { useMemo, useState } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { FormInputField } from "@/components/workspace/form-input-field";
import { FormTextareaField } from "@/components/workspace/form-textarea-field";
import { OutputBlock } from "@/components/workspace/output-block";
import { StatusMessage } from "@/components/workspace/status-message";
import type { DataSourceType, ScopeRequest, ScopeResponse } from "@/lib/contracts/workspace";
import type { ValidationErrorPayload } from "@/lib/validation/workspace";

const initialFormState: ScopeRequest = {
  projectName: "",
  businessObjective: "",
  targetUsersRoles: "",
  requirementsText: "",
  meetingNotes: "",
  preferredDataSource: "dataverse",
  integrationNeeds: "",
  desiredOutputs: ""
};

const dataSourceOptions: Array<{ label: string; value: DataSourceType }> = [
  { label: "Dataverse", value: "dataverse" },
  { label: "SQL", value: "sql" },
  { label: "SharePoint", value: "sharepoint" },
  { label: "API", value: "api" },
  { label: "Mixed", value: "mixed" },
  { label: "Other", value: "other" }
];

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
    const validationError = error as ValidationErrorPayload;
    return validationError.error.message;
  }

  return "Unable to create a scope draft right now. Please try again.";
}

export default function ScopePage() {
  const [formState, setFormState] = useState<ScopeRequest>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [scopeResponse, setScopeResponse] = useState<ScopeResponse | null>(null);

  const isSubmitDisabled = useMemo(() => {
    return Object.entries(formState).some(([key, value]) => key !== "context" && value.trim().length === 0);
  }, [formState]);

  const updateField = <TKey extends keyof ScopeRequest>(field: TKey, value: ScopeRequest[TKey]) => {
    setFormState((current) => ({
      ...current,
      [field]: value
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/scope", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formState)
      });

      const data = (await response.json()) as ScopeResponse | ValidationErrorPayload;

      if (!response.ok) {
        throw data;
      }

      setScopeResponse(data as ScopeResponse);
    } catch (error) {
      setSubmitError(getValidationMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Scope Studio"
        description="Transform requirements into app structure recommendations including screens, entities, roles, SQL artifacts, and flows."
      />
      <SectionCard
        title="Scoping Workspace"
        description="Capture the business context and submit it to Scope Studio for architecture recommendations."
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormInputField
              label="Project Name"
              value={formState.projectName}
              placeholder="Field service modernization"
              onChange={(value) => updateField("projectName", value)}
            />
            <FormInputField
              label="Business Objective"
              value={formState.businessObjective}
              placeholder="Reduce manual intake and improve routing accuracy"
              onChange={(value) => updateField("businessObjective", value)}
            />
            <FormInputField
              label="Target Users & Roles"
              value={formState.targetUsersRoles}
              placeholder="Dispatchers, technicians, operations managers"
              onChange={(value) => updateField("targetUsersRoles", value)}
            />
            <FormTextareaField
              label="Requirements"
              rows={5}
              value={formState.requirementsText}
              placeholder="Describe the screens, workflows, approvals, and reporting needs."
              onChange={(value) => updateField("requirementsText", value)}
            />
            <FormTextareaField
              label="Meeting Notes"
              rows={5}
              value={formState.meetingNotes}
              placeholder="Paste discovery notes, user pain points, and assumptions."
              onChange={(value) => updateField("meetingNotes", value)}
            />
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Preferred Data Source</span>
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
            <FormTextareaField
              label="Integration Needs"
              rows={4}
              value={formState.integrationNeeds}
              placeholder="ERP sync, approval notifications, document storage, reporting feeds."
              onChange={(value) => updateField("integrationNeeds", value)}
            />
            <FormTextareaField
              label="Desired Outputs"
              rows={4}
              value={formState.desiredOutputs}
              placeholder="Recommended modules, entities, roles, SQL artifacts, and MVP plan."
              onChange={(value) => updateField("desiredOutputs", value)}
            />

            {submitError ? <StatusMessage tone="error" message={submitError} /> : null}

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={isSubmitDisabled || isSubmitting}>
                {isSubmitting ? "Generating scope draft..." : "Create Scope Draft"}
              </Button>
              <p className="text-sm text-muted-foreground">
                {isSubmitting ? "Submitting your requirements to the Scope API." : "All fields are required."}
              </p>
            </div>
          </form>

          <div className="space-y-4">
            <SectionCard
              title="Scope Draft Output"
              description={
                scopeResponse
                  ? `Latest draft generated at ${new Date(scopeResponse.generatedAt).toLocaleString()}.`
                  : "The response will be retained in state here for follow-up rendering tasks."
              }
              className="bg-background/40"
            >
              {scopeResponse ? (
                <div className="space-y-4">
                  <StatusMessage message={scopeResponse.appSummary} />
                  <OutputBlock title="Recommended Modules" items={scopeResponse.recommendedModules} />
                  <OutputBlock title="Data Entities" items={scopeResponse.dataEntities} />
                  <OutputBlock title="Risks & Assumptions" items={scopeResponse.risksAndAssumptions} />
                </div>
              ) : (
                <StatusMessage message="Submit the form to generate and retain a scope response." />
              )}
            </SectionCard>
          </div>
        </div>
      </SectionCard>
    </PageContainer>
  );
}
