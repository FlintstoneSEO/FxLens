import { NextResponse } from "next/server";

import { createRecommendationMockResponse } from "@/lib/mocks/api";
import { parseAndValidateRequest, recommendationRequestSchema } from "@/lib/validation/workspace";

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseAndValidateRequest(request, recommendationRequestSchema);

  if (!parsed.success) {
    return NextResponse.json(parsed.error, { status: 400 });
  }

  const response = createRecommendationMockResponse(parsed.data as import("@/lib/contracts/workspace").RecommendationRequest);

  return NextResponse.json(response);
}
