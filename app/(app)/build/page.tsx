"use client";

import { useMemo, useState } from "react";
import { Blocks, FileCode2, Layers3, Rocket, Sparkles, Wand2 } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { cn } from "@/lib/utils";

const intentOptions = [
  {
    id: "new-experience",
    label: "Create a new experience",
    description: "Plan a fresh screen or workflow from a blank starting point.",
    icon: Sparkles
  },
  {
    id: "refactor-existing",
    label: "Refine an existing flow",
    description: "Improve structure, usability, or maintainability in an existing app area.",
    icon: Wand2
  },
  {
    id: "accelerate-delivery",
    label: "Accelerate delivery",
    description: "Generate a focused implementation brief for a team to build immediately.",
    icon: Rocket
  }
] as const;

const artifactOptions = [
  {
    id: "screen-blueprint",
    label: "Screen blueprint",
    description: "Layout, controls, states, and interaction guidance.",
    icon: Blocks
  },
  {
    id: "component-set",
    label: "Reusable component set",
    description: "Patterns for cards, forms, lists, and high-value UI modules.",
    icon: Layers3
  },
  {
    id: "power-fx-starter",
    label: "Power Fx starter",
    description: "Starter formulas and implementation notes for the selected build.",
    icon: FileCode2
  }
] as const;

const constraintOptions = [
  "Responsive tablet-first layout",
  "Keep Dataverse schema unchanged",
  "Limit to standard connectors",
  "Accessibility review required",
  "Minimize nested galleries",
  "Avoid non-delegable formulas"
] as const;

const outputPreferences = [
  "Step-by-step implementation checklist",
  "Suggested control hierarchy",
  "Power Fx starter snippets",
  "Naming recommendations",
  "Risk and dependency callouts",
  "Test scenarios"
] as const;

