"use client";

import { useMemo, useState } from "react";
import { AlertCircle, Loader2, Sparkles } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatusMessage } from "@/components/workspace/status-message";
import { FormInputField } from "@/components/workspace/form-input-field";
import { FormTextareaField } from "@/components/workspace/form-textarea-field";
import {
  BackendRecommendationCard,
  SqlArtifactCard,
  SuggestedComponentCard,
  SuggestedScreenCard
} from "@/components/workspace/result-cards";
import { OutputBlock } from "@/components/workspace/output-block";
import type { ScopeRequest, ScopeResponse, DataSourceType } from "@/lib/contracts/workspace";

type ScopeFormState = ScopeRequest;

type ApiErrorShape = {
  error?: {
    message?: string;
    issues?: Array<{
      path?: string;
      message?: string;
    }>;
  };
};

const initialFormState: ScopeFormState = {
  projectName: "Field Service Command Center",
  businessObjective: "Reduce intake-to-dispatch time and improve SLA compliance visibility.",
  targetUsersRoles: "Dispatch coordinators, field technicians, operations managers, and approvers.",
  requirementsText:
    "Capture requests, triage priority, assign technicians, track approvals, manage status updates, and expose dashboards for service throughput.",
  meetingNotes:
    "Need mobile-friendly technician experience, regional approval routing, attachment support, and reporting that combines Dataverse transactions with SQL analytics.",
  preferredDataSource: "mixed",
  integrationNeeds: "Microsoft Teams notifications, ERP work order sync, and nightly reporting export.",
  desiredOutputs: "Modules, screens, entities, backend guidance, automation ideas, and MVP plan."
};

const dataSourceOptions: Array<{ value: DataSourceType; label: string }> = [
  { value: "dataverse", label: "Dataverse" },
  { value: "sql", label: "SQL" },
  { value: "sharepoint", label: "SharePoint" },
  { value: "api", label: "API" },
  { value: "mixed", label: "Mixed" },
  { value: "other", label: "Other" }
];

function isScopeResponse(value: unknown): value is ScopeResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ScopeResponse>;

  return (
    candidate.area === "scope_studio" &&
    typeof candidate.generatedAt === "string" &&
    typeof candidate.appSummary === "string" &&
    Array.isArray(candidate.recommendedModules) &&
    Array.isArray(candidate.suggestedScreens) &&
    Array.isArray(candidate.dataEntities) &&
    Array.isArray(candidate.backendRecommendations) &&
    Array.isArray(candidate.sqlArtifacts) &&
    Array.isArray(candidate.powerAutomateSuggestions) &&
    Array.isArray(candidate.suggestedComponents) &&
    Array.isArray(candidate.risksAndAssumptions) &&
    Array.isArray(candidate.mvpPlan)
  );
}

function getErrorMessage(payload: ApiErrorShape | null, status: number): string {
  const message = payload?.error?.message;
  const issueMessage = payload?.error?.issues?.[0]?.message;

  if (message && issueMessage) {
    return `${message} ${issueMessage}`;
  }

  if (message) {
    return message;
  }

  if (status >= 500) {
    return "Scope generation is temporarily unavailable. Please try again in a moment.";
  }

  return "We could not generate a scope from that submission. Please review the form and try again.";
}

