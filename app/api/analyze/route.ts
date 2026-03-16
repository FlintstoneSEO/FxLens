import { NextResponse } from "next/server";

import { createAnalyzeMockResponse } from "@/lib/mocks/api";
import { analyzeRequestSchema, parseAndValidateRequest } from "@/lib/validation/workspace";

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseAndValidateRequest(request, analyzeRequestSchema);

  if (!parsed.success) {
    return NextResponse.json(parsed.error, { status: 400 });
  }

  const response = createAnalyzeMockResponse(parsed.data);

  return NextResponse.json(response);
}
