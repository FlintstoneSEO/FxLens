import { createAnalyzeMockResponse } from "@/lib/mocks/api";
import { generateAnalyzeWithOpenAI } from "@/lib/openai/workspace";
import { analyzeRequestSchema, createValidationErrorResponse, parseAndValidateRequest } from "@/lib/validation/workspace";

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseAndValidateRequest(request, analyzeRequestSchema);

  if (!parsed.success) {
    return createValidationErrorResponse(parsed.error);
  }

  try {
    const response = await generateAnalyzeWithOpenAI(parsed.data);
    return Response.json(response);
  } catch {
    const fallback = createAnalyzeMockResponse(parsed.data);
    return Response.json(fallback);
  }
}
