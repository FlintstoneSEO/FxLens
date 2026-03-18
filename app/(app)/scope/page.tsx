import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatusMessage } from "@/components/workspace/status-message";

const scopeOutputs = [
  "Screen and role inventory",
  "Entity and data-source recommendations",
  "SQL, flow, and automation handoff notes"
] as const;

export default function ScopePage() {
  return (
    <PageContainer>
      <PageHeader
        title="Scope Studio"
        description="Transform requirements into app structure recommendations including screens, entities, roles, SQL artifacts, and flows."
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <SectionCard
          title="Scoping Workspace"
          description="Capture raw discovery inputs, then turn them into a structured implementation brief."
        >
          <div className="space-y-5">
            <StatusMessage
              label="Workspace status"
              message="Uploads, pasted notes, and generated scope drafts will appear inline here once Phase 2 workflows are connected."
            />
            <EmptyState
              title="No scope draft yet"
              description="Bring in meeting notes, requirement lists, or a backlog summary to generate a first-pass architecture outline."
              actionLabel="Start scope draft"
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Expected outputs"
          description="Every studio now uses the same support panel pattern so next steps stay easy to scan."
        >
          <ul className="space-y-3 text-sm text-muted-foreground">
            {scopeOutputs.map((item) => (
              <li key={item} className="rounded-lg border border-border/70 bg-background/70 px-3 py-3">
                {item}
              </li>
            ))}
          </ul>
        </SectionCard>
      </section>
    </PageContainer>
  );
}
