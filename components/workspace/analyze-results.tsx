import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, ClipboardList, SearchCode, Sparkles, Zap } from "lucide-react";

import { CodePanel } from "@/components/ui/code-panel";
import { EmptyState } from "@/components/ui/empty-state";
import { SeverityBadge } from "@/components/ui/severity-badge";
import { cn } from "@/lib/utils";
import type { AnalyzeRequest, AnalyzeResponse, RecommendationItem } from "@/lib/contracts/workspace";

type AnalyzeResultsProps = {
  result: AnalyzeResponse | null;
  request?: AnalyzeRequest | null;
  isLoading?: boolean;
};

type ResultListProps = {
  title: string;
  description: string;
  items: readonly string[];
  icon: typeof ClipboardList;
  emptyLabel: string;
};

function ResultsSection({
  title,
  description,
  children,
  count,
  tone = "default"
}: {
  title: string;
  description: string;
  children: ReactNode;
  count?: number;
  tone?: "default" | "highlight";
}) {
  return (
    <section
      className={cn(
        "space-y-3 rounded-2xl border p-5",
        tone === "highlight" ? "border-primary/20 bg-primary/5" : "border-border/70 bg-background/50"
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {typeof count === "number" ? (
          <span className="rounded-full border border-border/70 bg-card px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {count} {count === 1 ? "item" : "items"}
          </span>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function ResultList({ title, description, items, icon: Icon, emptyLabel }: ResultListProps) {
  return (
    <ResultsSection title={title} description={description} count={items.length}>
      {items.length > 0 ? (
        <ul className="space-y-2 text-sm text-muted-foreground">
          {items.map((item) => (
            <li key={item} className="flex gap-2 rounded-xl border border-border/60 bg-card/70 px-3 py-2 text-foreground">
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      )}
    </ResultsSection>
  );
}

function RecommendationCard({ recommendation }: { recommendation: RecommendationItem }) {
  return (
    <article className="rounded-xl border border-border/70 bg-card/70 p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">{recommendation.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{recommendation.rationale}</p>
        </div>
        <SeverityBadge severity={recommendation.severity} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs uppercase tracking-wide text-muted-foreground">
          {recommendation.type.replaceAll("_", " ")}
        </span>
      </div>
      {recommendation.nextSteps.length > 0 ? (
        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Next Steps</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {recommendation.nextSteps.map((step) => (
              <li key={step} className="flex gap-2 rounded-xl border border-border/60 bg-background/70 px-3 py-2 text-foreground">
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

function RequestSummary({ request }: { request: AnalyzeRequest }) {
  return (
    <ResultsSection
      title="Submitted context"
      description="The current results were generated from this request payload sent to the Analyze API."
      tone="highlight"
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-border/60 bg-background/80 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Artifact</p>
            <p className="mt-1 text-sm font-medium text-foreground">{request.artifactName}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Purpose</p>
            <p className="mt-1 text-sm text-foreground">{request.artifactPurpose}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <SummaryMetric label="Mode" value={request.mode.replaceAll("_", " ")} />
            <SummaryMetric label="Data source" value={request.dataSource} />
          </div>
        </div>
        <div className="space-y-3 rounded-xl border border-border/60 bg-background/80 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Symptoms or concerns</p>
            <p className="mt-1 text-sm text-foreground">{request.symptoms}</p>
          </div>
          {request.relatedFormulas ? (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Supporting context</p>
              <p className="mt-1 text-sm text-foreground">{request.relatedFormulas}</p>
            </div>
          ) : null}
        </div>
      </div>
    </ResultsSection>
  );
}

export function AnalyzeResults({ result, request, isLoading = false }: AnalyzeResultsProps) {
  if (isLoading && !result) {
    return (
      <div className="rounded-2xl border border-border/70 bg-background/50 p-8 text-sm text-muted-foreground">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
          <div>
            <p className="font-medium text-foreground">Generating structured analysis...</p>
            <p className="mt-1">We are organizing the submission into findings, risks, recommendations, and optimization guidance.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <EmptyState
        title="No analysis results yet"
        description="Configure the artifact details, run Analyze, and structured findings will appear here with clear sections for findings, risks, and recommendations."
        actionLabel="Awaiting input"
        actionIcon={<Sparkles className="mr-2 h-4 w-4" />}
      />
    );
  }

  const riskItems = [...result.delegationConsiderations, ...result.performanceNotes, ...result.maintainabilityNotes];

  return (
    <div className="space-y-5">
      {request ? <RequestSummary request={request} /> : null}

      <div className="grid gap-4 md:grid-cols-[minmax(0,1.6fr)_minmax(240px,0.8fr)]">
        <ResultsSection
          title="Analysis summary"
          description="A concise interpretation of the submitted artifact and the main issue pattern returned by the analyzer."
          tone="highlight"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">{result.summary}</p>
            </div>
            <SeverityBadge severity={result.severity} />
          </div>
          <div className="rounded-xl border border-border/70 bg-background/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Root cause</p>
            <p className="mt-2 text-sm text-foreground">{result.rootCause}</p>
          </div>
        </ResultsSection>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
          <SummaryMetric label="Analyzer mode" value={result.mode.replaceAll("_", " ")} />
          <SummaryMetric label="Generated" value={new Date(result.generatedAt).toLocaleString()} tone="accent" />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <ResultList
          title="Findings"
          description="Direct observations and noteworthy patterns detected from the submitted artifact."
          items={result.findings}
          icon={SearchCode}
          emptyLabel="No findings were returned for this run."
        />
        <ResultList
          title="Risks and watchouts"
          description="Delegation, performance, and maintainability concerns that should be addressed before implementation continues."
          items={riskItems}
          icon={AlertTriangle}
          emptyLabel="No risks or issues were reported for this run."
        />
      </div>

      <ResultsSection
        title="Recommendations"
        description="Suggested next actions to reduce risk, improve correctness, and make the artifact easier to scale or maintain."
        count={result.recommendations.length}
      >
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
      </ResultsSection>

      {result.optimizedFormula ? (
        <ResultsSection
          title="Optimized formula"
          description="Returned implementation guidance for the primary formula or logic path that would benefit from refactoring."
          count={result.optimizedFormula.notes.length + result.optimizedFormula.delegationConsiderations.length}
        >
          <div className="space-y-4">
            <div className="rounded-xl border border-border/70 bg-card/70 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-lg border border-border/70 bg-background p-2 text-primary">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold tracking-tight text-foreground">{result.optimizedFormula.name}</h4>
                  <p className="mt-1 text-sm text-muted-foreground">{result.optimizedFormula.purpose}</p>
                </div>
              </div>
            </div>
            <CodePanel title={`Optimized Formula · ${result.optimizedFormula.name}`} code={result.optimizedFormula.formula} />
            <div className="grid gap-4 lg:grid-cols-2">
              <ResultList
                title="Implementation notes"
                description="Actions and considerations to carry into the next iteration of the formula."
                items={result.optimizedFormula.notes}
                icon={ClipboardList}
                emptyLabel="No implementation notes were returned."
              />
              <ResultList
                title="Delegation considerations"
                description="Connector and query-shape checks to validate before using the updated formula at scale."
                items={result.optimizedFormula.delegationConsiderations}
                icon={AlertTriangle}
                emptyLabel="No delegation considerations were returned."
              />
            </div>
          </div>
        </ResultsSection>
      ) : null}

      {isLoading ? (
        <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
            <p>A newer request is in progress. The panel will refresh when the latest analysis output is ready.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
