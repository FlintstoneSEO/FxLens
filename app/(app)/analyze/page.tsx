"use client";

import { useMemo, useState } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { CodePanel } from "@/components/ui/code-panel";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { RecommendationCard } from "@/components/workspace/result-cards";
import { FormInputField } from "@/components/workspace/form-input-field";
import { FormTextareaField } from "@/components/workspace/form-textarea-field";
import { OutputBlock } from "@/components/workspace/output-block";
import { StatusMessage } from "@/components/workspace/status-message";
import type { AnalyzeMode, AnalyzeRequest, AnalyzeResponse, DataSourceType } from "@/lib/contracts/workspace";
import { cn } from "@/lib/utils";

type AnalyzeTab = "formula" | "screen" | "component" | "performance";

type FieldConfig = {
  key: string;
  label: string;
  placeholder: string;
  multiline?: boolean;
};

type ScoreChips = {
  performance: number;
  maintainability: number;
};

const tabs: ReadonlyArray<{ key: AnalyzeTab; label: string; subtitle: string }> = [
  {
    key: "formula",
    label: "Formula Analyzer",
    subtitle: "Inspect Power Fx formulas for correctness and performance"
  },
  {
    key: "screen",
    label: "Screen Analyzer",
    subtitle: "Assess screen structure, data loading, and maintainability"
  },
  {
    key: "component",
    label: "Component Analyzer",
    subtitle: "Review component contracts and rendering behavior"
  },
  {
    key: "performance",
    label: "Performance Advisor",
    subtitle: "Recommend architecture-level optimization strategies"
  }
];

const modeByTab: Record<AnalyzeTab, AnalyzeMode> = {
  formula: "formula_analyzer",
  screen: "screen_analyzer",
  component: "component_analyzer",
  performance: "performance_advisor"
};

const fieldConfigByTab: Record<AnalyzeTab, FieldConfig[]> = {
  formula: [
    { key: "formulaName", label: "Formula Name", placeholder: "e.g. EvaluateEscalationFlag" },
    {
      key: "formulaPurpose",
      label: "Formula Purpose",
      placeholder: "Determine whether a request should be escalated"
    },
    { key: "dataSource", label: "Data Source", placeholder: "Requests" },
    { key: "screenContext", label: "Screen Context", placeholder: "Manager Review" },
    {
      key: "symptoms",
      label: "Symptoms",
      placeholder: "Slow control updates and inconsistent behavior on large datasets",
      multiline: true
    },
    {
      key: "inputPayload",
      label: "Formula Input",
      placeholder: "Paste the Power Fx formula to analyze...",
      multiline: true
    }
  ],
  screen: [
    { key: "screenName", label: "Screen Name", placeholder: "e.g. Manager Review" },
    {
      key: "screenPurpose",
      label: "Screen Purpose",
      placeholder: "Review requests and approve or reject with notes"
    },
    { key: "dataSource", label: "Data Source", placeholder: "Dataverse: Requests, Approvals, Users" },
    {
      key: "symptoms",
      label: "Symptoms",
      placeholder: "Slow initial load, delayed gallery updates",
      multiline: true
    },
    {
      key: "inputPayload",
      label: "YAML or Screen Structure Input",
      placeholder: "Paste screen layout structure, container tree, and key controls...",
      multiline: true
    },
    {
      key: "relatedFormulas",
      label: "Related Formulas",
      placeholder: "Paste formulas used in gallery items, actions, and screen events...",
      multiline: true
    }
  ],
  component: [
    { key: "componentName", label: "Component Name", placeholder: "e.g. Approval Status Card" },
    {
      key: "componentPurpose",
      label: "Component Purpose",
      placeholder: "Display request status and escalation actions"
    },
    {
      key: "inputsOutputs",
      label: "Inputs / Outputs",
      placeholder: "Inputs: Status, SLA; Outputs: OnEscalate(), OnOpenDetails()"
    },
    {
      key: "symptoms",
      label: "Symptoms",
      placeholder: "Inconsistent rendering, heavy formula branches",
      multiline: true
    },
    {
      key: "inputPayload",
      label: "Component Logic",
      placeholder: "Paste key formulas and logic used inside the component...",
      multiline: true
    }
  ],
  performance: [
    { key: "appScenario", label: "App Scenario", placeholder: "Field operations request lifecycle management" },
    { key: "dataSourceMix", label: "Data Source Mix", placeholder: "Dataverse + SQL + SharePoint attachments" },
    { key: "screenCount", label: "Screen Count", placeholder: "18" },
    {
      key: "symptoms",
      label: "Performance Symptoms",
      placeholder: "Intermittent slow loads and delayed list interactions during peak hours",
      multiline: true
    },
    {
      key: "inputPayload",
      label: "Current Architecture Notes",
      placeholder: "Monolithic screen logic, mixed data shaping in controls, limited component reuse",
      multiline: true
    }
  ]
};

