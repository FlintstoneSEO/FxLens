import { createBuildMockResponse } from "@/lib/mocks/api";
import { generateBuildWithOpenAI } from "@/lib/openai/workspace";
import { buildRequestSchema, createValidationErrorResponse, parseAndValidateRequest } from "@/lib/validation/workspace";

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseAndValidateRequest(request, buildRequestSchema);

  if (!parsed.success) {
    return createValidationErrorResponse(parsed.error);
  }

  const requestData = parsed.data as import("@/lib/contracts/workspace").BuildRequest;

  try {
    const response = await generateBuildWithOpenAI(requestData);
    return Response.json(response);
  } catch {
    const fallback = createBuildMockResponse(requestData);
    return Response.json(fallback);
  }
}
