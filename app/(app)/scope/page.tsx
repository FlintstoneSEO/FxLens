"use client";

import React, { FormEvent, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, Loader2, Sparkles } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { ScopeResultsPanel } from "@/components/workspace/scope-results-panel";
import { RunExportActions } from "@/components/workspace/run-export-actions";
import { StatusMessage } from "@/components/workspace/status-message";
import { STUDIO_RUN_LABEL, STUDIO_RUNNING_LABEL, StudioInputCard, StudioOutputCard } from "@/components/workspace/studio-shell";
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
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-70";

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
        <p className={sectionHintClassName}>{eyebrow}</p>
        <div>
          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function FieldShell({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {children}
    </label>
  );
}

export default function ScopePage() {
  const [formState, setFormState] = useState<ScopeRequest>(initialFormState);
  const [result, setResult] = useState<ScopeResponse | null>(null);
  const [submittedRequest, setSubmittedRequest] = useState<ScopeRequest | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSubmitDisabled = useMemo(
    () =>
      isSubmitting ||
      Object.entries(formState).some(([key, value]) => key !== "context" && String(value).trim().length === 0),
    [formState, isSubmitting]
  );

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

      setSubmittedRequest(formState);
      setResult(payload as ScopeResponse);
    } catch (error) {
      setErrorMessage(getValidationMessage(error));
      setResult(null);
      setSubmittedRequest(null);
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)]">
        <StudioInputCard
          title="Scope brief"
          description="Define the project context, operating model, and expected outcomes. Every field is editable before and after generation."
          accent="input"
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
                <p>
                  Use this form to prepare a complete scoping brief. The output panel on the right organizes the returned
                  recommendation into implementation-ready sections.
                </p>
              </div>
            </div>

            <FormSection
              eyebrow="Project foundation"
              title="Context and goals"
              description="Anchor the request with the core business goal and the expected scope of the solution."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <FieldShell label="Project / app name" hint="Use the working title stakeholders recognize.">
                  <input
                    className={fieldClassName}
                    placeholder="e.g. Vendor onboarding portal"
                    value={formState.projectName}
                    onChange={(event) => updateField("projectName", event.target.value)}
                    disabled={isSubmitting}
                  />
                </FieldShell>
                <FieldShell label="Preferred data source" hint="This guides the recommendations but does not change the API contract.">
                  <select
                    className={fieldClassName}
                    value={formState.preferredDataSource}
                    onChange={(event) => updateField("preferredDataSource", event.target.value as DataSourceType)}
                    disabled={isSubmitting}
                  >
                    {dataSourceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </FieldShell>
              </div>
              <FieldShell
                label="Business objective"
                hint="Summarize the business problem, urgency, and what success should look like."
              >
                <textarea
                  className={fieldClassName}
                  rows={4}
                  value={formState.businessObjective}
                  onChange={(event) => updateField("businessObjective", event.target.value)}
                  placeholder="Summarize the business problem, current workflow, and why this app is being proposed."
                  disabled={isSubmitting}
                />
              </FieldShell>
              <FieldShell label="Desired outputs" hint="Tell Scope Studio what you expect back from this scoping pass.">
                <textarea
                  className={fieldClassName}
                  rows={4}
                  value={formState.desiredOutputs}
                  onChange={(event) => updateField("desiredOutputs", event.target.value)}
                  placeholder="List measurable outcomes, must-have capabilities, and what a successful launch should achieve."
                  disabled={isSubmitting}
                />
              </FieldShell>
            </FormSection>

            <FormSection
              eyebrow="Users and structure"
              title="Roles, actors, and data"
              description="Describe who the solution serves and the information model it needs to support."
            >
              <FieldShell label="Users / roles" hint="Include primary users, reviewers, approvers, and any permission differences.">
                <textarea
                  className={fieldClassName}
                  rows={4}
                  value={formState.targetUsersRoles}
                  onChange={(event) => updateField("targetUsersRoles", event.target.value)}
                  placeholder="Describe each user type, their responsibilities, and any permission differences."
                  disabled={isSubmitting}
                />
              </FieldShell>
              <FieldShell label="Requirements and data" hint="Focus on records, relationships, statuses, documents, and business rules.">
                <textarea
                  className={fieldClassName}
                  rows={5}
                  value={formState.requirementsText}
                  onChange={(event) => updateField("requirementsText", event.target.value)}
                  placeholder="Outline the main records, relationships, documents, statuses, and important fields to track."
                  disabled={isSubmitting}
                />
              </FieldShell>
            </FormSection>

            <FormSection
              eyebrow="Execution model"
              title="Processes and dependencies"
              description="Capture the real-world operating constraints, automation opportunities, and handoffs the solution must cover."
            >
              <FieldShell label="Meeting notes" hint="Capture stakeholder context, journey notes, exceptions, and rollout constraints.">
                <textarea
                  className={fieldClassName}
                  rows={5}
                  value={formState.meetingNotes}
                  onChange={(event) => updateField("meetingNotes", event.target.value)}
                  placeholder="Map the major journeys, approvals, automations, notifications, and exceptions the app should support."
                  disabled={isSubmitting}
                />
              </FieldShell>
              <FieldShell label="Integrations or dependencies" hint="List systems, APIs, storage, notifications, or manual handoffs that matter.">
                <textarea
                  className={fieldClassName}
                  rows={4}
                  value={formState.integrationNeeds}
                  onChange={(event) => updateField("integrationNeeds", event.target.value)}
                  placeholder="ERP, CRM, identity providers, spreadsheets, APIs, or manual handoffs."
                  disabled={isSubmitting}
                />
              </FieldShell>
            </FormSection>

            <div className="space-y-3 rounded-2xl border border-border/80 bg-background/40 p-4">
              <StatusMessage
                tone={errorMessage ? "error" : isSubmitting ? "loading" : result ? "success" : "info"}
                label={errorMessage ? "Run failed" : isSubmitting ? "Run in progress" : result ? "Latest run" : "Ready to run"}
                message={
                  errorMessage
                    ? errorMessage
                    : isSubmitting
                      ? "Running the latest request. Results will appear here when processing finishes."
                      : result
                        ? "The latest successful response is loaded in the results panel. You can update the form and regenerate at any time."
                        : "Submit to generate structured screens, entities, roles, flows, and rollout recommendations."
                }
              />

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-card/70 px-4 py-3">
                <div className="flex items-start gap-3 text-sm text-muted-foreground">
                  {isSubmitting ? (
                    <Loader2 className="mt-0.5 h-4 w-4 animate-spin text-primary" aria-hidden="true" />
                  ) : result ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" aria-hidden="true" />
                  ) : (
                    <AlertCircle className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
                  )}
                  <p>
                    {isSubmitting
                      ? "We are validating the submission and preparing the structured output."
                      : result
                        ? "Results stay visible so you can compare, refine inputs, and resubmit without losing context."
                        : "Complete each section to create a polished scope draft for the next stakeholder review."}
                  </p>
                </div>
                <Button type="submit" disabled={isSubmitDisabled} className="min-w-40">
                  {isSubmitting ? STUDIO_RUNNING_LABEL : STUDIO_RUN_LABEL}
                </Button>
              </div>
            </div>
          </form>
        </StudioInputCard>

        <StudioOutputCard
          title="Structured output"
          description="Review the generated scoping summary, recommended structure, and downstream delivery notes in clearly separated result sections."
          errorMessage={errorMessage}
          emptyMessage="Submit the scope brief to generate a structured scoping summary for this studio."
          accent="output"
          generatedAtLabel={generatedAtLabel}
          isLoading={isSubmitting}
        >
          {result && submittedRequest ? (
            <RunExportActions
              runType="scope_studio"
              input={submittedRequest}
              output={result}
              generatedAt={result.generatedAt}
              fileName={`${submittedRequest.projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "scope-run"}-scope-run`}
            />
          ) : null}
          <ScopeResultsPanel result={result} isLoading={isSubmitting} />
        </StudioOutputCard>
      </div>
    </PageContainer>
  );
}
