import { BookmarkPlus, FileStack, Sparkles } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatusMessage } from "@/components/workspace/status-message";

const templatePatterns = [
  {
    title: "Reusable briefs",
    description: "Save approved prompt structures for scope, build, recommendations, and review workflows.",
    icon: FileStack
  },
  {
    title: "Team consistency",
    description: "Shared templates help new runs feel aligned no matter which studio the team starts from.",
    icon: Sparkles
  },
  {
    title: "Quick-start creation",
    description: "Create, version, and reuse templates without changing the core studio experience.",
    icon: BookmarkPlus
  }
] as const;

export default function PromptsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Templates"
        description="Manage reusable studio templates so scoping, generation, recommendations, and review prep all follow the same team-approved patterns."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)]">
        <SectionCard
          title="Template library"
          description="Saved templates will live here with the same clear empty, loading, and saved states used across the rest of the product."
        >
          <div className="space-y-4">
            <StatusMessage
              label="Library status"
              message="Template persistence is not connected yet. This surface is ready for shared prompts, review briefs, and export-ready starting points."
            />
            <EmptyState
              eyebrow="Templates"
              title="No templates yet"
              description="Create reusable starting points for your team’s most common studio runs so every output begins with the same structure and tone."
              actionLabel="Create template"
            />
          </div>
        </SectionCard>

        <SectionCard
          title="How templates will help"
          description="The same patterns used in core studios, adapted for saved reusable inputs."
        >
          <div className="space-y-4">
            {templatePatterns.map(({ title, description, icon: Icon }) => (
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
