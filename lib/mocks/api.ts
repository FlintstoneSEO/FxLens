import type {
  AnalyzeRequest,
  AnalyzeResponse,
  BackendRecommendation,
  BuildRequest,
  BuildResponse,
  RecommendationItem,
  RecommendationRequest,
  RecommendationResponse,
  ScopeRequest,
  ScopeResponse,
  SolutionReviewRequest,
  SolutionReviewResponse,
  SuggestedComponent,
  SuggestedFormula,
  SuggestedScreen,
  SuggestedSqlArtifact
} from "@/lib/contracts/workspace";

const nowIso = (): string => new Date().toISOString();

const sharedScreens: SuggestedScreen[] = [
  {
    id: "scr-dashboard",
    name: "Operations Dashboard",
    purpose: "Monitor request throughput and SLA compliance",
    targetRoles: ["Operations Manager", "Team Lead"],
    keyDataSources: ["Requests", "SLA Metrics"],
    primaryActions: ["Open request", "Escalate request"]
  },
  {
    id: "scr-intake",
    name: "Request Intake",
    purpose: "Capture new service requests and attachments",
    targetRoles: ["Technician"],
    keyDataSources: ["Requests", "Request Types"],
    primaryActions: ["Save Draft", "Submit"]
  }
];

const sharedComponents: SuggestedComponent[] = [
  {
    id: "cmp-status-card",
    name: "Status Card",
    purpose: "Display request status and escalation state",
    inputs: ["status", "priority", "dueDate"],
    outputs: ["onOpen", "onEscalate"],
    reuseNotes: ["Use across dashboard, review, and detail screens"]
  }
];

const sharedFormulas: SuggestedFormula[] = [
  {
    id: "fx-escalation-flag",
    name: "EvaluateEscalationFlag",
    purpose: "Compute escalation boolean for high-priority open requests",
    formula:
      'With({ req: LookUp(Requests, RequestId = varRequestId) }, If(!IsBlank(req) && req.Priority = "High" && req.Status <> "Closed", true, false))',
    notes: ["Uses cached record reference", "Reduces repeated LookUp calls"],
    delegationConsiderations: ["Ensure RequestId is indexed and delegable"]
  }
];

const sharedSqlArtifacts: SuggestedSqlArtifact[] = [
  {
    id: "sql-view-1",
    kind: "view",
    name: "vw_ManagerPendingQueue",
    purpose: "Pre-joined manager queue for dashboard usage",
    definitionSummary: "Joins requests, owners, and SLA tables by request id and manager role"
  },
  {
    id: "sql-sp-1",
    kind: "stored_procedure",
    name: "usp_AssignApprovalRoute",
    purpose: "Assign approval routes based on request type and region",
    definitionSummary: "Resolves routing matrix and inserts approval stages"
  }
];

const sharedBackendRecommendations: BackendRecommendation[] = [
  {
    id: "be-1",
    title: "Adopt hybrid transactional/reporting backend",
    recommendationType: "backend_architecture",
    rationale: "Keeps app operations responsive while scaling analytics workloads",
    tradeoffs: ["More integration surface", "Requires governance for synchronization"],
    implementationNotes: ["Use Dataverse for writes", "Use SQL views for operational analytics"]
  }
];

const sharedRecommendations: RecommendationItem[] = [
  {
    id: "rec-1",
    type: "performance",
    title: "Reduce repeated data lookups in control formulas",
    severity: "high",
    rationale: "Repeated LookUp calls increase render latency",
    nextSteps: ["Cache records in With()", "Move reusable logic to named formulas"]
  },
  {
    id: "rec-2",
    type: "component",
    title: "Extract status and action footer into reusable components",
    severity: "medium",
    rationale: "Minimizes duplicated formulas and improves consistency",
    nextSteps: ["Define component contracts", "Replace in top 3 screens"]
  }
];

