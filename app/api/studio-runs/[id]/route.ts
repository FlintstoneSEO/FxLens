import { NextResponse } from "next/server";

import { getStudioRunById } from "@/lib/server/studio-runs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params;
  const run = await getStudioRunById(id);

  if (!run) {
    return NextResponse.json({ error: { code: "NOT_FOUND", message: `Studio run ${id} was not found.` } }, { status: 404 });
  }

  return NextResponse.json(run);
}
