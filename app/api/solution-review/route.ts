import { NextResponse } from "next/server";

import { createSolutionReviewMockResponse } from "@/lib/mocks/api";
import { generateSolutionReviewWithOpenAI } from "@/lib/openai/workspace";
import { parseAndValidateRequest, solutionReviewRequestSchema } from "@/lib/validation/workspace";

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseAndValidateRequest(request, solutionReviewRequestSchema);

  if (!parsed.success) {
    return NextResponse.json(parsed.error, { status: 400 });
  }

  try {
    const response = await generateSolutionReviewWithOpenAI(parsed.data);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Solution Review OpenAI generation failed. Falling back to mock response.", {
      error: error instanceof Error ? error.message : "Unknown error"
    });

    const fallback = createSolutionReviewMockResponse(parsed.data);
    return NextResponse.json(fallback);
  }
}
