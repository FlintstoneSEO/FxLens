import { cn } from "@/lib/utils";

type Severity = "low" | "medium" | "high" | "critical";

type SeverityBadgeProps = {
  severity: Severity;
};

const labelMap: Record<Severity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical"
};

const styles: Record<Severity, string> = {
  low: "border-emerald-300/60 bg-emerald-50 text-emerald-700",
  medium: "border-amber-300/60 bg-amber-50 text-amber-700",
  high: "border-orange-300/60 bg-orange-50 text-orange-700",
  critical: "border-rose-300/60 bg-rose-50 text-rose-700"
};

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide",
        styles[severity]
      )}
    >
      {labelMap[severity]}
    </span>
  );
}
