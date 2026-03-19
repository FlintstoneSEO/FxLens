import { createRecommendationMockResponse } from "@/lib/mocks/api";
import { generateRecommendationWithOpenAI } from "@/lib/openai/workspace";
import { createValidationErrorResponse, parseAndValidateRequest, recommendationRequestSchema } from "@/lib/validation/workspace";

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseAndValidateRequest(request, recommendationRequestSchema);

  if (!parsed.success) {
    return createValidationErrorResponse(parsed.error);
  }

  const requestData = parsed.data as import("@/lib/contracts/workspace").RecommendationRequest;

  try {
    const response = await generateRecommendationWithOpenAI(requestData);
    return Response.json(response);
  } catch {
    const fallback = createRecommendationMockResponse(requestData);
    return Response.json(fallback);
  }
}
