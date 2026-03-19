"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, Layers3, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionCard } from "@/components/ui/section-card";
import { FormInputField } from "@/components/workspace/form-input-field";
import { FormTextareaField } from "@/components/workspace/form-textarea-field";
import { cn } from "@/lib/utils";

type StudioType = "scope" | "build" | "analyze" | "recommend";

type TemplateRecord = {
  id: string;
  name: string;
  studioType: StudioType;
  content: string;
  notes: string;
  createdAt: string;
};

type TemplateDraft = {
  name: string;
  studioType: StudioType;
  content: string;
  notes: string;
};

const STORAGE_KEY = "fxlens.prompt-templates";

const studioOptions: Array<{ value: StudioType; label: string; summary: string }> = [
  {
    value: "scope",
    label: "Scope Studio",
    summary: "Discovery, architecture framing, and delivery-ready scoping prompts."
  },
  {
    value: "build",
    label: "Build Studio",
    summary: "Starter instructions for screens, components, and formula generation."
  },
  {
    value: "analyze",
    label: "Analyze Studio",
    summary: "Code review templates focused on delegation, performance, and maintainability."
  },
  {
    value: "recommend",
    label: "Recommendations",
    summary: "Decision-support prompts for architecture tradeoffs and next-step guidance."
  }
];

const starterTemplates: TemplateRecord[] = [
  {
    id: "scope-discovery-brief",
    name: "Scope discovery brief",
    studioType: "scope",
    content:
      "Summarize the request as a Power Apps scope brief. Identify users, workflows, screens, entities, integrations, and backend recommendations.",
    notes: "Use when an intake call or messy notes need to become a delivery-ready architecture summary.",
    createdAt: "2026-03-19T00:00:00.000Z"
  },
  {
    id: "build-screen-starter",
    name: "Build screen starter",
    studioType: "build",
    content:
      "Generate a focused build plan for the requested screen. Include layout guidance, reusable components, formulas, and implementation assumptions.",
    notes: "Helpful after a scope is approved and the team needs consistent output for implementation handoff.",
    createdAt: "2026-03-19T00:00:00.000Z"
  }
];

const emptyDraft: TemplateDraft = {
  name: "",
  studioType: "scope",
  content: "",
  notes: ""
};

function createTemplateRecord(draft: TemplateDraft): TemplateRecord {
  return {
    id: `template-${Date.now()}`,
    name: draft.name.trim(),
    studioType: draft.studioType,
    content: draft.content.trim(),
    notes: draft.notes.trim(),
    createdAt: new Date().toISOString()
  };
}

