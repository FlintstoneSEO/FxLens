"use client";

import { useMemo, useState } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/lib/utils";

type BuildTab = "screen" | "component" | "formula";

type OutputBlockData = {
  title: string;
  items: readonly string[];
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

const screenBuilderSections: readonly OutputBlockData[] = [
  {
    title: "Screen Blueprint Summary",
    items: [
      "Service Request Intake screen for technicians to create and submit requests.",
      "Role-aware visibility to simplify first-use completion and reduce invalid submissions.",
      "Optimized for mobile-first entry with compact sections and clear action hierarchy."
    ]
  },
  {
    title: "Suggested Control Tree",
    items: [
      "Screen: scrRequestIntake",
      "Container: cntHeader > lblTitle + lblSubtitle",
      "Form: frmRequest (DataSource: Requests)",
      "Gallery: galRequiredFieldsChecklist",
      "Actions: btnSaveDraft + btnSubmitRequest"
    ]
  },
  {
    title: "Suggested Formulas",
    items: [
      "btnSubmitRequest.DisplayMode: If(frmRequest.Valid, DisplayMode.Edit, DisplayMode.Disabled)",
      "btnSaveDraft.OnSelect: Patch(Requests, Defaults(Requests), frmRequest.Updates)",
      "OnVisible: ClearCollect(colLookups, Filter(RequestTypes, Active = true))"
    ]
  },
  {
    title: "Component Opportunities",
    items: [
      "Reusable progress tracker for staged forms",
      "Shared field validation banner component",
      "Action footer component with standardized primary/secondary actions"
    ]
  },
  {
    title: "Performance Notes",
    items: [
      "Preload only reference tables required for first interaction.",
      "Avoid multiple LookUp calls by caching selected request type metadata.",
      "Use concurrent data prefetching for role and environment settings."
    ]
  },
  {
    title: "Implementation Notes",
    items: [
      "Use named formulas for repeated calculations.",
      "Apply role checks once on load and persist in context variables.",
      "Align field naming with Dataverse schema for easier handoff."
    ]
  }
];

const componentBuilderSections: readonly OutputBlockData[] = [
  {
    title: "Component Contract",
    items: [
      "Component Name: cmpApprovalStatusCard",
      "Inputs: RequestStatus, ApproverName, DueDate, EscalationFlag",
      "Outputs: OnOpenDetails, OnEscalate",
      "Behavior: Displays status state, due countdown, and escalation controls"
    ]
  },
  {
    title: "Usage Guidance",
    items: [
      "Use in Manager Review and Request Details screens for consistent status framing.",
      "Wrap in a responsive container to support tablet and desktop layouts.",
      "Bind to a strongly-typed record to reduce formula sprawl."
    ]
  },
  {
    title: "Suggested Formula Patterns",
    items: [
      "Visible: !IsBlank(Self.RequestStatus)",
      "lblSLAColor.Color: If(Self.EscalationFlag, Color.Red, Color.Green)",
      "btnOpenDetails.OnSelect: Self.OnOpenDetails()"
    ]
  },
  {
    title: "Styling Notes",
    items: [
      "Use semantic status color tokens for consistency with dashboard KPIs.",
      "Keep rounded corners and spacing identical across all card components.",
      "Use icon + short text combinations for compact readability."
    ]
  },
  {
    title: "Performance Notes",
    items: [
      "Avoid heavy conditional branches in component render formulas.",
      "Pass already-computed values from parent when possible.",
      "Standardize input contract to reduce conversion formulas."
    ]
  }
];

const formulaBuilderSections: readonly OutputBlockData[] = [
  {
    title: "Formula Draft",
    items: [
      "With({ req: LookUp(Requests, RequestId = varRequestId) },",
      "    If(req.Priority = \"High\" && req.Status <> \"Closed\", true, false)",
      ")"
    ]
  },
  {
    title: "Explanation",
    items: [
      "Loads the current request record once and reuses it in conditional evaluation.",
      "Returns a boolean flag that can drive escalation UI states.",
      "Designed to keep readability high while minimizing repeated queries."
    ]
  },
  {
    title: "Optimization Notes",
    items: [
      "Use With() to avoid repeated LookUp operations.",
      "Persist selected request context in a variable before control-level formulas.",
      "Normalize status values to avoid string mismatch checks."
    ]
  },
  {
    title: "Delegation Considerations",
    items: [
      "Ensure RequestId column is indexed for delegable LookUp operations.",
      "Avoid non-delegable functions when filtering large request tables.",
      "Test formula behavior against datasets above delegation thresholds."
    ]
  }
];

export default function BuildPage() {
  const [activeTab, setActiveTab] = useState<BuildTab>("screen");

  const panelData = useMemo(() => {
    if (activeTab === "component") {
      return {
        leftTitle: "Component Definition Inputs",
        leftDescription:
          "Capture component intent and interaction contract so outputs are reusable across studios.",
        leftFields: [
          { label: "Component Name", placeholder: "e.g. Approval Status Card" },
          { label: "Component Purpose", placeholder: "Summarize approval status and next actions" },
          { label: "Inputs", placeholder: "Status, Approver, DueDate, EscalationFlag" },
          { label: "Outputs", placeholder: "OnOpenDetails(), OnEscalate()" },
          { label: "Behavior", placeholder: "Render SLA state and trigger escalation actions" },
          { label: "Reuse Goals", placeholder: "Use in review, details, and dashboard screens" }
        ],
        rightTitle: "Component Output Preview",
        rightDescription:
          "Mock component architecture output for UI validation. Generated results will be wired in a later phase.",
        rightSections: componentBuilderSections,
        actionLabel: "Generate Component Draft"
      } as const;
    }

    if (activeTab === "formula") {
      return {
        leftTitle: "Formula Context Inputs",
        leftDescription:
          "Define the business logic context so generated Power Fx is clear, performant, and maintainable.",
        leftFields: [
          { label: "Formula Purpose", placeholder: "Set escalation indicator for high-priority open requests" },
          { label: "Data Source", placeholder: "Requests" },
          { label: "Screen Context", placeholder: "Manager Review / Request Details" },
          {
            label: "Logic Description",
            placeholder: "If priority is High and status is not Closed, surface escalation flag",
            multiline: true
          },
          { label: "Performance Priority", placeholder: "Minimize repeated LookUp and ensure delegation safety" }
        ],
        rightTitle: "Formula Output Preview",
        rightDescription:
          "Mock formula recommendations for Phase validation. Real generation logic will follow in a later phase.",
        rightSections: formulaBuilderSections,
        actionLabel: "Generate Formula Draft"
      } as const;
    }

    return {
      leftTitle: "Screen Definition Inputs",
      leftDescription:
        "Provide screen context and behavior requirements to generate a production-ready blueprint recommendation.",
      leftFields: [
        { label: "Screen Name", placeholder: "e.g. Service Request Intake" },
        { label: "Screen Purpose", placeholder: "Capture and submit service requests with required metadata" },
        { label: "Target Role", placeholder: "Technician" },
        { label: "Data Source", placeholder: "Dataverse: Requests + Request Types" },
        { label: "Key Fields", placeholder: "Request Type, Priority, Asset, Description, Attachments" },
        { label: "Primary Actions", placeholder: "Save Draft, Submit Request" },
        { label: "Layout Style", placeholder: "Mobile-first form with contextual side panel" },
        {
          label: "Special Business Rules",
          placeholder: "High priority requests require manager notification within 15 minutes",
          multiline: true
        }
      ],
      rightTitle: "Screen Output Preview",
      rightDescription:
        "Mock blueprint output for Build Studio UI validation. Real AI-generated outputs will be connected later.",
      rightSections: screenBuilderSections,
      actionLabel: "Generate Screen Blueprint"
    } as const;
  }, [activeTab]);

  return (
    <PageContainer>
      <PageHeader
        title="Build Studio Workspace"
        description="Design screens, components, and formulas in one structured workspace aligned for enterprise Power Apps delivery."
        actions={<Button>{panelData.actionLabel}</Button>}
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
                Save Builder Draft
              </Button>
            </div>
          </form>
        </SectionCard>

        <SectionCard title={panelData.rightTitle} description={panelData.rightDescription}>
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
