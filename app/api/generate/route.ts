import { createBuildMockResponse } from "@/lib/mocks/api";
import { generateBuildWithOpenAI } from "@/lib/openai/workspace";
import { createStudioRun } from "@/lib/server/studio-runs";
import { buildRequestSchema, createValidationErrorResponse, parseAndValidateRequest } from "@/lib/validation/workspace";

export async function POST(request: Request): Promise<Response> {
  const parsed = await parseAndValidateRequest(request, buildRequestSchema);

  if (!parsed.success) {
    return createValidationErrorResponse(parsed.error);
  }

  const requestData = parsed.data as import("@/lib/contracts/workspace").BuildRequest;

  const startedAt = new Date().toISOString();

  try {
    const response = await generateBuildWithOpenAI(requestData);
    await createStudioRun({
      studioType: "build",
      inputPayload: requestData,
      outputPayload: response
    });
    return Response.json(response);
  } catch {
    const fallback = createBuildMockResponse(requestData);
    await createStudioRun({
      studioType: "build",
      inputPayload: requestData,
      outputPayload: fallback
    });
    return Response.json(fallback);
  }
}