export function TemplatesWorkspace() {
  const [templates, setTemplates] = useState<TemplateRecord[]>(starterTemplates);
  const [draft, setDraft] = useState<TemplateDraft>(emptyDraft);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(starterTemplates[0]?.id ?? "");
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedValue = window.localStorage.getItem(STORAGE_KEY);

    if (!storedValue) {
      setHasHydrated(true);
      return;
    }

    try {
      const parsedTemplates = JSON.parse(storedValue) as TemplateRecord[];

      if (Array.isArray(parsedTemplates) && parsedTemplates.length > 0) {
        setTemplates(parsedTemplates);
        setSelectedTemplateId(parsedTemplates[0]?.id ?? "");
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHasHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hasHydrated || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  }, [hasHydrated, templates]);

  const templatesByStudio = useMemo(() => {
    return studioOptions.map((studio) => ({
      ...studio,
      templates: templates.filter((template) => template.studioType === studio.value)
    }));
  }, [templates]);

  const selectedTemplate = useMemo(
    () => templates.find((template) => template.id === selectedTemplateId) ?? templates[0] ?? null,
    [selectedTemplateId, templates]
  );

  const totalTemplates = templates.length;
  const populatedStudios = templatesByStudio.filter((studio) => studio.templates.length > 0).length;

  const handleCreateTemplate = () => {
    if (!draft.name.trim() || !draft.content.trim()) {
      return;
    }

    const nextTemplate = createTemplateRecord(draft);

    setTemplates((current) => [nextTemplate, ...current]);
    setSelectedTemplateId(nextTemplate.id);
    setDraft(emptyDraft);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(340px,0.85fr)]">
      <div className="space-y-6">
        <SectionCard
          title="Template library"
          description="Save reusable starter prompts for the core studios so teams can begin with consistent instructions instead of rewriting the same brief each time."
          headerAdornment={
            <div className="flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Layers3 className="h-3.5 w-3.5" />
              {totalTemplates} templates
            </div>
          }
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-border/70 bg-background/70 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Coverage</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{populatedStudios}/4</p>
              <p className="mt-1 text-sm text-muted-foreground">Core studios with at least one reusable template.</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/70 p-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Latest addition</p>
              <p className="mt-2 text-base font-semibold tracking-tight">{templates[0]?.name ?? "No templates yet"}</p>
              <p className="mt-1 text-sm text-muted-foreground">Most recent template available to the workspace.</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/70 p-4 md:col-span-2">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Workspace notes</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Templates are stored in the browser for now so this Phase 3 workspace stays practical without adding permissions or sharing flows.
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Saved templates"
          description="Browse templates by studio and open any entry to review its starter instructions and notes."
        >
          <div className="space-y-5">
            {templatesByStudio.map((studio) => (
              <div key={studio.value} className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold tracking-tight">{studio.label}</p>
                    <p className="text-xs text-muted-foreground">{studio.summary}</p>
                  </div>
                  <span className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-xs text-muted-foreground">
                    {studio.templates.length}
                  </span>
                </div>

                {studio.templates.length > 0 ? (
                  <div className="space-y-3">
                    {studio.templates.map((template) => {
                      const isSelected = selectedTemplate?.id === template.id;

                      return (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => setSelectedTemplateId(template.id)}
                          className={cn(
                            "w-full rounded-xl border px-4 py-4 text-left transition",
                            isSelected
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border/70 bg-background/70 hover:border-foreground/20 hover:bg-background"
                          )}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <p className="text-sm font-semibold tracking-tight">{template.name}</p>
                              </div>
                              <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">{template.content}</p>
                            </div>
                            <span className="rounded-full border border-border/70 bg-background px-2.5 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                              {studio.label}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border/70 bg-background/40 p-4 text-sm text-muted-foreground">
                    No templates saved for this studio yet.
                  </div>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="space-y-6">
        <SectionCard
          title="Create template"
          description="Add a reusable starter prompt with just the fields teams need right now."
          headerAdornment={
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" />
              Phase 3 templates
            </div>
          }
        >
          <div className="space-y-4">
            <FormInputField
              label="Template name"
              value={draft.name}
              placeholder="Example: Analyze delegation review"
              onChange={(value) => setDraft((current) => ({ ...current, name: value }))}
            />

            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Studio type</span>
              <select
                value={draft.studioType}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, studioType: event.target.value as StudioType }))
                }
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring"
              >
                {studioOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <FormTextareaField
              label="Template content or starter instructions"
              value={draft.content}
              rows={7}
              placeholder="Provide the reusable instructions this studio should start from. Focus on the structure, constraints, and output style you want repeated."
              onChange={(value) => setDraft((current) => ({ ...current, content: value }))}
            />

            <FormTextareaField
              label="Notes"
              value={draft.notes}
              rows={4}
              placeholder="Optional implementation notes, when to use the template, or reminders for reviewers."
              onChange={(value) => setDraft((current) => ({ ...current, notes: value }))}
            />

            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={handleCreateTemplate} disabled={!draft.name.trim() || !draft.content.trim()}>
                Save template
              </Button>
              <Button type="button" variant="secondary" onClick={() => setDraft(emptyDraft)}>
                Reset form
              </Button>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Template preview"
          description="Review the currently selected template without leaving the page."
        >
          {selectedTemplate ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-border/70 bg-background/70 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Template name</p>
                <p className="mt-2 text-base font-semibold tracking-tight">{selectedTemplate.name}</p>
              </div>

              <div className="rounded-xl border border-border/70 bg-background/70 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Studio</p>
                <p className="mt-2 text-sm text-foreground">
                  {studioOptions.find((option) => option.value === selectedTemplate.studioType)?.label}
                </p>
              </div>

              <div className="rounded-xl border border-border/70 bg-background/70 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Starter instructions</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">{selectedTemplate.content}</p>
              </div>

              <div className="rounded-xl border border-border/70 bg-background/70 p-4">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Notes</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                  {selectedTemplate.notes || "No notes added yet."}
                </p>
              </div>
            </div>
          ) : (
            <EmptyState
              title="No template selected"
              description="Create a template to start building a reusable prompt library for the core studios."
              actionLabel="Save template"
            />
          )}
        </SectionCard>
      </div>
    </div>
  );
}