export default function BuildPage() {
  const [buildIntent, setBuildIntent] = useState<(typeof intentOptions)[number]["id"]>("new-experience");
  const [artifactType, setArtifactType] = useState<(typeof artifactOptions)[number]["id"]>("screen-blueprint");
  const [workspaceTitle, setWorkspaceTitle] = useState("Operations command center");
  const [technicalNotes, setTechnicalNotes] = useState(
    "Need an approval-focused workspace for field operations managers. Prioritize summary KPIs, queued requests, and a fast path into item-level actions."
  );
  const [selectedConstraints, setSelectedConstraints] = useState<string[]>([
    "Responsive tablet-first layout",
    "Limit to standard connectors",
    "Avoid non-delegable formulas"
  ]);
  const [selectedOutputs, setSelectedOutputs] = useState<string[]>([
    "Step-by-step implementation checklist",
    "Suggested control hierarchy",
    "Risk and dependency callouts"
  ]);
  const [successMetric, setSuccessMetric] = useState(
    "A maker should understand the page structure, primary controls, and formula starting points in under 10 minutes."
  );

  const selectedIntent = useMemo(
    () => intentOptions.find((option) => option.id === buildIntent) ?? intentOptions[0],
    [buildIntent]
  );
  const selectedArtifact = useMemo(
    () => artifactOptions.find((option) => option.id === artifactType) ?? artifactOptions[0],
    [artifactType]
  );

  const toggleSelection = (value: string, selected: string[], setSelected: (next: string[]) => void) => {
    setSelected(
      selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]
    );
  };

  return (
    <PageContainer>
      <PageHeader
        title="Build Studio"
        description="Shape implementation-ready build inputs with focused intent, artifact selection, technical notes, constraints, and output guidance before generation is wired in."
        actions={<Button>Prepare Build Brief</Button>}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,0.95fr)]">
        <div className="space-y-6">
          <SectionCard
            title="Build workspace"
            description="Capture the build direction clearly so the next generation step starts from a usable, implementation-oriented brief."
          >
            <div className="space-y-6">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">Workspace title</span>
                <input
                  value={workspaceTitle}
                  onChange={(event) => setWorkspaceTitle(event.target.value)}
                  placeholder="Example: Claims intake review hub"
                  className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Build intent</p>
                  <p className="text-sm text-muted-foreground">
                    Choose the primary reason this studio session exists.
                  </p>
                </div>
                <div className="grid gap-3 lg:grid-cols-3">
                  {intentOptions.map((option) => {
                    const Icon = option.icon;
                    const isActive = option.id === buildIntent;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setBuildIntent(option.id)}
                        className={cn(
                          "rounded-xl border p-4 text-left transition",
                          isActive
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-border/70 bg-background hover:border-primary/40 hover:bg-muted/40"
                        )}
                      >
                        <div className="mb-3 flex items-center gap-2">
                          <span
                            className={cn(
                              "flex h-9 w-9 items-center justify-center rounded-lg border",
                              isActive ? "border-primary/40 bg-primary/15 text-primary" : "border-border bg-muted text-muted-foreground"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <p className="text-sm font-semibold">{option.label}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Target artifact type</p>
                  <p className="text-sm text-muted-foreground">
                    Select the main asset this build brief should produce first.
                  </p>
                </div>
                <div className="grid gap-3 lg:grid-cols-3">
                  {artifactOptions.map((option) => {
                    const Icon = option.icon;
                    const isActive = option.id === artifactType;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setArtifactType(option.id)}
                        className={cn(
                          "rounded-xl border p-4 text-left transition",
                          isActive
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-border/70 bg-background hover:border-primary/40 hover:bg-muted/40"
                        )}
                      >
                        <div className="mb-3 flex items-center gap-2">
                          <span
                            className={cn(
                              "flex h-9 w-9 items-center justify-center rounded-lg border",
                              isActive ? "border-primary/40 bg-primary/15 text-primary" : "border-border bg-muted text-muted-foreground"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <p className="text-sm font-semibold">{option.label}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium">Technical notes</span>
                  <textarea
                    rows={7}
                    value={technicalNotes}
                    onChange={(event) => setTechnicalNotes(event.target.value)}
                    placeholder="Describe entities, user roles, key interactions, data sources, and implementation considerations."
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-sm font-medium">Success signal</span>
                  <textarea
                    rows={7}
                    value={successMetric}
                    onChange={(event) => setSuccessMetric(event.target.value)}
                    placeholder="Define what a good generated build brief should make easier for the team."
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </label>
              </div>
            </div>
          </SectionCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard
              title="Constraints"
              description="Flag platform, delivery, and experience boundaries the generated output must respect."
            >
              <div className="space-y-3">
                {constraintOptions.map((option) => {
                  const isSelected = selectedConstraints.includes(option);

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleSelection(option, selectedConstraints, setSelectedConstraints)}
                      className={cn(
                        "flex w-full items-start justify-between gap-3 rounded-lg border px-4 py-3 text-left text-sm transition",
                        isSelected
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border/70 bg-background text-muted-foreground hover:border-primary/40 hover:bg-muted/40"
                      )}
                    >
                      <span>{option}</span>
                      <span
                        className={cn(
                          "mt-0.5 h-4 w-4 rounded-full border",
                          isSelected ? "border-primary bg-primary" : "border-border bg-transparent"
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            </SectionCard>

            <SectionCard
              title="Output preferences"
              description="Choose the format cues and supporting detail you want included in the first build pass."
            >
              <div className="space-y-3">
                {outputPreferences.map((option) => {
                  const isSelected = selectedOutputs.includes(option);

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => toggleSelection(option, selectedOutputs, setSelectedOutputs)}
                      className={cn(
                        "flex w-full items-start justify-between gap-3 rounded-lg border px-4 py-3 text-left text-sm transition",
                        isSelected
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border/70 bg-background text-muted-foreground hover:border-primary/40 hover:bg-muted/40"
                      )}
                    >
                      <span>{option}</span>
                      <span
                        className={cn(
                          "mt-0.5 h-4 w-4 rounded-sm border",
                          isSelected ? "border-primary bg-primary" : "border-border bg-transparent"
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            </SectionCard>
          </div>
        </div>

        <div className="space-y-6">
          <SectionCard
            title="Studio snapshot"
            description="A live summary of the build setup that will drive the future generation step."
          >
            <div className="space-y-5">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">Current focus</p>
                <h3 className="mt-2 text-lg font-semibold tracking-tight">{workspaceTitle || "Untitled build workspace"}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{selectedIntent.description}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-xl border border-border/70 bg-background p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Intent</p>
                  <p className="mt-2 text-sm font-medium">{selectedIntent.label}</p>
                </div>
                <div className="rounded-xl border border-border/70 bg-background p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Artifact</p>
                  <p className="mt-2 text-sm font-medium">{selectedArtifact.label}</p>
                </div>
              </div>

              <div className="rounded-xl border border-border/70 bg-background p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">What the builder should know</p>
                <p className="mt-2 text-sm text-muted-foreground">{technicalNotes}</p>
              </div>

              <div className="rounded-xl border border-border/70 bg-background p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Selected guardrails</p>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                    {selectedConstraints.length} active
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedConstraints.map((item) => (
                    <span key={item} className="rounded-full border border-border bg-muted/60 px-3 py-1 text-xs text-foreground">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border/70 bg-background p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Planned output</p>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                    {selectedOutputs.length} included
                  </span>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {selectedOutputs.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-dashed border-border/80 bg-muted/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Readiness note</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  This workspace is ready for API wiring later. For now, it gives teams a clear, studio-style place to shape build inputs before generation.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </PageContainer>
  );
}
