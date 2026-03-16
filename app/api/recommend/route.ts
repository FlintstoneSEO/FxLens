import { NextResponse } from "next/server";

import type { RecommendationRequest } from "@/lib/contracts/workspace";
import { createRecommendationMockResponse } from "@/lib/mocks/api";

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as RecommendationRequest;
  const response = createRecommendationMockResponse(body);

  return NextResponse.json(response);
}
