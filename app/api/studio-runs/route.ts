import { NextResponse } from "next/server";

import type { CreateStudioRunInput, StudioRunType } from "@/lib/contracts/studio-runs";
import { createStudioRun, listStudioRuns } from "@/lib/server/studio-runs";
import { createValidationErrorResponse } from "@/lib/validation/workspace";

const validStudioRunTypes: StudioRunType[] = ["scope", "build", "analyze", "recommendations"];

function isStudioRunType(value: string): value is StudioRunType {
  return validStudioRunTypes.includes(value as StudioRunType);
}

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const studioTypeParam = searchParams.get("studioType");

  if (studioTypeParam && !isStudioRunType(studioTypeParam)) {
    return createValidationErrorResponse({
      error: {
        code: "INVALID_REQUEST_BODY",
        message: "Query string validation failed.",
        issues: [{ path: "studioType", message: "studioType must be one of scope, build, analyze, recommendations." }]
      }
    });
  }

  const studioTypeFilter = studioTypeParam && isStudioRunType(studioTypeParam) ? studioTypeParam : undefined;
  const runs = await listStudioRuns(studioTypeFilter);
  return NextResponse.json({ runs });
}

export async function POST(request: Request): Promise<Response> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return createValidationErrorResponse({
      error: {
        code: "INVALID_REQUEST_BODY",
        message: "Request body must be valid JSON.",
        issues: [{ path: "$", message: "Malformed JSON payload." }]
      }
    });
  }

  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return createValidationErrorResponse({
      error: {
        code: "INVALID_REQUEST_BODY",
        message: "Request body validation failed.",
        issues: [{ path: "$", message: "Expected object." }]
      }
    });
  }

  const input = payload as Partial<CreateStudioRunInput> & Record<string, unknown>;

  if (typeof input.studioType !== "string" || !isStudioRunType(input.studioType)) {
    return createValidationErrorResponse({
      error: {
        code: "INVALID_REQUEST_BODY",
        message: "Request body validation failed.",
        issues: [{ path: "studioType", message: "studioType must be one of scope, build, analyze, recommendations." }]
      }
    });
  }

  if (typeof input.inputPayload !== "object" || input.inputPayload === null || Array.isArray(input.inputPayload)) {
    return createValidationErrorResponse({
      error: {
        code: "INVALID_REQUEST_BODY",
        message: "Request body validation failed.",
        issues: [{ path: "inputPayload", message: "inputPayload must be an object." }]
      }
    });
  }

  if (typeof input.outputPayload !== "object" || input.outputPayload === null || Array.isArray(input.outputPayload)) {
    return createValidationErrorResponse({
      error: {
        code: "INVALID_REQUEST_BODY",
        message: "Request body validation failed.",
        issues: [{ path: "outputPayload", message: "outputPayload must be an object." }]
      }
    });
  }

  if (input.title !== undefined && typeof input.title !== "string") {
    return createValidationErrorResponse({
      error: {
        code: "INVALID_REQUEST_BODY",
        message: "Request body validation failed.",
        issues: [{ path: "title", message: "title must be a string when provided." }]
      }
    });
  }

  if (input.status !== undefined && input.status !== "completed" && input.status !== "failed") {
    return createValidationErrorResponse({
      error: {
        code: "INVALID_REQUEST_BODY",
        message: "Request body validation failed.",
        issues: [{ path: "status", message: "status must be completed or failed." }]
      }
    });
  }

  const run = await createStudioRun(input as CreateStudioRunInput);
  return NextResponse.json(run, { status: 201 });
}
