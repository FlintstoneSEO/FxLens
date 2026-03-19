import type { ReactNode } from "react";

import { CodePanel } from "@/components/ui/code-panel";
import { CopyButton } from "@/components/ui/copy-button";
import { EmptyState } from "@/components/ui/empty-state";
import { RunExportActions } from "@/components/workspace/run-export-actions";
import {
  SuggestedComponentCard,
  SuggestedScreenCard,
} from "@/components/workspace/result-cards";
import type { BuildRequest, BuildResponse } from "@/lib/contracts/workspace";
import { formatBuildResultForCopy } from "@/lib/workspace-copy";

function OutputSection({
  eyebrow,
  title,
  description,
  children,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border/70 bg-background/40 p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {eyebrow}
          </p>
          <div>
            <h3 className="text-base font-semibold tracking-tight">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

function BulletList({ items }: { items: readonly string[] }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No items were returned for this section in the latest build run.
      </p>
    );
  }

  return (
    <ul className="space-y-2 text-sm text-muted-foreground">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-primary/20 bg-background/90 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
    </div>
  );
}

function RequestSnapshot({
  request,
  generatedAt,
}: {
  request?: BuildRequest;
  generatedAt?: string;
}) {
  return (
    <section className="rounded-xl border border-dashed border-border/70 bg-card/50 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        Submitted Input
      </p>
      <h3 className="mt-2 text-lg font-semibold tracking-tight">
        {request?.promptTitle ?? "Build request"}
      </h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {request?.contextSummary ??
          "Complete the form and generate a build package to review output here."}
      </p>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex items-start justify-between gap-4 border-t border-border/60 pt-3">
          <dt className="text-muted-foreground">Mode</dt>
          <dd className="font-medium capitalize text-foreground">
            {request?.mode?.replaceAll("_", " ") ?? "Not selected"}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-4 border-t border-border/60 pt-3">
          <dt className="text-muted-foreground">Latest response</dt>
          <dd className="font-medium text-foreground">
            {generatedAt ?? "Waiting for submission"}
          </dd>
        </div>
      </dl>
      {request?.inputPayload ? (
        <div className="mt-4 rounded-lg border border-border/60 bg-background/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Request Parameters
          </p>
          <div className="mt-3 space-y-3">
            {Object.entries(request.inputPayload).map(([key, value]) => (
              <div key={key}>
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  {key.replaceAll("_", " ")}
                </p>
                <p className="mt-1 text-sm text-foreground">{value}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export function BuildOutput({
  request,
  response,
}: {
  request?: BuildRequest;
  response?: BuildResponse;
}) {
  if (!response) {
    return (
      <div className="space-y-5">
        <RequestSnapshot request={request} />
        <EmptyState
          title="No generated build output yet"
          description="Submit the build brief to render structured sections for the overview, screens, components, formulas, and implementation guidance."
          actionLabel="Generate Build Output"
        />
      </div>
    );
  }

  const generatedAt = new Date(response.generatedAt);
  const generatedAtLabel = Number.isNaN(generatedAt.getTime())
    ? "Generated just now"
    : generatedAt.toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });

  const copyValue = formatBuildResultForCopy(response);

  return (
    <div className="space-y-6">
      {request ? (
        <RunExportActions
          runType="build_studio"
          input={request}
          output={response}
          generatedAt={response.generatedAt}
          fileName={`${request.promptTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "build-run"}-build-run`}
        />
      ) : null}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <RequestSnapshot request={request} generatedAt={generatedAtLabel} />

        <section className="rounded-xl border border-primary/20 bg-primary/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">
            Generated Output
          </p>
          <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
            <h3 className="text-lg font-semibold tracking-tight">Build package overview</h3>
            <CopyButton value={copyValue} label="Copy result" />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {response.summary}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Screens"
              value={response.suggestedScreens.length}
            />
            <StatCard
              label="Components"
              value={response.suggestedComponents.length}
            />
            <StatCard
              label="Formulas"
              value={response.suggestedFormulas.length}
            />
            <StatCard
              label="Notes"
              value={
                response.implementationNotes.length +
                response.performanceNotes.length
              }
            />
          </div>
        </section>
      </div>

      <OutputSection
        eyebrow="Screens"
        title="Recommended screen blueprint"
        description="Structured screen ideas aligned to user roles, data sources, and key actions."
      >
        {response.suggestedScreens.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {response.suggestedScreens.map((screen) => (
              <SuggestedScreenCard key={screen.id} screen={screen} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No screen blueprints were returned for this build mode.
          </p>
        )}
      </OutputSection>

      <OutputSection
        eyebrow="Components"
        title="Reusable component plan"
        description="Shared building blocks to keep the app consistent with scope outputs and the broader UI system."
      >
        {response.suggestedComponents.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {response.suggestedComponents.map((component) => (
              <SuggestedComponentCard
                key={component.id}
                component={component}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No reusable component suggestions were returned for this build run.
          </p>
        )}
      </OutputSection>

      <OutputSection
        eyebrow="Power Fx"
        title="Starter formulas"
        description="Formula snippets are rendered in code-style panels so teams can scan, copy, and implement quickly."
      >
        {response.suggestedFormulas.length > 0 ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {response.suggestedFormulas.map((formula) => (
              <div
                key={formula.id}
                className="space-y-3 rounded-xl border border-border/70 bg-card/70 p-4"
              >
                <div>
                  <h4 className="text-sm font-semibold tracking-tight">
                    {formula.name}
                  </h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formula.purpose}
                  </p>
                </div>
                <CodePanel title={formula.name} code={formula.formula} />
                <div className="grid gap-3 lg:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Implementation Notes
                    </p>
                    <BulletList items={formula.notes} />
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Delegation Considerations
                    </p>
                    <BulletList items={formula.delegationConsiderations} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No Power Fx starter snippets were included in this response.
          </p>
        )}
      </OutputSection>

      <div className="grid gap-6 lg:grid-cols-2">
        <OutputSection
          eyebrow="Implementation"
          title="Build guidance"
          description="Delivery notes that help move from generated output into implementation."
        >
          <BulletList items={response.implementationNotes} />
        </OutputSection>
        <OutputSection
          eyebrow="Performance"
          title="Optimization reminders"
          description="Quick reminders to keep generated assets efficient as they are implemented."
        >
          <BulletList items={response.performanceNotes} />
        </OutputSection>
      </div>
    </div>
  );
}
