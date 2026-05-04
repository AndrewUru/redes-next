import { formatDelta } from "./utils";

type TrendBadgeProps = {
  delta: number | null;
  isPercent?: boolean;
};

export function TrendBadge({ delta, isPercent = false }: TrendBadgeProps) {
  const text = formatDelta(delta, isPercent);
  const tone =
    delta === null || delta === 0
      ? "bg-stone-100 text-stone-700"
      : delta > 0
        ? "bg-emerald-100 text-emerald-800"
        : "bg-rose-100 text-rose-800";

  return (
    <span
      className={`inline-flex min-h-8 items-center rounded-full border border-black/5 px-3 py-1 text-[11px] font-bold ${tone}`}
    >
      {text}
    </span>
  );
}
