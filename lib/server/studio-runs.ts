import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import type { AnalyzeRequest, BuildRequest, RecommendationRequest, ScopeRequest } from "@/lib/contracts/workspace";
import type { CreateStudioRunInput, StudioRunInputPayload, StudioRunRecord, StudioRunType } from "@/lib/contracts/studio-runs";

const DATA_DIRECTORY = path.join(process.cwd(), "data");
const STUDIO_RUNS_FILE = path.join(DATA_DIRECTORY, "studio-runs.json");

interface StudioRunsStore {
  runs: StudioRunRecord[];
}

async function ensureStore(): Promise<void> {
  await mkdir(DATA_DIRECTORY, { recursive: true });

  try {
    await readFile(STUDIO_RUNS_FILE, "utf8");
  } catch {
    await writeFile(STUDIO_RUNS_FILE, JSON.stringify({ runs: [] }, null, 2), "utf8");
  }
}

async function readStore(): Promise<StudioRunsStore> {
  await ensureStore();
  const raw = await readFile(STUDIO_RUNS_FILE, "utf8");
  return JSON.parse(raw) as StudioRunsStore;
}

async function writeStore(store: StudioRunsStore): Promise<void> {
  await ensureStore();
  await writeFile(STUDIO_RUNS_FILE, JSON.stringify(store, null, 2), "utf8");
}

function buildGeneratedTitle(studioType: StudioRunType, payload: StudioRunInputPayload): string {
  switch (studioType) {
    case "scope":
      return `Scope: ${(payload as ScopeRequest).projectName}`;
    case "build":
      return `Build: ${(payload as BuildRequest).promptTitle}`;
    case "analyze":
      return `Analyze: ${(payload as AnalyzeRequest).artifactName}`;
    case "recommendations":
      return `Recommendations: ${(payload as RecommendationRequest).scenario}`;
    default:
      return `${studioType} run`;
  }
}

export async function createStudioRun(input: CreateStudioRunInput): Promise<StudioRunRecord> {
  const store = await readStore();
  const timestamp = new Date().toISOString();
  const run: StudioRunRecord = {
    id: randomUUID(),
    studioType: input.studioType,
    title: input.title?.trim() || buildGeneratedTitle(input.studioType, input.inputPayload),
    inputPayload: input.inputPayload,
    outputPayload: input.outputPayload,
    status: input.status ?? "completed",
    createdAt: timestamp,
    updatedAt: timestamp
  };

  store.runs.unshift(run);
  await writeStore(store);

  return run;
}

export async function listStudioRuns(studioType?: StudioRunType): Promise<StudioRunRecord[]> {
  const store = await readStore();

  if (!studioType) {
    return store.runs;
  }

  return store.runs.filter((run) => run.studioType === studioType);
}

export async function getStudioRunById(id: string): Promise<StudioRunRecord | null> {
  const store = await readStore();
  return store.runs.find((run) => run.id === id) ?? null;
}
