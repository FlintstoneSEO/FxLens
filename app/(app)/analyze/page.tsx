"use client";

import { useMemo, useState } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { SeverityBadge } from "@/components/ui/severity-badge";
import type { AnalyzeMode, AnalyzeRequest, AnalyzeResponse, DataSourceType } from "@/lib/contracts/workspace";
import { cn } from "@/lib/utils";

type AnalyzeTab = "formula" | "screen" | "component" | "performance";

type FieldConfig = {
  key: string;
  label: string;
  placeholder: string;
  multiline?: boolean;
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
    relatedFormulas: "Gallery.Items = Filter(Requests, Status <> \"Closed\")"
  },
  component: {
    componentName: "Approval Status Card",
    componentPurpose: "Display request status and escalation actions",
    inputsOutputs: "Inputs: Status, SLA; Outputs: OnEscalate(), OnOpenDetails()",
    symptoms: "Inconsistent rendering, heavy formula branches",
    inputPayload: "If(Status = \"Escalated\", Color.Red, If(Status = \"Open\", Color.Orange, Color.Green))"
  },
  performance: {
    appScenario: "Field operations request lifecycle management",
    dataSourceMix: "Dataverse + SQL + SharePoint attachments",
    screenCount: "18",
    symptoms: "Intermittent slow loads and delayed list interactions during peak hours",
    inputPayload: "Monolithic screen logic, mixed data shaping in controls, limited component reuse"
  }
};

const dataSourceOptions: DataSourceType[] = ["dataverse", "sql", "sharepoint", "api", "mixed", "other"];

function toDataSourceType(value: string): DataSourceType {
  const normalized = value.toLowerCase().trim();
  return dataSourceOptions.find((option) => option === normalized) ?? "other";
}

export default function AnalyzePage() {
  const [activeTab, setActiveTab] = useState<AnalyzeTab>("formula");
  const [inputsByTab, setInputsByTab] = useState<Record<AnalyzeTab, Record<string, string>>>(initialValues);
  const [response, setResponse] = useState<AnalyzeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeFields = fieldConfigByTab[activeTab];

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

    const inputs = inputsByTab[activeTab];
    const payload: AnalyzeRequest = {
      mode: modeByTab[activeTab],
      artifactName: inputs.formulaName ?? inputs.screenName ?? inputs.componentName ?? inputs.appScenario ?? "Artifact",
      artifactPurpose:
        inputs.formulaPurpose ?? inputs.screenPurpose ?? inputs.componentPurpose ?? "Performance architecture review",
      dataSource: toDataSourceType(inputs.dataSource ?? inputs.dataSourceMix ?? "other"),
      symptoms: inputs.symptoms ?? "General optimization request",
      inputPayload: inputs.inputPayload ?? "",
      relatedFormulas: inputs.relatedFormulas,
      context: {
        workspaceId: "workspace-demo",
        correlationId: crypto.randomUUID()
      }
    };

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
      {
        title: "Optimized Formula",
        items: response.optimizedFormula ? [response.optimizedFormula.formula] : ["No formula optimization returned."]
      },
      { title: "Delegation Considerations", items: response.delegationConsiderations },
      { title: "Performance Notes", items: response.performanceNotes },
      { title: "Maintainability Notes", items: response.maintainabilityNotes },
      { title: "Recommendations", items: response.recommendations.map((item) => item.title) }
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
            {activeFields.map((field) => (
              <FormField
                key={field.key}
                label={field.label}
                value={inputsByTab[activeTab][field.key] ?? ""}
                placeholder={field.placeholder}
                multiline={field.multiline}
                onChange={(value) => handleInputChange(field.key, value)}
              />
            ))}

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
          {error ? (
            <div className="rounded-xl border border-rose-300/60 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
          ) : null}

          {!response && !error ? (
            <p className="text-sm text-muted-foreground">Run an analysis to view findings, severity, and optimization guidance.</p>
          ) : null}

          {response ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Severity</p>
                <SeverityBadge severity={response.severity} />
              </div>

              {outputSections.map((section) => (
                <OutputBlock key={section.title} title={section.title} items={section.items} />
              ))}
            </div>
          ) : null}
        </SectionCard>
      </div>
    </PageContainer>
  );
}

type FormFieldProps = {
  label: string;
  value: string;
  placeholder: string;
  multiline?: boolean;
  onChange: (value: string) => void;
};

function FormField({ label, value, placeholder, multiline = false, onChange }: FormFieldProps) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {multiline ? (
        <textarea
          rows={4}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          type="text"
          className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  );
}

type OutputBlockProps = {
  title: string;
  items: readonly string[];
};

function OutputBlock({ title, items }: OutputBlockProps) {
  return (
    <section className="rounded-xl border border-border/70 bg-background/60 p-4">
      <h3 className="mb-2 text-sm font-semibold tracking-tight">{title}</h3>
      <ul className="space-y-1.5 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="list-inside list-disc">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
