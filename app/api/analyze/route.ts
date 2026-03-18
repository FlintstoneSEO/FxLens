import { createAnalyzeMockResponse } from "@/lib/mocks/api";
import { generateAnalyzeWithOpenAI } from "@/lib/openai/workspace";
import { persistSuccessfulStudioRunSafely } from "@/lib/server/studio-run-history";
import { analyzeRequestSchema, createValidationErrorResponse, parseAndValidateRequest } from "@/lib/validation/workspace";

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseAndValidateRequest(request, analyzeRequestSchema);

  if (!parsed.success) {
    return createValidationErrorResponse(parsed.error);
  }

  const requestData = parsed.data as import("@/lib/contracts/workspace").AnalyzeRequest;

  const startedAt = new Date().toISOString();

  try {
    const response = await generateAnalyzeWithOpenAI(requestData);
    await persistSuccessfulStudioRunSafely({
      studioArea: "analyze_studio",
      route: "/api/analyze",
      requestPayload: requestData,
      responsePayload: response,
      startedAt
    });
    return Response.json(response);
  } catch {
    const fallback = createAnalyzeMockResponse(requestData);
    await persistSuccessfulStudioRunSafely({
      studioArea: "analyze_studio",
      route: "/api/analyze",
      requestPayload: requestData,
      responsePayload: fallback,
      startedAt
    });
    return Response.json(fallback);
  }
}
