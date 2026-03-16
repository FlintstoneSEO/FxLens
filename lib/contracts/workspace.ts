export type StudioArea =
  | "scope_studio"
  | "build_studio"
  | "analyze_studio"
  | "solution_review"
  | "recommendation_engine";

export type SeverityLevel = "low" | "medium" | "high" | "critical";

export type RecommendationType =
  | "power_fx"
  | "sql_view"
  | "stored_procedure"
  | "power_automate"
  | "component"
  | "screen"
  | "backend_architecture"
  | "performance";

export type DataSourceType = "dataverse" | "sql" | "sharepoint" | "api" | "mixed" | "other";

export type BuildMode = "screen_builder" | "component_builder" | "formula_builder";

export type AnalyzeMode = "formula_analyzer" | "screen_analyzer" | "component_analyzer" | "performance_advisor";

export type SqlArtifactKind = "view" | "stored_procedure";

export type UploadFileFormat = "zip" | "yaml" | "txt" | "json";

export interface RequestContext {
  correlationId?: string;
  workspaceId?: string;
  userId?: string;
  modelHint?: string;
}

export interface SuggestedScreen {
  id: string;
  name: string;
  purpose: string;
  targetRoles: string[];
  keyDataSources: string[];
  primaryActions: string[];
}

export interface SuggestedFormula {
  id: string;
  name: string;
  purpose: string;
  formula: string;
  notes: string[];
  delegationConsiderations: string[];
}

export interface SuggestedComponent {
  id: string;
  name: string;
  purpose: string;
  inputs: string[];
  outputs: string[];
  reuseNotes: string[];
}

export interface SuggestedSqlArtifact {
  id: string;
  kind: SqlArtifactKind;
  name: string;
  purpose: string;
  definitionSummary: string;
}

export interface PerformanceRecommendation {
  id: string;
  title: string;
  severity: SeverityLevel;
  priority: number;
  rationale: string;
  expectedImpact: string;
  implementationNotes: string[];
}

export interface BackendRecommendation {
  id: string;
  title: string;
  recommendationType: Extract<RecommendationType, "backend_architecture" | "sql_view" | "stored_procedure">;
  rationale: string;
  tradeoffs: string[];
  implementationNotes: string[];
}

export interface RecommendationItem {
  id: string;
  type: RecommendationType;
  title: string;
  severity: SeverityLevel;
  rationale: string;
  nextSteps: string[];
}

export interface ScopeRequest {
  projectName: string;
  businessObjective: string;
  targetUsersRoles: string;
  requirementsText: string;
  meetingNotes: string;
  preferredDataSource: DataSourceType;
  integrationNeeds: string;
  desiredOutputs: string;
  context?: RequestContext;
}

export interface ScopeResponse {
  area: "scope_studio";
  generatedAt: string;
  appSummary: string;
  recommendedModules: string[];
  suggestedScreens: SuggestedScreen[];
  dataEntities: string[];
  backendRecommendations: BackendRecommendation[];
  sqlArtifacts: SuggestedSqlArtifact[];
  powerAutomateSuggestions: string[];
  suggestedComponents: SuggestedComponent[];
  risksAndAssumptions: string[];
  mvpPlan: string[];
}

export interface BuildRequest {
  mode: BuildMode;
  promptTitle: string;
  contextSummary: string;
  inputPayload: Record<string, string>;
  context?: RequestContext;
}

export interface BuildResponse {
  area: "build_studio";
  mode: BuildMode;
  generatedAt: string;
  summary: string;
  suggestedScreens: SuggestedScreen[];
  suggestedComponents: SuggestedComponent[];
  suggestedFormulas: SuggestedFormula[];
  implementationNotes: string[];
  performanceNotes: string[];
}

export interface AnalyzeRequest {
  mode: AnalyzeMode;
  artifactName: string;
  artifactPurpose: string;
  dataSource: DataSourceType;
  symptoms: string;
  inputPayload: string;
  relatedFormulas?: string;
  context?: RequestContext;
}

export interface AnalyzeResponse {
  area: "analyze_studio";
  mode: AnalyzeMode;
  generatedAt: string;
  summary: string;
  severity: SeverityLevel;
  rootCause: string;
  findings: string[];
  optimizedFormula?: SuggestedFormula;
  delegationConsiderations: string[];
  performanceNotes: string[];
  maintainabilityNotes: string[];
  recommendations: RecommendationItem[];
}

export interface SolutionUploadMetadata {
  solutionName: string;
  environmentName: string;
  uploadedBy: string;
  uploadedAt: string;
  version: string;
}

export interface SolutionArtifact {
  id: string;
  artifactType: "screen" | "component" | "formula" | "flow" | "table" | "other";
  fileFormat?: UploadFileFormat;
  name: string;
  summary: string;
  sourcePath?: string;
}

export interface SolutionReviewRequest {
  metadata: SolutionUploadMetadata;
  artifacts: SolutionArtifact[];
  context?: RequestContext;
}

export interface SolutionReviewResponse {
  area: "solution_review";
  generatedAt: string;
  inventorySummary: string;
  architecturalFindings: string[];
  riskLevel: SeverityLevel;
  recommendedRefactors: string[];
  performanceRecommendations: PerformanceRecommendation[];
}

export interface RecommendationRequest {
  scenario: string;
  dataSourceMix: DataSourceType;
  screenCount: number;
  architectureNotes: string;
  symptoms: string;
  context?: RequestContext;
}

export interface RecommendationResponse {
  area: "recommendation_engine";
  generatedAt: string;
  recommendations: RecommendationItem[];
  performanceRecommendations: PerformanceRecommendation[];
  backendRecommendations: BackendRecommendation[];
  sqlArtifacts: SuggestedSqlArtifact[];
  suggestedComponents: SuggestedComponent[];
  suggestedFormulas: SuggestedFormula[];
}
