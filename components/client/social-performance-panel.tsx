"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCw, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type PostInsights = {
  id: string;
  caption: string;
  mediaType: string;
  permalink: string | null;
  publishedAt: string | null;
  likeCount: number;
  commentCount: number;
  interactions: number;
  previewUrl: string | null;
};

type HistoryPoint = {
  date: string;
  followers: number | null;
  reach7d: number | null;
  impressions7d: number | null;
  profileViews7d: number | null;
  interactionsRecentPosts: number | null;
  engagementRate: number | null;
};

type AccountInsights = {
  accountId: string;
  accountName: string;
  accountHandle: string | null;
  platform: "instagram";
  followers: number | null;
  following: number | null;
  mediaCount: number | null;
  reach7d: number | null;
  impressions7d: number | null;
  profileViews7d: number | null;
  interactionsRecentPosts: number;
  engagementRate: number | null;
  insightsStatus: "ok" | "limited" | "unavailable";
  insightsMessage?: string;
  posts: PostInsights[];
  history: HistoryPoint[];
  error?: string;
};

type SocialPerformancePanelProps = {
  apiPath?: string;
  aiSummaryApiPath?: string | null;
};

type AiSocialSummary = {
  headline: string;
  executiveSummary: string;
  opportunities: string[];
  risks: string[];
  nextActions: Array<{
    title: string;
    reason: string;
    priority: "alta" | "media" | "baja";
  }>;
  contentIdeas: Array<{
    format: string;
    angle: string;
    hook: string;
  }>;
};

type MetricKey =
  | "followers"
  | "reach7d"
  | "impressions7d"
  | "profileViews7d"
  | "interactionsRecentPosts"
  | "engagementRate";

type ChartPoint = {
  label: string;
  value: number | null;
};

function formatMetric(value: number | null, compact = false) {
  if (value === null || Number.isNaN(value)) return "N/D";
  return new Intl.NumberFormat("es-ES", {
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 0
  }).format(value);
}

function formatPercent(value: number | null) {
  if (value === null || Number.isNaN(value)) return "N/D";
  return `${value.toFixed(2)}%`;
}

function formatDelta(value: number | null, isPercent = false) {
  if (value === null || Number.isNaN(value)) return "Sin referencia";
  const absValue = Math.abs(value);
  const formatted = isPercent
    ? `${absValue.toFixed(2)} pp`
    : formatMetric(absValue);
  if (value === 0) return `Sin cambio (${formatted})`;
  return `${value > 0 ? "+" : "-"}${formatted}`;
}

