"use client";

import { useMemo, useState } from "react";
import { FileText, FolderKanban, Layers3, Network, StickyNote } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { FormInputField } from "@/components/workspace/form-input-field";
import { FormTextareaField } from "@/components/workspace/form-textarea-field";

const starterArtifacts = [
  {
    label: "Solution summary",
    description: "Paste a packaged solution overview, export notes, or release summary.",
    icon: FileText
  },
  {
    label: "Architecture notes",
    description: "Capture entities, integrations, environments, and design decisions.",
    icon: Layers3
  },
  {
    label: "Implementation details",
    description: "Document screen coverage, flows, plugins, automation, and known gaps.",
    icon: Network
  }
];

export default function SolutionReviewPage() {
  const [solutionName, setSolutionName] = useState("");
  const [reviewGoal, setReviewGoal] = useState("");
  const [solutionDetails, setSolutionDetails] = useState("");
  const [architectureNotes, setArchitectureNotes] = useState("");
  const [implementationSummary, setImplementationSummary] = useState("");
  const [artifactMetadata, setArtifactMetadata] = useState("");

  const populatedSections = useMemo(
    () =>
      [solutionDetails, architectureNotes, implementationSummary, artifactMetadata].filter(
        (value) => value.trim().length > 0
      ).length,
    [artifactMetadata, architectureNotes, implementationSummary, solutionDetails]
  );

  const resetWorkspace = () => {
    setSolutionName("");
    setReviewGoal("");
    setSolutionDetails("");
    setArchitectureNotes("");
    setImplementationSummary("");
    setArtifactMetadata("");
  };

  return (
    <PageContainer>
      <PageHeader
        title="Solution Review"
        description="Inventory uploaded artifacts, detect architectural drift, and receive focused refactor recommendations."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.9fr)]">
        <SectionCard
          title="Review Intake Workspace"
          description="Capture the core context reviewers need before automated diagnostics and recommendations are connected."
        >
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormInputField
                label="Solution or package name"
                value={solutionName}
                placeholder="e.g. Field Service Modernization"
                onChange={setSolutionName}
              />
              <FormInputField
                label="Primary review goal"
                value={reviewGoal}
                placeholder="e.g. validate architecture, summarize implementation, prep refactor"
                onChange={setReviewGoal}
              />
            </div>

            <FormTextareaField
              label="Solution details"
              value={solutionDetails}
              rows={7}
              placeholder="Paste exported solution notes, high-level scope, environments, publishers, or release details."
              onChange={setSolutionDetails}
            />

            <div className="grid gap-4 lg:grid-cols-2">
              <FormTextareaField
                label="Architecture notes"
                value={architectureNotes}
                rows={8}
                placeholder="Outline app boundaries, entities, flows, integrations, security model, or dependencies."
                onChange={setArchitectureNotes}
              />
              <FormTextareaField
                label="Implementation summary"
                value={implementationSummary}
                rows={8}
                placeholder="Summarize delivered screens, automation, customizations, technical debt, or rollout status."
                onChange={setImplementationSummary}
              />
            </div>

            <FormTextareaField
              label="Artifacts metadata"
              value={artifactMetadata}
              rows={5}
              placeholder="Add exported file names, versions, timestamps, source repos, environments, or handoff references."
              onChange={setArtifactMetadata}
            />

            <div className="flex flex-wrap items-center gap-3 border-t border-border/70 pt-2">
              <Button type="button">Review Input Ready</Button>
              <Button type="button" variant="secondary" onClick={resetWorkspace}>
                Clear Workspace
              </Button>
              <p className="text-sm text-muted-foreground">
                Submission stays local for now. API handoff will be added in a later phase.
              </p>
            </div>
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard
            title="Review Prep"
            description="A lightweight checklist to help organize the solution package before analysis is wired in."
          >
            <div className="space-y-4">
              {starterArtifacts.map(({ label, description, icon: Icon }) => (
                <div key={label} className="rounded-lg border border-border/70 bg-background/70 p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-md bg-muted p-2 text-muted-foreground">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Workspace Snapshot"
            description="Quick status summary for the current review intake draft."
          >
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border/70 bg-background/70 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <FolderKanban className="h-4 w-4 text-muted-foreground" />
                    Intake completion
                  </div>
                  <p className="text-2xl font-semibold">{populatedSections}/4</p>
                  <p className="text-sm text-muted-foreground">Review sections populated</p>
                </div>
                <div className="rounded-lg border border-border/70 bg-background/70 p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <StickyNote className="h-4 w-4 text-muted-foreground" />
                    Current focus
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    {reviewGoal.trim() || "Set a review goal to guide upcoming diagnostics."}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-dashed border-border bg-background/60 p-4 text-sm text-muted-foreground">
                {solutionName.trim()
                  ? `Preparing a review workspace for ${solutionName}. Add as much implementation and architecture detail as you have available.`
                  : "Add a solution name and paste your notes to create a reusable review brief for your team."}
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </PageContainer>
  );
}
