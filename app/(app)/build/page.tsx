"use client";

import { useMemo, useState, type FormEvent } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { FormInputField } from "@/components/workspace/form-input-field";
import { FormTextareaField } from "@/components/workspace/form-textarea-field";
import { StudioInputCard, StudioOutputCard } from "@/components/workspace/studio-shell";

const initialState = {
  workspaceTitle: "Operations command center",
  buildIntent: "Create a new experience",
  artifactType: "Screen blueprint",
  technicalNotes:
    "Need an approval-focused workspace for field operations managers with summary KPIs, queued work, and quick access to item-level actions.",
  constraints: "Responsive tablet-first layout, standard connectors only, accessibility review required.",
  outputPreferences: "Implementation checklist, control hierarchy, naming recommendations, and test scenarios.",
  successMetric: "A maker should understand the page structure and formula starting points in under 10 minutes."
};

export default function BuildPage() {
  const [formState, setFormState] = useState(initialState);
  const [result, setResult] = useState<null | { summary: string; nextSteps: string[]; guardrails: string[] }>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSubmitDisabled = useMemo(
    () => isSubmitting || Object.values(formState).some((value) => value.trim().length === 0),
    [formState, isSubmitting]
  );

  const updateField = (field: keyof typeof initialState, value: string) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    window.setTimeout(() => {
      setResult({
        summary: `${formState.workspaceTitle} is ready for a ${formState.artifactType.toLowerCase()} focused on ${formState.buildIntent.toLowerCase()}.`,
        nextSteps: [
          `Use the technical notes to outline the first-pass screen structure and interactions.`,
          `Apply the requested output preferences: ${formState.outputPreferences}`,
          `Validate success against: ${formState.successMetric}`
        ],
        guardrails: formState.constraints.split(",").map((item) => item.trim()).filter(Boolean)
      });
      setIsSubmitting(false);
    }, 300);
  };

  return (
    <PageContainer>
      <PageHeader
        title="Build Studio"
        description="Shape a clean build brief, confirm the delivery guardrails, and leave the page with a clear implementation-ready output."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <StudioInputCard
          title="Input"
          description="Capture the build direction, supporting notes, and delivery constraints before generating the brief."
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-4 md:grid-cols-2">
              <FormInputField
                label="Workspace title"
                value={formState.workspaceTitle}
                placeholder="Example: Claims intake review hub"
                onChange={(value) => updateField("workspaceTitle", value)}
              />
              <FormInputField
                label="Build intent"
                value={formState.buildIntent}
                placeholder="Example: Refine an existing flow"
                onChange={(value) => updateField("buildIntent", value)}
              />
            </div>

            <FormInputField
              label="Artifact type"
              value={formState.artifactType}
              placeholder="Example: Reusable component set"
              onChange={(value) => updateField("artifactType", value)}
            />
            <FormTextareaField
              label="Technical notes"
              value={formState.technicalNotes}
              rows={5}
              placeholder="Describe entities, user roles, key interactions, and implementation considerations"
              onChange={(value) => updateField("technicalNotes", value)}
            />
            <div className="grid gap-4 lg:grid-cols-2">
              <FormTextareaField
                label="Constraints"
                value={formState.constraints}
                rows={4}
                placeholder="List platform, accessibility, data, or delivery constraints"
                onChange={(value) => updateField("constraints", value)}
              />
              <FormTextareaField
                label="Output preferences"
                value={formState.outputPreferences}
                rows={4}
                placeholder="List the output details the team wants included"
                onChange={(value) => updateField("outputPreferences", value)}
              />
            </div>
            <FormTextareaField
              label="Success signal"
              value={formState.successMetric}
              rows={3}
              placeholder="Define what a useful build output should make easier"
              onChange={(value) => updateField("successMetric", value)}
            />

            <div className="flex flex-wrap items-center gap-3 border-t border-border/70 pt-4">
              <Button type="submit" disabled={isSubmitDisabled}>
                {isSubmitting ? "Generating output..." : "Generate output"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setFormState(initialState);
                  setResult(null);
                  setErrorMessage(null);
                }}
              >
                Reset input
              </Button>
            </div>
          </form>
        </StudioInputCard>

        <StudioOutputCard
          title="Output"
          description="Review the build-ready summary, guardrails, and immediate next steps in a consistent studio layout."
          errorMessage={errorMessage}
          emptyMessage="Submit the input to generate a build summary for this studio."
        >
          {result ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/80">Summary</p>
                <p className="mt-2 text-sm text-foreground">{result.summary}</p>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Guardrails</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {result.guardrails.map((item) => (
                    <span key={item} className="rounded-full border border-border bg-muted/60 px-3 py-1 text-xs text-foreground">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-border/70 bg-background/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Next steps</p>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {result.nextSteps.map((item) => (
                    <li key={item} className="list-inside list-disc">{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null}
        </StudioOutputCard>
      </div>
    </PageContainer>
  );
}
