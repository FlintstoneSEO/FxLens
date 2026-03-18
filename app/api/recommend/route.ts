import { createRecommendationMockResponse } from "@/lib/mocks/api";
import { persistSuccessfulStudioRunSafely } from "@/lib/server/studio-run-history";
import { createValidationErrorResponse, parseAndValidateRequest, recommendationRequestSchema } from "@/lib/validation/workspace";

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseAndValidateRequest(request, recommendationRequestSchema);

  if (!parsed.success) {
    return createValidationErrorResponse(parsed.error);
  }

  const requestData = parsed.data as import("@/lib/contracts/workspace").RecommendationRequest;
  const response = createRecommendationMockResponse(requestData);

  await persistSuccessfulStudioRunSafely({
    studioArea: "recommendation_engine",
    route: "/api/recommend",
    requestPayload: requestData,
    responsePayload: response,
    startedAt: new Date().toISOString()
  });

  return Response.json(response);
}
