import type {
  AnalyzeRequest,
  AnalyzeResponse,
  BuildRequest,
  BuildResponse,
  RecommendationRequest,
  RecommendationResponse,
  ScopeRequest,
  ScopeResponse
} from "@/lib/contracts/workspace";

export type StudioRunType = "scope" | "build" | "analyze" | "recommendations";

export type StudioRunStatus = "completed" | "failed";

export type StudioRunInputPayload = ScopeRequest | BuildRequest | AnalyzeRequest | RecommendationRequest;

export type StudioRunOutputPayload = ScopeResponse | BuildResponse | AnalyzeResponse | RecommendationResponse;

export interface StudioRunRecord {
  id: string;
  studioType: StudioRunType;
  title: string;
  inputPayload: StudioRunInputPayload;
  outputPayload: StudioRunOutputPayload;
  status: StudioRunStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudioRunInput {
  studioType: StudioRunType;
  title?: string;
  inputPayload: StudioRunInputPayload;
  outputPayload: StudioRunOutputPayload;
  status?: StudioRunStatus;
}
