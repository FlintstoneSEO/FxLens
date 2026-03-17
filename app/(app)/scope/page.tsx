"use client";

import { useState } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { BackendRecommendationCard, SqlArtifactCard } from "@/components/workspace/result-cards";
import { FormInputField } from "@/components/workspace/form-input-field";
import { FormTextareaField } from "@/components/workspace/form-textarea-field";
import { OutputBlock } from "@/components/workspace/output-block";
import { StatusMessage } from "@/components/workspace/status-message";
import type { DataSourceType, ScopeRequest, ScopeResponse } from "@/lib/contracts/workspace";

type ScopeFormState = {
  projectName: string;
  businessObjective: string;
  targetUsersRoles: string;
  requirementsText: string;
  meetingNotes: string;
  preferredDataSource: DataSourceType;
  integrationNeeds: string;
  desiredOutputs: string;
};

const initialFormState: ScopeFormState = {
  projectName: "Field Service Request Portal",
  businessObjective: "Reduce service resolution time and improve approval transparency.",
  targetUsersRoles: "Technicians, Service Managers, Regional Ops, Support Admin",
  requirementsText:
    "Capture requests, route approvals, track SLA status, and provide role-aware dashboards.",
  meetingNotes:
    "Stakeholders need mobile-first intake, audit visibility, and clear escalation pathways.",
  preferredDataSource: "mixed",
  integrationNeeds: "SAP order sync, Teams alerts, SharePoint attachments",
  desiredOutputs: "Architecture brief, screen map, data model, automation recommendations"
};

export default function ScopePage() {
  const [formState, setFormState] = useState<ScopeFormState>(initialFormState);
  const [response, setResponse] = useState<ScopeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = <K extends keyof ScopeFormState>(key: K, value: ScopeFormState[K]) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    const payload: ScopeRequest = {
      ...formState,
      context: {
        workspaceId: "workspace-demo",
        correlationId: crypto.randomUUID()
      }
    };

    try {
      const result = await fetch("/api/scope", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!result.ok) {
        throw new Error("Unable to generate scope draft.");
      }

      const data = (await result.json()) as ScopeResponse;
      setResponse(data);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unexpected error while generating scope.");
      setResponse(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Scope Studio Workspace"
        description="Capture project context and generate a structured Power Apps scope draft with architecture-ready recommendations."
        actions={
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Generating..." : "Generate Scope Draft"}
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.02fr_1.18fr]">
        <SectionCard
          title="Input Form"
          description="Provide project details to generate a complete scope draft from /api/scope."
        >
          <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
            <FormInputField
              label="Project Name"
              value={formState.projectName}
              onChange={(value) => handleChange("projectName", value)}
            />

            <FormTextareaField
              label="Business Objective"
              value={formState.businessObjective}
              onChange={(value) => handleChange("businessObjective", value)}
              rows={4}
            />

            <FormTextareaField
              label="Target Users / Roles"
              value={formState.targetUsersRoles}
              onChange={(value) => handleChange("targetUsersRoles", value)}
              rows={3}
            />

            <FormTextareaField
              label="Requirements Text"
              value={formState.requirementsText}
              onChange={(value) => handleChange("requirementsText", value)}
              rows={5}
            />

            <FormTextareaField
              label="Meeting Notes"
              value={formState.meetingNotes}
              onChange={(value) => handleChange("meetingNotes", value)}
              rows={5}
            />

            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Preferred Data Source</span>
              <select
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                value={formState.preferredDataSource}
                onChange={(event) => handleChange("preferredDataSource", event.target.value as DataSourceType)}
              >
                <option value="dataverse">dataverse</option>
                <option value="sql">sql</option>
                <option value="sharepoint">sharepoint</option>
                <option value="api">api</option>
                <option value="mixed">mixed</option>
                <option value="other">other</option>
              </select>
            </label>

            <FormTextareaField
              label="Integration Needs"
              value={formState.integrationNeeds}
              onChange={(value) => handleChange("integrationNeeds", value)}
              rows={4}
            />

            <FormTextareaField
              label="Desired Outputs"
              value={formState.desiredOutputs}
              onChange={(value) => handleChange("desiredOutputs", value)}
              rows={4}
            />

            <div className="pt-1">
              <Button type="button" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Generating..." : "Generate Scope Draft"}
              </Button>
            </div>
          </form>
        </SectionCard>

        <SectionCard
          title="Output Panel"
          description="Structured output returned by /api/scope (OpenAI response or fallback mock)."
        >
          {isLoading ? <StatusMessage tone="info" message="Generating scope draft..." /> : null}
          {error ? <StatusMessage tone="error" message={error} /> : null}

          {!isLoading && !error && !response ? (
            <StatusMessage tone="info" message="Submit the form to generate your scope draft." />
          ) : null}

          {response ? (
            <div className="space-y-4">
              <OutputBlock title="App Summary" items={[response.appSummary]} />
              <OutputBlock title="Recommended Modules" items={response.recommendedModules} />
              <OutputBlock
                title="Suggested Screens"
                items={response.suggestedScreens.map((screen) => `${screen.name}: ${screen.purpose}`)}
              />
              <OutputBlock title="Data Entities" items={response.dataEntities} />

              <section className="space-y-3">
                <h3 className="text-sm font-semibold tracking-tight">Backend Recommendations</h3>
                {response.backendRecommendations.length === 0 ? (
                  <StatusMessage tone="info" message="No backend recommendations returned." />
                ) : (
                  response.backendRecommendations.map((recommendation) => (
                    <BackendRecommendationCard key={recommendation.id} recommendation={recommendation} />
                  ))
                )}
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold tracking-tight">SQL Artifacts</h3>
                {response.sqlArtifacts.length === 0 ? (
                  <StatusMessage tone="info" message="No SQL artifacts returned." />
                ) : (
                  response.sqlArtifacts.map((artifact) => <SqlArtifactCard key={artifact.id} artifact={artifact} />)
                )}
              </section>

              <OutputBlock title="Risks and Assumptions" items={response.risksAndAssumptions} />
              <OutputBlock title="MVP Plan" items={response.mvpPlan} />
            </div>
          ) : null}
        </SectionCard>
      </div>
    </PageContainer>
  );
}