export function createScopeMockResponse(request: ScopeRequest): ScopeResponse {
  return {
    area: "scope_studio",
    generatedAt: nowIso(),
    appSummary: `${request.projectName} solution blueprint focused on ${request.businessObjective}.`,
    recommendedModules: ["Intake", "Review", "Operations", "Reporting"],
    suggestedScreens: sharedScreens,
    dataEntities: ["Requests", "Request Types", "Approvals", "Users"],
    backendRecommendations: sharedBackendRecommendations,
    sqlArtifacts: sharedSqlArtifacts,
    powerAutomateSuggestions: [
      "Submission-to-approval routing flow",
      "SLA breach escalation flow",
      "Nightly sync to reporting store"
    ],
    suggestedComponents: sharedComponents,
    risksAndAssumptions: [
      "Role matrix may evolve by region",
      "Integration latency can impact SLA metrics"
    ],
    mvpPlan: [
      "Sprint 1: Intake + approval",
      "Sprint 2: Dashboard + notifications",
      "Sprint 3: Optimization and reporting"
    ]
  };
}

export function createBuildMockResponse(request: BuildRequest): BuildResponse {
  return {
    area: "build_studio",
    mode: request.mode,
    generatedAt: nowIso(),
    summary: `Generated ${request.mode} output for ${request.promptTitle}.`,
    suggestedScreens: sharedScreens,
    suggestedComponents: sharedComponents,
    suggestedFormulas: sharedFormulas,
    implementationNotes: [
      "Use role-scoped visibility controls",
      "Keep formulas modular and reusable"
    ],
    performanceNotes: [
      "Cache reference data once per screen load",
      "Avoid repeated nested LookUp patterns"
    ]
  };
}

export function createAnalyzeMockResponse(request: AnalyzeRequest): AnalyzeResponse {
  return {
    area: "analyze_studio",
    mode: request.mode,
    generatedAt: nowIso(),
    summary: `${request.artifactName} analysis complete with targeted optimization guidance.`,
    severity: "high",
    rootCause: "Repeated lookup patterns and mixed UI/business logic in single formulas.",
    findings: [
      "Repeated data source calls found in high-frequency control formulas",
      "Potential delegation risk when scaling datasets",
      "Logic complexity impacts readability and maintainability"
    ],
    optimizedFormula: sharedFormulas[0],
    delegationConsiderations: [
      "Validate connector delegation capabilities",
      "Ensure indexed columns for lookups and filters"
    ],
    performanceNotes: [
      "Move expensive data retrieval out of frequently re-evaluated controls",
      "Use helper variables for repeated calculations"
    ],
    maintainabilityNotes: [
      "Split long formulas into named helper formulas",
      "Document assumptions around status and priority values"
    ],
    recommendations: sharedRecommendations
  };
}

export function createRecommendationMockResponse(
  _request: RecommendationRequest
): RecommendationResponse {
  return {
    area: "recommendation_engine",
    generatedAt: nowIso(),
    recommendations: sharedRecommendations,
    performanceRecommendations: [
      {
        id: "perf-1",
        title: "Refactor startup data loading",
        severity: "high",
        priority: 1,
        rationale: "Initial load includes non-critical datasets",
        expectedImpact: "Faster first paint and improved perceived responsiveness",
        implementationNotes: ["Lazy-load secondary data", "Cache role context"]
      }
    ],
    backendRecommendations: sharedBackendRecommendations,
    sqlArtifacts: sharedSqlArtifacts,
    suggestedComponents: sharedComponents,
    suggestedFormulas: sharedFormulas
  };
}

export function createSolutionReviewMockResponse(
  request: SolutionReviewRequest
): SolutionReviewResponse {
  return {
    area: "solution_review",
    generatedAt: nowIso(),
    inventorySummary: `${request.metadata.solutionName} includes ${request.artifacts.length} artifacts for review.`,
    architecturalFindings: [
      "Screen responsibilities are partially duplicated",
      "Formula logic can be centralized into reusable patterns"
    ],
    riskLevel: "medium",
    recommendedRefactors: [
      "Extract shared status component",
      "Introduce consistent data loading strategy across screens"
    ],
    performanceRecommendations: [
      {
        id: "perf-sol-1",
        title: "Reduce duplicate data refresh patterns",
        severity: "medium",
        priority: 2,
        rationale: "Multiple refresh calls trigger avoidable network roundtrips",
        expectedImpact: "Lower latency and fewer transient UI stalls",
        implementationNotes: ["Consolidate refresh logic", "Use targeted patch updates"]
      }
    ]
  };
}
