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
  accent = "bg-white/85"
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/80 p-4 shadow-sm ring-1 ring-white/70",
        accent
      )}
    >
      <p className="text-[11px] font-bold uppercase text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">
        {value}
      </p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{helper}</p>
    </div>
  );
}
