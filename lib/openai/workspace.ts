import type {
  AnalyzeRequest,
  AnalyzeResponse,
  BuildRequest,
  BuildResponse,
  RecommendationRequest,
  RecommendationResponse,
  ScopeRequest,
  ScopeResponse
} from "@/lib/contracts/workspace";
import { requestStructuredJson } from "@/lib/openai/client";
import {
  createAnalyzePrompts,
  createBuildPrompts,
  createRecommendationPrompts,
  createScopePrompts
} from "@/lib/openai/prompts";
import {
  analyzeResponseSchema,
  buildResponseSchema,
  recommendationResponseSchema,
  scopeResponseSchema
} from "@/lib/openai/response-schemas";

export async function generateScopeWithOpenAI(request: ScopeRequest): Promise<ScopeResponse> {
  const prompts = createScopePrompts(request);
  return requestStructuredJson(prompts.system, prompts.user, scopeResponseSchema) as Promise<ScopeResponse>;
}

export async function generateBuildWithOpenAI(request: BuildRequest): Promise<BuildResponse> {
  const prompts = createBuildPrompts(request);
  return requestStructuredJson(prompts.system, prompts.user, buildResponseSchema) as Promise<BuildResponse>;
}

export async function generateAnalyzeWithOpenAI(request: AnalyzeRequest): Promise<AnalyzeResponse> {
  const prompts = createAnalyzePrompts(request);
  return requestStructuredJson(prompts.system, prompts.user, analyzeResponseSchema) as Promise<AnalyzeResponse>;
}

export async function generateRecommendationWithOpenAI(
  request: RecommendationRequest
): Promise<RecommendationResponse> {
  const prompts = createRecommendationPrompts(request);
  return requestStructuredJson(prompts.system, prompts.user, recommendationResponseSchema) as Promise<RecommendationResponse>;
}
