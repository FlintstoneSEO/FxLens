"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard } from "@/components/ui/section-card";
import {
  formatSavedRunTimestamp,
  getStudioPath,
  queueSavedRunForRerun,
  readSavedRuns,
  type SavedRunRecord
} from "@/lib/run-history";

const studioLabels: Record<SavedRunRecord["studio"], string> = {
  scope: "Scope Studio",
  build: "Build Studio",
  analyze: "Analyze Studio"
};

export function RunHistoryClient() {
  const [runs, setRuns] = useState<SavedRunRecord[]>([]);
  const router = useRouter();

  useEffect(() => {
    setRuns(readSavedRuns());
  }, []);

  const hasRuns = useMemo(() => runs.length > 0, [runs]);

  const handleRerun = (run: SavedRunRecord) => {
    queueSavedRunForRerun(run);
    router.push(getStudioPath(run.studio));
  };

  if (!hasRuns) {
    return (
      <SectionCard
        title="Timeline"
        description="Saved runs appear here after a successful studio execution."
      >
        <EmptyState
          title="No history available"
          description="Run Scope, Build, or Analyze once to create a reusable saved run you can open again later."
        />
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Timeline"
      description="Open a saved run, review the payload, or send the same input back into the matching studio."
    >
      <div className="space-y-4">
        {runs.map((run) => (
          <article key={run.id} className="rounded-2xl border border-border/70 bg-background/70 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full border border-border bg-muted px-2.5 py-1 font-medium text-foreground">
                    {studioLabels[run.studio]}
                  </span>
                  <span>Saved {formatSavedRunTimestamp(run.createdAt)}</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">{run.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Reuse this saved input to continue from the same starting point in {studioLabels[run.studio]}.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" onClick={() => handleRerun(run)}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Rerun
                </Button>
                <Link href={`/history/${run.id}`} className={buttonVariants({ variant: "ghost" })}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View details
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
