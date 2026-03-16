import { NextResponse } from "next/server";

import { createBuildMockResponse } from "@/lib/mocks/api";
import { generateBuildWithOpenAI } from "@/lib/openai/workspace";
import { buildRequestSchema, parseAndValidateRequest } from "@/lib/validation/workspace";

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseAndValidateRequest(request, buildRequestSchema);

  if (!parsed.success) {
    return NextResponse.json(parsed.error, { status: 400 });
  }

  try {
    const response = await generateBuildWithOpenAI(parsed.data);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Build OpenAI generation failed. Falling back to mock response.", {
      error: error instanceof Error ? error.message : "Unknown error"
    });

    const fallback = createBuildMockResponse(parsed.data);
    return NextResponse.json(fallback);
  }
}
