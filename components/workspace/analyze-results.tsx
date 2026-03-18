import { AlertTriangle, CheckCircle2, ClipboardList, Gauge, Lightbulb, SearchCode, Sparkles } from "lucide-react";

import { CodePanel } from "@/components/ui/code-panel";
import { EmptyState } from "@/components/ui/empty-state";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { cn } from "@/lib/utils";
import type { AnalyzeResponse, RecommendationItem } from "@/lib/contracts/workspace";

type AnalyzeResultsProps = {
  result: AnalyzeResponse | null;
};

type ResultListProps = {
  title: string;
  items: readonly string[];
  icon: typeof ClipboardList;
  emptyLabel: string;
};

function ResultList({ title, items, icon: Icon, emptyLabel }: ResultListProps) {
  return (
    <article className="rounded-xl border border-border/70 bg-background/60 p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className="rounded-lg border border-border/70 bg-card p-2 text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
      </div>
      {items.length > 0 ? (
        <ul className="space-y-2 text-sm text-muted-foreground">
          {items.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      )}
    </article>
  );
}

type RecommendationCardProps = {
  recommendation: RecommendationItem;
};

function RecommendationCard({ recommendation }: RecommendationCardProps) {
  return (
    <article className="rounded-xl border border-border/70 bg-background/60 p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">{recommendation.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{recommendation.rationale}</p>
        </div>
        <SeverityBadge severity={recommendation.severity} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs uppercase tracking-wide text-muted-foreground">
          {recommendation.type.replaceAll("_", " ")}
        </span>
      </div>
      {recommendation.nextSteps.length > 0 ? (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Next Steps</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {recommendation.nextSteps.map((step) => (
              <li key={step} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}

function SummaryMetric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "accent" }) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4 shadow-sm",
        tone === "accent" ? "border-sky-300/70 bg-sky-50/70" : "border-border/70 bg-background/60"
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm text-foreground">{value}</p>
    </div>
  );
}

export function AnalyzeResults({ result }: AnalyzeResultsProps) {
  if (!result) {
    return (
      <EmptyState
        title="No analysis results yet"
        description="Configure the artifact details, run Analyze, and structured findings will appear here with issues, risks, recommendations, and optimized output."
        actionLabel="Awaiting input"
        actionIcon={<Sparkles className="mr-2 h-4 w-4" />}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1.6fr)_minmax(240px,0.8fr)]">
        <article className="rounded-xl border border-border/70 bg-card/80 p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Analysis Summary</p>
              <h3 className="mt-2 text-lg font-semibold tracking-tight">{result.summary}</h3>
            </div>
            <SeverityBadge severity={result.severity} />
          </div>
          <div className="mt-4 rounded-xl border border-border/70 bg-background/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Root Cause</p>
            <p className="mt-2 text-sm text-muted-foreground">{result.rootCause}</p>
          </div>
        </article>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
          <SummaryMetric label="Analyzer Mode" value={result.mode.replaceAll("_", " ")} />
          <SummaryMetric label="Generated" value={new Date(result.generatedAt).toLocaleString()} tone="accent" />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ResultList
          title="Findings"
          items={result.findings}
          icon={SearchCode}
          emptyLabel="No findings were returned for this run."
        />
        <ResultList
          title="Delegation Risks"
          items={result.delegationConsiderations}
          icon={AlertTriangle}
          emptyLabel="No delegation-specific risks were reported."
        />
        <ResultList
          title="Performance Issues"
          items={result.performanceNotes}
          icon={Gauge}
          emptyLabel="No performance issues were returned."
        />
        <ResultList
          title="Maintainability Notes"
          items={result.maintainabilityNotes}
          icon={ClipboardList}
          emptyLabel="No maintainability notes were returned."
        />
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg border border-border/70 bg-card p-2 text-muted-foreground">
            <Lightbulb className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold tracking-tight">Recommendations</h3>
            <p className="text-sm text-muted-foreground">Suggested next actions to reduce issues and improve scale-readiness.</p>
          </div>
        </div>
        {result.recommendations.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {result.recommendations.map((recommendation) => (
              <RecommendationCard key={recommendation.id} recommendation={recommendation} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-background/40 p-6 text-sm text-muted-foreground">
            No recommendations were returned for this analysis.
          </div>
        )}
      </section>

      {result.optimizedFormula ? (
        <CodePanel title={`Optimized Formula · ${result.optimizedFormula.name}`} code={result.optimizedFormula.formula} />
      ) : null}
    </div>
  );
}
