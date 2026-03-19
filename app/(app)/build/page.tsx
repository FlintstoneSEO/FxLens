"use client";

import { useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  AlertCircle,
  Blocks,
  CheckCircle2,
  FileCode2,
  Layers3,
  LoaderCircle,
  Rocket,
  Sparkles,
  Wand2,
} from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { BuildOutput } from "@/components/workspace/build-output";
import { StatusMessage } from "@/components/workspace/status-message";
import { StudioTemplatePicker } from "@/components/workspace/studio-template-picker";
import type { BuildRequest, BuildResponse } from "@/lib/contracts/workspace";
import type { BuildTemplatePayload, StudioTemplate } from "@/lib/studio-templates";
import { consumeQueuedRerun, createSavedRunRecord, saveRun } from "@/lib/run-history";
import type { ValidationErrorPayload } from "@/lib/validation/workspace";
import { cn } from "@/lib/utils";

const intentOptions = [
  {
    id: "new-experience",
    label: "Create a new experience",
    description: "Plan a fresh screen or workflow from a blank starting point.",
    icon: Sparkles,
  },
  {
    id: "refactor-existing",
    label: "Refine an existing flow",
    description:
      "Improve structure, usability, or maintainability in an existing app area.",
    icon: Wand2,
  },
  {
    id: "accelerate-delivery",
    label: "Accelerate delivery",
    description:
      "Generate a focused implementation brief for a team to build immediately.",
    icon: Rocket,
  },
] as const;

const artifactOptions = [
  {
    id: "screen-blueprint",
    label: "Screen blueprint",
    description: "Layout, controls, states, and interaction guidance.",
    icon: Blocks,
    mode: "screen_builder",
  },
  {
    id: "component-set",
    label: "Reusable component set",
    description: "Patterns for cards, forms, lists, and high-value UI modules.",
    icon: Layers3,
    mode: "component_builder",
  },
  {
    id: "power-fx-starter",
    label: "Power Fx starter",
    description:
      "Starter formulas and implementation notes for the selected build.",
    icon: FileCode2,
    mode: "formula_builder",
  },
] as const;

const constraintOptions = [
  "Responsive tablet-first layout",
  "Keep Dataverse schema unchanged",
  "Limit to standard connectors",
  "Accessibility review required",
  "Minimize nested galleries",
  "Avoid non-delegable formulas",
] as const;

const outputPreferences = [
  "Step-by-step implementation checklist",
  "Suggested control hierarchy",
  "Power Fx starter snippets",
  "Naming recommendations",
  "Risk and dependency callouts",
  "Test scenarios",
] as const;

const fieldClassName =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-70";

type BuildStudioFormState = {
  workspaceTitle: string;
  buildIntent: string;
  artifactType: string;
  technicalNotes: string;
  successMetric: string;
  selectedConstraints: string[];
  selectedOutputs: string[];
};

const initialFormState: BuildStudioFormState = {
  workspaceTitle: "",
  buildIntent: intentOptions[0].id,
  artifactType: artifactOptions[0].id,
  technicalNotes: "",
  successMetric: "",
  selectedConstraints: [],
  selectedOutputs: [],
};

function getBuildErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "error" in error &&
    typeof error.error === "object" &&
    error.error !== null &&
    "message" in error.error &&
    typeof error.error.message === "string"
  ) {
    return (error as ValidationErrorPayload).error.message;
  }

  return "We couldn't generate the build output right now. Please review your inputs and try again.";
}

function toggleSelection(
  value: string,
  setValues: Dispatch<SetStateAction<string[]>>,
) {
  setValues((current) =>
    current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value],
  );
}

