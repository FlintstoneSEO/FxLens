import { z } from "zod";

import type {
  AnalyzeRequest,
  BuildRequest,
  RecommendationRequest,
  ScopeRequest,
  SolutionReviewRequest
} from "@/lib/contracts/workspace";

const requestContextSchema = z
  .object({
    correlationId: z.string().min(1).optional(),
    workspaceId: z.string().min(1).optional(),
    userId: z.string().min(1).optional(),
    modelHint: z.string().min(1).optional()
  })
  .strict();

const dataSourceTypeSchema = z.enum(["dataverse", "sql", "sharepoint", "api", "mixed", "other"]);
const buildModeSchema = z.enum(["screen_builder", "component_builder", "formula_builder"]);
const analyzeModeSchema = z.enum(["formula_analyzer", "screen_analyzer", "component_analyzer", "performance_advisor"]);
const uploadFileFormatSchema = z.enum(["zip", "yaml", "txt", "json"]);

const solutionArtifactSchema = z
  .object({
    id: z.string().min(1),
    artifactType: z.enum(["screen", "component", "formula", "flow", "table", "other"]),
    fileFormat: uploadFileFormatSchema.optional(),
    name: z.string().min(1),
    summary: z.string().min(1),
    sourcePath: z.string().min(1).optional()
  })
  .strict();

export const scopeRequestSchema = z
  .object({
    projectName: z.string().min(1),
    businessObjective: z.string().min(1),
    targetUsersRoles: z.string().min(1),
    requirementsText: z.string().min(1),
    meetingNotes: z.string().min(1),
    preferredDataSource: dataSourceTypeSchema,
    integrationNeeds: z.string().min(1),
    desiredOutputs: z.string().min(1),
    context: requestContextSchema.optional()
  })
  .strict();

export const buildRequestSchema = z
  .object({
    mode: buildModeSchema,
    promptTitle: z.string().min(1),
    contextSummary: z.string().min(1),
    inputPayload: z.record(z.string()),
    context: requestContextSchema.optional()
  })
  .strict();

export const analyzeRequestSchema = z
  .object({
    mode: analyzeModeSchema,
    artifactName: z.string().min(1),
    artifactPurpose: z.string().min(1),
    dataSource: dataSourceTypeSchema,
    symptoms: z.string().min(1),
    inputPayload: z.string(),
    relatedFormulas: z.string().optional(),
    context: requestContextSchema.optional()
  })
  .strict();

export const recommendationRequestSchema = z
  .object({
    scenario: z.string().min(1),
    dataSourceMix: dataSourceTypeSchema,
    screenCount: z.number().int().nonnegative(),
    architectureNotes: z.string().min(1),
    symptoms: z.string().min(1),
    context: requestContextSchema.optional()
  })
  .strict();

export const solutionReviewRequestSchema = z
  .object({
    metadata: z
      .object({
        solutionName: z.string().min(1),
        environmentName: z.string().min(1),
        uploadedBy: z.string().min(1),
        uploadedAt: z.string().min(1),
        version: z.string().min(1)
      })
      .strict(),
    artifacts: z.array(solutionArtifactSchema),
    context: requestContextSchema.optional()
  })
  .strict();

type _ScopeSchemaMatchesContract = z.infer<typeof scopeRequestSchema> extends ScopeRequest ? true : never;
type _ScopeContractMatchesSchema = ScopeRequest extends z.infer<typeof scopeRequestSchema> ? true : never;
type _BuildSchemaMatchesContract = z.infer<typeof buildRequestSchema> extends BuildRequest ? true : never;
type _BuildContractMatchesSchema = BuildRequest extends z.infer<typeof buildRequestSchema> ? true : never;
type _AnalyzeSchemaMatchesContract = z.infer<typeof analyzeRequestSchema> extends AnalyzeRequest ? true : never;
type _AnalyzeContractMatchesSchema = AnalyzeRequest extends z.infer<typeof analyzeRequestSchema> ? true : never;
type _RecommendSchemaMatchesContract = z.infer<typeof recommendationRequestSchema> extends RecommendationRequest ? true : never;
type _RecommendContractMatchesSchema = RecommendationRequest extends z.infer<typeof recommendationRequestSchema> ? true : never;
type _SolutionReviewSchemaMatchesContract = z.infer<typeof solutionReviewRequestSchema> extends SolutionReviewRequest ? true : never;
type _SolutionReviewContractMatchesSchema = SolutionReviewRequest extends z.infer<typeof solutionReviewRequestSchema>
  ? true
  : never;

export type ValidationIssue = {
  path: string;
  message: string;
};

export type ValidationErrorPayload = {
  error: {
    code: "INVALID_REQUEST_BODY";
    message: string;
    issues: ValidationIssue[];
  };
};

type ParseValidationSuccess<T> = {
  success: true;
  data: T;
};

type ParseValidationFailure = {
  success: false;
  error: ValidationErrorPayload;
};

export async function parseAndValidateRequest<TSchema extends z.ZodTypeAny>(
  request: Request,
  schema: TSchema
): Promise<ParseValidationSuccess<z.infer<TSchema>> | ParseValidationFailure> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return {
      success: false,
      error: {
        error: {
          code: "INVALID_REQUEST_BODY",
          message: "Request body must be valid JSON.",
          issues: [{ path: "$", message: "Malformed JSON payload." }]
        }
      }
    };
  }

  const parsed = schema.safeParse(payload);

  if (!parsed.success) {
    return {
      success: false,
      error: {
        error: {
          code: "INVALID_REQUEST_BODY",
          message: "Request body validation failed.",
          issues: parsed.error.issues.map((issue: { path: Array<string | number>; message: string }) => ({
            path: issue.path.length > 0 ? issue.path.join(".") : "$",
            message: issue.message
          }))
        }
      }
    };
  }

  return {
    success: true,
    data: parsed.data
  };
}
