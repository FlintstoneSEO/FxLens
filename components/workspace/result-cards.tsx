import type { ReactNode } from "react";

import { SeverityBadge } from "@/components/ui/severity-badge";
import type {
  BackendRecommendation,
  PerformanceRecommendation,
  RecommendationItem,
  SuggestedComponent,
  SuggestedFormula,
  SuggestedScreen,
  SuggestedSqlArtifact
} from "@/lib/contracts/workspace";

export type DetailListProps = {
  title: string;
  items: readonly string[];
};

function DetailList({ title, items }: DetailListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{title}</p>
      <ul className="space-y-1 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="list-inside list-disc">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

type ResultCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

function ResultCard({ title, subtitle, children }: ResultCardProps) {
  return (
    <article className="rounded-xl border border-border/70 bg-background/60 p-4">
      <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
      {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
      <div className="mt-3 space-y-3">{children}</div>
    </article>
  );
}


export function SummaryPanel({
  title,
  subtitle,
  items
}: {
  title: string;
  subtitle?: string;
  items: readonly string[];
}) {
  return (
    <ResultCard title={title} subtitle={subtitle}>
      <DetailList title={title} items={items} />
    </ResultCard>
  );
}

export function SuggestedScreenCard({ screen }: { screen: SuggestedScreen }) {
  return (
    <ResultCard title={screen.name} subtitle={screen.purpose}>
      <DetailList title="Target Roles" items={screen.targetRoles} />
      <DetailList title="Key Data Sources" items={screen.keyDataSources} />
      <DetailList title="Primary Actions" items={screen.primaryActions} />
    </ResultCard>
  );
}

export function SuggestedComponentCard({ component }: { component: SuggestedComponent }) {
  return (
    <ResultCard title={component.name} subtitle={component.purpose}>
      <DetailList title="Inputs" items={component.inputs} />
      <DetailList title="Outputs" items={component.outputs} />
      <DetailList title="Reuse Notes" items={component.reuseNotes} />
    </ResultCard>
  );
}

export function SuggestedFormulaCard({ formula }: { formula: SuggestedFormula }) {
  return (
    <ResultCard title={formula.name} subtitle={formula.purpose}>
      <DetailList title="Notes" items={formula.notes} />
      <DetailList title="Delegation Considerations" items={formula.delegationConsiderations} />
    </ResultCard>
  );
}

export function RecommendationCard({ recommendation }: { recommendation: RecommendationItem }) {
  return (
    <ResultCard title={recommendation.title} subtitle={recommendation.rationale}>
      <div className="flex items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Severity</p>
        <SeverityBadge severity={recommendation.severity} />
      </div>
      <DetailList title="Next Steps" items={recommendation.nextSteps} />
    </ResultCard>
  );
}

export function BackendRecommendationCard({ recommendation }: { recommendation: BackendRecommendation }) {
  return (
    <ResultCard title={recommendation.title} subtitle={recommendation.rationale}>
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
        Type: {recommendation.recommendationType}
      </p>
      <DetailList title="Tradeoffs" items={recommendation.tradeoffs} />
      <DetailList title="Implementation Notes" items={recommendation.implementationNotes} />
    </ResultCard>
  );
}

export function SqlArtifactCard({ artifact }: { artifact: SuggestedSqlArtifact }) {
  return (
    <article
      className={
        artifact.kind === "view"
          ? "rounded-xl border border-sky-300/70 bg-sky-50/60 p-4"
          : "rounded-xl border border-violet-300/70 bg-violet-50/60 p-4"
      }
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold tracking-tight">{artifact.name}</h3>
        <span className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {artifact.kind === "view" ? "SQL View" : "Stored Procedure"}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{artifact.purpose}</p>
      <p className="mt-2 text-xs text-muted-foreground">{artifact.definitionSummary}</p>
    </article>
  );
}

export function PerformanceRecommendationCard({ recommendation }: { recommendation: PerformanceRecommendation }) {
  return (
    <ResultCard title={recommendation.title} subtitle={recommendation.rationale}>
      <div className="flex flex-wrap items-center gap-2">
        <SeverityBadge severity={recommendation.severity} />
        <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground">
          Priority: {recommendation.priority}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        <span className="font-medium text-foreground">Expected impact:</span> {recommendation.expectedImpact}
      </p>
      <DetailList title="Implementation Notes" items={recommendation.implementationNotes} />
    </ResultCard>
  );
}
