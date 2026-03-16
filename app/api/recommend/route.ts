import { NextResponse } from "next/server";

import { createRecommendationMockResponse } from "@/lib/mocks/api";
import { generateRecommendationWithOpenAI } from "@/lib/openai/workspace";
import { parseAndValidateRequest, recommendationRequestSchema } from "@/lib/validation/workspace";

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseAndValidateRequest(request, recommendationRequestSchema);

  if (!parsed.success) {
    return NextResponse.json(parsed.error, { status: 400 });
  }

  try {
    const response = await generateRecommendationWithOpenAI(parsed.data);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Recommendation OpenAI generation failed. Falling back to mock response.", {
      error: error instanceof Error ? error.message : "Unknown error"
    });

    const fallback = createRecommendationMockResponse(parsed.data);
    return NextResponse.json(fallback);
  }
}
