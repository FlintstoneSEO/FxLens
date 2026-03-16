import { NextResponse } from "next/server";

import type { ScopeRequest } from "@/lib/contracts/workspace";
import { createScopeMockResponse } from "@/lib/mocks/api";

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as ScopeRequest;
  const response = createScopeMockResponse(body);

  return NextResponse.json(response);
}
