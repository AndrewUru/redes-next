import { formatMetric } from "./utils";

type ComparisonBarsProps = {
  title: string;
  points: Array<{ label: string; value: number | null; color: string }>;
  formatter?: (value: number | null) => string;
};

export function ComparisonBars({
  title,
  points,
  formatter = formatMetric
}: ComparisonBarsProps) {
  const validValues = points.map((point) => point.value ?? 0);
  const maxValue = Math.max(...validValues, 1);

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
      <p className="text-sm font-bold">{title}</p>
      <div className="mt-4 space-y-3.5">
        {points.map((point) => (
          <div key={point.label} className="space-y-1">
            <div className="flex items-center justify-between gap-3 text-xs font-medium">
              <span>{point.label}</span>
              <span className="tabular-nums">{formatter(point.value)}</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(8, ((point.value ?? 0) / maxValue) * 100)}%`,
                  backgroundColor: point.color
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
