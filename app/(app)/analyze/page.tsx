import { PageContainer } from "@/components/layout/page-container";
import { StatusMessage } from "@/components/workspace/status-message";
import { CodePanel } from "@/components/ui/code-panel";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { SeverityBadge } from "@/components/ui/severity-badge";

const sampleFormula = `Filter(
  Orders,
  CustomerId = selectedCustomer.Id &&
  LookUp(Users, Id = User().Email, Role) = "Manager"
)`;

const analysisOutputs = [
  "Delegation and formula risk findings",
  "Performance-focused recommendation set",
  "Optimized rewrite opportunities"
] as const;

export default function AnalyzePage() {
  return (
    <PageContainer>
      <PageHeader
        title="Analyze Studio"
        description="Inspect Power Fx formulas for delegation issues, repeated lookups, and data loading inefficiencies."
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <SectionCard
          title="Formula Inspection"
          description="Review analyzer findings in the same panel structure used across the other studios."
        >
          <div className="space-y-5">
            <StatusMessage
              label="Analysis run"
              message="Sample output is shown below until live analysis, loading, and retry states are wired into the workspace."
            />
            <div className="rounded-xl border border-rose-300/60 bg-rose-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <SeverityBadge severity="high" />
                <p className="text-sm font-medium text-rose-700">Potential repeated LookUp on the Users data source.</p>
              </div>
              <p className="text-sm text-rose-700/90">
                Cache the current user role before filtering to reduce repeated calls during screen rendering.
              </p>
            </div>
            <CodePanel title="Sample Formula" language="Power Fx" code={sampleFormula} />
          </div>
        </SectionCard>

        <SectionCard
          title="Expected outputs"
          description="Analyzer recommendations now follow the same quick-scan pattern as the other Phase 2 studios."
        >
          <ul className="space-y-3 text-sm text-muted-foreground">
            {analysisOutputs.map((item) => (
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
