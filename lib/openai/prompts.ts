import type { AnalyzeRequest, BuildRequest, RecommendationRequest, ScopeRequest } from "@/lib/contracts/workspace";

type PromptPair = {
  system: string;
  user: string;
};

type StudioPromptDefinition<TRequest> = {
  responseName: string;
  studioInstructions: string[];
  createUserSections: (request: TRequest) => string[];
};

const sharedSystemInstructions = [
  "You are an expert Power Apps solution architect.",
  "Return valid JSON only.",
  "Do not include markdown fences.",
  "Preserve existing response contract keys exactly.",
  "Keep output practical, implementation-oriented, and concise."
];

const scopeResponseShape = {
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
};

const buildResponseShape = {
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
};

const analyzeResponseShape = {
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
};

const recommendationResponseShape = {
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
};

function formatJsonBlock(label: string, value: unknown): string {
  return [label, JSON.stringify(value, null, 2)].join("\n");
}

function buildPrompt<TRequest>(definition: StudioPromptDefinition<TRequest>, request: TRequest): PromptPair {
  return {
    system: [
      ...sharedSystemInstructions,
      ...definition.studioInstructions,
      `Generate a ${definition.responseName} JSON payload for FxLens.`
    ].join(" "),
    user: definition.createUserSections(request).join("\n\n")
  };
}

const scopePromptDefinition: StudioPromptDefinition<ScopeRequest> = {
  responseName: "ScopeResponse",
  studioInstructions: [
    "Focus on app scope, modules, screens, data entities, backend recommendations, and MVP planning."
  ],
  createUserSections: (request) => [
    formatJsonBlock("Input request:", request),
    formatJsonBlock("Required response shape:", scopeResponseShape)
  ]
};

const buildPromptDefinition: StudioPromptDefinition<BuildRequest> = {
  responseName: "BuildResponse",
  studioInstructions: [
    "Tailor recommendations to the requested builder mode while keeping implementation details actionable."
  ],
  createUserSections: (request) => [
    formatJsonBlock("Input request:", request),
    formatJsonBlock("Required response shape:", buildResponseShape)
  ]
};

const analyzePromptDefinition: StudioPromptDefinition<AnalyzeRequest> = {
  responseName: "AnalyzeResponse",
  studioInstructions: [
    "Diagnose the likely root cause, explain severity clearly, and prioritize actionable remediations."
  ],
  createUserSections: (request) => [
    formatJsonBlock("Input request:", request),
    formatJsonBlock("Required response shape:", analyzeResponseShape)
  ]
};

export function createScopePrompts(request: ScopeRequest): PromptPair {
  return buildPrompt(scopePromptDefinition, request);
}

export function createBuildPrompts(request: BuildRequest): PromptPair {
  return buildPrompt(buildPromptDefinition, request);
}

export function createAnalyzePrompts(request: AnalyzeRequest): PromptPair {
  return buildPrompt(analyzePromptDefinition, request);
}

const recommendationPromptDefinition: StudioPromptDefinition<RecommendationRequest> = {
  responseName: "RecommendationResponse",
  studioInstructions: [
    "Recommend practical Power Apps solution approaches tailored to the scenario, constraints, and desired outcomes."
  ],
  createUserSections: (request) => [
    formatJsonBlock("Input request:", request),
    formatJsonBlock("Required response shape:", recommendationResponseShape)
  ]
};

export function createRecommendationPrompts(request: RecommendationRequest): PromptPair {
  return buildPrompt(recommendationPromptDefinition, request);
}
