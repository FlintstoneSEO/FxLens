import { createRecommendationMockResponse } from "@/lib/mocks/api";
import { createStudioRun } from "@/lib/server/studio-runs";
import { createValidationErrorResponse, parseAndValidateRequest, recommendationRequestSchema } from "@/lib/validation/workspace";

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseAndValidateRequest(request, recommendationRequestSchema);

  if (!parsed.success) {
    return createValidationErrorResponse(parsed.error);
  }

  const requestData = parsed.data as import("@/lib/contracts/workspace").RecommendationRequest;
  const response = createRecommendationMockResponse(requestData);

  await createStudioRun({
    studioType: "recommendations",
    inputPayload: requestData,
    outputPayload: response
  });

  return Response.json(response);
}
