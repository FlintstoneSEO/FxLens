"use client";

import React, { useMemo, useState } from "react";
import { ClipboardList, Flag, Loader2, ShieldAlert, Sparkles, Users } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { ScopeResultsPanel } from "@/components/workspace/scope-results-panel";
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

const sectionHintClassName = "text-xs uppercase tracking-[0.18em] text-muted-foreground";
const fieldClassName =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition placeholder:text-muted-foreground/70 focus-visible:ring-2 focus-visible:ring-ring";

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

    if (submitError) {
      setSubmitError(null);
    }
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
      setScopeResponse(null);
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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.9fr)]">
        <SectionCard
          title="Scoping Workspace"
          description="Capture the core product context, operational requirements, and delivery constraints before architecture generation."
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
                  {submitError ? (
                    <StatusMessage message={submitError} tone="error" />
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
        </SectionCard>

        <div className="space-y-6">
          <SectionCard
            title="What to include"
            description="Use this checklist to keep requirement intake detailed enough for downstream screen, role, and data recommendations."
          >
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="flex gap-3 rounded-lg border border-border/70 bg-background/40 p-3">
                <ClipboardList className="mt-0.5 h-4 w-4 text-foreground" />
                <div>
                  <p className="font-medium text-foreground">Business problem</p>
                  <p>State the current pain point, desired outcome, and what teams do today.</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-lg border border-border/70 bg-background/40 p-3">
                <Users className="mt-0.5 h-4 w-4 text-foreground" />
                <div>
                  <p className="font-medium text-foreground">Actors and permissions</p>
                  <p>Clarify who initiates work, who approves, and who only needs visibility.</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-lg border border-border/70 bg-background/40 p-3">
                <Flag className="mt-0.5 h-4 w-4 text-foreground" />
                <div>
                  <p className="font-medium text-foreground">Workflow milestones</p>
                  <p>Identify statuses, decisions, escalations, and any automation triggers.</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-lg border border-border/70 bg-background/40 p-3">
                <ShieldAlert className="mt-0.5 h-4 w-4 text-foreground" />
                <div>
                  <p className="font-medium text-foreground">Delivery guardrails</p>
                  <p>Note constraints around compliance, deadlines, integrations, and data sensitivity.</p>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Recommended source material"
            description="Optional inputs that typically improve scoping quality once upload support is added."
          >
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="rounded-lg border border-border/70 bg-background/40 px-3 py-2">Discovery notes, workshop outputs, or stakeholder interview summaries.</li>
              <li className="rounded-lg border border-border/70 bg-background/40 px-3 py-2">Existing SOPs, spreadsheets, forms, or screenshots of the current process.</li>
              <li className="rounded-lg border border-border/70 bg-background/40 px-3 py-2">Security, compliance, or reporting requirements that affect app design.</li>
            </ul>
          </SectionCard>
        </div>
      </div>

      <div className="mt-6">
        <SectionCard
          title="Scope results"
          description="Structured recommendations returned by the Scope API for the latest successful submission."
        >
          <ScopeResultsPanel result={scopeResponse} />
        </SectionCard>
      </div>
    </PageContainer>
  );
}
