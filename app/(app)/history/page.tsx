import { Clock3, Database, Search } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatusMessage } from "@/components/workspace/status-message";

const historySignals = [
  {
    title: "Runs and exports",
    description: "Generated outputs, saved review briefs, and future exports will land in one shared timeline.",
    icon: Clock3
  },
  {
    title: "Searchable context",
    description: "Filters for studios, templates, and timestamps will plug into the same workspace pattern used elsewhere.",
    icon: Search
  },
  {
    title: "Persistence layer",
    description: "Connected storage will unlock durable history, loading states, and actionable run detail views.",
    icon: Database
  }
] as const;

export default function HistoryPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Run History"
        description="Review saved studio runs, exported review briefs, and upcoming persistence-backed activity from one shared workspace surface."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(280px,0.92fr)]">
        <SectionCard
          title="Workspace timeline"
          description="Run history will show the same lifecycle states used across the studios once persistent storage is connected."
        >
          <div className="space-y-4">
            <StatusMessage
              label="Loading state"
              tone="loading"
              message="Connecting run history. Saved activity, exports, and filters will appear here when persistence is enabled."
            />
            <EmptyState
              eyebrow="Run history"
              title="No saved runs yet"
              description="When your team starts saving studio output, this timeline will collect run summaries, export activity, and quick links back into each workspace."
              actionLabel="History controls coming soon"
            />
          </div>
        </SectionCard>

        <SectionCard
          title="What will appear here"
          description="A quick preview of the patterns this page is aligning to across Phase 3 surfaces."
        >
          <div className="space-y-4">
            {historySignals.map(({ title, description, icon: Icon }) => (
              <div key={title} className="rounded-xl border border-border/70 bg-background/70 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-lg bg-muted p-2 text-muted-foreground">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">{title}</p>
                    <p className="text-sm leading-6 text-muted-foreground">{description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </PageContainer>
  );
}