export default function ScopePage() {
  const [formState, setFormState] = useState<ScopeFormState>(initialFormState);
  const [result, setResult] = useState<ScopeResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const generatedAtLabel = useMemo(() => {
    if (!result?.generatedAt) {
      return null;
    }

    const parsedDate = new Date(result.generatedAt);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Generated just now";
    }

    return `Generated ${parsedDate.toLocaleString()}`;
  }, [result]);

  const updateField = <T extends keyof ScopeFormState>(field: T, value: ScopeFormState[T]) => {
    setFormState((current) => ({
      ...current,
      [field]: value
    }));

    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/scope", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formState)
      });

      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        setErrorMessage(getErrorMessage((payload as ApiErrorShape | null) ?? null, response.status));
        return;
      }

      if (!isScopeResponse(payload)) {
        setErrorMessage(
          "Scope Studio returned an unexpected response. Your inputs are still here, so you can adjust them and try again."
        );
        return;
      }

      setResult(payload);
    } catch {
      setErrorMessage("Network connection lost while generating scope. Please retry when your connection is stable.");
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <SectionCard
          title="Scoping Workspace"
          description="Capture the project context, submit to Scope Studio, and review a structured blueprint without leaving the page."
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <FormInputField
                label="Project name"
                value={formState.projectName}
                placeholder="Customer Support Hub"
                onChange={(value) => updateField("projectName", value)}
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
              rows={3}
              value={formState.businessObjective}
              placeholder="Describe the core business outcome this app must support."
              onChange={(value) => updateField("businessObjective", value)}
            />
            <FormTextareaField
              label="Target users and roles"
              rows={3}
              value={formState.targetUsersRoles}
              placeholder="Who will use the app and what do they need to do?"
              onChange={(value) => updateField("targetUsersRoles", value)}
            />
            <FormTextareaField
              label="Requirements"
              rows={5}
              value={formState.requirementsText}
              placeholder="Paste the core requirements, workflows, rules, and reporting expectations."
              onChange={(value) => updateField("requirementsText", value)}
            />
            <FormTextareaField
              label="Meeting notes"
              rows={5}
              value={formState.meetingNotes}
              placeholder="Capture stakeholder notes, assumptions, risks, and open questions."
              onChange={(value) => updateField("meetingNotes", value)}
            />
            <FormTextareaField
              label="Integration needs"
              rows={3}
              value={formState.integrationNeeds}
              placeholder="List external systems, notifications, automation, or data movement needs."
              onChange={(value) => updateField("integrationNeeds", value)}
            />
            <FormTextareaField
              label="Desired outputs"
              rows={3}
              value={formState.desiredOutputs}
              placeholder="What should Scope Studio return for your team?"
              onChange={(value) => updateField("desiredOutputs", value)}
            />

            {errorMessage ? (
              <StatusMessage message={errorMessage} tone="error" />
            ) : (
              <StatusMessage message="Submit requirements to generate modules, screens, automation ideas, backend guidance, and MVP planning notes." />
            )}

            <div className="flex flex-col gap-3 rounded-xl border border-border/70 bg-background/60 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                {isSubmitting ? (
                  <Loader2 className="mt-0.5 h-4 w-4 animate-spin text-primary" aria-hidden="true" />
                ) : (
                  <Sparkles className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
                )}
                <div>
                  <p className="font-medium text-foreground">
                    {isSubmitting ? "Generating scope draft..." : "Ready to generate"}
                  </p>
                  <p>
                    {isSubmitting
                      ? "We are validating the request and assembling the architecture recommendation."
                      : "Your form stays editable after any error so you can refine and resubmit quickly."}
                  </p>
                </div>
              </div>
              <Button type="submit" className="min-w-44 gap-2" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                {isSubmitting ? "Generating..." : "Create Scope Draft"}
              </Button>
            </div>
          </form>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard
            title="Generated Scope"
            description={generatedAtLabel ?? "Your latest valid scope draft will appear here after submission."}
          >
            {result ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">App Summary</p>
                  <p className="mt-2 text-sm text-foreground">{result.appSummary}</p>
                </div>
                <OutputBlock title="Recommended Modules" items={result.recommendedModules} />
                <OutputBlock title="Data Entities" items={result.dataEntities} />
                <OutputBlock title="Power Automate Suggestions" items={result.powerAutomateSuggestions} />
                <OutputBlock title="Risks and Assumptions" items={result.risksAndAssumptions} />
                <OutputBlock title="MVP Plan" items={result.mvpPlan} />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-background/50 p-6 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
                  <p>
                    Submit the form to preview a scope draft with modules, entities, automations, and implementation guidance.
                  </p>
                </div>
              </div>
            )}
          </SectionCard>

          {result ? (
            <>
              <SectionCard title="Suggested Screens" description="Recommended experiences and the jobs each screen should support.">
                <div className="grid gap-4">
                  {result.suggestedScreens.map((screen) => (
                    <SuggestedScreenCard key={screen.id} screen={screen} />
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Suggested Components" description="Reusable UI patterns to keep the app shell consistent.">
                <div className="grid gap-4">
                  {result.suggestedComponents.map((component) => (
                    <SuggestedComponentCard key={component.id} component={component} />
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="Backend Recommendations" description="Architecture and persistence guidance aligned to the scope output.">
                <div className="grid gap-4">
                  {result.backendRecommendations.map((recommendation) => (
                    <BackendRecommendationCard key={recommendation.id} recommendation={recommendation} />
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="SQL Artifacts" description="Potential SQL objects to support reporting and process orchestration.">
                <div className="grid gap-4">
                  {result.sqlArtifacts.map((artifact) => (
                    <SqlArtifactCard key={artifact.id} artifact={artifact} />
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
