import { createAnalyzeMockResponse } from "@/lib/mocks/api";
import { generateAnalyzeWithOpenAI } from "@/lib/openai/workspace";
import { createStudioRun } from "@/lib/server/studio-runs";
import { analyzeRequestSchema, createValidationErrorResponse, parseAndValidateRequest } from "@/lib/validation/workspace";

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseAndValidateRequest(request, analyzeRequestSchema);

  if (!parsed.success) {
    return createValidationErrorResponse(parsed.error);
  }

  const requestData = parsed.data as import("@/lib/contracts/workspace").AnalyzeRequest;

  try {
    const response = await generateAnalyzeWithOpenAI(requestData);
    await createStudioRun({
      studioType: "analyze",
      inputPayload: requestData,
      outputPayload: response
    });
    return Response.json(response);
  } catch {
    const fallback = createAnalyzeMockResponse(requestData);
    await createStudioRun({
      studioType: "analyze",
      inputPayload: requestData,
      outputPayload: fallback
    });
    return Response.json(fallback);
  }
}
