"use client";

import { useMemo, useState } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { SeverityBadge } from "@/components/ui/severity-badge";
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

  const outputSections = useMemo(() => {
    if (!response) {
      return [] as Array<{ title: string; items: string[] }>;
    }

    return [
      { title: "Recommended Modules", items: response.recommendedModules },
      { title: "Screen List", items: response.suggestedScreens.map((screen) => screen.name) },
      { title: "Data Entities", items: response.dataEntities },
      { title: "Power Automate Suggestions", items: response.powerAutomateSuggestions },
      {
        title: "Component Opportunities",
        items: response.suggestedComponents.map((component) => component.name)
      },
      { title: "MVP Plan", items: response.mvpPlan }
    ];
  }, [response]);

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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Scope Studio Workspace"
        description="Capture project intent and generate a structured Power Apps solution blueprint with architecture-ready recommendations."
        actions={
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Generating..." : "Generate Scope Draft"}
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.02fr_1.18fr]">
        <SectionCard
          title="Requirement Intake"
          description="Provide core context for your app so FxLens can shape a practical architecture recommendation."
        >
          <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
            <FormInputField
              label="Project Name"
              value={formState.projectName}
              onChange={(value) => handleChange("projectName", value)}
            />
            <FormInputField
              label="Business Objective"
              value={formState.businessObjective}
              onChange={(value) => handleChange("businessObjective", value)}
            />
            <FormInputField
              label="Target Users / Roles"
              value={formState.targetUsersRoles}
              onChange={(value) => handleChange("targetUsersRoles", value)}
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
                <option value="dataverse">Dataverse</option>
                <option value="sql">SQL</option>
                <option value="sharepoint">SharePoint</option>
                <option value="api">API</option>
                <option value="mixed">Mixed</option>
                <option value="other">Other</option>
              </select>
            </label>

            <FormInputField
              label="Integration Needs"
              value={formState.integrationNeeds}
              onChange={(value) => handleChange("integrationNeeds", value)}
            />
            <FormInputField
              label="Desired Outputs"
              value={formState.desiredOutputs}
              onChange={(value) => handleChange("desiredOutputs", value)}
            />

            <div className="flex justify-end pt-2">
              <Button type="button" variant="secondary" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Running..." : "Run with Current Inputs"}
              </Button>
            </div>
          </form>
        </SectionCard>

        <SectionCard
          title="Structured Solution Output"
          description="Generated from the Scope API contract. Results stay mock-backed until backend + AI integration is enabled."
        >
          {error ? <StatusMessage tone="error" message={error} /> : null}

          {!response && !error ? (
            <StatusMessage tone="info" message="Generate a scope draft to view structured architecture output." />
          ) : null}

          {response ? (
            <div className="space-y-4">
              <OutputBlock title="App Summary" items={[response.appSummary]} />

              {outputSections.map((section) => (
                <OutputBlock key={section.title} title={section.title} items={section.items} />
              ))}

              <section className="space-y-3">
                <h3 className="text-sm font-semibold tracking-tight">Backend Recommendations</h3>
                {response.backendRecommendations.map((recommendation) => (
                  <BackendRecommendationCard key={recommendation.id} recommendation={recommendation} />
                ))}
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-semibold tracking-tight">SQL Artifact Suggestions</h3>
                {response.sqlArtifacts.map((artifact) => (
                  <SqlArtifactCard key={artifact.id} artifact={artifact} />
                ))}
              </section>

              <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="text-sm font-semibold tracking-tight">Risks and Assumptions</h3>
                  <SeverityBadge severity="medium" />
                </div>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {response.risksAndAssumptions.map((item) => (
                    <li key={item} className="list-inside list-disc">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </SectionCard>
      </div>
    </PageContainer>
  );
}
