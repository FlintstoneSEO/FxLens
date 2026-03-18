import { AlertTriangle, CheckCircle2, Info, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

type StatusMessageProps = {
  message: string;
  tone?: "error" | "info" | "loading" | "success";
  label?: string;
};

export function StatusMessage({ message, tone = "info", label }: StatusMessageProps) {
  const Icon =
    tone === "error"
      ? AlertTriangle
      : tone === "loading"
        ? Loader2
        : tone === "success"
          ? CheckCircle2
          : Info;

  return (
    <div
      className={cn(
        "rounded-xl border p-4 text-sm",
        tone === "error"
          ? "border-rose-300/60 bg-rose-50 text-rose-700"
          : tone === "loading"
            ? "border-primary/20 bg-primary/5 text-primary/90"
            : tone === "success"
              ? "border-emerald-300/60 bg-emerald-50 text-emerald-700"
              : "border-border/70 bg-background/60 text-muted-foreground"
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", tone === "loading" ? "animate-spin" : undefined)} aria-hidden="true" />
        <div>
          {label ? <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em]">{label}</p> : null}
          <p>{message}</p>
        </div>
      </div>
    </div>
  );
}
