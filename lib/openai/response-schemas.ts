import { z } from "zod";

const severitySchema = z.enum(["low", "medium", "high", "critical"]);
const recommendationTypeSchema = z.enum([
  "power_fx",
  "sql_view",
  "stored_procedure",
  "power_automate",
  "component",
  "screen",
  "backend_architecture",
  "performance"
]);

const suggestedScreenSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  purpose: z.string().min(1),
  targetRoles: z.array(z.string().min(1)),
  keyDataSources: z.array(z.string().min(1)),
  primaryActions: z.array(z.string().min(1))
});

const suggestedFormulaSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  purpose: z.string().min(1),
  formula: z.string().min(1),
  notes: z.array(z.string().min(1)),
  delegationConsiderations: z.array(z.string().min(1))
});

const suggestedComponentSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  purpose: z.string().min(1),
  inputs: z.array(z.string().min(1)),
  outputs: z.array(z.string().min(1)),
  reuseNotes: z.array(z.string().min(1))
});

const backendRecommendationSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  recommendationType: z.enum(["backend_architecture", "sql_view", "stored_procedure"]),
  rationale: z.string().min(1),
  tradeoffs: z.array(z.string().min(1)),
  implementationNotes: z.array(z.string().min(1))
});

const sqlArtifactSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["view", "stored_procedure"]),
  name: z.string().min(1),
  purpose: z.string().min(1),
  definitionSummary: z.string().min(1)
});

const recommendationItemSchema = z.object({
  id: z.string().min(1),
  type: recommendationTypeSchema,
  title: z.string().min(1),
  severity: severitySchema,
  rationale: z.string().min(1),
  nextSteps: z.array(z.string().min(1))
});

const performanceRecommendationSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  severity: severitySchema,
  priority: z.number().int(),
  rationale: z.string().min(1),
  expectedImpact: z.string().min(1),
  implementationNotes: z.array(z.string().min(1))
});

export const scopeResponseSchema = z.object({
  area: z.literal("scope_studio"),
  generatedAt: z.string().min(1),
  appSummary: z.string().min(1),
  recommendedModules: z.array(z.string().min(1)),
  suggestedScreens: z.array(suggestedScreenSchema),
  dataEntities: z.array(z.string().min(1)),
  backendRecommendations: z.array(backendRecommendationSchema),
  sqlArtifacts: z.array(sqlArtifactSchema),
  powerAutomateSuggestions: z.array(z.string().min(1)),
  suggestedComponents: z.array(suggestedComponentSchema),
  risksAndAssumptions: z.array(z.string().min(1)),
  mvpPlan: z.array(z.string().min(1))
});

export const buildResponseSchema = z.object({
  area: z.literal("build_studio"),
  mode: z.enum(["screen_builder", "component_builder", "formula_builder"]),
  generatedAt: z.string().min(1),
  summary: z.string().min(1),
  suggestedScreens: z.array(suggestedScreenSchema),
  suggestedComponents: z.array(suggestedComponentSchema),
  suggestedFormulas: z.array(suggestedFormulaSchema),
  implementationNotes: z.array(z.string().min(1)),
  performanceNotes: z.array(z.string().min(1))
});

export const analyzeResponseSchema = z.object({
  area: z.literal("analyze_studio"),
  mode: z.enum(["formula_analyzer", "screen_analyzer", "component_analyzer", "performance_advisor"]),
  generatedAt: z.string().min(1),
  summary: z.string().min(1),
  severity: severitySchema,
  rootCause: z.string().min(1),
  findings: z.array(z.string().min(1)),
  optimizedFormula: suggestedFormulaSchema.optional(),
  delegationConsiderations: z.array(z.string().min(1)),
  performanceNotes: z.array(z.string().min(1)),
  maintainabilityNotes: z.array(z.string().min(1)),
  recommendations: z.array(recommendationItemSchema)
});

export const recommendationResponseSchema = z.object({
  area: z.literal("recommendation_engine"),
  generatedAt: z.string().min(1),
  recommendations: z.array(recommendationItemSchema),
  performanceRecommendations: z.array(performanceRecommendationSchema),
  backendRecommendations: z.array(backendRecommendationSchema),
  sqlArtifacts: z.array(sqlArtifactSchema),
  suggestedComponents: z.array(suggestedComponentSchema),
  suggestedFormulas: z.array(suggestedFormulaSchema)
});
