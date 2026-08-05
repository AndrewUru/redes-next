import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  detail?: string;
  trend?: number;
  trendLabel?: string;
  icon?: LucideIcon;
  className?: string;
};

export function StatCard({
  label,
  value,
  detail,
  trend,
  trendLabel = "frente al periodo anterior",
  icon: Icon,
  className
}: StatCardProps) {
  const TrendIcon =
    trend === undefined || trend === 0
      ? Minus
      : trend > 0
        ? ArrowUpRight
        : ArrowDownRight;
  const trendTone =
    trend === undefined || trend === 0
      ? "text-muted-foreground"
      : trend > 0
        ? "text-success"
        : "text-danger";

  return (
    <div
      className={cn(
        "min-w-0 rounded-xl border border-border bg-surface p-4 shadow-xs",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {Icon ? (
          <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        ) : null}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.025em] tabular-nums">
        {value}
      </p>
      {trend !== undefined ? (
        <p
          className={cn(
            "mt-2 flex items-center gap-1 text-xs font-medium",
            trendTone
          )}
        >
          <TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="tabular-nums">{Math.abs(trend)}%</span>
          <span className="font-normal text-muted-foreground">
            {trendLabel}
          </span>
        </p>
      ) : detail ? (
        <p className="mt-2 text-xs leading-5 text-muted-foreground">{detail}</p>
      ) : null}
    </div>
  );
}
