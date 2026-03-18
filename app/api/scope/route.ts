import { createScopeMockResponse } from "@/lib/mocks/api";
import { generateScopeWithOpenAI } from "@/lib/openai/workspace";
import { createStudioRun } from "@/lib/server/studio-runs";
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
    await createStudioRun({
      studioType: "scope",
      inputPayload: requestData,
      outputPayload: response
    });
    return Response.json(response);
  } catch {
    const fallback = createScopeMockResponse(requestData);
    await createStudioRun({
      studioType: "scope",
      inputPayload: requestData,
      outputPayload: fallback
    });
    return Response.json(fallback);
  }
}
