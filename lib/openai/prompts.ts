import type { AnalyzeRequest, BuildRequest, RecommendationRequest, ScopeRequest } from "@/lib/contracts/workspace";

const sharedRules = [
  "You are an expert Power Apps solution architect producing production-ready structured outputs for FxLens.",
  "Return valid JSON only.",
  "Do not include markdown fences, commentary, or any text outside the JSON object.",
  "Preserve existing response contract keys exactly and do not add extra top-level or nested keys.",
  "Populate every required field with concrete, implementation-ready content.",
  "Use professional language with specific recommendations, not placeholders.",
  "If a section has no strong recommendation, return an empty array for that section.",
  "Keep IDs short, stable-looking, and unique within the response.",
  "Use ISO-8601 UTC timestamps for generatedAt.",
  "Ensure summaries, rationales, findings, notes, and next steps are concise but decision-useful.",
  "Keep list items atomic and non-duplicative.",
  "Only include optimizedFormula when the request mode is formula_analyzer or a formula rewrite is clearly useful."
].join(" ");

function createSchemaGuidance(area: string): string {
  return [
    `Required output area: ${area}.`,
    "Contract rules:",
    "- Match the JSON shape exactly.",
    "- Keep enum values exactly as shown.",
    "- Prefer 2-6 strong items per list when the request supports them.",
    "- Keep titles and names short and scannable.",
    "- Keep implementation notes and next steps action-oriented.",
    "- Do not use null unless the schema explicitly allows it.",
    "- Do not repeat the same recommendation across multiple sections unless materially different."
  ].join("\n");
}

export function createScopePrompts(request: ScopeRequest): { system: string; user: string } {
  return {
    system: `${sharedRules} Generate a ScopeResponse JSON payload for FxLens.`,
    user: [
      createSchemaGuidance("scope_studio"),
      "Focus on turning the project brief into a crisp scope, architecture direction, automation opportunities, and MVP delivery path.",
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
      createSchemaGuidance("build_studio"),
      "Focus on implementation-ready build assets that align with the requested build mode while staying consistent with scope outputs.",
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
      createSchemaGuidance("analyze_studio"),
      "Focus on diagnosis quality: explain likely root cause, surface the highest-value findings, and provide actionable remediation.",
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
      ),
      "If optimizedFormula is not appropriate, omit that property entirely rather than returning an empty object."
    ].join("\n\n")
  };
}

export function createRecommendationPrompts(request: RecommendationRequest): { system: string; user: string } {
  return {
    system: `${sharedRules} Generate a RecommendationResponse JSON payload for FxLens.`,
    user: [
      createSchemaGuidance("recommendation_engine"),
      "Focus on prioritized recommendations, concrete performance improvements, architecture direction, and implementation-ready assets.",
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
      ),
      "Rank performanceRecommendations with 1 as highest priority and keep priorities unique when multiple items are returned."
    ].join("\n\n")
  };
}
