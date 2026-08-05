import type { ChartPoint } from "./types";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig
} from "@/components/ui/chart";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { formatMetric } from "./utils";

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
  const chartData = validPoints.map((point) => ({
    label: point.label,
    value: point.value
  }));
  const chartConfig = {
    value: {
      label: title,
      color
    }
  } satisfies ChartConfig;

  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-xs">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs font-medium text-muted-foreground">
            {subtitle}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold tabular-nums">
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
          <ChartContainer
            config={chartConfig}
            className="h-28 w-full aspect-auto"
          >
            <LineChart
              accessibilityLayer
              data={chartData}
              margin={{ left: 4, right: 4, top: 8, bottom: 0 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={false}
              />
              <YAxis hide domain={["dataMin", "dataMax"]} />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value) =>
                      typeof value === "number"
                        ? formatter(value)
                        : String(value)
                    }
                  />
                }
              />
              <Line
                dataKey="value"
                type="monotone"
                stroke="var(--color-value)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ChartContainer>
          <div className="mt-2 flex justify-between gap-2 text-[11px] font-medium text-muted-foreground">
            <span>{validPoints[0]?.label}</span>
            <span>{validPoints.at(-1)?.label}</span>
          </div>
        </>
      )}
    </div>
  );
}
