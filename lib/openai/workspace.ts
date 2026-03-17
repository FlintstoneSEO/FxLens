import type {
  AnalyzeRequest,
  AnalyzeResponse,
  BuildRequest,
  BuildResponse,
  RecommendationRequest,
  RecommendationResponse,
  ScopeRequest,
  ScopeResponse,
  SolutionReviewRequest,
  SolutionReviewResponse
} from "@/lib/contracts/workspace";
import { requestStructuredJson } from "@/lib/openai/client";
import {
  createAnalyzePrompts,
  createBuildPrompts,
  createRecommendationPrompts,
  createScopePrompts,
  createSolutionReviewPrompts
} from "@/lib/openai/prompts";
import {
  analyzeResponseSchema,
  buildResponseSchema,
  recommendationResponseSchema,
  scopeResponseSchema,
  solutionReviewResponseSchema
} from "@/lib/openai/response-schemas";

export async function generateScopeWithOpenAI(request: ScopeRequest): Promise<ScopeResponse> {
  const prompts = createScopePrompts(request);
  return requestStructuredJson(prompts.system, prompts.user, scopeResponseSchema);
}

export async function generateBuildWithOpenAI(request: BuildRequest): Promise<BuildResponse> {
  const prompts = createBuildPrompts(request);
  return requestStructuredJson(prompts.system, prompts.user, buildResponseSchema);
}

export async function generateAnalyzeWithOpenAI(request: AnalyzeRequest): Promise<AnalyzeResponse> {
  const prompts = createAnalyzePrompts(request);
  return requestStructuredJson(prompts.system, prompts.user, analyzeResponseSchema);
}

export async function generateRecommendationWithOpenAI(
  request: RecommendationRequest
): Promise<RecommendationResponse> {
  const prompts = createRecommendationPrompts(request);
  return requestStructuredJson(prompts.system, prompts.user, recommendationResponseSchema);
}

export async function generateSolutionReviewWithOpenAI(
  request: SolutionReviewRequest
): Promise<SolutionReviewResponse> {
  const prompts = createSolutionReviewPrompts(request);
  return requestStructuredJson(prompts.system, prompts.user, solutionReviewResponseSchema);
}
