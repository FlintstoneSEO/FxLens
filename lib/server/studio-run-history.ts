import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import type {
  AnalyzeRequest,
  AnalyzeResponse,
  BuildRequest,
  BuildResponse,
  RecommendationRequest,
  RecommendationResponse,
  RequestContext,
  ScopeRequest,
  ScopeResponse,
  StudioArea
} from "@/lib/contracts/workspace";

type PersistedStudioRequest = ScopeRequest | BuildRequest | AnalyzeRequest | RecommendationRequest;
type PersistedStudioResponse = ScopeResponse | BuildResponse | AnalyzeResponse | RecommendationResponse;

type PersistedStudioRun = {
  id: string;
  studioArea: StudioArea;
  status: "success";
  route: string;
  label: string;
  mode?: string;
  startedAt: string;
  completedAt: string;
  generatedAt?: string;
  requestContext?: RequestContext;
  requestPayload: PersistedStudioRequest;
  responsePayload: PersistedStudioResponse;
};

const RUN_HISTORY_DIRECTORY = path.join(process.cwd(), ".data");
const RUN_HISTORY_FILE = path.join(RUN_HISTORY_DIRECTORY, "studio-runs.jsonl");

export async function persistSuccessfulStudioRun(params: {
  studioArea: StudioArea;
  route: string;
  requestPayload: PersistedStudioRequest;
  responsePayload: PersistedStudioResponse;
  startedAt?: string;
}): Promise<void> {
  const startedAt = params.startedAt ?? new Date().toISOString();
  const completedAt = new Date().toISOString();

  const record: PersistedStudioRun = {
    id: randomUUID(),
    studioArea: params.studioArea,
    status: "success",
    route: params.route,
    label: createRunLabel(params.studioArea, params.requestPayload),
    mode: extractRunMode(params.requestPayload, params.responsePayload),
    startedAt,
    completedAt,
    generatedAt: extractGeneratedAt(params.responsePayload),
    requestContext: params.requestPayload.context,
    requestPayload: params.requestPayload,
    responsePayload: params.responsePayload
  };

  await mkdir(RUN_HISTORY_DIRECTORY, { recursive: true });
  await appendFile(RUN_HISTORY_FILE, `${JSON.stringify(record)}\n`, "utf8");
}

export async function persistSuccessfulStudioRunSafely(params: {
  studioArea: StudioArea;
  route: string;
  requestPayload: PersistedStudioRequest;
  responsePayload: PersistedStudioResponse;
  startedAt?: string;
}): Promise<void> {
  try {
    await persistSuccessfulStudioRun(params);
  } catch (error) {
    console.error(`Failed to persist ${params.studioArea} run history.`, error);
  }
}

function createRunLabel(studioArea: StudioArea, requestPayload: PersistedStudioRequest): string {
  if (studioArea === "scope_studio" && "projectName" in requestPayload) {
    return requestPayload.projectName;
  }

  if (studioArea === "build_studio" && "promptTitle" in requestPayload) {
    return requestPayload.promptTitle;
  }

  if (studioArea === "analyze_studio" && "artifactName" in requestPayload) {
    return requestPayload.artifactName;
  }

  if (studioArea === "recommendation_engine" && "scenario" in requestPayload) {
    return requestPayload.scenario;
  }

  return studioArea;
}

function extractRunMode(
  requestPayload: PersistedStudioRequest,
  responsePayload: PersistedStudioResponse
): string | undefined {
  if ("mode" in responsePayload && typeof responsePayload.mode === "string") {
    return responsePayload.mode;
  }

  if ("mode" in requestPayload && typeof requestPayload.mode === "string") {
    return requestPayload.mode;
  }

  return undefined;
}

function extractGeneratedAt(responsePayload: PersistedStudioResponse): string | undefined {
  return "generatedAt" in responsePayload ? responsePayload.generatedAt : undefined;
}
