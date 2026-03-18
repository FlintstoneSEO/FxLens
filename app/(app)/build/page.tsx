"use client";

import { useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Blocks, FileCode2, Layers3, Rocket, Sparkles, Wand2 } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { BuildOutput } from "@/components/workspace/build-output";
import { StatusMessage } from "@/components/workspace/status-message";
import {
  STUDIO_ERROR_LABEL,
  STUDIO_LOADING_MESSAGE,
  STUDIO_RUN_LABEL,
  STUDIO_RUNNING_LABEL,
  StudioInputCard,
  StudioOutputCard
} from "@/components/workspace/studio-shell";
import type { BuildRequest, BuildResponse } from "@/lib/contracts/workspace";
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
    icon: Blocks,
    mode: "screen_builder"
  },
  {
    id: "component-set",
    label: "Reusable component set",
    description: "Patterns for cards, forms, lists, and high-value UI modules.",
    icon: Layers3,
    mode: "component_builder"
  },
  {
    id: "power-fx-starter",
    label: "Power Fx starter",
    description: "Starter formulas and implementation notes for the selected build.",
    icon: FileCode2,
    mode: "formula_builder"
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

function toggleSelection(value: string, setValues: Dispatch<SetStateAction<string[]>>) {
  setValues((current) => (current.includes(value) ? current.filter((item) => item !== value) : [...current, value]));
}

export default function BuildPage() {
  const [workspaceTitle, setWorkspaceTitle] = useState("");
  const [buildIntent, setBuildIntent] = useState<string>(intentOptions[0].id);
  const [artifactType, setArtifactType] = useState<string>(artifactOptions[0].id);
  const [technicalNotes, setTechnicalNotes] = useState("");
  const [successMetric, setSuccessMetric] = useState("");
  const [selectedConstraints, setSelectedConstraints] = useState<string[]>([]);
  const [selectedOutputs, setSelectedOutputs] = useState<string[]>([]);

  const [response, setResponse] = useState<BuildResponse | null>(null);
  const [submittedRequest, setSubmittedRequest] = useState<BuildRequest | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedIntent = useMemo(
    () => intentOptions.find((option) => option.id === buildIntent) ?? intentOptions[0],
    [buildIntent]
  );

  const selectedArtifact = useMemo(
    () => artifactOptions.find((option) => option.id === artifactType) ?? artifactOptions[0],
    [artifactType]
  );

  const isSubmitDisabled = useMemo(
    () =>
      isSubmitting ||
      workspaceTitle.trim().length === 0 ||
      technicalNotes.trim().length === 0 ||
      successMetric.trim().length === 0,
    [isSubmitting, successMetric, technicalNotes, workspaceTitle]
  );

  const generatedAtLabel = useMemo(() => {
    if (!response?.generatedAt) {
      return null;
    }

    return `Last run ${new Date(response.generatedAt).toLocaleString()}`;
  }, [response]);

  const buildRequest: BuildRequest = {
    mode: selectedArtifact.mode,
    promptTitle: workspaceTitle.trim(),
    contextSummary: technicalNotes.trim(),
    inputPayload: {
      build_intent: selectedIntent.label,
      target_artifact: selectedArtifact.label,
      success_signal: successMetric.trim(),
      constraints: selectedConstraints.join(", ") || "None selected",
      output_preferences: selectedOutputs.join(", ") || "None selected"
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const apiResponse = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(buildRequest)
      });

      const payload = (await apiResponse.json()) as BuildResponse | { error?: { message?: string } };

      if (!apiResponse.ok) {
        setResponse(null);
        setErrorMessage(
          "error" in payload && payload.error?.message
            ? payload.error.message
            : "Unable to run Build Studio right now. Review the inputs and try again."
        );
        return;
      }

      setSubmittedRequest(buildRequest);
      setResponse(payload as BuildResponse);
    } catch {
      setResponse(null);
      setErrorMessage("Unable to run Build Studio right now. Please try again in a moment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Build Studio"
        description="Shape implementation-ready inputs, run the existing generation flow, and review the build package in a consistent studio workspace."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <StudioInputCard
          title="Input"
          description="Define the build direction, constraints, and output preferences. All sections stay editable between runs."
        >
          <form id="build-studio-form" className="space-y-6" onSubmit={handleSubmit}>
            <SectionCard
              title="Build brief"
              description="Capture the delivery goal, the artifact to generate, and the context the build output should reflect."
              className="border-border/60 bg-background/40 p-5 shadow-none"
            >
              <div className="space-y-6">
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium">Workspace title</span>
                  <input
                    value={workspaceTitle}
                    onChange={(event) => setWorkspaceTitle(event.target.value)}
                    placeholder="Example: Claims intake review hub"
                    className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                    disabled={isSubmitting}
                  />
                </label>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium">Build intent</p>
                    <p className="text-sm text-muted-foreground">Choose the primary reason this studio run exists.</p>
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
                          disabled={isSubmitting}
                          className={cn(
                            "rounded-xl border p-4 text-left transition",
                            isActive
                              ? "border-primary bg-primary/10 shadow-sm"
                              : "border-border/70 bg-background hover:border-primary/40 hover:bg-muted/40",
                            isSubmitting && "cursor-not-allowed opacity-70"
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
                    <p className="text-sm text-muted-foreground">Select the main asset this run should produce first.</p>
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
                          disabled={isSubmitting}
                          className={cn(
                            "rounded-xl border p-4 text-left transition",
                            isActive
                              ? "border-primary bg-primary/10 shadow-sm"
                              : "border-border/70 bg-background hover:border-primary/40 hover:bg-muted/40",
                            isSubmitting && "cursor-not-allowed opacity-70"
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
                    />
                  </label>
                </div>
              </div>
            </SectionCard>

            <div className="grid gap-6 lg:grid-cols-2">
              <SectionCard
                title="Constraints"
                description="Flag platform, delivery, and experience boundaries the generated output must respect."
                className="border-border/60 bg-background/40 p-5 shadow-none"
              >
                <div className="space-y-3">
                  {constraintOptions.map((option) => {
                    const isSelected = selectedConstraints.includes(option);

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => toggleSelection(option, setSelectedConstraints)}
                        disabled={isSubmitting}
                        className={cn(
                          "flex w-full items-start justify-between gap-3 rounded-lg border px-4 py-3 text-left text-sm transition",
                          isSelected
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border/70 bg-background text-muted-foreground hover:border-primary/40 hover:bg-muted/40",
                          isSubmitting && "cursor-not-allowed opacity-70"
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
                className="border-border/60 bg-background/40 p-5 shadow-none"
              >
                <div className="space-y-3">
                  {outputPreferences.map((option) => {
                    const isSelected = selectedOutputs.includes(option);

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => toggleSelection(option, setSelectedOutputs)}
                        disabled={isSubmitting}
                        className={cn(
                          "flex w-full items-start justify-between gap-3 rounded-lg border px-4 py-3 text-left text-sm transition",
                          isSelected
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border/70 bg-background text-muted-foreground hover:border-primary/40 hover:bg-muted/40",
                          isSubmitting && "cursor-not-allowed opacity-70"
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

            <div className="space-y-3 rounded-2xl border border-border/80 bg-background/40 p-4">
              <StatusMessage
                tone={errorMessage ? "error" : isSubmitting ? "loading" : response ? "success" : "info"}
                label={errorMessage ? STUDIO_ERROR_LABEL : isSubmitting ? "Run in progress" : response ? "Latest run" : "Ready to run"}
                message={
                  errorMessage
                    ? errorMessage
                    : isSubmitting
                      ? STUDIO_LOADING_MESSAGE
                      : response
                        ? "The latest build package is loaded in the output panel. Update any section and run again at any time."
                        : "Complete the brief to generate screens, components, formulas, and implementation guidance."
                }
              />

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-card/70 px-4 py-3">
                <p className="text-sm text-muted-foreground">
                  Every run uses the current form state and refreshes the output panel with the latest build package.
                </p>
                <Button type="submit" disabled={isSubmitDisabled} className="min-w-32">
                  {isSubmitting ? STUDIO_RUNNING_LABEL : STUDIO_RUN_LABEL}
                </Button>
              </div>
            </div>
          </form>
        </StudioInputCard>

        <StudioOutputCard
          title="Output"
          description="Review the submitted brief and generated build package in the same structured output pattern used across studios."
          errorMessage={errorMessage}
          errorLabel={STUDIO_ERROR_LABEL}
          emptyMessage="Run Build Studio to generate implementation-ready output for this brief."
          generatedAtLabel={generatedAtLabel}
          isLoading={isSubmitting}
        >
          <BuildOutput request={submittedRequest ?? buildRequest} response={response ?? undefined} />
        </StudioOutputCard>
      </div>
    </PageContainer>
  );
}
