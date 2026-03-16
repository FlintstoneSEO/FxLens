"use client";

import { useMemo, useState } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import type { BuildMode, BuildRequest, BuildResponse } from "@/lib/contracts/workspace";
import { cn } from "@/lib/utils";

type BuildTab = "screen" | "component" | "formula";

type FieldConfig = {
  key: string;
  label: string;
  placeholder: string;
  multiline?: boolean;
};

type PanelMeta = {
  leftTitle: string;
  leftDescription: string;
  rightTitle: string;
  rightDescription: string;
};

const tabs: ReadonlyArray<{ key: BuildTab; label: string; subtitle: string }> = [
  {
    key: "screen",
    label: "Screen Builder",
    subtitle: "Blueprint a Power Apps screen with structure and formulas"
  },
  {
    key: "component",
    label: "Component Builder",
    subtitle: "Define reusable component contracts and usage patterns"
  },
  {
    key: "formula",
    label: "Formula Builder",
    subtitle: "Draft and optimize Power Fx formulas with guidance"
  }
];

const fieldConfigByTab: Record<BuildTab, FieldConfig[]> = {
  screen: [
    { key: "screenName", label: "Screen Name", placeholder: "e.g. Service Request Intake" },
    {
      key: "screenPurpose",
      label: "Screen Purpose",
      placeholder: "Capture and submit service requests with required metadata"
    },
    { key: "targetRole", label: "Target Role", placeholder: "Technician" },
    { key: "dataSource", label: "Data Source", placeholder: "Dataverse: Requests + Request Types" },
    {
      key: "keyFields",
      label: "Key Fields",
      placeholder: "Request Type, Priority, Asset, Description, Attachments"
    },
    { key: "primaryActions", label: "Primary Actions", placeholder: "Save Draft, Submit Request" },
    { key: "layoutStyle", label: "Layout Style", placeholder: "Mobile-first form with contextual side panel" },
    {
      key: "businessRules",
      label: "Special Business Rules",
      placeholder: "High priority requests require manager notification within 15 minutes",
      multiline: true
    }
  ],
  component: [
    { key: "componentName", label: "Component Name", placeholder: "e.g. Approval Status Card" },
    {
      key: "componentPurpose",
      label: "Component Purpose",
      placeholder: "Summarize approval status and next actions"
    },
    { key: "inputs", label: "Inputs", placeholder: "Status, Approver, DueDate, EscalationFlag" },
    { key: "outputs", label: "Outputs", placeholder: "OnOpenDetails(), OnEscalate()" },
    {
      key: "behavior",
      label: "Behavior",
      placeholder: "Render SLA state and trigger escalation actions"
    },
    {
      key: "reuseGoals",
      label: "Reuse Goals",
      placeholder: "Use in review, details, and dashboard screens"
    }
  ],
  formula: [
    {
      key: "formulaPurpose",
      label: "Formula Purpose",
      placeholder: "Set escalation indicator for high-priority open requests"
    },
    { key: "dataSource", label: "Data Source", placeholder: "Requests" },
    { key: "screenContext", label: "Screen Context", placeholder: "Manager Review / Request Details" },
    {
      key: "logicDescription",
      label: "Logic Description",
      placeholder: "If priority is High and status is not Closed, surface escalation flag",
      multiline: true
    },
    {
      key: "performancePriority",
      label: "Performance Priority",
      placeholder: "Minimize repeated LookUp and ensure delegation safety"
    }
  ]
};

const initialValues: Record<BuildTab, Record<string, string>> = {
  screen: {
    screenName: "Service Request Intake",
    screenPurpose: "Capture and submit service requests with required metadata",
    targetRole: "Technician",
    dataSource: "Dataverse: Requests + Request Types",
    keyFields: "Request Type, Priority, Asset, Description, Attachments",
    primaryActions: "Save Draft, Submit Request",
    layoutStyle: "Mobile-first form with contextual side panel",
    businessRules: "High priority requests require manager notification within 15 minutes"
  },
  component: {
    componentName: "Approval Status Card",
    componentPurpose: "Summarize approval status and next actions",
    inputs: "Status, Approver, DueDate, EscalationFlag",
    outputs: "OnOpenDetails(), OnEscalate()",
    behavior: "Render SLA state and trigger escalation actions",
    reuseGoals: "Use in review, details, and dashboard screens"
  },
  formula: {
    formulaPurpose: "Set escalation indicator for high-priority open requests",
    dataSource: "Requests",
    screenContext: "Manager Review / Request Details",
    logicDescription: "If priority is High and status is not Closed, surface escalation flag",
    performancePriority: "Minimize repeated LookUp and ensure delegation safety"
  }
};

