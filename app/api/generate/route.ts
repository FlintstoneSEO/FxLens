import { NextResponse } from "next/server";

import type { BuildRequest } from "@/lib/contracts/workspace";
import { createBuildMockResponse } from "@/lib/mocks/api";

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as BuildRequest;
  const response = createBuildMockResponse(body);

  return NextResponse.json(response);
}
