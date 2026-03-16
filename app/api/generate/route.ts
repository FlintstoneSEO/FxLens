import { NextResponse } from "next/server";

import { createBuildMockResponse } from "@/lib/mocks/api";
import { buildRequestSchema, parseAndValidateRequest } from "@/lib/validation/workspace";

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseAndValidateRequest(request, buildRequestSchema);

  if (!parsed.success) {
    return NextResponse.json(parsed.error, { status: 400 });
  }

  const response = createBuildMockResponse(parsed.data);

  return NextResponse.json(response);
}
