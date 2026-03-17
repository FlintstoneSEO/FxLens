import { NextResponse } from "next/server";

import { createAnalyzeMockResponse } from "@/lib/mocks/api";
import { generateAnalyzeWithOpenAI } from "@/lib/openai/workspace";
import { analyzeRequestSchema, parseAndValidateRequest } from "@/lib/validation/workspace";

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseAndValidateRequest(request, analyzeRequestSchema);

  if (!parsed.success) {
    return NextResponse.json(parsed.error, { status: 400 });
  }

  try {
    const response = await generateAnalyzeWithOpenAI(parsed.data);
    return NextResponse.json(response);
  } catch {
    const fallback = createAnalyzeMockResponse(parsed.data);
    return NextResponse.json(fallback);
  }
}
