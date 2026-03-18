import { PageContainer } from "@/components/layout/page-container";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { StatusMessage } from "@/components/workspace/status-message";

const buildOutputs = [
  "Screen blueprint suggestions",
  "Reusable component and pattern guidance",
  "Starter Power Fx and implementation notes"
] as const;

export default function BuildPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Build Studio"
        description="Generate implementation-ready screen blueprints, reusable components, and starter Power Fx output."
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <SectionCard
          title="Blueprint Generator"
          description="Move from approved scope to build-ready assets without changing the overall app flow."
        >
          <div className="space-y-5">
            <StatusMessage
              label="Workspace status"
              message="Generated blueprints, reusable components, and handoff artifacts will load here once project configuration is available."
            />
            <EmptyState
              title="No build plan yet"
              description="Start from a scoped solution to generate screens, shared components, and starter formulas for the next implementation pass."
              actionLabel="Start build plan"
            />
          </div>
        </SectionCard>

        <SectionCard
          title="Expected outputs"
          description="Use this panel to quickly confirm what the build pass will prepare for the team."
        >
          <ul className="space-y-3 text-sm text-muted-foreground">
            {buildOutputs.map((item) => (
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
