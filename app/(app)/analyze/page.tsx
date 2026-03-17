import { PageContainer } from "@/components/layout/page-container";
import { CodePanel } from "@/components/ui/code-panel";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { SeverityBadge } from "@/components/ui/severity-badge";

const sampleFormula = `Filter(
  Orders,
  CustomerId = selectedCustomer.Id &&
  LookUp(Users, Id = User().Email, Role) = "Manager"
)`;

export default function AnalyzePage() {
  return (
    <PageContainer>
      <PageHeader
        title="Analyze Studio"
        description="Inspect Power Fx formulas for delegation issues, repeated lookups, and data loading inefficiencies."
      />
      <SectionCard
        title="Formula Inspection"
        description="Sample analysis panel placeholder for upcoming analyzer workflows."
      >
        <div className="mb-4 flex items-center gap-2">
          <SeverityBadge severity="high" />
          <p className="text-sm text-muted-foreground">Potential repeated LookUp on Users data source.</p>
        </div>
        <CodePanel title="Sample Formula" language="Power Fx" code={sampleFormula} />
      </SectionCard>
    </PageContainer>
  );
}
