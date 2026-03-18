"use client";

import { useMemo, useState } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionCard } from "@/components/ui/section-card";
import { FormInputField } from "@/components/workspace/form-input-field";
import { FormTextareaField } from "@/components/workspace/form-textarea-field";
import { cn } from "@/lib/utils";

const dataSourceOptions = [
  { value: "dataverse", label: "Dataverse" },
  { value: "sql", label: "SQL" },
  { value: "sharepoint", label: "SharePoint" },
  { value: "api", label: "API" },
  { value: "mixed", label: "Mixed" },
  { value: "other", label: "Other" }
] as const;

const priorityOptions = ["Speed to release", "User adoption", "Performance", "Maintainability", "Governance"] as const;

function FieldHint({ children }: { children: string }) {
  return <p className="text-xs text-muted-foreground">{children}</p>;
}

export default function RecommendPage() {
  const [projectContext, setProjectContext] = useState("");
  const [currentState, setCurrentState] = useState("");
  const [priorities, setPriorities] = useState<string[]>(["Performance", "Maintainability"]);
  const [constraints, setConstraints] = useState("");
  const [targetOutcomes, setTargetOutcomes] = useState("");
  const [dataSourceMix, setDataSourceMix] = useState("mixed");
  const [screenCount, setScreenCount] = useState("8");
  const [architectureNotes, setArchitectureNotes] = useState("");
  const [symptoms, setSymptoms] = useState("");

  const requestSnapshot = useMemo(
    () => [
      { label: "Project context", value: projectContext || "Add business context, actors, and scope." },
      { label: "Priorities", value: priorities.join(", ") || "Select the main tradeoffs to optimize." },
      { label: "Constraints", value: constraints || "Capture platform, timeline, security, or integration limits." },
      { label: "Current state", value: currentState || "Summarize what exists today and where the gaps are." },
      { label: "Target outcomes", value: targetOutcomes || "Describe the improvements the recommendation should drive." }
    ],
    [constraints, currentState, priorities, projectContext, targetOutcomes]
  );

  const togglePriority = (priority: (typeof priorityOptions)[number]) => {
    setPriorities((current) =>
      current.includes(priority) ? current.filter((item) => item !== priority) : [...current, priority]
    );
  };

  const resetForm = () => {
    setProjectContext("");
    setCurrentState("");
    setPriorities(["Performance", "Maintainability"]);
    setConstraints("");
    setTargetOutcomes("");
    setDataSourceMix("mixed");
    setScreenCount("8");
    setArchitectureNotes("");
    setSymptoms("");
  };

  return (
    <PageContainer>
      <PageHeader
        title="Recommendations"
        description="Prepare a recommendation request with enough delivery context, tradeoffs, and architecture detail for a high-quality review." 
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={resetForm}>
              Reset
            </Button>
            <Button disabled>Generate Recommendations</Button>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.9fr)]">
        <div className="space-y-6">
          <SectionCard
            title="Recommendation Brief"
            description="Define the situation, what matters most, and what a strong recommendation needs to respect."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <FormTextareaField
                  label="Project context"
                  value={projectContext}
                  rows={4}
                  placeholder="Example: Internal operations app for field managers coordinating inspections, escalations, and follow-up work across three regions."
                  onChange={setProjectContext}
                />
                <FieldHint>Include audience, workflow scope, and the decision the recommendations should support.</FieldHint>
              </div>

              <div className="md:col-span-2">
                <span className="mb-1.5 block text-sm font-medium">Priorities</span>
                <div className="flex flex-wrap gap-2">
                  {priorityOptions.map((priority) => {
                    const isSelected = priorities.includes(priority);

                    return (
                      <button
                        key={priority}
                        type="button"
                        onClick={() => togglePriority(priority)}
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-sm transition",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                        )}
                      >
                        {priority}
                      </button>
                    );
                  })}
                </div>
                <FieldHint>Select the tradeoffs the recommendation should optimize first.</FieldHint>
              </div>

              <div className="md:col-span-2">
                <FormTextareaField
                  label="Constraints"
                  value={constraints}
                  rows={4}
                  placeholder="List any deadlines, licensing boundaries, governance rules, security requirements, integration limits, or resourcing concerns."
                  onChange={setConstraints}
                />
              </div>

              <div className="md:col-span-2">
                <FormTextareaField
                  label="Current state"
                  value={currentState}
                  rows={4}
                  placeholder="Summarize the current app, process, or architecture and call out what is working versus where friction is showing up."
                  onChange={setCurrentState}
                />
              </div>

              <div className="md:col-span-2">
                <FormTextareaField
                  label="Target outcomes"
                  value={targetOutcomes}
                  rows={4}
                  placeholder="Describe the results you want from the next recommendation set, such as faster approvals, fewer screens, simpler data access, or better responsiveness."
                  onChange={setTargetOutcomes}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Solution Signals"
            description="Capture the implementation details that should shape the recommendation set."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">Data source mix</span>
                <select
                  value={dataSourceMix}
                  onChange={(event) => setDataSourceMix(event.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {dataSourceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <FormInputField
                label="Estimated screen count"
                type="number"
                value={screenCount}
                placeholder="8"
                onChange={setScreenCount}
              />

              <div className="md:col-span-2">
                <FormTextareaField
                  label="Architecture notes"
                  value={architectureNotes}
                  rows={4}
                  placeholder="Capture existing patterns, important tables, integration touchpoints, and any implementation assumptions the recommendation should build around."
                  onChange={setArchitectureNotes}
                />
              </div>

              <div className="md:col-span-2">
                <FormTextareaField
                  label="Observed symptoms"
                  value={symptoms}
                  rows={4}
                  placeholder="List pain points such as slow screen loads, duplicated logic, approval bottlenecks, or unclear ownership between app and backend services."
                  onChange={setSymptoms}
                />
                <FieldHint>This workspace is input-only for now. Submission remains intentionally disabled until API wiring is added.</FieldHint>
              </div>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard
            title="Request snapshot"
            description="A compact brief to review before recommendation generation is connected."
          >
            <div className="space-y-4">
              {requestSnapshot.map((item) => (
                <div key={item.label} className="rounded-xl border border-border/70 bg-background/70 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.label}</p>
                  <p className="mt-2 text-sm leading-6 text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Generation payload"
            description="Preview of the fields that will back the recommendation request contract."
          >
            <dl className="space-y-3 text-sm">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">Scenario</dt>
                <dd className="max-w-[16rem] text-right">{projectContext || "—"}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">Data source mix</dt>
                <dd className="capitalize">{dataSourceMix}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">Screen count</dt>
                <dd>{screenCount || "0"}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">Architecture notes</dt>
                <dd className="max-w-[16rem] text-right">{architectureNotes || "—"}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">Symptoms</dt>
                <dd className="max-w-[16rem] text-right">{symptoms || "—"}</dd>
              </div>
            </dl>
          </SectionCard>
        </div>
      </div>
    </PageContainer>
  );
}
