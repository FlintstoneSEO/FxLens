import type {
  AnalyzeRequest,
  AnalyzeResponse,
  BuildRequest,
  BuildResponse,
  RecommendationRequest,
  RecommendationResponse,
  ScopeRequest,
  ScopeResponse,
  StudioArea
} from "@/lib/contracts/workspace";

export type PersistedRunStatus = "completed" | "failed" | "saved";

export type PersistedRunRecord = {
  id: string;
  studioType: StudioArea;
  title: string;
  status: PersistedRunStatus;
  createdAt: string;
  input: ScopeRequest | BuildRequest | AnalyzeRequest | RecommendationRequest;
  output: ScopeResponse | BuildResponse | AnalyzeResponse | RecommendationResponse;
};

const persistedRuns: PersistedRunRecord[] = [
  {
    id: "scope-field-ops-intake",
    studioType: "scope_studio",
    title: "Field operations intake workspace",
    status: "completed",
    createdAt: "2026-03-15T14:20:00.000Z",
    input: {
      projectName: "Field Operations Intake",
      businessObjective: "Reduce dispatch delays by centralizing request intake, triage, and technician scheduling.",
      targetUsersRoles: "Dispatch coordinators, regional managers, and field technicians.",
      requirementsText:
        "Capture service requests, assign owners, track parts, record site notes, and expose workload dashboards.",
      meetingNotes: "Leadership wants an MVP in six weeks with approvals, SLA monitoring, and mobile-friendly screens.",
      preferredDataSource: "dataverse",
      integrationNeeds: "ERP work order sync, Teams notifications, and SharePoint attachments.",
      desiredOutputs: "Scope summary, screen map, data entities, automation ideas, and rollout risks."
    },
    output: {
      area: "scope_studio",
      generatedAt: "2026-03-15T14:20:00.000Z",
      appSummary:
        "A dispatcher-led operations app that centralizes service intake, SLA tracking, technician assignment, and site follow-up.",
      recommendedModules: ["Request intake", "Dispatch board", "Technician mobile workspace", "Manager reporting"],
      suggestedScreens: [
        {
          id: "screen-intake",
          name: "Request Intake",
          purpose: "Capture new field requests and route them into triage.",
          targetRoles: ["Dispatch coordinators"],
          keyDataSources: ["Service requests", "Customer sites"],
          primaryActions: ["Create request", "Attach photos", "Assign priority"]
        }
      ],
      dataEntities: ["Service request", "Technician", "Site", "Part reservation", "SLA policy"],
      backendRecommendations: [
        {
          id: "backend-sync",
          title: "Use an integration layer for ERP synchronization",
          recommendationType: "backend_architecture",
          rationale: "Separating ERP sync logic keeps the canvas app responsive and easier to support.",
          tradeoffs: ["Additional implementation surface", "Requires monitoring and retry handling"],
          implementationNotes: ["Publish ERP updates asynchronously", "Log failed sync attempts with correlation IDs"]
        }
      ],
      sqlArtifacts: [
        {
          id: "sql-sla-view",
          kind: "view",
          name: "vw_RequestSlaStatus",
          purpose: "Support SLA health dashboards and escalation reporting.",
          definitionSummary: "Joins request, assignment, and due date data to expose aging and breach signals."
        }
      ],
      powerAutomateSuggestions: ["Escalate overdue requests", "Notify technicians of schedule updates"],
      suggestedComponents: [
        {
          id: "cmp-request-summary",
          name: "Request Summary Card",
          purpose: "Show request status, SLA, and assignment details in a reusable header.",
          inputs: ["Request ID", "Status", "Assigned technician"],
          outputs: ["Open details action"],
          reuseNotes: ["Use on intake, dispatch, and manager views"]
        }
      ],
      risksAndAssumptions: ["ERP integration API quotas need validation", "Technician offline support is not in MVP"],
      mvpPlan: ["Ship intake and dispatch first", "Add technician updates second", "Layer reporting after stabilization"]
    }
  },
  {
    id: "build-approval-console",
    studioType: "build_studio",
    title: "Approval console blueprint",
    status: "completed",
    createdAt: "2026-03-13T09:05:00.000Z",
    input: {
      mode: "screen_builder",
      promptTitle: "Approval console blueprint",
      contextSummary: "Design a review screen for finance managers approving exception requests.",
      inputPayload: {
        audience: "Finance managers",
        primaryGoal: "Approve or reject exception requests quickly",
        importantData: "Request amount, requester, due date, justification, supporting files"
      }
    },
    output: {
      area: "build_studio",
      mode: "screen_builder",
      generatedAt: "2026-03-13T09:05:00.000Z",
      summary: "A focused approval console with request overview, evidence panel, decision actions, and status history.",
      suggestedScreens: [
        {
          id: "screen-approval-console",
          name: "Approval Console",
          purpose: "Help approvers review risk, evidence, and decision options in one workspace.",
          targetRoles: ["Finance managers"],
          keyDataSources: ["Approval requests", "Attachments", "Audit trail"],
          primaryActions: ["Approve", "Reject", "Request more info"]
        }
      ],
      suggestedComponents: [
        {
          id: "cmp-decision-footer",
          name: "Decision Footer",
          purpose: "Keep approval actions and comment entry consistent across review screens.",
          inputs: ["Decision state", "Comment required"],
          outputs: ["Submit action"],
          reuseNotes: ["Share across finance and compliance review apps"]
        }
      ],
      suggestedFormulas: [
        {
          id: "fx-filter-open",
          name: "Open Request Filter",
          purpose: "Show only requests assigned to the current approver and still pending.",
          formula: "Filter(ApprovalRequests, Approver.Email = User().Email && Status = \"Pending\")",
          notes: ["Index approval status for faster filtering"],
          delegationConsiderations: ["Keep comparisons delegable in the selected data source"]
        }
      ],
      implementationNotes: ["Add a sticky decision footer on long review screens", "Prefetch attachments when the record opens"],
      performanceNotes: ["Limit default gallery columns", "Load audit history on demand"]
    }
  },
  {
    id: "analyze-work-order-formula",
    studioType: "analyze_studio",
    title: "Work order formula review",
    status: "completed",
    createdAt: "2026-03-11T17:42:00.000Z",
    input: {
      mode: "formula_analyzer",
      artifactName: "Work order gallery filter",
      artifactPurpose: "Return open work orders for the active supervisor.",
      dataSource: "sql",
      symptoms: "Slow gallery load and inconsistent delegation warnings.",
      inputPayload: "Filter(WorkOrders, SupervisorEmail = User().Email && StartsWith(Status, txtStatus.Text))",
      relatedFormulas: "SortByColumns(...)",
      context: {
        workspaceId: "ops-west"
      }
    },
    output: {
      area: "analyze_studio",
      mode: "formula_analyzer",
      generatedAt: "2026-03-11T17:42:00.000Z",
      summary: "The formula mixes delegable and non-delegable operations, causing partial datasets and slower initial rendering.",
      severity: "high",
      rootCause: "StartsWith against the current SQL connector pattern does not fully delegate in the existing expression path.",
      findings: ["Filtering logic can truncate results beyond the delegation limit", "The gallery loads unnecessary columns before user action"],
      optimizedFormula: {
        id: "fx-optimized-work-orders",
        name: "Delegable work order filter",
        purpose: "Reduce delegation warnings and improve gallery load time.",
        formula: "Filter(ShowColumns(WorkOrders, \"Id\", \"Title\", \"Status\", \"SupervisorEmail\"), SupervisorEmail = User().Email && Status = drpStatus.Selected.Value)",
        notes: ["Replace free-text prefix search with a status selector for delegation safety"],
        delegationConsiderations: ["Confirm equality filtering remains delegable for the SQL connector in use"]
      },
      delegationConsiderations: ["Avoid StartsWith in the main gallery query", "Validate indexes on supervisor and status columns"],
      performanceNotes: ["Use ShowColumns to reduce payload size", "Delay loading child tables until selection"],
      maintainabilityNotes: ["Extract status filter selection into a shared helper pattern"],
      recommendations: [
        {
          id: "rec-status-selector",
          type: "performance",
          title: "Replace text search with a controlled status selector",
          severity: "high",
          rationale: "A fixed selector improves delegation safety and removes expensive prefix scans.",
          nextSteps: ["Update UX to use a status dropdown", "Retest gallery queries with production-sized data"]
        }
      ]
    }
  }
];

export function getPersistedRuns(): PersistedRunRecord[] {
  return persistedRuns;
}

export function getPersistedRunById(id: string): PersistedRunRecord | undefined {
  return persistedRuns.find((run) => run.id === id);
}

export function getStudioTypeLabel(studioType: StudioArea): string {
  switch (studioType) {
    case "scope_studio":
      return "Scope Studio";
    case "build_studio":
      return "Build Studio";
    case "analyze_studio":
      return "Analyze Studio";
    case "solution_review":
      return "Solution Review";
    case "recommendation_engine":
      return "Recommendations";
    default:
      return studioType;
  }
}
