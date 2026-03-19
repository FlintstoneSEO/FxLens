"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button, buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard } from "@/components/ui/section-card";
import {
  formatSavedRunTimestamp,
  getSavedRunById,
  getStudioPath,
  queueSavedRunForRerun,
  type SavedRunRecord
} from "@/lib/run-history";

const studioLabels: Record<SavedRunRecord["studio"], string> = {
  scope: "Scope Studio",
  build: "Build Studio",
  analyze: "Analyze Studio"
};

export function RunDetailClient({ runId }: { runId: string }) {
  const [run, setRun] = useState<SavedRunRecord | null | undefined>(undefined);
  const router = useRouter();

  useEffect(() => {
    setRun(getSavedRunById(runId));
  }, [runId]);

  if (run === undefined) {
    return null;
  }

  if (!run) {
    return (
      <SectionCard title="Saved run" description="Review a saved run and reopen it in its original studio.">
        <EmptyState
          title="Saved run not found"
          description="This run may have been cleared from local browser history. Return to History to pick another run."
        />
      </SectionCard>
    );
  }

  const handleRerun = () => {
    queueSavedRunForRerun(run);
    router.push(getStudioPath(run.studio));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/history" className={buttonVariants({ variant: "ghost" })}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to history
        </Link>
        <Button type="button" variant="secondary" onClick={handleRerun}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Rerun in {studioLabels[run.studio]}
        </Button>
      </div>

      <SectionCard title={run.title} description={`Saved from ${studioLabels[run.studio]} on ${formatSavedRunTimestamp(run.createdAt)}.`}>
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Saved input</h3>
            <pre className="overflow-x-auto rounded-xl border border-border/70 bg-muted/40 p-4 text-xs leading-6 text-foreground">
              {JSON.stringify(run.request, null, 2)}
            </pre>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Saved output</h3>
            <pre className="overflow-x-auto rounded-xl border border-border/70 bg-muted/40 p-4 text-xs leading-6 text-foreground">
              {JSON.stringify(run.response, null, 2)}
            </pre>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
