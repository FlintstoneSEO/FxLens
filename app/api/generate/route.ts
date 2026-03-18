import { createBuildMockResponse } from "@/lib/mocks/api";
import { generateBuildWithOpenAI } from "@/lib/openai/workspace";
import { persistSuccessfulStudioRunSafely } from "@/lib/server/studio-run-history";
import { buildRequestSchema, createValidationErrorResponse, parseAndValidateRequest } from "@/lib/validation/workspace";

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseAndValidateRequest(request, buildRequestSchema);

  if (!parsed.success) {
    return createValidationErrorResponse(parsed.error);
  }

  const requestData = parsed.data as import("@/lib/contracts/workspace").BuildRequest;

  const startedAt = new Date().toISOString();

  try {
    const response = await generateBuildWithOpenAI(requestData);
    await persistSuccessfulStudioRunSafely({
      studioArea: "build_studio",
      route: "/api/generate",
      requestPayload: requestData,
      responsePayload: response,
      startedAt
    });
    return Response.json(response);
  } catch {
    const fallback = createBuildMockResponse(requestData);
    await persistSuccessfulStudioRunSafely({
      studioArea: "build_studio",
      route: "/api/generate",
      requestPayload: requestData,
      responsePayload: fallback,
      startedAt
    });
    return Response.json(fallback);
  }
}
