import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string;
  helper: string;
  accent?: string;
};

export function MetricCard({
  label,
  value,
  helper,
  accent = "bg-surface"
}: MetricCardProps) {
  return (
    <div
      className={cn("rounded-xl border border-border p-4 shadow-xs", accent)}
    >
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.02em] tabular-nums text-foreground">
        {value}
      </p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{helper}</p>
    </div>
  );
}