const modeByTab: Record<BuildTab, BuildMode> = {
  screen: "screen_builder",
  component: "component_builder",
  formula: "formula_builder"
};

const panelMetaByTab: Record<BuildTab, PanelMeta> = {
  screen: {
    leftTitle: "Screen Definition Inputs",
    leftDescription: "Provide screen context for blueprint generation.",
    rightTitle: "Screen Output",
    rightDescription: "Generated build output from /api/generate."
  },
  component: {
    leftTitle: "Component Definition Inputs",
    leftDescription: "Capture component intent and interaction contract.",
    rightTitle: "Component Output",
    rightDescription: "Generated build output from /api/generate."
  },
  formula: {
    leftTitle: "Formula Context Inputs",
    leftDescription: "Define formula context and optimization priorities.",
    rightTitle: "Formula Output",
    rightDescription: "Generated build output from /api/generate."
  }
};

function createBuildRequest(activeTab: BuildTab, inputsByTab: Record<BuildTab, Record<string, string>>): BuildRequest {
  const activeTabLabel = tabs.find((tab) => tab.key === activeTab)?.label ?? "Build";

  return {
    mode: modeByTab[activeTab],
    promptTitle: `${activeTabLabel} Request`,
    contextSummary: `Build Studio submission for ${activeTab} mode`,
    inputPayload: inputsByTab[activeTab],
    context: {
      workspaceId: "workspace-demo",
      correlationId: crypto.randomUUID()
    }
  };
}

export default function BuildPage() {
  const [activeTab, setActiveTab] = useState<BuildTab>("screen");
  const [inputsByTab, setInputsByTab] = useState<Record<BuildTab, Record<string, string>>>(initialValues);
  const [response, setResponse] = useState<BuildResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeFields = fieldConfigByTab[activeTab];
  const panelMeta = useMemo(() => panelMetaByTab[activeTab], [activeTab]);

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

    const payload = createBuildRequest(activeTab, inputsByTab);

    try {
      const result = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!result.ok) {
        throw new Error("Unable to generate build output.");
      }

      const data = (await result.json()) as BuildResponse;
      setResponse(data);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unexpected error while generating build output.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Build Studio Workspace"
        description="Design screens, components, and formulas in one structured workspace aligned for enterprise Power Apps delivery."
        actions={
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Generating..." : "Generate Build Output"}
          </Button>
        }
      />

      <div className="mb-6 grid gap-2 rounded-xl border border-border/70 bg-card/70 p-2 shadow-sm sm:grid-cols-3">
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
        <SectionCard title={panelMeta.leftTitle} description={panelMeta.leftDescription}>
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
                {isLoading ? "Saving..." : "Save Builder Draft"}
              </Button>
            </div>
          </form>
        </SectionCard>

        <SectionCard title={panelMeta.rightTitle} description={panelMeta.rightDescription}>
          {error ? (
            <div className="rounded-xl border border-rose-300/60 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
          ) : null}

          {!response && !error ? (
            <p className="text-sm text-muted-foreground">
              Generate build output to see screen, component, and formula recommendations.
            </p>
          ) : null}

          {response ? (
            <div className="space-y-4">
              <OutputBlock title="Summary" items={[response.summary]} />
              <OutputBlock title="Suggested Screens" items={response.suggestedScreens.map((item) => item.name)} />
              <OutputBlock title="Suggested Components" items={response.suggestedComponents.map((item) => item.name)} />
              <OutputBlock title="Suggested Formulas" items={response.suggestedFormulas.map((item) => item.name)} />
              <OutputBlock title="Implementation Notes" items={response.implementationNotes} />
              <OutputBlock title="Performance Notes" items={response.performanceNotes} />
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
