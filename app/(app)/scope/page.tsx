import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { Button } from "@/components/ui/button";

type OutputSection = {
  title: string;
  items: readonly string[];
};

const outputSections: readonly OutputSection[] = [
  {
    title: "Recommended Modules",
    items: [
      "Request Intake Module",
      "Approval Workflow Module",
      "Operations Dashboard Module",
      "Analytics & Audit Module"
    ]
  },
  {
    title: "Screen List",
    items: [
      "Home Dashboard",
      "New Request Wizard",
      "Request Details",
      "Manager Review",
      "Admin Configuration",
      "Audit History"
    ]
  },
  {
    title: "Data Entities",
    items: [
      "Projects",
      "Requests",
      "Request Status History",
      "Business Units",
      "User Roles",
      "Approval Rules"
    ]
  },
  {
    title: "Backend Recommendations",
    items: [
      "Use Dataverse for app-native transactional entities",
      "Use SQL for operational reporting and heavy aggregations",
      "Apply role-based security through Entra groups"
    ]
  },
  {
    title: "SQL View Suggestions",
    items: [
      "vw_RequestSLAStatus",
      "vw_ManagerPendingQueue",
      "vw_OperationsAgingTrend"
    ]
  },
  {
    title: "Stored Procedure Suggestions",
    items: [
      "usp_AssignApprovalRoute",
      "usp_CloseRequestAndArchive",
      "usp_RecalculatePriorityScore"
    ]
  },
  {
    title: "Power Automate Suggestions",
    items: [
      "Flow: Request submitted -> approval routing",
      "Flow: SLA breach -> escalation notification",
      "Flow: Daily sync to reporting warehouse"
    ]
  },
  {
    title: "Component Opportunities",
    items: [
      "Request status timeline component",
      "Approval decision panel component",
      "KPI tile set for cross-screen reuse"
    ]
  },
  {
    title: "MVP Plan",
    items: [
      "Sprint 1: Core request submission + manager approval",
      "Sprint 2: Role-aware dashboard + notifications",
      "Sprint 3: Reporting views + performance optimization"
    ]
  }
];

const assumptions = [
  "Requirements are consolidated from discovery sessions and may evolve after stakeholder validation.",
  "Data residency and compliance constraints must be confirmed before final data architecture selection.",
  "Approval rules may vary by region, requiring configurable policy tables and flow branching."
] as const;

export default function ScopePage() {
  return (
    <PageContainer>
      <PageHeader
        title="Scope Studio Workspace"
        description="Capture project intent and generate a structured Power Apps solution blueprint with architecture-ready recommendations."
        actions={<Button>Generate Scope Draft</Button>}
      />

      <div className="grid gap-6 xl:grid-cols-[1.02fr_1.18fr]">
        <SectionCard
          title="Requirement Intake"
          description="Provide core context for your app so FxLens can shape a practical architecture recommendation."
        >
          <form className="space-y-4">
            <Field label="Project Name" placeholder="e.g. Field Service Request Portal" />
            <Field
              label="Business Objective"
              placeholder="Reduce service resolution time and improve approval transparency across operations."
            />
            <Field
              label="Target Users / Roles"
              placeholder="Technicians, Service Managers, Regional Ops, Support Admin"
            />
            <TextBlock
              label="Requirements Text"
              placeholder="Describe functional requirements, constraints, and success criteria..."
              rows={5}
            />
            <TextBlock
              label="Meeting Notes"
              placeholder="Paste discovery notes, workshop outcomes, and stakeholder concerns..."
              rows={5}
            />
            <Field label="Preferred Data Source" placeholder="Dataverse + SQL reporting mirror" />
            <Field label="Integration Needs" placeholder="SAP order sync, Teams alerts, SharePoint attachments" />
            <Field
              label="Desired Outputs"
              placeholder="Architecture brief, screen map, data model, automation recommendations"
            />
            <div className="flex justify-end pt-2">
              <Button type="button" variant="secondary">
                Save Intake Draft
              </Button>
            </div>
          </form>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard
            title="Structured Solution Output (Preview)"
            description="Mock output shown for Phase 3 UI validation. This panel will later be generated from real workspace inputs."
          >
            <div className="space-y-4">
              <OutputBlock
                title="App Summary"
                items={[
                  "Power Apps canvas solution for managing service requests end-to-end.",
                  "Primary workflow covers intake, manager approval, and SLA tracking.",
                  "Architecture balances rapid delivery with enterprise reporting readiness."
                ]}
              />

              {outputSections.map((section) => (
                <OutputBlock key={section.title} title={section.title} items={section.items} />
              ))}

              <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <h3 className="text-sm font-semibold tracking-tight">Risks and Assumptions</h3>
                  <SeverityBadge severity="medium" />
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {assumptions.map((item) => (
                    <li key={item} className="list-inside list-disc">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </PageContainer>
  );
}

type FieldProps = {
  label: string;
  placeholder: string;
};

function Field({ label, placeholder }: FieldProps) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      <input
        type="text"
        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
        placeholder={placeholder}
      />
    </label>
  );
}

type TextBlockProps = {
  label: string;
  placeholder: string;
  rows?: number;
};

function TextBlock({ label, placeholder, rows = 4 }: TextBlockProps) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      <textarea
        rows={rows}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
        placeholder={placeholder}
      />
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
