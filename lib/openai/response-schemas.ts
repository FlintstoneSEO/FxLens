import { z } from "zod";
import type { Infer as ZodInfer } from "zod";

const isoDateTimeSchema = z.string().min(1);
const nonEmptyStringSchema = z.string().min(1);
const nonEmptyStringArraySchema = z.array(nonEmptyStringSchema);
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

const suggestedScreenSchema = z
  .object({
    id: nonEmptyStringSchema,
    name: nonEmptyStringSchema,
    purpose: nonEmptyStringSchema,
    targetRoles: nonEmptyStringArraySchema,
    keyDataSources: nonEmptyStringArraySchema,
    primaryActions: nonEmptyStringArraySchema
  })
  .strict();

const suggestedFormulaSchema = z
  .object({
    id: nonEmptyStringSchema,
    name: nonEmptyStringSchema,
    purpose: nonEmptyStringSchema,
    formula: nonEmptyStringSchema,
    notes: nonEmptyStringArraySchema,
    delegationConsiderations: nonEmptyStringArraySchema
  })
  .strict();

const suggestedComponentSchema = z
  .object({
    id: nonEmptyStringSchema,
    name: nonEmptyStringSchema,
    purpose: nonEmptyStringSchema,
    inputs: nonEmptyStringArraySchema,
    outputs: nonEmptyStringArraySchema,
    reuseNotes: nonEmptyStringArraySchema
  })
  .strict();

const backendRecommendationSchema = z
  .object({
    id: nonEmptyStringSchema,
    title: nonEmptyStringSchema,
    recommendationType: z.enum(["backend_architecture", "sql_view", "stored_procedure"]),
    rationale: nonEmptyStringSchema,
    tradeoffs: nonEmptyStringArraySchema,
    implementationNotes: nonEmptyStringArraySchema
  })
  .strict();

const sqlArtifactSchema = z
  .object({
    id: nonEmptyStringSchema,
    kind: z.enum(["view", "stored_procedure"]),
    name: nonEmptyStringSchema,
    purpose: nonEmptyStringSchema,
    definitionSummary: nonEmptyStringSchema
  })
  .strict();

const recommendationItemSchema = z
  .object({
    id: nonEmptyStringSchema,
    type: recommendationTypeSchema,
    title: nonEmptyStringSchema,
    severity: severitySchema,
    rationale: nonEmptyStringSchema,
    nextSteps: nonEmptyStringArraySchema
  })
  .strict();

const performanceRecommendationSchema = z
  .object({
    id: nonEmptyStringSchema,
    title: nonEmptyStringSchema,
    severity: severitySchema,
    priority: z.number().int(),
    rationale: nonEmptyStringSchema,
    expectedImpact: nonEmptyStringSchema,
    implementationNotes: nonEmptyStringArraySchema
  })
  .strict();

export const scopeResponseSchema = z
  .object({
    area: z.literal("scope_studio"),
    generatedAt: isoDateTimeSchema,
    appSummary: nonEmptyStringSchema,
    recommendedModules: nonEmptyStringArraySchema,
    suggestedScreens: z.array(suggestedScreenSchema),
    dataEntities: nonEmptyStringArraySchema,
    backendRecommendations: z.array(backendRecommendationSchema),
    sqlArtifacts: z.array(sqlArtifactSchema),
    powerAutomateSuggestions: nonEmptyStringArraySchema,
    suggestedComponents: z.array(suggestedComponentSchema),
    risksAndAssumptions: nonEmptyStringArraySchema,
    mvpPlan: nonEmptyStringArraySchema
  })
  .strict();

export const buildResponseSchema = z
  .object({
    area: z.literal("build_studio"),
    mode: z.enum(["screen_builder", "component_builder", "formula_builder"]),
    generatedAt: isoDateTimeSchema,
    summary: nonEmptyStringSchema,
    suggestedScreens: z.array(suggestedScreenSchema),
    suggestedComponents: z.array(suggestedComponentSchema),
    suggestedFormulas: z.array(suggestedFormulaSchema),
    implementationNotes: nonEmptyStringArraySchema,
    performanceNotes: nonEmptyStringArraySchema
  })
  .strict();

export const analyzeResponseSchema = z
  .object({
    area: z.literal("analyze_studio"),
    mode: z.enum(["formula_analyzer", "screen_analyzer", "component_analyzer", "performance_advisor"]),
    generatedAt: isoDateTimeSchema,
    summary: nonEmptyStringSchema,
    severity: severitySchema,
    rootCause: nonEmptyStringSchema,
    findings: nonEmptyStringArraySchema,
    optimizedFormula: suggestedFormulaSchema.optional(),
    delegationConsiderations: nonEmptyStringArraySchema,
    performanceNotes: nonEmptyStringArraySchema,
    maintainabilityNotes: nonEmptyStringArraySchema,
    recommendations: z.array(recommendationItemSchema)
  })
  .strict();

export const recommendationResponseSchema = z
  .object({
    area: z.literal("recommendation_engine"),
    generatedAt: isoDateTimeSchema,
    recommendations: z.array(recommendationItemSchema),
    performanceRecommendations: z.array(performanceRecommendationSchema),
    backendRecommendations: z.array(backendRecommendationSchema),
    sqlArtifacts: z.array(sqlArtifactSchema),
    suggestedComponents: z.array(suggestedComponentSchema),
    suggestedFormulas: z.array(suggestedFormulaSchema)
  })
  .strict();


export type _ScopeResponseSchemaMatchesContract = ZodInfer<typeof scopeResponseSchema> extends import("@/lib/contracts/workspace").ScopeResponse ? true : never;
export type _ScopeResponseContractMatchesSchema = import("@/lib/contracts/workspace").ScopeResponse extends ZodInfer<typeof scopeResponseSchema> ? true : never;
export type _BuildResponseSchemaMatchesContract = ZodInfer<typeof buildResponseSchema> extends import("@/lib/contracts/workspace").BuildResponse ? true : never;
export type _BuildResponseContractMatchesSchema = import("@/lib/contracts/workspace").BuildResponse extends ZodInfer<typeof buildResponseSchema> ? true : never;
export type _AnalyzeResponseSchemaMatchesContract = ZodInfer<typeof analyzeResponseSchema> extends import("@/lib/contracts/workspace").AnalyzeResponse ? true : never;
export type _AnalyzeResponseContractMatchesSchema = import("@/lib/contracts/workspace").AnalyzeResponse extends ZodInfer<typeof analyzeResponseSchema> ? true : never;
export type _RecommendationResponseSchemaMatchesContract = ZodInfer<typeof recommendationResponseSchema> extends import("@/lib/contracts/workspace").RecommendationResponse ? true : never;
export type _RecommendationResponseContractMatchesSchema = import("@/lib/contracts/workspace").RecommendationResponse extends ZodInfer<typeof recommendationResponseSchema> ? true : never;