const initialValues: Record<AnalyzeTab, Record<string, string>> = {
  formula: {
    formulaName: "EvaluateEscalationFlag",
    formulaPurpose: "Determine whether a request should be escalated",
    dataSource: "Requests",
    screenContext: "Manager Review",
    symptoms: "Slow control updates and inconsistent behavior on large datasets",
    inputPayload:
      'If(LookUp(Requests, RequestId = varRequestId).Priority = "High" && LookUp(Requests, RequestId = varRequestId).Status <> "Closed", true, false)'
  },
  screen: {
    screenName: "Manager Review",
    screenPurpose: "Review requests and approve or reject with notes",
    dataSource: "Dataverse: Requests, Approvals, Users",
    symptoms: "Slow initial load, delayed gallery updates",
    inputPayload: "screen:\n  containers:\n    - header\n    - requestGallery\n    - detailsPanel",
    relatedFormulas: 'Gallery.Items = Filter(Requests, Status <> "Closed")'
  },
  component: {
    componentName: "Approval Status Card",
    componentPurpose: "Display request status and escalation actions",
    inputsOutputs: "Inputs: Status, SLA; Outputs: OnEscalate(), OnOpenDetails()",
    symptoms: "Inconsistent rendering, heavy formula branches",
    inputPayload: 'If(Status = "Escalated", Color.Red, If(Status = "Open", Color.Orange, Color.Green))'
  },
  performance: {
    appScenario: "Field operations request lifecycle management",
    dataSourceMix: "Dataverse + SQL + SharePoint attachments",
    screenCount: "18",
    symptoms: "Intermittent slow loads and delayed list interactions during peak hours",
    inputPayload: "Monolithic screen logic, mixed data shaping in controls, limited component reuse"
  }
};

const scoreChipsByTab: Partial<Record<AnalyzeTab, ScoreChips>> = {
  screen: { performance: 71, maintainability: 68 },
  performance: { performance: 64, maintainability: 66 }
};

const dataSourceOptions: readonly DataSourceType[] = ["dataverse", "sql", "sharepoint", "api", "mixed", "other"];

function toDataSourceType(value: string): DataSourceType {
  const normalized = value.toLowerCase().trim();
  return dataSourceOptions.find((option) => option === normalized) ?? "other";
}

function createAnalyzeRequest(activeTab: AnalyzeTab, valuesByTab: Record<AnalyzeTab, Record<string, string>>): AnalyzeRequest {
  const activeInputs = valuesByTab[activeTab];

  return {
    mode: modeByTab[activeTab],
    artifactName: activeInputs.formulaName ?? activeInputs.screenName ?? activeInputs.componentName ?? activeInputs.appScenario ?? "Artifact",
    artifactPurpose:
      activeInputs.formulaPurpose ??
      activeInputs.screenPurpose ??
      activeInputs.componentPurpose ??
      "Performance architecture review",
    dataSource: toDataSourceType(activeInputs.dataSource ?? activeInputs.dataSourceMix ?? "other"),
    symptoms: activeInputs.symptoms ?? "General optimization request",
    inputPayload: activeInputs.inputPayload ?? "",
    relatedFormulas: activeInputs.relatedFormulas,
    context: {
      workspaceId: "workspace-demo",
      correlationId: crypto.randomUUID()
    }
  };
}

