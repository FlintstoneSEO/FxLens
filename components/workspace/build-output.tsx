import type { ReactNode } from "react";

import { CodePanel } from "@/components/ui/code-panel";
import { EmptyState } from "@/components/ui/empty-state";
import {
  SuggestedComponentCard,
  SuggestedScreenCard
} from "@/components/workspace/result-cards";
import type { BuildRequest, BuildResponse } from "@/lib/contracts/workspace";

function OutputSection({
  eyebrow,
  title,
  description,
  children
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border/70 bg-background/40 p-4 shadow-sm">
      <div className="mb-4 space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>
        <div>
          <h3 className="text-base font-semibold tracking-tight">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function BulletList({ items }: { items: readonly string[] }) {
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

export function BuildRequestSummary({ request }: { request: BuildRequest }) {
  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-dashed border-border/70 bg-card/50 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Input Context</p>
        <h3 className="mt-2 text-lg font-semibold tracking-tight">{request.promptTitle}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{request.contextSummary}</p>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex items-start justify-between gap-4 border-t border-border/60 pt-3">
            <dt className="text-muted-foreground">Mode</dt>
            <dd className="font-medium capitalize text-foreground">{request.mode.replaceAll("_", " ")}</dd>
          </div>
          <div className="flex items-start justify-between gap-4 border-t border-border/60 pt-3">
            <dt className="text-muted-foreground">Status</dt>
            <dd className="font-medium text-foreground">Ready to generate</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-xl border border-border/70 bg-background/60 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Request Parameters</p>
        <div className="mt-4 space-y-4">
          {Object.entries(request.inputPayload).map(([key, value]) => (
            <div key={key} className="border-t border-border/60 pt-4 first:border-t-0 first:pt-0">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {key.replaceAll("_", " ")}
              </p>
              <p className="mt-1 text-sm text-foreground">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <EmptyState
        title="No generated build output yet"
        description="Generated results will appear in the output panel with structured sections for screens, components, formulas, and implementation guidance."
        actionLabel="Run"
      />
    </div>
  );
}

export function BuildOutput({ request, response }: { request?: BuildRequest; response?: BuildResponse }) {
  if (!response) {
    return (
      <EmptyState
        title="No generated build output yet"
        description="Run Build Studio after scoping your solution to see screen blueprints, reusable components, formulas, and implementation guidance in one structured workspace."
        actionLabel="Run"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <section className="rounded-xl border border-dashed border-border/70 bg-card/50 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Input Context</p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight">{request?.promptTitle ?? "Build request"}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{request?.contextSummary ?? "No request context provided."}</p>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-start justify-between gap-4 border-t border-border/60 pt-3">
              <dt className="text-muted-foreground">Mode</dt>
              <dd className="font-medium capitalize text-foreground">{response.mode.replaceAll("_", " ")}</dd>
            </div>
            <div className="flex items-start justify-between gap-4 border-t border-border/60 pt-3">
              <dt className="text-muted-foreground">Generated</dt>
              <dd className="font-medium text-foreground">
                {new Date(response.generatedAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
              </dd>
            </div>
          </dl>
          {request?.inputPayload ? (
            <div className="mt-4 rounded-lg border border-border/60 bg-background/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Request Parameters</p>
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

        <section className="rounded-xl border border-primary/20 bg-primary/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">Generated Output</p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight">Build package overview</h3>
          <p className="mt-2 text-sm text-muted-foreground">{response.summary}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Screens", response.suggestedScreens.length],
              ["Components", response.suggestedComponents.length],
              ["Formulas", response.suggestedFormulas.length],
              ["Notes", response.implementationNotes.length + response.performanceNotes.length]
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-primary/20 bg-background/90 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <OutputSection
        eyebrow="Screens"
        title="Recommended screen blueprint"
        description="Structured screen ideas aligned to user roles, data sources, and key actions."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {response.suggestedScreens.map((screen) => (
            <SuggestedScreenCard key={screen.id} screen={screen} />
          ))}
        </div>
      </OutputSection>

      <OutputSection
        eyebrow="Components"
        title="Reusable component plan"
        description="Shared building blocks to keep the app consistent with Scope outputs and the broader UI system."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          {response.suggestedComponents.map((component) => (
            <SuggestedComponentCard key={component.id} component={component} />
          ))}
        </div>
      </OutputSection>

      <OutputSection
        eyebrow="Power Fx"
        title="Starter formulas"
        description="Formula snippets are rendered in code-style panels so teams can scan, copy, and implement quickly."
      >
        <div className="grid gap-4 xl:grid-cols-2">
          {response.suggestedFormulas.map((formula) => (
            <div key={formula.id} className="space-y-3 rounded-xl border border-border/70 bg-card/70 p-4">
              <div>
                <h4 className="text-sm font-semibold tracking-tight">{formula.name}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{formula.purpose}</p>
              </div>
              <CodePanel title={formula.name} code={formula.formula} />
              <div className="grid gap-3 lg:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Implementation Notes</p>
                  <BulletList items={formula.notes} />
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Delegation Considerations</p>
                  <BulletList items={formula.delegationConsiderations} />
                </div>
              </div>
            </div>
          ))}
        </div>
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
