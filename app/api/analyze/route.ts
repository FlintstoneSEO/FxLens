import { NextResponse } from "next/server";

import type { AnalyzeRequest } from "@/lib/contracts/workspace";
import { createAnalyzeMockResponse } from "@/lib/mocks/api";

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as AnalyzeRequest;
  const response = createAnalyzeMockResponse(body);

  return NextResponse.json(response);
}