export default function AnalyzePage() {
  const [activeTab, setActiveTab] = useState<AnalyzeTab>("formula");
  const [inputsByTab, setInputsByTab] = useState<Record<AnalyzeTab, Record<string, string>>>(initialValues);
  const [response, setResponse] = useState<AnalyzeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeFields = fieldConfigByTab[activeTab];
  const scores = scoreChipsByTab[activeTab];

  const handleInputChange = (fieldKey: string, value: string) => {
    setInputsByTab((prev) => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        [fieldKey]: value
      }
    }));
  };

  const handleSubmit = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    const payload = createAnalyzeRequest(activeTab, inputsByTab);

    try {
      const result = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!result.ok) {
        throw new Error("Unable to run analysis.");
      }

      const data = (await result.json()) as AnalyzeResponse;
      setResponse(data);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unexpected error while analyzing artifact.");
    } finally {
      setIsLoading(false);
    }
  };

  const outputSections = useMemo(() => {
    if (!response) {
      return [] as Array<{ title: string; items: string[] }>;
    }

    return [
      { title: "Summary", items: [response.summary] },
      { title: "Root Cause", items: [response.rootCause] },
      { title: "Findings", items: response.findings },
      { title: "Delegation Considerations", items: response.delegationConsiderations },
      { title: "Performance Notes", items: response.performanceNotes },
      { title: "Maintainability Notes", items: response.maintainabilityNotes }
    ];
  }, [response]);

  return (
    <PageContainer>
      <PageHeader
        title="Analyze Studio Workspace"
        description="Diagnose formulas, screens, components, and architecture decisions with structured recommendations for Power Apps teams."
        actions={
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Analyzing..." : "Run Analysis"}
          </Button>
        }
      />

      <div className="mb-6 grid gap-2 rounded-xl border border-border/70 bg-card/70 p-2 shadow-sm sm:grid-cols-2 xl:grid-cols-4">
        {tabs.map((tab) => {
          const selected = tab.key === activeTab;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "rounded-lg px-3 py-2.5 text-left transition",
                selected ? "bg-background shadow-sm" : "hover:bg-background/70"
              )}
            >
              <p className={cn("text-sm font-semibold", selected ? "text-foreground" : "text-muted-foreground")}>
                {tab.label}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{tab.subtitle}</p>
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.15fr]">
        <SectionCard
          title="Analysis Inputs"
          description="Provide artifact context to generate typed analyzer feedback from mock APIs."
        >
          <form className="space-y-4" onSubmit={(event) => event.preventDefault()}>
            {activeFields.map((field) =>
              field.multiline ? (
                <FormTextareaField
                  key={field.key}
                  label={field.label}
                  value={inputsByTab[activeTab][field.key] ?? ""}
                  placeholder={field.placeholder}
                  onChange={(value) => handleInputChange(field.key, value)}
                />
              ) : (
                <FormInputField
                  key={field.key}
                  label={field.label}
                  value={inputsByTab[activeTab][field.key] ?? ""}
                  placeholder={field.placeholder}
                  onChange={(value) => handleInputChange(field.key, value)}
                />
              )
            )}

            <div className="flex justify-end pt-2">
              <Button type="button" variant="secondary" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Analysis Draft"}
              </Button>
            </div>
          </form>
        </SectionCard>

        <SectionCard
          title="Analysis Output"
          description="Structured response returned from /api/analyze using shared Analyze contracts."
        >
          {error ? <StatusMessage tone="error" message={error} /> : null}

          {!response && !error ? (
            <StatusMessage tone="info" message="Run an analysis to view findings, severity, and optimization guidance." />
          ) : null}

          {response ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Severity</p>
                <SeverityBadge severity={response.severity} />
                {scores ? (
                  <>
                    <div className="ml-2 rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                      Performance Score: {scores.performance}
                    </div>
                    <div className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                      Maintainability Score: {scores.maintainability}
                    </div>
                  </>
                ) : null}
              </div>

              {outputSections.map((section) => (
                <OutputBlock key={section.title} title={section.title} items={section.items} />
              ))}

              {response.optimizedFormula ? (
                <CodePanel title={response.optimizedFormula.name} language="Power Fx" code={response.optimizedFormula.formula} />
              ) : null}

              <section className="space-y-3">
                <h3 className="text-sm font-semibold tracking-tight">Recommendations</h3>
                {response.recommendations.map((recommendation) => (
                  <RecommendationCard key={recommendation.id} recommendation={recommendation} />
                ))}
              </section>
            </div>
          ) : null}
        </SectionCard>
      </div>
    </PageContainer>
  );
}
