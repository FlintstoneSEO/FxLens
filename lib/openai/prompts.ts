import type {
  AnalyzeRequest,
  BuildRequest,
  RecommendationRequest,
  ScopeRequest,
  SolutionReviewRequest
} from "@/lib/contracts/workspace";

const sharedRules = [
  "You are an expert Power Apps solution architect.",
  "Return valid JSON only.",
  "Do not include markdown fences.",
  "Preserve existing response contract keys exactly.",
  "Keep output practical, implementation-oriented, and concise."
].join(" ");

export function createScopePrompts(request: ScopeRequest): { system: string; user: string } {
  return {
    system: `${sharedRules} Generate a ScopeResponse JSON payload for FxLens.`,
    user: [
      "Input request:",
      JSON.stringify(request, null, 2),
      "Required response shape:",
      JSON.stringify(
        {
          area: "scope_studio",
          generatedAt: "ISO-8601 datetime",
          appSummary: "string",
          recommendedModules: ["string"],
          suggestedScreens: [
            {
              id: "string",
              name: "string",
              purpose: "string",
              targetRoles: ["string"],
              keyDataSources: ["string"],
              primaryActions: ["string"]
            }
          ],
          dataEntities: ["string"],
          backendRecommendations: [
            {
              id: "string",
              title: "string",
              recommendationType: "backend_architecture | sql_view | stored_procedure",
              rationale: "string",
              tradeoffs: ["string"],
              implementationNotes: ["string"]
            }
          ],
          sqlArtifacts: [
            {
              id: "string",
              kind: "view | stored_procedure",
              name: "string",
              purpose: "string",
              definitionSummary: "string"
            }
          ],
          powerAutomateSuggestions: ["string"],
          suggestedComponents: [
            {
              id: "string",
              name: "string",
              purpose: "string",
              inputs: ["string"],
              outputs: ["string"],
              reuseNotes: ["string"]
            }
          ],
          risksAndAssumptions: ["string"],
          mvpPlan: ["string"]
        },
        null,
        2
      )
    ].join("\n\n")
  };
}

export function createBuildPrompts(request: BuildRequest): { system: string; user: string } {
  return {
    system: `${sharedRules} Generate a BuildResponse JSON payload for FxLens.`,
    user: [
      "Input request:",
      JSON.stringify(request, null, 2),
      "Required response shape:",
      JSON.stringify(
        {
          area: "build_studio",
          mode: "screen_builder | component_builder | formula_builder",
          generatedAt: "ISO-8601 datetime",
          summary: "string",
          suggestedScreens: [
            {
              id: "string",
              name: "string",
              purpose: "string",
              targetRoles: ["string"],
              keyDataSources: ["string"],
              primaryActions: ["string"]
            }
          ],
          suggestedComponents: [
            {
              id: "string",
              name: "string",
              purpose: "string",
              inputs: ["string"],
              outputs: ["string"],
              reuseNotes: ["string"]
            }
          ],
          suggestedFormulas: [
            {
              id: "string",
              name: "string",
              purpose: "string",
              formula: "string",
              notes: ["string"],
              delegationConsiderations: ["string"]
            }
          ],
          implementationNotes: ["string"],
          performanceNotes: ["string"]
        },
        null,
        2
      )
    ].join("\n\n")
  };
}

export function createAnalyzePrompts(request: AnalyzeRequest): { system: string; user: string } {
  return {
    system: `${sharedRules} Generate an AnalyzeResponse JSON payload for FxLens.`,
    user: [
      "Input request:",
      JSON.stringify(request, null, 2),
      "Required response shape:",
      JSON.stringify(
        {
          area: "analyze_studio",
          mode: "formula_analyzer | screen_analyzer | component_analyzer | performance_advisor",
          generatedAt: "ISO-8601 datetime",
          summary: "string",
          severity: "low | medium | high | critical",
          rootCause: "string",
          findings: ["string"],
          optimizedFormula: {
            id: "string",
            name: "string",
            purpose: "string",
            formula: "string",
            notes: ["string"],
            delegationConsiderations: ["string"]
          },
          delegationConsiderations: ["string"],
          performanceNotes: ["string"],
          maintainabilityNotes: ["string"],
          recommendations: [
            {
              id: "string",
              type: "power_fx | sql_view | stored_procedure | power_automate | component | screen | backend_architecture | performance",
              title: "string",
              severity: "low | medium | high | critical",
              rationale: "string",
              nextSteps: ["string"]
            }
          ]
        },
        null,
        2
      )
    ].join("\n\n")
  };
}

export function createRecommendationPrompts(request: RecommendationRequest): {
  system: string;
  user: string;
} {
  return {
    system: `${sharedRules} Generate a RecommendationResponse JSON payload for FxLens.`,
    user: [
      "Input request:",
      JSON.stringify(request, null, 2),
      "Required response shape:",
      JSON.stringify(
        {
          area: "recommendation_engine",
          generatedAt: "ISO-8601 datetime",
          recommendations: [
            {
              id: "string",
              type: "power_fx | sql_view | stored_procedure | power_automate | component | screen | backend_architecture | performance",
              title: "string",
              severity: "low | medium | high | critical",
              rationale: "string",
              nextSteps: ["string"]
            }
          ],
          performanceRecommendations: [
            {
              id: "string",
              title: "string",
              severity: "low | medium | high | critical",
              priority: 1,
              rationale: "string",
              expectedImpact: "string",
              implementationNotes: ["string"]
            }
          ],
          backendRecommendations: [
            {
              id: "string",
              title: "string",
              recommendationType: "backend_architecture | sql_view | stored_procedure",
              rationale: "string",
              tradeoffs: ["string"],
              implementationNotes: ["string"]
            }
          ],
          sqlArtifacts: [
            {
              id: "string",
              kind: "view | stored_procedure",
              name: "string",
              purpose: "string",
              definitionSummary: "string"
            }
          ],
          suggestedComponents: [
            {
              id: "string",
              name: "string",
              purpose: "string",
              inputs: ["string"],
              outputs: ["string"],
              reuseNotes: ["string"]
            }
          ],
          suggestedFormulas: [
            {
              id: "string",
              name: "string",
              purpose: "string",
              formula: "string",
              notes: ["string"],
              delegationConsiderations: ["string"]
            }
          ]
        },
        null,
        2
      )
    ].join("\n\n")
  };
}

export function createSolutionReviewPrompts(request: SolutionReviewRequest): {
  system: string;
  user: string;
} {
  return {
    system: `${sharedRules} Generate a SolutionReviewResponse JSON payload for FxLens.`,
    user: [
      "Input request:",
      JSON.stringify(request, null, 2),
      "Required response shape:",
      JSON.stringify(
        {
          area: "solution_review",
          generatedAt: "ISO-8601 datetime",
          inventorySummary: "string",
          architecturalFindings: ["string"],
          riskLevel: "low | medium | high | critical",
          recommendedRefactors: ["string"],
          performanceRecommendations: [
            {
              id: "string",
              title: "string",
              severity: "low | medium | high | critical",
              priority: 1,
              rationale: "string",
              expectedImpact: "string",
              implementationNotes: ["string"]
            }
          ]
        },
        null,
        2
      )
    ].join("\n\n")
  };
}
