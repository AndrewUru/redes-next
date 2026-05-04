import type { ChartPoint } from "./types";
import { buildLinePath, formatMetric } from "./utils";

type MiniLineChartProps = {
  title: string;
  subtitle: string;
  points: ChartPoint[];
  color: string;
  formatter?: (value: number | null) => string;
};

export function MiniLineChart({
  title,
  subtitle,
  points,
  color,
  formatter = formatMetric
}: MiniLineChartProps) {
  const validPoints = points.filter(
    (point): point is ChartPoint & { value: number } => point.value !== null
  );
  const path = buildLinePath(
    validPoints.map((point) => point.value),
    300,
    90
  );

  return (
    <div className="rounded-2xl border border-border bg-white/95 p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold">{title}</p>
          <p className="text-xs font-medium text-muted-foreground">
            {subtitle}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold tabular-nums">
            {formatter(validPoints.at(-1)?.value ?? null)}
          </p>
          <p className="text-[11px] font-medium text-muted-foreground">
            {validPoints.length} puntos
          </p>
        </div>
      </div>

      {validPoints.length < 2 ? (
        <p className="text-xs text-muted-foreground">
          Hace falta mas historico para dibujar la tendencia.
        </p>
      ) : (
        <>
          <svg
            viewBox="0 0 300 90"
            className="h-28 w-full overflow-visible"
            role="img"
            aria-label={`${title}: ${subtitle}`}
          >
            <path d="M 0 89 L 300 89" stroke="#e2e8f0" strokeWidth="1" />
            <path
              d={path}
              fill="none"
              stroke={color}
              strokeWidth="4"
              strokeLinecap="round"
            />
            {validPoints.map((point, index, list) => {
              const x =
                list.length === 1 ? 150 : (index / (list.length - 1)) * 300;
              const values = list.map((item) => item.value);
              const max = Math.max(...values);
              const min = Math.min(...values);
              const range = max - min || 1;
              const y = 90 - ((point.value - min) / range) * 90;
              return (
                <circle
                  key={`${point.label}-${index}`}
                  cx={x}
                  cy={y}
                  r="4"
                  fill={color}
                />
              );
            })}
          </svg>
          <div className="mt-2 flex justify-between gap-2 text-[11px] font-medium text-muted-foreground">
            <span>{validPoints[0]?.label}</span>
            <span>{validPoints.at(-1)?.label}</span>
          </div>
        </>
      )}
    </div>
  );
}
