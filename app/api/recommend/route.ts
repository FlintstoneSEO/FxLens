import { createRecommendationMockResponse } from "@/lib/mocks/api";
import { createValidationErrorResponse, parseAndValidateRequest, recommendationRequestSchema } from "@/lib/validation/workspace";

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseAndValidateRequest(request, recommendationRequestSchema);

  if (!parsed.success) {
    return createValidationErrorResponse(parsed.error);
  }

  const response = createRecommendationMockResponse(parsed.data as import("@/lib/contracts/workspace").RecommendationRequest);

  return Response.json(response);
}
