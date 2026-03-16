import { NextResponse } from "next/server";

import { createScopeMockResponse } from "@/lib/mocks/api";
import { parseAndValidateRequest, scopeRequestSchema } from "@/lib/validation/workspace";

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseAndValidateRequest(request, scopeRequestSchema);

  if (!parsed.success) {
    return NextResponse.json(parsed.error, { status: 400 });
  }

  const response = createScopeMockResponse(parsed.data);

  return NextResponse.json(response);
}
