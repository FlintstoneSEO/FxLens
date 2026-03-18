import { createSolutionReviewMockResponse } from "@/lib/mocks/api";
import { createValidationErrorResponse, parseAndValidateRequest, solutionReviewRequestSchema } from "@/lib/validation/workspace";

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseAndValidateRequest(request, solutionReviewRequestSchema);

  if (!parsed.success) {
    return createValidationErrorResponse(parsed.error);
  }

  const response = createSolutionReviewMockResponse(parsed.data as import("@/lib/contracts/workspace").SolutionReviewRequest);

  return Response.json(response);
}
