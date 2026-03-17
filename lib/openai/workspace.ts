import type { AnalyzeRequest, AnalyzeResponse, BuildRequest, BuildResponse, ScopeRequest, ScopeResponse } from "@/lib/contracts/workspace";
import { requestStructuredJson } from "@/lib/openai/client";
import { createAnalyzePrompts, createBuildPrompts, createScopePrompts } from "@/lib/openai/prompts";
import { analyzeResponseSchema, buildResponseSchema, scopeResponseSchema } from "@/lib/openai/response-schemas";

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
