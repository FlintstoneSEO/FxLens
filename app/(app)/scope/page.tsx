"use client";

import { useMemo, useState } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { FormInputField } from "@/components/workspace/form-input-field";
import { FormTextareaField } from "@/components/workspace/form-textarea-field";
import { ScopeResultsPanel } from "@/components/workspace/scope-results-panel";
import { StatusMessage } from "@/components/workspace/status-message";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import type { ScopeRequest, ScopeResponse } from "@/lib/contracts/workspace";

const initialForm: ScopeRequest = {
  projectName: "",
  businessObjective: "",
  targetUsersRoles: "",
  requirementsText: "",
  meetingNotes: "",
  preferredDataSource: "mixed",
  integrationNeeds: "",
  desiredOutputs: "Screens, data entities, automations, and implementation recommendations"
};

export default function ScopePage() {
  const [form, setForm] = useState<ScopeRequest>(initialForm);
  const [result, setResult] = useState<ScopeResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return [form.projectName, form.businessObjective, form.targetUsersRoles, form.requirementsText].every(
      (value) => value.trim().length > 0
    );
  }, [form]);

  const updateField = <K extends keyof ScopeRequest>(field: K, value: ScopeRequest[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      setError("Complete the project basics, roles, and requirements before generating scope results.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/scope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (!response.ok) {
        throw new Error("Scope generation failed. Please review the inputs and try again.");
      }

      const payload = (await response.json()) as ScopeResponse;
      setResult(payload);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to generate scope results right now.");
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
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <SectionCard
          title="Scope inputs"
          description="Capture the project context on the left, then review the structured scope output in the results panel."
          className="h-full"
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <FormInputField
              label="Project name"
              value={form.projectName}
              placeholder="Claims triage workspace"
              onChange={(value) => updateField("projectName", value)}
            />
            <FormInputField
              label="Business objective"
              value={form.businessObjective}
              placeholder="Reduce intake time and improve approval visibility"
              onChange={(value) => updateField("businessObjective", value)}
            />
            <FormTextareaField
              label="Target users and roles"
              value={form.targetUsersRoles}
              placeholder="Agents, supervisors, approvers, operations leads"
              rows={3}
              onChange={(value) => updateField("targetUsersRoles", value)}
            />
            <FormTextareaField
              label="Requirements"
              value={form.requirementsText}
              placeholder="Describe the core workflows, screens, and reporting needs."
              rows={6}
              onChange={(value) => updateField("requirementsText", value)}
            />
            <FormTextareaField
              label="Meeting notes"
              value={form.meetingNotes}
              placeholder="Optional discovery notes, assumptions, or stakeholder feedback."
              rows={4}
              onChange={(value) => updateField("meetingNotes", value)}
            />
            <FormInputField
              label="Preferred data source"
              value={form.preferredDataSource}
              placeholder="mixed"
              onChange={(value) => updateField("preferredDataSource", value as ScopeRequest["preferredDataSource"])}
            />
            <FormTextareaField
              label="Integration needs"
              value={form.integrationNeeds}
              placeholder="ERP sync, email notifications, reporting warehouse"
              rows={3}
              onChange={(value) => updateField("integrationNeeds", value)}
            />
            <FormTextareaField
              label="Desired outputs"
              value={form.desiredOutputs}
              rows={3}
              onChange={(value) => updateField("desiredOutputs", value)}
            />
            {error ? <StatusMessage message={error} tone="error" /> : null}
            <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-4">
              <p className="text-xs text-muted-foreground">Required: project name, objective, roles, and requirements.</p>
              <Button type="submit" disabled={isSubmitting || !canSubmit}>
                {isSubmitting ? "Generating scope…" : "Generate scope"}
              </Button>
            </div>
          </form>
        </SectionCard>

        <SectionCard
          title="Scope results"
          description="Structured output is grouped into the key planning areas surfaced by the Scope API."
          className="h-full"
        >
          <ScopeResultsPanel result={result} />
        </SectionCard>
      </div>
    </PageContainer>
  );
}
