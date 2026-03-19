import type {
  AnalyzeResponse,
  BackendRecommendation,
  BuildResponse,
  PerformanceRecommendation,
  RecommendationItem,
  RecommendationResponse,
  ScopeResponse,
  SuggestedComponent,
  SuggestedFormula,
  SuggestedScreen,
  SuggestedSqlArtifact
} from "@/lib/contracts/workspace";

function joinLines(lines: Array<string | null | undefined | false>, separator = "\n"): string {
  return lines.filter(Boolean).join(separator);
}

function formatList(title: string, items: readonly string[]): string {
  if (items.length === 0) {
    return "";
  }

  return joinLines([title, ...items.map((item) => `- ${item}`)]);
}

function formatScreen(screen: SuggestedScreen): string {
  return joinLines([
    screen.name,
    screen.purpose,
    formatList("Target Roles", screen.targetRoles),
    formatList("Key Data Sources", screen.keyDataSources),
    formatList("Primary Actions", screen.primaryActions)
  ]);
}

function formatComponent(component: SuggestedComponent): string {
  return joinLines([
    component.name,
    component.purpose,
    formatList("Inputs", component.inputs),
    formatList("Outputs", component.outputs),
    formatList("Reuse Notes", component.reuseNotes)
  ]);
}

function formatFormula(formula: SuggestedFormula): string {
  return joinLines([
    formula.name,
    formula.purpose,
    "Formula",
    formula.formula,
    formatList("Notes", formula.notes),
    formatList("Delegation Considerations", formula.delegationConsiderations)
  ]);
}

function formatRecommendation(recommendation: RecommendationItem): string {
  return joinLines([
    recommendation.title,
    `Type: ${recommendation.type.replaceAll("_", " ")}`,
    `Severity: ${recommendation.severity}`,
    recommendation.rationale,
    formatList("Next Steps", recommendation.nextSteps)
  ]);
}

function formatBackendRecommendation(recommendation: BackendRecommendation): string {
  return joinLines([
    recommendation.title,
    `Type: ${recommendation.recommendationType.replaceAll("_", " ")}`,
    recommendation.rationale,
    formatList("Tradeoffs", recommendation.tradeoffs),
    formatList("Implementation Notes", recommendation.implementationNotes)
  ]);
}

function formatPerformanceRecommendation(recommendation: PerformanceRecommendation): string {
  return joinLines([
    recommendation.title,
    `Severity: ${recommendation.severity}`,
    `Priority: ${recommendation.priority}`,
    recommendation.rationale,
    `Expected impact: ${recommendation.expectedImpact}`,
    formatList("Implementation Notes", recommendation.implementationNotes)
  ]);
}

function formatSqlArtifact(artifact: SuggestedSqlArtifact): string {
  return joinLines([
    artifact.name,
    `Kind: ${artifact.kind.replaceAll("_", " ")}`,
    artifact.purpose,
    `Definition summary: ${artifact.definitionSummary}`
  ]);
}

function formatSection(title: string, content: string): string {
  return content ? joinLines([title, content], "\n\n") : "";
}

export function formatScopeResultForCopy(result: ScopeResponse): string {
  return [
    formatSection("Executive Summary", result.appSummary),
    formatSection("Solution Shape", result.recommendedModules.map((item) => `- ${item}`).join("\n")),
    formatSection("Roles in Scope", Array.from(new Set(result.suggestedScreens.flatMap((screen) => screen.targetRoles))).sort().map((item) => `- ${item}`).join("\n")),
    formatSection("Data Entities", result.dataEntities.map((item) => `- ${item}`).join("\n")),
    formatSection("Flows and Automations", result.powerAutomateSuggestions.map((item) => `- ${item}`).join("\n")),
    formatSection("Screens", result.suggestedScreens.map(formatScreen).join("\n\n")),
    formatSection("Reusable Components", result.suggestedComponents.map(formatComponent).join("\n\n")),
    formatSection("Backend Recommendations", result.backendRecommendations.map(formatBackendRecommendation).join("\n\n")),
    formatSection("SQL and Data Artifacts", result.sqlArtifacts.map(formatSqlArtifact).join("\n\n")),
    formatSection("Risks and Assumptions", result.risksAndAssumptions.map((item) => `- ${item}`).join("\n")),
    formatSection("Recommended MVP Plan", result.mvpPlan.map((item) => `- ${item}`).join("\n"))
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function formatBuildResultForCopy(result: BuildResponse): string {
  return [
    formatSection("Build Package Overview", result.summary),
    formatSection("Recommended Screen Blueprint", result.suggestedScreens.map(formatScreen).join("\n\n")),
    formatSection("Reusable Component Plan", result.suggestedComponents.map(formatComponent).join("\n\n")),
    formatSection("Starter Formulas", result.suggestedFormulas.map(formatFormula).join("\n\n")),
    formatSection("Build Guidance", result.implementationNotes.map((item) => `- ${item}`).join("\n")),
    formatSection("Optimization Reminders", result.performanceNotes.map((item) => `- ${item}`).join("\n"))
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function formatAnalyzeResultForCopy(result: AnalyzeResponse): string {
  const risks = [...result.delegationConsiderations, ...result.performanceNotes, ...result.maintainabilityNotes];

  return [
    formatSection("Analysis Summary", joinLines([result.summary, `Severity: ${result.severity}`, `Root cause: ${result.rootCause}`], "\n")),
    formatSection("Findings", result.findings.map((item) => `- ${item}`).join("\n")),
    formatSection("Risks and Watchouts", risks.map((item) => `- ${item}`).join("\n")),
    formatSection("Recommendations", result.recommendations.map(formatRecommendation).join("\n\n")),
    result.optimizedFormula ? formatSection("Optimized Formula", formatFormula(result.optimizedFormula)) : ""
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function formatRecommendationResultForCopy(result: RecommendationResponse): string {
  return [
    formatSection("Priority Recommendations", result.recommendations.map(formatRecommendation).join("\n\n")),
    formatSection("Performance Actions", result.performanceRecommendations.map(formatPerformanceRecommendation).join("\n\n")),
    formatSection("Backend and Data Ideas", [...result.backendRecommendations.map(formatBackendRecommendation), ...result.sqlArtifacts.map(formatSqlArtifact)].join("\n\n")),
    formatSection("Implementation Ideas", [...result.suggestedComponents.map(formatComponent), ...result.suggestedFormulas.map(formatFormula)].join("\n\n"))
  ]
    .filter(Boolean)
    .join("\n\n");
}