function formatDate(
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

function getMetricValue(point: HistoryPoint, key: MetricKey) {
  return point[key];
}

function getSeries(history: HistoryPoint[], key: MetricKey) {
  return history.map((point) => ({
    label: formatDate(point.date, { day: "2-digit", month: "short" }),
    value: getMetricValue(point, key)
  }));
}

function averageMetric(values: Array<number | null>) {
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

function buildLinePath(values: number[], width: number, height: number) {
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

function getComparison(
  history: HistoryPoint[],
  key: MetricKey
): {
  latest: number | null;
  previous: number | null;
  delta: number | null;
  trend: "up" | "down" | "flat";
} {
  const values = history
    .map((point) => getMetricValue(point, key))
    .filter((value): value is number => typeof value === "number");

  const latest = values.at(-1) ?? null;
  const previous = values.length > 1 ? (values.at(-2) ?? null) : null;
  const delta =
    latest !== null && previous !== null
      ? Number((latest - previous).toFixed(2))
      : null;
  const trend =
    delta === null || delta === 0 ? "flat" : delta > 0 ? "up" : "down";

  return { latest, previous, delta, trend };
}

function analyzeAccount(account: AccountInsights) {
  const history = [...account.history].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const followerComparison = getComparison(history, "followers");
  const engagementComparison = getComparison(history, "engagementRate");
  const reachComparison = getComparison(history, "reach7d");
  const impressionsComparison = getComparison(history, "impressions7d");
  const profileViewsComparison = getComparison(history, "profileViews7d");

  const topPost =
    [...account.posts].sort((a, b) => b.interactions - a.interactions)[0] ??
    null;
  const averageInteractions =
    account.posts.length > 0
      ? Math.round(
          account.posts.reduce((total, post) => total + post.interactions, 0) /
            account.posts.length
        )
      : null;

  let headline = "Sigue construyendo histórico para afinar el análisis.";
  if (followerComparison.delta !== null && followerComparison.delta > 0) {
    headline = `La comunidad crece: ${formatDelta(followerComparison.delta)} seguidores frente al último snapshot.`;
  } else if (
    engagementComparison.delta !== null &&
    engagementComparison.delta > 0
  ) {
    headline = `La interacción mejora: ${formatDelta(engagementComparison.delta, true)} en engagement frente al último snapshot.`;
  } else if (reachComparison.delta !== null && reachComparison.delta < 0) {
    headline = `El alcance ha caído ${formatDelta(reachComparison.delta)} y conviene revisar formatos y frecuencia.`;
  }

  const strengths: string[] = [];
  const risks: string[] = [];

  if (followerComparison.delta !== null && followerComparison.delta > 0) {
    strengths.push(
      "La base de seguidores está creciendo con respecto al último corte."
    );
  }
  if (engagementComparison.delta !== null && engagementComparison.delta > 0) {
    strengths.push(
      "El engagement mejora, señal de mejor respuesta del contenido reciente."
    );
  }
  if (topPost) {
    strengths.push(
      `El mejor post reciente suma ${formatMetric(topPost.interactions)} interacciones y puede servir como referencia creativa.`
    );
  }

  if (reachComparison.delta !== null && reachComparison.delta < 0) {
    risks.push("El alcance va a la baja frente al snapshot anterior.");
  }
  if (impressionsComparison.delta !== null && impressionsComparison.delta < 0) {
    risks.push(
      "Las impresiones están perdiendo tracción y conviene reforzar distribución."
    );
  }
  if (
    profileViewsComparison.delta !== null &&
    profileViewsComparison.delta < 0
  ) {
    risks.push(
      "Las visitas al perfil caen, así que el contenido está convirtiendo menos curiosidad en intención."
    );
  }
  if (strengths.length === 0) {
    strengths.push(
      "Todavía no hay suficiente señal histórica para detectar patrones fuertes."
    );
  }
  if (risks.length === 0) {
    risks.push(
      "No se detectan caídas fuertes en el último tramo del histórico."
    );
  }

  return {
    history,
    headline,
    strengths,
    risks,
    topPost,
    averageInteractions,
    comparisons: {
      followers: followerComparison,
      engagement: engagementComparison,
      reach: reachComparison,
      impressions: impressionsComparison,
      profileViews: profileViewsComparison
    }
  };
}

function MetricCard({
  label,
  value,
  helper,
  accent = "bg-white/85"
}: {
  label: string;
  value: string;
  helper: string;
  accent?: string;
}) {
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

function TrendBadge({
  delta,
  isPercent = false
}: {
  delta: number | null;
  isPercent?: boolean;
}) {
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

function MiniLineChart({
  title,
  subtitle,
  points,
  color,
  formatter = formatMetric
}: {
  title: string;
  subtitle: string;
  points: ChartPoint[];
  color: string;
  formatter?: (value: number | null) => string;
}) {
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
          Hace falta más histórico para dibujar la tendencia.
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

function ComparisonBars({
  title,
  points,
  formatter = formatMetric
}: {
  title: string;
  points: Array<{ label: string; value: number | null; color: string }>;
  formatter?: (value: number | null) => string;
}) {
  const validValues = points.map((point) => point.value ?? 0);
  const maxValue = Math.max(...validValues, 1);

  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
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

function PostPerformanceList({ posts }: { posts: PostInsights[] }) {
  const topPosts = useMemo(
    () =>
      [...posts].sort((a, b) => b.interactions - a.interactions).slice(0, 5),
    [posts]
  );

  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 shadow-sm">
      <div className="mb-3">
        <p className="text-sm font-bold">Top publicaciones recientes</p>
        <p className="text-xs font-medium text-muted-foreground">
          Ranking por interacciones para detectar formatos que mejor responden.
        </p>
      </div>

      {topPosts.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          No hay publicaciones recientes disponibles.
        </p>
      ) : (
        <ul className="space-y-2">
          {topPosts.map((post, index) => (
            <li
              key={post.id}
              className="rounded-xl border border-border bg-white/95 p-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase text-muted-foreground">
                    Top {index + 1}
                  </p>
                  <p className="line-clamp-2 text-sm font-bold text-foreground">
                    {post.caption || `Publicación ${post.id.slice(0, 8)}`}
                  </p>
                </div>
                <div className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold tabular-nums text-emerald-800">
                  {formatMetric(post.interactions)}
                </div>
              </div>

              <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-medium text-muted-foreground">
                <span>{post.mediaType}</span>
                <span>{formatDate(post.publishedAt)}</span>
                <span>{formatMetric(post.likeCount)} likes</span>
                <span>{formatMetric(post.commentCount)} comentarios</span>
              </div>

              {post.permalink ? (
                <a
                  href={post.permalink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex min-h-8 items-center text-xs font-bold underline underline-offset-4"
                >
                  Ver publicación
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function SocialPerformancePanel({
  apiPath = "/api/client/social-accounts/insights",
  aiSummaryApiPath = "/api/client/ai/social-summary"
}: SocialPerformancePanelProps) {
  const [insights, setInsights] = useState<AccountInsights[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<AiSocialSummary | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const overview = useMemo(() => {
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
  }, [insights]);

  const loadInsights = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(apiPath, {
        cache: "no-store"
      });
      const json = (await response.json()) as {
        error?: string;
        insights?: AccountInsights[];
      };

      if (!response.ok) {
        setError(json.error ?? "No se pudo cargar el rendimiento.");
        return;
      }

      setInsights(json.insights ?? []);
    } catch {
      setError("No se pudo cargar el rendimiento.");
    } finally {
      setLoading(false);
    }
  }, [apiPath]);

  useEffect(() => {
    void loadInsights();
  }, [loadInsights]);

  const generateAiSummary = useCallback(async () => {
    if (!aiSummaryApiPath) return;

    setAiLoading(true);
    setAiError(null);

    try {
      const response = await fetch(aiSummaryApiPath, {
        method: "POST",
        cache: "no-store"
      });
      const json = (await response.json()) as {
        error?: string;
        summary?: AiSocialSummary;
      };

      if (!response.ok || !json.summary) {
        setAiError(json.error ?? "No se pudo generar la lectura con IA.");
        return;
      }

      setAiSummary(json.summary);
    } catch {
      setAiError("No se pudo generar la lectura con IA.");
    } finally {
      setAiLoading(false);
    }
  }, [aiSummaryApiPath]);

  return (
    <Card className="space-y-6 overflow-hidden border-border/80 bg-white/95 shadow-[0_24px_70px_hsl(222_47%_11%/0.07)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-2">
          <Badge className="w-fit border-sky-200 bg-sky-50 text-sky-900">
            Instagram analytics
          </Badge>
          <CardTitle className="text-2xl">
            Análisis completo de evolución y rendimiento
          </CardTitle>
          <CardDescription>
            Seguimos la evolución de seguidores, alcance, impresiones, visitas
            al perfil y engagement para convertir métricas sueltas en decisiones
            más claras.
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => void loadInsights()}
          disabled={loading}
          className="w-fit bg-white"
        >
          <RefreshCw
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            aria-hidden
          />
          {loading ? "Actualizando…" : "Actualizar métricas"}
        </Button>
      </div>

      <div aria-live="polite">
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
            {error}
          </div>
        ) : null}
      </div>

      {!loading && insights.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-white/70 p-4 text-sm font-medium text-muted-foreground">
          No hay cuentas de Instagram conectadas con OAuth para mostrar
          análisis.
        </p>
      ) : null}

      {aiSummaryApiPath && insights.length > 0 ? (
        <section className="rounded-3xl border border-violet-100 bg-violet-50/60 p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-700" aria-hidden />
                <p className="text-sm font-bold text-violet-950">
                  Lectura con IA
                </p>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                Genera una interpretacion ejecutiva con oportunidades, riesgos,
                proximas acciones e ideas de contenido.
              </p>
            </div>
            <Button
              type="button"
              onClick={() => void generateAiSummary()}
              disabled={aiLoading}
              className="w-fit bg-violet-700 text-white hover:bg-violet-800"
            >
              <Sparkles className="h-4 w-4" aria-hidden />
              {aiLoading ? "Generando..." : "Generar lectura con IA"}
            </Button>
          </div>

          <div aria-live="polite">
            {aiError ? (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
                {aiError}
              </p>
            ) : null}
          </div>

          {aiSummary ? (
            <div className="mt-4 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
                <p className="text-xs font-bold uppercase text-muted-foreground">
                  Resumen
                </p>
                <h4 className="mt-2 text-xl font-bold text-foreground">
                  {aiSummary.headline}
                </h4>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {aiSummary.executiveSummary}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                  <p className="text-sm font-bold">Oportunidades</p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-foreground">
                    {aiSummary.opportunities.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                  <p className="text-sm font-bold">Riesgos</p>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-foreground">
                    {aiSummary.risks.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-white p-4 shadow-sm xl:col-span-2">
                <p className="text-sm font-bold">Proximas acciones</p>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  {aiSummary.nextActions.map((action) => (
                    <div
                      key={action.title}
                      className="rounded-xl border border-border bg-slate-50 p-3"
                    >
                      <span className="rounded-full bg-white px-2 py-1 text-[11px] font-bold uppercase text-muted-foreground">
                        {action.priority}
                      </span>
                      <p className="mt-3 text-sm font-bold">{action.title}</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {action.reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-white p-4 shadow-sm xl:col-span-2">
                <p className="text-sm font-bold">Ideas de contenido</p>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  {aiSummary.contentIdeas.map((idea) => (
                    <div
                      key={`${idea.format}-${idea.hook}`}
                      className="rounded-xl border border-border bg-slate-50 p-3"
                    >
                      <p className="text-xs font-bold uppercase text-muted-foreground">
                        {idea.format}
                      </p>
                      <p className="mt-2 text-sm font-bold">{idea.angle}</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {idea.hook}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {insights.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Cuentas conectadas"
            value={formatMetric(overview.connectedAccounts)}
            helper={
              overview.accountsWithHistory > 0
                ? `${formatMetric(overview.accountsWithHistory)} con histórico útil`
                : "El histórico todavía se está formando"
            }
            accent="bg-indigo-50"
          />
          <MetricCard
            label="Seguidores totales"
            value={formatMetric(overview.totalFollowers)}
            helper="Suma actual de audiencia conectada"
            accent="bg-cyan-50"
          />
          <MetricCard
            label="Interacciones recientes"
            value={formatMetric(overview.totalInteractions)}
            helper="Likes y comentarios agregados"
            accent="bg-emerald-50"
          />
          <MetricCard
            label="Engagement medio"
            value={formatPercent(overview.averageEngagement)}
            helper="Referencia rápida entre cuentas"
            accent="bg-amber-50"
          />
        </section>
      ) : null}

      <div className="space-y-6">
        {insights.map((account) => {
          const analysis = analyzeAccount(account);
          const accountName = account.accountHandle
            ? `${account.accountName} (${account.accountHandle})`
            : account.accountName;

          return (
            <article
              key={account.accountId}
              className="space-y-5 rounded-3xl border border-border bg-slate-50/70 p-4 shadow-sm sm:p-5"
            >
              <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-xl font-bold text-foreground">
                      {accountName}
                    </p>
                    <Badge className="bg-white text-foreground">7d</Badge>
                    <Badge className="bg-white text-foreground">
                      {account.platform}
                    </Badge>
                  </div>
                  <p className="max-w-3xl text-sm font-medium text-muted-foreground">
                    {analysis.headline}
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <TrendBadge delta={analysis.comparisons.followers.delta} />
                  <TrendBadge
                    delta={analysis.comparisons.engagement.delta}
                    isPercent
                  />
                </div>
              </div>

              {account.error ? (
                <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
                  {account.error}
                </p>
              ) : null}

              {account.insightsStatus !== "ok" && !account.error ? (
                <p className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm font-medium leading-6 text-amber-900">
                  {account.insightsMessage ??
                    "Meta no devolvió insights avanzados para esta cuenta. Revisa permisos y estado de revisión de la app."}
                </p>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  label="Seguidores"
                  value={formatMetric(account.followers)}
                  helper={`Cambio último snapshot: ${formatDelta(analysis.comparisons.followers.delta)}`}
                  accent="bg-cyan-50"
                />
                <MetricCard
                  label="Engagement"
                  value={formatPercent(account.engagementRate)}
                  helper={`Cambio último snapshot: ${formatDelta(analysis.comparisons.engagement.delta, true)}`}
                  accent="bg-amber-50"
                />
                <MetricCard
                  label="Interacciones recientes"
                  value={formatMetric(account.interactionsRecentPosts)}
                  helper={
                    analysis.averageInteractions === null
                      ? "Sin publicaciones suficientes"
                      : `Media por post: ${formatMetric(analysis.averageInteractions)}`
                  }
                  accent="bg-emerald-50"
                />
                <MetricCard
                  label="Media publicada"
                  value={formatMetric(account.mediaCount)}
                  helper={`Siguiendo: ${formatMetric(account.following)}`}
                  accent="bg-rose-50"
                />
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.25fr_0.95fr]">
                <div className="grid gap-4 lg:grid-cols-2">
                  <MiniLineChart
                    title="Seguidores"
                    subtitle="Evolución del tamaño de la comunidad"
                    points={getSeries(analysis.history, "followers")}
                    color="#0f766e"
                  />
                  <MiniLineChart
                    title="Engagement"
                    subtitle="Respuesta de la audiencia en el tiempo"
                    points={getSeries(analysis.history, "engagementRate")}
                    color="#dc2626"
                    formatter={formatPercent}
                  />
                  <MiniLineChart
                    title="Alcance 7d"
                    subtitle="Capacidad de distribución de la cuenta"
                    points={getSeries(analysis.history, "reach7d")}
                    color="#2563eb"
                  />
                  <MiniLineChart
                    title="Visitas al perfil 7d"
                    subtitle="Interés generado hacia la marca"
                    points={getSeries(analysis.history, "profileViews7d")}
                    color="#7c3aed"
                  />
                </div>

                <div className="space-y-4">
                  <ComparisonBars
                    title="Pulso actual del funnel"
                    points={[
                      {
                        label: "Alcance 7d",
                        value: account.reach7d,
                        color: "#2563eb"
                      },
                      {
                        label: "Impresiones 7d",
                        value: account.impressions7d,
                        color: "#f97316"
                      },
                      {
                        label: "Visitas perfil 7d",
                        value: account.profileViews7d,
                        color: "#7c3aed"
                      },
                      {
                        label: "Interacciones recientes",
                        value: account.interactionsRecentPosts,
                        color: "#16a34a"
                      }
                    ]}
                  />

                  <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                    <p className="text-sm font-bold">Lectura rápida</p>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div>
                        <p className="text-xs font-bold uppercase text-muted-foreground">
                          Señales positivas
                        </p>
                        <ul className="mt-2 space-y-2 text-sm leading-6 text-foreground">
                          {analysis.strengths.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-muted-foreground">
                          Alertas
                        </p>
                        <ul className="mt-2 space-y-2 text-sm leading-6 text-foreground">
                          {analysis.risks.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    {analysis.topPost ? (
                      <p className="mt-3 rounded-xl bg-sky-50 p-3 text-xs font-medium leading-5 text-slate-700">
                        Mejor contenido reciente:{" "}
                        {formatMetric(analysis.topPost.interactions)}{" "}
                        interacciones el{" "}
                        {formatDate(analysis.topPost.publishedAt)}.
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              <PostPerformanceList posts={account.posts} />
            </article>
          );
        })}
      </div>
    </Card>
  );
}
