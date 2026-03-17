import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  helperText?: string;
  trend?: "up" | "down" | "neutral";
};

const trendClasses: Record<NonNullable<StatCardProps["trend"]>, string> = {
  up: "text-emerald-600",
  down: "text-rose-600",
  neutral: "text-muted-foreground"
};

export function StatCard({ label, value, helperText, trend = "neutral" }: StatCardProps) {
  return (
    <article className="rounded-xl border border-border/70 bg-card/80 p-5 shadow-sm">
      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
      {helperText ? <p className={cn("mt-2 text-sm", trendClasses[trend])}>{helperText}</p> : null}
    </article>
  );
}
