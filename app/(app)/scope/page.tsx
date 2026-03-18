"use client";

import React, { FormEvent, useMemo, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { ScopeResultsPanel } from "@/components/workspace/scope-results-panel";
import { StatusMessage } from "@/components/workspace/status-message";
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

const fieldClassName =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring";

const sectionHintClassName = "text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground";

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
    setFormState((current) => ({
      ...current,
      [field]: value
    }));

    if (errorMessage) {
      setErrorMessage(null);
    }
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
      setErrorMessage(getValidationMessage(error));
      setResult(null);
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
            <section className="space-y-4 rounded-xl border border-border/70 bg-background/40 p-4">
              <div className="space-y-1">
                <p className={sectionHintClassName}>Project foundation</p>
                <h4 className="text-sm font-semibold">Context and goals</h4>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Project / app name</span>
                  <input
                    className={fieldClassName}
                    placeholder="e.g. Vendor onboarding portal"
                    value={formState.projectName}
                    onChange={(event) => updateField("projectName", event.target.value)}
                  />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Preferred data source</span>
                  <select
                    className={fieldClassName}
                    value={formState.preferredDataSource}
                    onChange={(event) => updateField("preferredDataSource", event.target.value as DataSourceType)}
                  >
                    {dataSourceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="block space-y-1.5 text-sm">
                <span className="font-medium">Business objective</span>
                <textarea
                  className={fieldClassName}
                  rows={4}
                  value={formState.businessObjective}
                  onChange={(event) => updateField("businessObjective", event.target.value)}
                  placeholder="Summarize the business problem, current workflow, and why this app is being proposed."
                />
              </label>
              <label className="block space-y-1.5 text-sm">
                <span className="font-medium">Desired outputs</span>
                <textarea
                  className={fieldClassName}
                  rows={4}
                  value={formState.desiredOutputs}
                  onChange={(event) => updateField("desiredOutputs", event.target.value)}
                  placeholder="List measurable outcomes, must-have capabilities, and what a successful launch should achieve."
                />
              </label>
            </section>

            <section className="space-y-4 rounded-xl border border-border/70 bg-background/40 p-4">
              <div className="space-y-1">
                <p className={sectionHintClassName}>Users and structure</p>
                <h4 className="text-sm font-semibold">Roles, actors, and entities</h4>
              </div>
              <label className="block space-y-1.5 text-sm">
                <span className="font-medium">Users / roles</span>
                <textarea
                  className={fieldClassName}
                  rows={4}
                  value={formState.targetUsersRoles}
                  onChange={(event) => updateField("targetUsersRoles", event.target.value)}
                  placeholder="Describe each user type, their responsibilities, and any permission differences."
                />
              </label>
              <label className="block space-y-1.5 text-sm">
                <span className="font-medium">Requirements and data</span>
                <textarea
                  className={fieldClassName}
                  rows={5}
                  value={formState.requirementsText}
                  onChange={(event) => updateField("requirementsText", event.target.value)}
                  placeholder="Outline the main records, relationships, documents, statuses, and important fields to track."
                />
              </label>
            </section>

            <section className="space-y-4 rounded-xl border border-border/70 bg-background/40 p-4">
              <div className="space-y-1">
                <p className={sectionHintClassName}>Execution model</p>
                <h4 className="text-sm font-semibold">Processes and constraints</h4>
              </div>
              <label className="block space-y-1.5 text-sm">
                <span className="font-medium">Meeting notes</span>
                <textarea
                  className={fieldClassName}
                  rows={5}
                  value={formState.meetingNotes}
                  onChange={(event) => updateField("meetingNotes", event.target.value)}
                  placeholder="Map the major journeys, approvals, automations, notifications, and exceptions the app should support."
                />
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Integrations or dependencies</span>
                  <textarea
                    className={fieldClassName}
                    rows={4}
                    value={formState.integrationNeeds}
                    onChange={(event) => updateField("integrationNeeds", event.target.value)}
                    placeholder="ERP, CRM, identity providers, spreadsheets, APIs, or manual handoffs."
                  />
                </label>
                <div className="space-y-1.5 text-sm">
                  <span className="font-medium">Submission status</span>
                  {errorMessage ? (
                    <StatusMessage message={errorMessage} tone="error" />
                  ) : (
                    <StatusMessage message="Submit to generate structured screens, entities, roles, flows, and rollout recommendations." />
                  )}
                </div>
              </div>
            </section>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/80 bg-background/30 px-4 py-3">
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                {isSubmitting ? (
                  <Loader2 className="mt-0.5 h-4 w-4 animate-spin text-primary" aria-hidden="true" />
                ) : (
                  <Sparkles className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
                )}
                <p>
                  {isSubmitting
                    ? "Generating your scope draft from the current inputs."
                    : "Scope Studio submits directly to the existing API route and renders the latest response below."}
                </p>
              </div>
              <Button type="submit" disabled={isSubmitting || isSubmitDisabled}>
                {isSubmitting ? "Generating..." : "Generate Scope"}
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

      <div className="mt-6">
        <SectionCard
          title="Scope results"
          description="Structured recommendations returned by the Scope API for the latest successful submission."
        >
          <ScopeResultsPanel result={result} />
        </SectionCard>
      </div>
    </PageContainer>
  );
}
