import type { ReactNode } from "react";
import { FileText, LayoutPanelTop } from "lucide-react";

import { SectionCard } from "@/components/ui/section-card";
import { StatusMessage } from "@/components/workspace/status-message";

export const STUDIO_RUN_LABEL = "Run";
export const STUDIO_RUNNING_LABEL = "Running...";
export const STUDIO_LOADING_MESSAGE = "Running the latest request. Results will appear here when processing finishes.";
export const STUDIO_ERROR_LABEL = "Run failed";

export function StudioInputCard({
  title = "Input",
  description,
  children,
  className,
  accent = "input"
}: {
  title?: string;
  description: string;
  children: ReactNode;
  className?: string;
  accent?: "input" | "output";
}) {
  return (
    <SectionCard
      title={title}
      description={description}
      className={className}
      headerAdornment={
        accent === "input" ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            Input
          </span>
        ) : undefined
      }
    >
      {children}
    </SectionCard>
  );
}

export function StudioOutputCard({
  title = "Output",
  description,
  children,
  emptyMessage,
  errorMessage,
  className,
  accent = "output",
  generatedAtLabel,
  isLoading = false,
  loadingMessage = STUDIO_LOADING_MESSAGE,
  errorLabel = STUDIO_ERROR_LABEL
}: {
  title?: string;
  description: string;
  children?: ReactNode;
  emptyMessage: string;
  errorMessage?: string | null;
  className?: string;
  accent?: "input" | "output";
  generatedAtLabel?: string | null;
  isLoading?: boolean;
  loadingMessage?: string;
  errorLabel?: string;
}) {
  return (
    <SectionCard
      title={title}
      description={description}
      className={className}
      headerAdornment={
        accent === "output" ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
            <LayoutPanelTop className="h-3.5 w-3.5" aria-hidden="true" />
            Output
          </span>
        ) : undefined
      }
    >
      <div className="space-y-4">
        {generatedAtLabel || isLoading ? (
          <StatusMessage
            label="Output status"
            tone={isLoading ? "loading" : "info"}
            message={isLoading ? loadingMessage : generatedAtLabel ?? "Latest result ready."}
          />
        ) : null}
        {errorMessage ? <StatusMessage tone="error" label={errorLabel} message={errorMessage} /> : null}
        {children ?? <StatusMessage label="Empty state" message={emptyMessage} />}
      </div>
    </SectionCard>
  );
}
