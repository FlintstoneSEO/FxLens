import { NextResponse } from "next/server";

import { createSolutionReviewMockResponse } from "@/lib/mocks/api";
import { parseAndValidateRequest, solutionReviewRequestSchema } from "@/lib/validation/workspace";

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseAndValidateRequest(request, solutionReviewRequestSchema);

  if (!parsed.success) {
    return NextResponse.json(parsed.error, { status: 400 });
  }

  const response = createSolutionReviewMockResponse(parsed.data as import("@/lib/contracts/workspace").SolutionReviewRequest);

  return NextResponse.json(response);
}
