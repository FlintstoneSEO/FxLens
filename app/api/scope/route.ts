import { createScopeMockResponse } from "@/lib/mocks/api";
import { generateScopeWithOpenAI } from "@/lib/openai/workspace";
import { createValidationErrorResponse, parseAndValidateRequest, scopeRequestSchema } from "@/lib/validation/workspace";

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseAndValidateRequest(request, scopeRequestSchema);

  if (!parsed.success) {
    return createValidationErrorResponse(parsed.error);
  }

  const requestData = parsed.data as import("@/lib/contracts/workspace").ScopeRequest;

  try {
    const response = await generateScopeWithOpenAI(requestData);
    return Response.json(response);
  } catch {
    const fallback = createScopeMockResponse(requestData);
    return Response.json(fallback);
  }
}
