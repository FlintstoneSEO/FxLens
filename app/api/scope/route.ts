import { createScopeMockResponse } from "@/lib/mocks/api";
import { generateScopeWithOpenAI } from "@/lib/openai/workspace";
import { persistSuccessfulStudioRunSafely } from "@/lib/server/studio-run-history";
import { createValidationErrorResponse, parseAndValidateRequest, scopeRequestSchema } from "@/lib/validation/workspace";

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseAndValidateRequest(request, scopeRequestSchema);

  if (!parsed.success) {
    return createValidationErrorResponse(parsed.error);
  }

  const requestData = parsed.data as import("@/lib/contracts/workspace").ScopeRequest;

  const startedAt = new Date().toISOString();

  try {
    const response = await generateScopeWithOpenAI(requestData);
    await persistSuccessfulStudioRunSafely({
      studioArea: "scope_studio",
      route: "/api/scope",
      requestPayload: requestData,
      responsePayload: response,
      startedAt
    });
    return Response.json(response);
  } catch {
    const fallback = createScopeMockResponse(requestData);
    await persistSuccessfulStudioRunSafely({
      studioArea: "scope_studio",
      route: "/api/scope",
      requestPayload: requestData,
      responsePayload: fallback,
      startedAt
    });
    return Response.json(fallback);
  }
}
