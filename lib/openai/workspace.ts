import type { ZodTypeAny } from "zod";

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

type PromptFactory<TRequest> = (request: TRequest) => { system: string; user: string };

async function generateStudioResponse<TRequest, TResponse>(
  request: TRequest,
  createPrompts: PromptFactory<TRequest>,
  responseSchema: ZodTypeAny
): Promise<TResponse> {
  const prompts = createPrompts(request);
  return requestStructuredJson(prompts.system, prompts.user, responseSchema) as Promise<TResponse>;
}

export async function generateScopeWithOpenAI(request: ScopeRequest): Promise<ScopeResponse> {
  return generateStudioResponse(request, createScopePrompts, scopeResponseSchema);
}

export async function generateBuildWithOpenAI(request: BuildRequest): Promise<BuildResponse> {
  return generateStudioResponse(request, createBuildPrompts, buildResponseSchema);
}

export async function generateAnalyzeWithOpenAI(request: AnalyzeRequest): Promise<AnalyzeResponse> {
  return generateStudioResponse(request, createAnalyzePrompts, analyzeResponseSchema);
}

export async function generateRecommendationWithOpenAI(
  request: RecommendationRequest
): Promise<RecommendationResponse> {
  const prompts = createRecommendationPrompts(request);
  return requestStructuredJson(prompts.system, prompts.user, recommendationResponseSchema) as Promise<RecommendationResponse>;
}
