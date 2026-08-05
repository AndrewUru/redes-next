import { formatDelta } from "./utils";

type TrendBadgeProps = {
  delta: number | null;
  isPercent?: boolean;
};

export function TrendBadge({ delta, isPercent = false }: TrendBadgeProps) {
  const text = formatDelta(delta, isPercent);
  const tone =
    delta === null || delta === 0
      ? "border-border bg-muted text-muted-foreground"
      : delta > 0
        ? "border-success/25 bg-success/10 text-success"
        : "border-danger/25 bg-danger/10 text-danger";

  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-md border px-2 py-1 text-[11px] font-semibold ${tone}`}
    >
      {text}
    </span>
  );
}
