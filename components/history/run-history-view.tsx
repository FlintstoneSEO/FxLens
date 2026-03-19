"use client";

import { useMemo, useState } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StudioType = "All studios" | "Scope Studio" | "Build Studio" | "Analyze Studio" | "Recommendations" | "Solution Review";
type RunStatus = "Completed" | "In progress" | "Needs review" | "Failed";

type RunHistoryItem = {
  id: string;
  studioType: Exclude<StudioType, "All studios">;
  title: string;
  status: RunStatus;
  createdAt: string;
};

const studioFilters: readonly StudioType[] = [
  "All studios",
  "Scope Studio",
  "Build Studio",
  "Analyze Studio",
  "Recommendations",
  "Solution Review"
];

const runHistory: readonly RunHistoryItem[] = [
  {
    id: "scope-intake-042",
    studioType: "Scope Studio",
    title: "Field service intake redesign",
    status: "Completed",
    createdAt: "2026-03-18T14:32:00.000Z"
  },
  {
    id: "build-quote-017",
    studioType: "Build Studio",
    title: "Quote approval workspace draft",
    status: "In progress",
    createdAt: "2026-03-17T09:15:00.000Z"
  },
  {
    id: "analyze-ops-203",
    studioType: "Analyze Studio",
    title: "Inventory transfer formula audit",
    status: "Needs review",
    createdAt: "2026-03-16T18:05:00.000Z"
  },
  {
    id: "recommend-support-088",
    studioType: "Recommendations",
    title: "Support queue optimization suggestions",
    status: "Completed",
    createdAt: "2026-03-15T11:48:00.000Z"
  },
  {
    id: "scope-compliance-026",
    studioType: "Scope Studio",
    title: "Compliance request triage flow",
    status: "Failed",
    createdAt: "2026-03-14T07:26:00.000Z"
  }
];

const statusStyles: Record<RunStatus, string> = {
  Completed: "border-emerald-300/70 bg-emerald-50 text-emerald-700",
  "In progress": "border-sky-300/70 bg-sky-50 text-sky-700",
  "Needs review": "border-amber-300/70 bg-amber-50 text-amber-700",
  Failed: "border-rose-300/70 bg-rose-50 text-rose-700"
};

function formatCreatedAt(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export function RunHistoryView() {
  const [studioFilter, setStudioFilter] = useState<StudioType>("All studios");

  const filteredRuns = useMemo(() => {
    if (studioFilter === "All studios") {
      return runHistory;
    }

    return runHistory.filter((run) => run.studioType === studioFilter);
  }, [studioFilter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {studioFilters.map((filter) => {
          const isActive = filter === studioFilter;

          return (
            <Button
              key={filter}
              type="button"
              variant={isActive ? "default" : "secondary"}
              size="sm"
              onClick={() => setStudioFilter(filter)}
              className={cn("rounded-full px-4", !isActive && "text-muted-foreground")}
            >
              {filter}
            </Button>
          );
        })}
      </div>

      {filteredRuns.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-border/70">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border/70 text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-[0.16em] text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-semibold">Studio type</th>
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 bg-card/60">
                {filteredRuns.map((run) => (
                  <tr key={run.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium text-foreground">{run.studioType}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{run.title}</div>
                      <div className="text-xs text-muted-foreground">Run ID: {run.id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide",
                          statusStyles[run.status]
                        )}
                      >
                        {run.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatCreatedAt(run.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No runs found"
          description="There are no saved runs for the selected studio type yet. Try another filter or run a studio workflow to populate history."
        />
      )}
    </div>
  );
}