export default function BuildPage() {
  const [formState, setFormState] =
    useState<BuildStudioFormState>(initialFormState);
  const [response, setResponse] = useState<BuildResponse | null>(null);
  const [submittedRequest, setSubmittedRequest] = useState<BuildRequest | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rerunMessage, setRerunMessage] = useState<string | null>(null);

  const selectedIntent = useMemo(
    () =>
      intentOptions.find((option) => option.id === formState.buildIntent) ??
      intentOptions[0],
    [formState.buildIntent],
  );

  const selectedArtifact = useMemo(
    () =>
      artifactOptions.find((option) => option.id === formState.artifactType) ??
      artifactOptions[0],
    [formState.artifactType],
  );

  const isSubmitDisabled = useMemo(
    () =>
      isSubmitting ||
      formState.workspaceTitle.trim().length === 0 ||
      formState.technicalNotes.trim().length === 0 ||
      formState.successMetric.trim().length === 0,
    [
      formState.successMetric,
      formState.technicalNotes,
      formState.workspaceTitle,
      isSubmitting,
    ],
  );

  const buildRequest: BuildRequest = {
    mode: selectedArtifact.mode,
    promptTitle: formState.workspaceTitle.trim(),
    contextSummary: formState.technicalNotes.trim(),
    inputPayload: {
      build_intent: selectedIntent.label,
      target_artifact: selectedArtifact.label,
      success_signal: formState.successMetric.trim(),
      constraints: formState.selectedConstraints.join(", ") || "None selected",
      output_preferences:
        formState.selectedOutputs.join(", ") || "None selected",
    },
  };

  const generatedAtLabel = useMemo(() => {
    if (!response?.generatedAt) {
      return null;
    }

    const parsedDate = new Date(response.generatedAt);
    return Number.isNaN(parsedDate.getTime())
      ? "Generated just now"
      : `Generated ${parsedDate.toLocaleString()}`;
  }, [response]);

  const updateField = <TKey extends keyof BuildStudioFormState>(
    field: TKey,
    value: BuildStudioFormState[TKey],
  ) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));

    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const updateSelectableField = (
    field: "selectedConstraints" | "selectedOutputs",
    value: string,
  ) => {
    toggleSelection(value, (updater) =>
      setFormState((current) => ({
        ...current,
        [field]:
          typeof updater === "function" ? updater(current[field]) : updater,
      })),
    );

    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  useEffect(() => {
    const queuedRun = consumeQueuedRerun("build");

    if (!queuedRun) {
      return;
    }

    const constraints = queuedRun.request.inputPayload.constraints;
    const outputs = queuedRun.request.inputPayload.output_preferences;

    setFormState({
      workspaceTitle: queuedRun.request.promptTitle,
      buildIntent:
        intentOptions.find((option) => option.label === queuedRun.request.inputPayload.build_intent)?.id ?? intentOptions[0].id,
      artifactType:
        artifactOptions.find((option) => option.label === queuedRun.request.inputPayload.target_artifact)?.id ??
        artifactOptions[0].id,
      technicalNotes: queuedRun.request.contextSummary,
      successMetric: queuedRun.request.inputPayload.success_signal ?? "",
      selectedConstraints: constraints === "None selected" ? [] : constraints.split(", ").filter(Boolean),
      selectedOutputs: outputs === "None selected" ? [] : outputs.split(", ").filter(Boolean)
    });
    setRerunMessage(`Loaded saved input from ${queuedRun.title}. Review it and generate the build package again when ready.`);
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const apiResponse = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(buildRequest),
      });

      const payload = (await apiResponse.json()) as
        | BuildResponse
        | ValidationErrorPayload;

      if (!apiResponse.ok) {
        setResponse(null);
        setErrorMessage(getBuildErrorMessage(payload));
        return;
      }

      const savedResponse = payload as BuildResponse;
      setSubmittedRequest(buildRequest);
      setResponse(savedResponse);
      saveRun(
        createSavedRunRecord({
          studio: "build",
          title: buildRequest.promptTitle || "Build run",
          request: buildRequest,
          response: savedResponse
        }),
      );
    } catch {
      setResponse(null);
      setErrorMessage(
        "We couldn't reach the build service right now. Please try again in a moment.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyTemplate = (template: StudioTemplate) => {
    setFormState((current) => ({
      ...current,
      ...(template.payload as Partial<BuildTemplatePayload>),
    }));
    setErrorMessage(null);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Build Studio"
        description="Shape implementation-ready build inputs, submit them to generation, and review the resulting build package in a structured output workspace."
        actions={
          <Button
            type="submit"
            form="build-studio-form"
            disabled={isSubmitDisabled}
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Generating...
              </span>
            ) : (
              "Generate Build Output"
            )}
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,1fr)]">
        <form
          id="build-studio-form"
          className="space-y-6"
          onSubmit={handleSubmit}
        >
          <StudioTemplatePicker
            area="build"
            disabled={isSubmitting}
            onApplyTemplate={applyTemplate}
          />

          <SectionCard
            title="Build inputs"
            description="Capture the build direction clearly so the generation step starts from a usable, implementation-oriented brief."
          >
            <div className="space-y-6">
              <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-3">
                  <Sparkles
                    className="mt-0.5 h-4 w-4 text-primary"
                    aria-hidden="true"
                  />
                  <p>
                    Build Studio sends your current brief to the existing
                    generation API and keeps the latest successful package
                    visible in the output workspace for review.
                  </p>
                </div>
              </div>
              {rerunMessage ? (
                <StatusMessage label="Saved run loaded" tone="info" message={rerunMessage} />
              ) : null}

              <label className="block space-y-1.5">
                <span className="text-sm font-medium">Workspace title</span>
                <input
                  value={formState.workspaceTitle}
                  onChange={(event) =>
                    updateField("workspaceTitle", event.target.value)
                  }
                  placeholder="Example: Claims intake review hub"
                  className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isSubmitting}
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
                    const isActive = option.id === formState.buildIntent;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => updateField("buildIntent", option.id)}
                        disabled={isSubmitting}
                        className={cn(
                          "rounded-xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-70",
                          isActive
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-border/70 bg-background hover:border-primary/40 hover:bg-muted/40",
                        )}
                      >
                        <div className="mb-3 flex items-center gap-2">
                          <span
                            className={cn(
                              "flex h-9 w-9 items-center justify-center rounded-lg border",
                              isActive
                                ? "border-primary/40 bg-primary/15 text-primary"
                                : "border-border bg-muted text-muted-foreground",
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <p className="text-sm font-semibold">
                            {option.label}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
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
                    const isActive = option.id === formState.artifactType;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => updateField("artifactType", option.id)}
                        disabled={isSubmitting}
                        className={cn(
                          "rounded-xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-70",
                          isActive
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-border/70 bg-background hover:border-primary/40 hover:bg-muted/40",
                        )}
                      >
                        <div className="mb-3 flex items-center gap-2">
                          <span
                            className={cn(
                              "flex h-9 w-9 items-center justify-center rounded-lg border",
                              isActive
                                ? "border-primary/40 bg-primary/15 text-primary"
                                : "border-border bg-muted text-muted-foreground",
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <p className="text-sm font-semibold">
                            {option.label}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
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
                    value={formState.technicalNotes}
                    onChange={(event) =>
                      updateField("technicalNotes", event.target.value)
                    }
                    placeholder="Describe entities, user roles, key interactions, data sources, and implementation considerations."
                    className={fieldClassName}
                    disabled={isSubmitting}
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="text-sm font-medium">Success signal</span>
                  <textarea
                    rows={7}
                    value={formState.successMetric}
                    onChange={(event) =>
                      updateField("successMetric", event.target.value)
                    }
                    placeholder="Define what a good generated build brief should make easier for the team."
                    className={fieldClassName}
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
            >
              <div className="space-y-3">
                {constraintOptions.map((option) => {
                  const isSelected =
                    formState.selectedConstraints.includes(option);

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        updateSelectableField("selectedConstraints", option)
                      }
                      disabled={isSubmitting}
                      className={cn(
                        "flex w-full items-start justify-between gap-3 rounded-lg border px-4 py-3 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-70",
                        isSelected
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border/70 bg-background text-muted-foreground hover:border-primary/40 hover:bg-muted/40",
                      )}
                    >
                      <span>{option}</span>
                      <span
                        className={cn(
                          "mt-0.5 h-4 w-4 rounded-full border",
                          isSelected
                            ? "border-primary bg-primary"
                            : "border-border bg-transparent",
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
                  const isSelected = formState.selectedOutputs.includes(option);

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() =>
                        updateSelectableField("selectedOutputs", option)
                      }
                      disabled={isSubmitting}
                      className={cn(
                        "flex w-full items-start justify-between gap-3 rounded-lg border px-4 py-3 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-70",
                        isSelected
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border/70 bg-background text-muted-foreground hover:border-primary/40 hover:bg-muted/40",
                      )}
                    >
                      <span>{option}</span>
                      <span
                        className={cn(
                          "mt-0.5 h-4 w-4 rounded-sm border",
                          isSelected
                            ? "border-primary bg-primary"
                            : "border-border bg-transparent",
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            </SectionCard>
          </div>

          <SectionCard
            title="Submit build request"
            description="When you generate, the current input state is packaged and sent to the existing Build API route."
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <Button type="submit" disabled={isSubmitDisabled}>
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Generating build package...
                    </span>
                  ) : (
                    "Generate Build Output"
                  )}
                </Button>
                <p className="text-sm text-muted-foreground">
                  The output panel updates after each successful run and keeps
                  the latest generated package in local state.
                </p>
              </div>

              {errorMessage ? (
                <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                  <div className="flex items-start gap-3">
                    <AlertCircle
                      className="mt-0.5 h-4 w-4"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="font-medium">Build generation failed</p>
                      <p className="mt-1 text-destructive/90">{errorMessage}</p>
                    </div>
                  </div>
                </div>
              ) : response ? (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-300">
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="font-medium">Build package ready</p>
                      <p className="mt-1">
                        {generatedAtLabel ??
                          "The latest build response is ready in the output workspace."}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </SectionCard>
        </form>

        <div className="space-y-6">
          <SectionCard
            title="Output workspace"
            description="Review the submitted brief and generated response in clearly separated, structured output sections."
          >
            <BuildOutput
              request={submittedRequest ?? buildRequest}
              response={response ?? undefined}
            />
          </SectionCard>
        </div>
      </div>
    </PageContainer>
  );
}
