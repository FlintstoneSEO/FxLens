"use client";

import { useMemo, useState } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { cn } from "@/lib/utils";

type AnalyzeTab = "formula" | "screen" | "component" | "performance";

type OutputSection = {
  title: string;
  items: readonly string[];
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

const formulaSections: readonly OutputSection[] = [
  {
    title: "Summary",
    items: [
      "Formula repeatedly queries the same data source during control re-evaluation.",
      "Current pattern increases latency on larger datasets and slows initial screen render.",
      "A cached-record strategy would improve readability and execution efficiency."
    ]
  },
  {
    title: "Root Cause",
    items: [
      "Repeated LookUp calls inside nested If branches.",
      "No local variable cache for selected request context.",
      "Mixed business logic and UI state calculations in a single expression."
    ]
  },
  {
    title: "Findings",
    items: [
      "LookUp against Requests executes multiple times per control refresh.",
      "Conditional paths duplicate status and priority checks.",
      "Potential non-delegable pattern when extended with additional filters."
    ]
  },
  {
    title: "Optimized Formula",
    items: [
      "With({ req: LookUp(Requests, RequestId = varRequestId) },",
      "  If(!IsBlank(req) && req.Priority = \"High\" && req.Status <> \"Closed\", true, false)",
      ")"
    ]
  },
  {
    title: "Delegation Considerations",
    items: [
      "Ensure RequestId is indexed and delegable for your connector.",
      "Avoid non-delegable functions in additional filter layers.",
      "Validate behavior with datasets above default delegation limits."
    ]
  },
  {
    title: "Performance Notes",
    items: [
      "Move record retrieval to OnVisible or an action boundary when possible.",
      "Use named formulas for repeated boolean conditions.",
      "Keep formula branches shallow to reduce recalculation overhead."
    ]
  },
  {
    title: "Maintainability Notes",
    items: [
      "Break logic into intermediate variables for readability.",
      "Document assumptions around status enum values.",
      "Standardize formula naming conventions across screens."
    ]
  }
];

const screenSections: readonly OutputSection[] = [
  {
    title: "Screen Assessment Summary",
    items: [
      "Screen is feature-rich but currently overloaded with startup data loading.",
      "Control hierarchy is deep, reducing maintainability and design consistency.",
      "Primary bottlenecks stem from eager data fetching and duplicate formula logic."
    ]
  },
  {
    title: "Likely Bottlenecks",
    items: [
      "Concurrent loading of three large reference tables on OnVisible.",
      "Gallery item formulas execute repeated LookUp patterns.",
      "Multiple hidden controls still trigger expensive evaluations."
    ]
  },
  {
    title: "Component Extraction Opportunities",
    items: [
      "Status banner can be extracted into reusable component.",
      "Action footer can be standardized across screens.",
      "Validation message stack can become a shared component."
    ]
  },
  {
    title: "Data Loading Recommendations",
    items: [
      "Lazy load secondary datasets after initial screen paint.",
      "Cache role and environment settings once per session.",
      "Replace repeated refresh calls with targeted patch updates."
    ]
  },
  {
    title: "Suggested Screen Refactors",
    items: [
      "Split the screen into Intake and Review variants.",
      "Move heavy logic to helper formulas and context variables.",
      "Flatten nested containers to improve readability and responsiveness."
    ]
  }
];

const componentSections: readonly OutputSection[] = [
  {
    title: "Contract Review",
    items: [
      "Input contract is broad and mixes display + business state.",
      "Outputs are clear but should include explicit error callback hooks.",
      "Recommend typed record input instead of many primitive parameters."
    ]
  },
  {
    title: "Reusability Assessment",
    items: [
      "Component can be reused across Manager Review and Request Details.",
      "Tight coupling to one screen color scheme limits portability.",
      "Parameter normalization will improve adoption across modules."
    ]
  },
  {
    title: "Formula Simplification Suggestions",
    items: [
      "Consolidate status mapping into a single With() block.",
      "Use helper formulas for icon and color state decisions.",
      "Remove duplicate If branches for equivalent outcomes."
    ]
  },
  {
    title: "Rendering / Performance Notes",
    items: [
      "Avoid recalculating formatted strings on every render.",
      "Pre-compute derived properties in parent when possible.",
      "Minimize dynamic style calculations in nested controls."
    ]
  },
  {
    title: "Maintainability Notes",
    items: [
      "Document component version and contract changes.",
      "Use consistent naming for events and outputs.",
      "Create a usage guide snippet for new contributors."
    ]
  }
];

const performanceSections: readonly OutputSection[] = [
  {
    title: "Architecture Recommendations",
    items: [
      "Adopt a hybrid model: Dataverse for transactional UI, SQL for reporting.",
      "Standardize domain boundaries by module to reduce coupling.",
      "Introduce workload-specific data services for heavy operations."
    ]
  },
  {
    title: "When to Use SQL Views",
    items: [
      "Use for pre-joined datasets consumed by dashboards and analytics screens.",
      "Use when multiple app screens share identical filtered aggregations.",
      "Use to reduce repeated client-side transformation logic."
    ]
  },
  {
    title: "When to Use Stored Procedures",
    items: [
      "Use for multi-step transactional updates requiring atomic behavior.",
      "Use for write-heavy workflows with strict business-rule enforcement.",
      "Use for operations requiring deterministic performance under load."
    ]
  },
  {
    title: "When to Use Power Automate",
    items: [
      "Use for asynchronous notifications and approval orchestration.",
      "Use for cross-system integration where retry logic is needed.",
      "Use for scheduled synchronization and background housekeeping."
    ]
  },
  {
    title: "When to Use Components",
    items: [
      "Use for repeated UI + behavior patterns across many screens.",
      "Use for standardized status, validation, and action bars.",
      "Use for reducing formula duplication and design drift."
    ]
  },
  {
    title: "Likely Optimization Priorities",
    items: [
      "Eliminate repeated LookUp patterns in high-traffic screens.",
      "Refactor startup data loading to lazy and contextual fetches.",
      "Rationalize screen/component contracts to reduce formula complexity."
    ]
  },
  {
    title: "Risk Areas",
    items: [
      "Delegation limits with growing operational datasets.",
      "Cross-screen logic duplication increasing maintenance cost.",
      "Inconsistent integration retry handling for external connectors."
    ]
  },
  {
    title: "Recommended Next Steps",
    items: [
      "Baseline key performance metrics for top 5 screens.",
      "Run analyzer pass on formulas with highest execution frequency.",
      "Prioritize refactors by user impact and delivery effort."
    ]
  }
];

export default function AnalyzePage() {
  const [activeTab, setActiveTab] = useState<AnalyzeTab>("formula");

  const panelData = useMemo(() => {
    if (activeTab === "screen") {
      return {
        leftTitle: "Screen Context Inputs",
        leftDescription:
          "Provide screen structure and symptom context to surface architecture and performance issues.",
        leftFields: [
          { label: "Screen Name", placeholder: "e.g. Manager Review" },
          { label: "Screen Purpose", placeholder: "Review requests and approve or reject with notes" },
          { label: "Data Source", placeholder: "Dataverse: Requests, Approvals, Users" },
          { label: "Symptoms", placeholder: "Slow initial load, delayed gallery updates", multiline: true },
          {
            label: "YAML or Screen Structure Input",
            placeholder: "Paste screen layout structure, container tree, and key controls...",
            multiline: true
          },
          {
            label: "Related Formulas",
            placeholder: "Paste formulas used in gallery items, actions, and screen events...",
            multiline: true
          }
        ],
        rightTitle: "Screen Analysis Output",
        rightDescription:
          "Mock analyzer output for screen-level diagnostics. Real outputs will be generated from live analysis in a later phase.",
        rightSections: screenSections,
        actionLabel: "Analyze Screen",
        severity: "medium" as const,
        score: { performance: 71, maintainability: 68 }
      } as const;
    }

    if (activeTab === "component") {
      return {
        leftTitle: "Component Context Inputs",
        leftDescription:
          "Capture component contract and logic patterns to evaluate reusability, complexity, and runtime behavior.",
        leftFields: [
          { label: "Component Name", placeholder: "e.g. Approval Status Card" },
          { label: "Component Purpose", placeholder: "Display request status and escalation actions" },
          { label: "Inputs / Outputs", placeholder: "Inputs: Status, SLA; Outputs: OnEscalate(), OnOpenDetails()" },
          { label: "Symptoms", placeholder: "Inconsistent rendering, heavy formula branches", multiline: true },
          {
            label: "Component Logic",
            placeholder: "Paste key formulas and logic used inside the component...",
            multiline: true
          }
        ],
        rightTitle: "Component Analysis Output",
        rightDescription:
          "Mock component review for UI validation. Future phases will connect this view to actual analyzer execution.",
        rightSections: componentSections,
        actionLabel: "Analyze Component",
        severity: "low" as const
      } as const;
    }

    if (activeTab === "performance") {
      return {
        leftTitle: "App Architecture Inputs",
        leftDescription:
          "Describe current app architecture and symptoms to receive targeted optimization recommendations.",
        leftFields: [
          { label: "App Scenario", placeholder: "Field operations request lifecycle management" },
          { label: "Data Source Mix", placeholder: "Dataverse + SQL + SharePoint attachments" },
          { label: "Screen Count", placeholder: "18" },
          {
            label: "Performance Symptoms",
            placeholder: "Intermittent slow loads and delayed list interactions during peak hours",
            multiline: true
          },
          {
            label: "Current Architecture Notes",
            placeholder: "Monolithic screen logic, mixed data shaping in controls, limited component reuse",
            multiline: true
          }
        ],
        rightTitle: "Performance Advisor Output",
        rightDescription:
          "Mock architecture recommendations for Phase validation. Live advisor guidance will follow after backend integration.",
        rightSections: performanceSections,
        actionLabel: "Run Performance Advisor",
        severity: "high" as const
      } as const;
    }

    return {
      leftTitle: "Formula Context Inputs",
      leftDescription:
        "Provide formula intent and symptoms so FxLens can identify root causes and produce optimized alternatives.",
      leftFields: [
        { label: "Formula Name", placeholder: "e.g. EvaluateEscalationFlag" },
        { label: "Formula Purpose", placeholder: "Determine whether a request should be escalated" },
        { label: "Data Source", placeholder: "Requests" },
        { label: "Screen Context", placeholder: "Manager Review" },
        {
          label: "Symptoms",
          placeholder: "Slow control updates and inconsistent behavior on large datasets",
          multiline: true
        },
        {
          label: "Formula Input",
          placeholder: "Paste the Power Fx formula to analyze...",
          multiline: true
        }
      ],
      rightTitle: "Formula Analysis Output",
      rightDescription:
        "Mock formula diagnostics for workspace validation. Real outputs will be connected in a later phase.",
      rightSections: formulaSections,
      actionLabel: "Analyze Formula",
      severity: "high" as const
    } as const;
  }, [activeTab]);

  return (
    <PageContainer>
      <PageHeader
        title="Analyze Studio Workspace"
        description="Diagnose formulas, screens, components, and architecture decisions with structured recommendations for Power Apps teams."
        actions={<Button>{panelData.actionLabel}</Button>}
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
        <SectionCard title={panelData.leftTitle} description={panelData.leftDescription}>
          <form className="space-y-4">
            {panelData.leftFields.map((field) => (
              <FormField
                key={field.label}
                label={field.label}
                placeholder={field.placeholder}
                multiline={field.multiline}
              />
            ))}
            <div className="flex justify-end pt-2">
              <Button type="button" variant="secondary">
                Save Analysis Draft
              </Button>
            </div>
          </form>
        </SectionCard>

        <SectionCard title={panelData.rightTitle} description={panelData.rightDescription}>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Severity</p>
            <SeverityBadge severity={panelData.severity} />
            {"score" in panelData ? (
              <>
                <div className="ml-2 rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                  Performance Score: {panelData.score.performance}
                </div>
                <div className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground">
                  Maintainability Score: {panelData.score.maintainability}
                </div>
              </>
            ) : null}
          </div>

          <div className="space-y-4">
            {panelData.rightSections.map((section) => (
              <OutputBlock key={section.title} title={section.title} items={section.items} />
            ))}
          </div>
        </SectionCard>
      </div>
    </PageContainer>
  );
}

type FormFieldProps = {
  label: string;
  placeholder: string;
  multiline?: boolean;
};

function FormField({ label, placeholder, multiline = false }: FormFieldProps) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {multiline ? (
        <textarea
          rows={4}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
          placeholder={placeholder}
        />
      ) : (
        <input
          type="text"
          className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
          placeholder={placeholder}
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
