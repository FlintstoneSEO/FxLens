import { cn } from "@/lib/utils";

type StatusMessageProps = {
  message: string;
  tone?: "error" | "info";
  label?: string;
};

export function StatusMessage({ message, tone = "info", label }: StatusMessageProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4 text-sm",
        tone === "error"
          ? "border-rose-300/60 bg-rose-50 text-rose-700"
          : "border-border/70 bg-background/60 text-muted-foreground"
      )}
    >
      {label ? <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em]">{label}</p> : null}
      <p>{message}</p>
    </div>
  );
}
