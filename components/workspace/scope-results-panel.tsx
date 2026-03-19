import type { ReactNode } from "react";
import { Loader2, Sparkles } from "lucide-react";

import type { ScopeResponse } from "@/lib/contracts/workspace";

import {
  BackendRecommendationCard,
  SuggestedComponentCard,
  SuggestedScreenCard,
  SqlArtifactCard
} from "@/components/workspace/result-cards";
import { EmptyState } from "@/components/ui/empty-state";
import { CopyButton } from "@/components/ui/copy-button";
import { formatScopeResultForCopy } from "@/lib/workspace-copy";

type ScopeResultsPanelProps = {
  result: ScopeResponse | null;
  isLoading?: boolean;
};

function ResultSection({
  title,
  description,
  children,
  count,
  tone = "default",
  action
}: {
  title: string;
  description: string;
  children: ReactNode;
  count?: number;
  tone?: "default" | "highlight";
  action?: ReactNode;
}) {
  return (
    <section
      className={
        tone === "highlight"
          ? "space-y-3 rounded-2xl border border-primary/20 bg-primary/5 p-5"
          : "space-y-3 rounded-2xl border border-border/70 bg-background/50 p-5"
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          {typeof count === "number" ? (
            <span className="rounded-full border border-border/70 bg-card px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {count} {count === 1 ? "item" : "items"}
            </span>
          ) : null}
          {action}
        </div>
      </div>
      {children}
    </section>
  );
}

function ChipList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item} className="rounded-full border border-border/70 bg-card px-3 py-1.5 text-sm text-foreground">
          {item}
        </li>
      ))}
    </ul>
  );
}

function BulletColumns({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
      {items.map((item) => (
        <li key={item} className="rounded-xl border border-border/60 bg-card/70 px-3 py-2 text-foreground">
          {item}
        </li>
      ))}
    </ul>
  );
}

function CardGrid({
  title,
  description,
  children,
  count
}: {
  title: string;
  description: string;
  children: ReactNode;
  count: number;
}) {
  return (
    <ResultSection title={title} description={description} count={count}>
      <div className="grid gap-4 lg:grid-cols-2">{children}</div>
    </ResultSection>
  );
}

export function ScopeResultsPanel({ result, isLoading = false }: ScopeResultsPanelProps) {
  if (isLoading && !result) {
    return (
      <div className="rounded-2xl border border-border/70 bg-background/50 p-8 text-sm text-muted-foreground">
        <div className="flex items-start gap-3">
          <Loader2 className="mt-0.5 h-4 w-4 animate-spin text-primary" aria-hidden="true" />
          <div>
            <p className="font-medium text-foreground">Generating structured scope...</p>
            <p className="mt-1">We are organizing screens, entities, roles, flows, and implementation guidance from your submission.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <EmptyState
        title="No scope results yet"
        description="Submit project context to generate structured screens, entities, flows, data artifacts, and rollout recommendations."
      />
    );
  }

  const roles = Array.from(new Set(result.suggestedScreens.flatMap((screen) => screen.targetRoles))).sort();
  const copyValue = formatScopeResultForCopy(result);

  return (
    <div className="space-y-5">
      <ResultSection
        title="Executive summary"
        description="A concise overview of the proposed solution direction for this project."
        tone="highlight"
        action={<CopyButton value={copyValue} label="Copy result" />}
      >
        <p className="text-sm leading-6 text-foreground">{result.appSummary}</p>
      </ResultSection>

      <div className="grid gap-5 xl:grid-cols-2">
        <ResultSection
          title="Solution shape"
          description="High-level modules and experience areas recommended for the first scoping pass."
          count={result.recommendedModules.length}
        >
          <ChipList items={result.recommendedModules} />
        </ResultSection>
        <ResultSection
          title="Roles in scope"
          description="Distinct user groups inferred from the generated screen responsibilities."
          count={roles.length}
        >
          <ChipList items={roles} />
        </ResultSection>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <ResultSection
          title="Data entities"
          description="Core records, business objects, and supporting information expected in the solution."
          count={result.dataEntities.length}
        >
          <BulletColumns items={result.dataEntities} />
        </ResultSection>
        <ResultSection
          title="Flows and automations"
          description="Recommended process automations, notifications, and orchestration opportunities."
          count={result.powerAutomateSuggestions.length}
        >
          <BulletColumns items={result.powerAutomateSuggestions} />
        </ResultSection>
      </div>

      {result.suggestedScreens.length > 0 ? (
        <CardGrid
          title="Screens"
          description="User-facing experiences, their jobs to be done, and the data or actions each one should contain."
          count={result.suggestedScreens.length}
        >
          {result.suggestedScreens.map((screen) => (
            <SuggestedScreenCard key={screen.id} screen={screen} />
          ))}
        </CardGrid>
      ) : null}

      {result.suggestedComponents.length > 0 ? (
        <CardGrid
          title="Reusable components"
          description="UI building blocks that should stay consistent across the scoped solution experience."
          count={result.suggestedComponents.length}
        >
          {result.suggestedComponents.map((component) => (
            <SuggestedComponentCard key={component.id} component={component} />
          ))}
        </CardGrid>
      ) : null}

      {result.backendRecommendations.length > 0 || result.sqlArtifacts.length > 0 ? (
        <div className="grid gap-5 xl:grid-cols-2">
          {result.backendRecommendations.length > 0 ? (
            <CardGrid
              title="Backend recommendations"
              description="Architecture guidance, tradeoffs, and implementation notes aligned to the generated scope."
              count={result.backendRecommendations.length}
            >
              {result.backendRecommendations.map((recommendation) => (
                <BackendRecommendationCard key={recommendation.id} recommendation={recommendation} />
              ))}
            </CardGrid>
          ) : null}

          {result.sqlArtifacts.length > 0 ? (
            <CardGrid
              title="SQL and data artifacts"
              description="Database-side assets that support reporting, orchestration, or operational scale."
              count={result.sqlArtifacts.length}
            >
              {result.sqlArtifacts.map((artifact) => (
                <SqlArtifactCard key={artifact.id} artifact={artifact} />
              ))}
            </CardGrid>
          ) : null}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-2">
        <ResultSection
          title="Risks and assumptions"
          description="Dependencies, open questions, or constraints that should be validated before delivery starts."
          count={result.risksAndAssumptions.length}
        >
          <BulletColumns items={result.risksAndAssumptions} />
        </ResultSection>
        <ResultSection
          title="Recommended MVP plan"
          description="A practical sequence to move from scope review into delivery planning and implementation."
          count={result.mvpPlan.length}
        >
          <BulletColumns items={result.mvpPlan} />
        </ResultSection>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-4 w-4 text-primary" aria-hidden="true" />
            <p>A newer request is in progress. The panel will refresh when the latest scoped output is ready.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
