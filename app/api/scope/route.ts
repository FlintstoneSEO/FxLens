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
    const response = await generateScopeWithOpenAI(parsed.data as import("@/lib/contracts/workspace").ScopeRequest);
    return NextResponse.json(response);
  } catch {
    const fallback = createScopeMockResponse(parsed.data as import("@/lib/contracts/workspace").ScopeRequest);
    return NextResponse.json(fallback);
  }
}
