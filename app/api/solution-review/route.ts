import { NextResponse } from "next/server";

import type { SolutionReviewRequest } from "@/lib/contracts/workspace";
import { createSolutionReviewMockResponse } from "@/lib/mocks/api";

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as SolutionReviewRequest;
  const response = createSolutionReviewMockResponse(body);

  return NextResponse.json(response);
}
