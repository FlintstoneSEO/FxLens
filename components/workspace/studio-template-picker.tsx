"use client";

import { useEffect, useMemo, useState } from "react";
import { Bookmark } from "lucide-react";

import type { StudioTemplate, StudioTemplateArea } from "@/lib/studio-templates";
import { readStoredStudioTemplates } from "@/lib/studio-templates";

const fieldClassName =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-70";

type StudioTemplatePickerProps = {
  area: StudioTemplateArea;
  disabled?: boolean;
  onApplyTemplate: (template: StudioTemplate) => void;
};

export function StudioTemplatePicker({ area, disabled = false, onApplyTemplate }: StudioTemplatePickerProps) {
  const [templates, setTemplates] = useState<StudioTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");

  useEffect(() => {
    setTemplates(readStoredStudioTemplates());
  }, []);

  const matchingTemplates = useMemo(
    () => templates.filter((template) => template.area === area),
    [area, templates]
  );

  const selectedTemplate = matchingTemplates.find((template) => template.id === selectedTemplateId) ?? null;

  const handleChange = (nextTemplateId: string) => {
    setSelectedTemplateId(nextTemplateId);

    const nextTemplate = matchingTemplates.find((template) => template.id === nextTemplateId);

    if (nextTemplate) {
      onApplyTemplate(nextTemplate);
    }
  };

  return (
    <section className="rounded-2xl border border-dashed border-border/80 bg-muted/20 px-4 py-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-background p-2 text-primary shadow-sm">
          <Bookmark className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <p className="text-sm font-medium text-foreground">Apply a template</p>
            <p className="text-sm text-muted-foreground">
              Select a saved starter to prefill this studio without changing the submission flow.
            </p>
          </div>

          <label className="block space-y-1.5 text-sm">
            <span className="font-medium text-foreground">Saved templates</span>
            <select
              className={fieldClassName}
              value={selectedTemplateId}
              onChange={(event) => handleChange(event.target.value)}
              disabled={disabled || matchingTemplates.length === 0}
            >
              <option value="">Choose a template</option>
              {matchingTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </label>

          <p className="text-xs text-muted-foreground">
            {selectedTemplate ? selectedTemplate.description : matchingTemplates.length > 0 ? "Templates only update the inputs shown on this page." : "No saved templates are available for this studio yet."}
          </p>
        </div>
      </div>
    </section>
  );
}
