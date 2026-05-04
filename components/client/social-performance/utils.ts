import type {
  AccountInsights,
  HistoryPoint,
  MetricKey,
  SocialOverview
} from "./types";

export function formatMetric(value: number | null, compact = false) {
  if (value === null || Number.isNaN(value)) return "N/D";
  return new Intl.NumberFormat("es-ES", {
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 0
  }).format(value);
}

export function formatPercent(value: number | null) {
  if (value === null || Number.isNaN(value)) return "N/D";
  return `${value.toFixed(2)}%`;
}

export function formatDelta(value: number | null, isPercent = false) {
  if (value === null || Number.isNaN(value)) return "Sin referencia";
  const absValue = Math.abs(value);
  const formatted = isPercent
    ? `${absValue.toFixed(2)} pp`
    : formatMetric(absValue);
  if (value === 0) return `Sin cambio (${formatted})`;
  return `${value > 0 ? "+" : "-"}${formatted}`;
}

export function formatDate(
  value: string | null,
  options?: Intl.DateTimeFormatOptions
) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options
  }).format(date);
}

export function getMetricValue(point: HistoryPoint, key: MetricKey) {
  return point[key];
}

export function getSeries(history: HistoryPoint[], key: MetricKey) {
  return history.map((point) => ({
    label: formatDate(point.date, { day: "2-digit", month: "short" }),
    value: getMetricValue(point, key)
  }));
}

export function averageMetric(values: Array<number | null>) {
  const validValues = values.filter(
    (value): value is number => typeof value === "number"
  );
  if (validValues.length === 0) return null;
  return Number(
    (
      validValues.reduce((total, value) => total + value, 0) /
      validValues.length
    ).toFixed(2)
  );
}

export function buildLinePath(values: number[], width: number, height: number) {
  if (values.length === 0) return "";
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x =
        values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export function buildOverview(insights: AccountInsights[]): SocialOverview {
  const connectedAccounts = insights.length;
  const totalFollowers = insights.reduce(
    (total, account) => total + (account.followers ?? 0),
    0
  );
  const totalInteractions = insights.reduce(
    (total, account) => total + account.interactionsRecentPosts,
    0
  );
  const averageEngagement = averageMetric(
    insights.map((account) => account.engagementRate)
  );
  const accountsWithHistory = insights.filter(
    (account) => account.history.length > 1
  ).length;

  return {
    connectedAccounts,
    totalFollowers,
    totalInteractions,
    averageEngagement,
    accountsWithHistory
  };
}
