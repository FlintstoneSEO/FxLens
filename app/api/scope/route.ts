import { NextResponse } from "next/server";

import { createScopeMockResponse } from "@/lib/mocks/api";
import { generateScopeWithOpenAI } from "@/lib/openai/workspace";
import { parseAndValidateRequest, scopeRequestSchema } from "@/lib/validation/workspace";

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseAndValidateRequest(request, scopeRequestSchema);

  if (!parsed.success) {
    return NextResponse.json(parsed.error, { status: 400 });
  }

  try {
    const response = await generateScopeWithOpenAI(parsed.data);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Scope OpenAI generation failed. Falling back to mock response.", {
      error: error instanceof Error ? error.message : "Unknown error"
    });

    const fallback = createScopeMockResponse(parsed.data);
    return NextResponse.json(fallback);
  }
}
