import { FileCode2, GitBranch, ListChecks, TextSearch } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";

const analysisUseCases = [
  {
    title: "Pasted code",
    description: "Review Power Fx, TypeScript, SQL, or configuration snippets for correctness, risk, and maintainability.",
    icon: FileCode2
  },
  {
    title: "Architecture notes",
    description: "Inspect solution structure, integration decisions, and data flow notes before implementation starts.",
    icon: GitBranch
  },
  {
    title: "Issue descriptions",
    description: "Break down defects, unexpected behavior, repro steps, and likely root causes for deeper analysis.",
    icon: TextSearch
  },
  {
    title: "Requirements text",
    description: "Evaluate acceptance criteria, edge cases, dependencies, and ambiguity in functional requirements.",
    icon: ListChecks
  }
] as const;

const promptStarters = [
  "Identify likely logic risks, hidden assumptions, and missing edge cases.",
  "Highlight performance, delegation, or maintainability concerns.",
  "Summarize the problem framing and point out any unclear requirements.",
  "Call out follow-up questions that would improve implementation confidence."
] as const;

export default function AnalyzePage() {
  return (
    <PageContainer>
      <PageHeader
        title="Analyze Studio"
        description="Inspect code, notes, issue reports, or requirements in a focused workspace before turning findings into build-ready changes."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
        <SectionCard
          title="Analysis Workspace"
          description="Capture the request context and paste the material you want reviewed. Submission wiring will be added in a future phase."
        >
          <form className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">Analysis focus</span>
                <select
                  defaultValue="code-review"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="code-review">Code review</option>
                  <option value="architecture-review">Architecture review</option>
                  <option value="issue-triage">Issue triage</option>
                  <option value="requirements-review">Requirements review</option>
                  <option value="general-analysis">General analysis</option>
                </select>
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium">Optional title</span>
                <input
                  type="text"
                  placeholder="e.g. Order screen delegation investigation"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
            </div>

            <label className="block space-y-1.5">
              <span className="text-sm font-medium">What do you want analyzed?</span>
              <textarea
                rows={16}
                placeholder="Paste code, architecture notes, issue details, or requirements here. Include relevant constraints, expected behavior, and any known pain points."
                className="w-full rounded-xl border border-border bg-background px-4 py-3 font-mono text-sm leading-6 outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>

            <div className="grid gap-4 lg:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">Context and constraints</span>
                <textarea
                  rows={7}
                  placeholder="Add app context, target users, impacted screens, non-functional requirements, or constraints the analysis should respect."
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm leading-6 outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium">Questions to answer</span>
                <textarea
                  rows={7}
                  placeholder="List the questions you want the analysis to cover, such as risk areas, edge cases, performance concerns, or recommendations."
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm leading-6 outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-border/70 pt-4">
              <Button type="button">Analyze Input</Button>
              <Button type="reset" variant="secondary">
                Clear Workspace
              </Button>
              <p className="text-sm text-muted-foreground">
                Input is local-only for now. API submission and saved analysis runs are not wired yet.
              </p>
            </div>
          </form>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard
            title="Common analysis inputs"
            description="Start with whichever artifact best represents the problem you need to understand."
          >
            <div className="space-y-3">
              {analysisUseCases.map(({ title, description, icon: Icon }) => (
                <div
                  key={title}
                  className="flex gap-3 rounded-xl border border-border/70 bg-background/70 p-4"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold">{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Prompt starters"
            description="Useful directions to include when you want focused findings instead of a generic review."
          >
            <ul className="space-y-3 text-sm text-muted-foreground">
              {promptStarters.map((starter) => (
                <li key={starter} className="rounded-lg border border-dashed border-border bg-background/60 px-4 py-3">
                  {starter}
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </div>
    </PageContainer>
  );
}
