import type { AnalyzeRequest, AnalyzeResponse, BuildRequest, BuildResponse, ScopeRequest, ScopeResponse } from "@/lib/contracts/workspace";

export type SavedRunStudio = "scope" | "build" | "analyze";

export type SavedRunRequestMap = {
  scope: ScopeRequest;
  build: BuildRequest;
  analyze: AnalyzeRequest;
};

export type SavedRunResponseMap = {
  scope: ScopeResponse;
  build: BuildResponse;
  analyze: AnalyzeResponse;
};

export type SavedRunRecord<TStudio extends SavedRunStudio = SavedRunStudio> = {
  id: string;
  studio: TStudio;
  title: string;
  createdAt: string;
  request: SavedRunRequestMap[TStudio];
  response: SavedRunResponseMap[TStudio];
};

const HISTORY_STORAGE_KEY = "fxlens.saved-runs";
const RERUN_STORAGE_KEY = "fxlens.pending-rerun";
const HISTORY_LIMIT = 24;

function isBrowser() {
  return typeof window !== "undefined";
}

export function getStudioPath(studio: SavedRunStudio) {
  switch (studio) {
    case "scope":
      return "/scope";
    case "build":
      return "/build";
    case "analyze":
      return "/analyze";
  }
}

export function createSavedRunRecord<TStudio extends SavedRunStudio>(input: {
  studio: TStudio;
  title: string;
  request: SavedRunRequestMap[TStudio];
  response: SavedRunResponseMap[TStudio];
}): SavedRunRecord<TStudio> {
  return {
    id: `${input.studio}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    ...input
  };
}

export function readSavedRuns(): SavedRunRecord[] {
  if (!isBrowser()) {
    return [];
  }

  const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as SavedRunRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRun(record: SavedRunRecord) {
  if (!isBrowser()) {
    return;
  }

  const nextRuns = [record, ...readSavedRuns().filter((item) => item.id !== record.id)].slice(0, HISTORY_LIMIT);
  window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(nextRuns));
}

export function getSavedRunById(id: string) {
  return readSavedRuns().find((item) => item.id === id) ?? null;
}

export function queueSavedRunForRerun(record: SavedRunRecord) {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.setItem(RERUN_STORAGE_KEY, JSON.stringify(record));
}

export function consumeQueuedRerun<TStudio extends SavedRunStudio>(studio: TStudio): SavedRunRecord<TStudio> | null {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.sessionStorage.getItem(RERUN_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as SavedRunRecord;

    if (parsed.studio !== studio) {
      return null;
    }

    window.sessionStorage.removeItem(RERUN_STORAGE_KEY);
    return parsed as SavedRunRecord<TStudio>;
  } catch {
    window.sessionStorage.removeItem(RERUN_STORAGE_KEY);
    return null;
  }
}

export function formatSavedRunTimestamp(value: string) {
  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Saved recently";
  }

  return parsedDate.toLocaleString();
}
