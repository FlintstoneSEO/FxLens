import type { ReactNode } from "react";

import type { ScopeResponse } from "@/lib/contracts/workspace";

import {
  BackendRecommendationCard,
  SuggestedComponentCard,
  SuggestedScreenCard,
  SqlArtifactCard
} from "@/components/workspace/result-cards";
import { EmptyState } from "@/components/ui/empty-state";

function ListSection({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">{items.length} items</p>
      </div>
      <div className="rounded-xl border border-border/70 bg-background/50 p-4">
        <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
          {items.map((item) => (
            <li key={item} className="rounded-lg border border-border/60 bg-card/70 px-3 py-2 text-foreground">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CardGrid({
  title,
  description,
  children
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">{children}</div>
    </section>
  );
}

export function ScopeResultsPanel({ result }: { result: ScopeResponse | null }) {
  if (!result) {
    return (
      <EmptyState
        title="No scope results yet"
        description="Submit project context to generate structured screens, entities, flows, data artifacts, and rollout recommendations."
      />
    );
  }

  const roles = Array.from(new Set(result.suggestedScreens.flatMap((screen) => screen.targetRoles))).sort();

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border/70 bg-background/50 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Scope summary</p>
        <p className="mt-2 text-sm text-foreground">{result.appSummary}</p>
      </section>

      <ListSection title="Recommended modules" items={result.recommendedModules} />
      <ListSection title="Roles in scope" items={roles} />
      <ListSection title="Data entities" items={result.dataEntities} />
      <ListSection title="Flows & automations" items={result.powerAutomateSuggestions} />
      <ListSection title="Risks & assumptions" items={result.risksAndAssumptions} />
      <ListSection title="Recommended next steps" items={result.mvpPlan} />

      {result.suggestedScreens.length > 0 ? (
        <CardGrid title="Screens" description="Suggested user-facing experiences and the responsibilities for each screen.">
          {result.suggestedScreens.map((screen) => (
            <SuggestedScreenCard key={screen.id} screen={screen} />
          ))}
        </CardGrid>
      ) : null}

      {result.suggestedComponents.length > 0 ? (
        <CardGrid title="Components" description="Reusable presentation building blocks identified for the solution.">
          {result.suggestedComponents.map((component) => (
            <SuggestedComponentCard key={component.id} component={component} />
          ))}
        </CardGrid>
      ) : null}

      {result.backendRecommendations.length > 0 ? (
        <CardGrid title="Recommendations" description="Architecture guidance and implementation recommendations from the scope response.">
          {result.backendRecommendations.map((recommendation) => (
            <BackendRecommendationCard key={recommendation.id} recommendation={recommendation} />
          ))}
        </CardGrid>
      ) : null}

      {result.sqlArtifacts.length > 0 ? (
        <CardGrid title="SQL & data artifacts" description="Database-side assets that support reporting, orchestration, or performance.">
          {result.sqlArtifacts.map((artifact) => (
            <SqlArtifactCard key={artifact.id} artifact={artifact} />
          ))}
        </CardGrid>
      ) : null}
    </div>
  );
}
