"use client";

import { type FormEvent, useMemo, useState } from "react";

import { PageContainer } from "@/components/layout/page-container";
import {
  SuggestedComponentCard,
  SuggestedFormulaCard,
  SuggestedScreenCard
} from "@/components/workspace/result-cards";
import { FormInputField } from "@/components/workspace/form-input-field";
import { FormTextareaField } from "@/components/workspace/form-textarea-field";
import { OutputBlock } from "@/components/workspace/output-block";
import { StatusMessage } from "@/components/workspace/status-message";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import type { BuildMode, BuildRequest, BuildResponse } from "@/lib/contracts/workspace";

type BuildFormState = {
  mode: BuildMode;
  promptTitle: string;
  contextSummary: string;
  userJourney: string;
  dataSources: string;
  implementationGoals: string;
};

const initialFormState: BuildFormState = {
  mode: "screen_builder",
  promptTitle: "Field service request intake",
  contextSummary:
    "Create build-ready assets for a technician intake workflow with manager review and SLA monitoring.",
  userJourney: "Technician captures request, manager reviews details, operations team monitors SLAs.",
  dataSources: "Dataverse Requests, Request Types, Users, SLA Metrics",
  implementationGoals: "Responsive screen layout, reusable status components, starter formulas for approvals"
};

const modeOptions: Array<{ value: BuildMode; label: string }> = [
  { value: "screen_builder", label: "Screen Builder" },
  { value: "component_builder", label: "Component Builder" },
  { value: "formula_builder", label: "Formula Builder" }
];

export default function BuildPage() {
  const [formState, setFormState] = useState<BuildFormState>(initialFormState);
  const [buildResult, setBuildResult] = useState<BuildResponse | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSubmitDisabled = useMemo(() => {
    return (
      isSubmitting ||
      !formState.promptTitle.trim() ||
      !formState.contextSummary.trim() ||
      !formState.userJourney.trim() ||
      !formState.dataSources.trim() ||
      !formState.implementationGoals.trim()
    );
  }, [formState, isSubmitting]);

  const updateField = <K extends keyof BuildFormState>(field: K, value: BuildFormState[K]) => {
    setFormState((currentState) => ({
      ...currentState,
      [field]: value
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: BuildRequest = {
      mode: formState.mode,
      promptTitle: formState.promptTitle.trim(),
      contextSummary: formState.contextSummary.trim(),
      inputPayload: {
        userJourney: formState.userJourney.trim(),
        dataSources: formState.dataSources.trim(),
        implementationGoals: formState.implementationGoals.trim()
      }
    };

    setIsSubmitting(true);
    setErrorMessage(null);
    setStatusMessage("Submitting build request...");

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const responseBody = (await response.json()) as BuildResponse | { error?: { message?: string } };

      if (!response.ok) {
        const message =
          "error" in responseBody && responseBody.error?.message
            ? responseBody.error.message
            : "Build generation failed. Please review your inputs and try again.";

        throw new Error(message);
      }

      setBuildResult(responseBody as BuildResponse);
      setStatusMessage("Build assets generated successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error generating build assets.";
      setErrorMessage(message);
      setStatusMessage(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Build Studio"
        description="Generate implementation-ready screen blueprints, reusable components, and starter Power Fx output."
      />

      <SectionCard
        title="Blueprint Generator"
        description="Submit build-ready requirements to the existing generation flow and keep the latest response available for review."
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Build mode</span>
            <select
              value={formState.mode}
              onChange={(event) => updateField("mode", event.target.value as BuildMode)}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
              disabled={isSubmitting}
            >
              {modeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <FormInputField
              label="Prompt title"
              value={formState.promptTitle}
              placeholder="Name the build request"
              onChange={(value) => updateField("promptTitle", value)}
            />
            <FormTextareaField
              label="Context summary"
              value={formState.contextSummary}
              placeholder="Summarize the workflow and intended outcome"
              rows={3}
              onChange={(value) => updateField("contextSummary", value)}
            />
          </div>

          <FormTextareaField
            label="User journey"
            value={formState.userJourney}
            placeholder="Describe how users will move through the experience"
            rows={3}
            onChange={(value) => updateField("userJourney", value)}
          />
          <FormTextareaField
            label="Data sources"
            value={formState.dataSources}
            placeholder="List tables, connectors, or APIs involved"
            rows={3}
            onChange={(value) => updateField("dataSources", value)}
          />
          <FormTextareaField
            label="Implementation goals"
            value={formState.implementationGoals}
            placeholder="Capture desired screens, components, or formulas"
            rows={3}
            onChange={(value) => updateField("implementationGoals", value)}
          />

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={isSubmitDisabled}>
              {isSubmitting ? "Generating..." : "Generate Blueprint"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setFormState(initialFormState);
                setErrorMessage(null);
                setStatusMessage(null);
              }}
              disabled={isSubmitting}
            >
              Reset inputs
            </Button>
          </div>
        </form>

        {statusMessage ? <div className="mt-4"><StatusMessage message={statusMessage} /></div> : null}
        {errorMessage ? <div className="mt-4"><StatusMessage message={errorMessage} tone="error" /></div> : null}
      </SectionCard>

      <SectionCard
        title="Latest generated assets"
        description="The most recent Build API response is stored in local page state and ready for rendering."
      >
        {buildResult ? (
          <div className="space-y-6">
            <div className="rounded-xl border border-border/70 bg-background/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Summary</p>
              <p className="mt-2 text-sm text-foreground">{buildResult.summary}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Mode: {buildResult.mode} · Generated at: {new Date(buildResult.generatedAt).toLocaleString()}
              </p>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              {buildResult.suggestedScreens.map((screen) => (
                <SuggestedScreenCard key={screen.id} screen={screen} />
              ))}
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              {buildResult.suggestedComponents.map((component) => (
                <SuggestedComponentCard key={component.id} component={component} />
              ))}
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              {buildResult.suggestedFormulas.map((formula) => (
                <SuggestedFormulaCard key={formula.id} formula={formula} />
              ))}
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <OutputBlock title="Implementation Notes" items={buildResult.implementationNotes} />
              <OutputBlock title="Performance Notes" items={buildResult.performanceNotes} />
            </div>
          </div>
        ) : (
          <EmptyState
            title="No generated assets yet"
            description="Submit build inputs to generate screen structures, reusable components, and starter formulas."
            actionLabel="Generate Blueprint"
          />
        )}
      </SectionCard>
    </PageContainer>
  );
}
