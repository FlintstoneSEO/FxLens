import { cn } from "@/lib/utils";

type StatusMessageProps = {
  message: string;
  tone?: "error" | "info";
};

export function StatusMessage({ message, tone = "info" }: StatusMessageProps) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4 text-sm",
        tone === "error"
          ? "border-rose-300/60 bg-rose-50 text-rose-700"
          : "border-border/70 bg-background/60 text-muted-foreground"
      )}
    >
      {message}
    </div>
  );
}
