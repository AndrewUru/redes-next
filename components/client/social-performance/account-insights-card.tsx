import { Badge } from "@/components/ui/badge";
import { analyzeAccount } from "./analysis";
import { ComparisonBars } from "./comparison-bars";
import { MetricCard } from "./metric-card";
import { MiniLineChart } from "./mini-line-chart";
import { PostPerformanceList } from "./post-performance-list";
import { TrendBadge } from "./trend-badge";
import type { AccountInsights } from "./types";
import {
  formatDate,
  formatDelta,
  formatMetric,
  formatPercent,
  getSeries
} from "./utils";

export function AccountInsightsCard({ account }: { account: AccountInsights }) {
  const analysis = analyzeAccount(account);
  const accountName = account.accountHandle
    ? `${account.accountName} (${account.accountHandle})`
    : account.accountName;

  return (
    <article className="space-y-5 rounded-3xl border border-border bg-slate-50/70 p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xl font-bold text-foreground">{accountName}</p>
            <Badge className="bg-surface text-foreground">7d</Badge>
            <Badge className="bg-surface text-foreground">
              {account.platform}
            </Badge>
          </div>
          <p className="max-w-3xl text-sm font-medium text-muted-foreground">
            {analysis.headline}
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <TrendBadge delta={analysis.comparisons.followers.delta} />
          <TrendBadge delta={analysis.comparisons.engagement.delta} isPercent />
        </div>
      </div>

      {account.error ? (
        <p
          className="rounded-lg border border-danger/25 bg-danger/10 p-3 text-sm font-medium text-foreground"
          role="alert"
        >
          {account.error}
        </p>
      ) : null}

      {account.insightsStatus !== "ok" && !account.error ? (
        <p className="rounded-lg border border-warning/25 bg-warning/10 p-3 text-sm font-medium leading-6 text-foreground">
          {account.insightsMessage ??
            "Meta no devolvio insights avanzados para esta cuenta. Revisa permisos y estado de revision de la app."}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Seguidores"
          value={formatMetric(account.followers)}
          helper={`Cambio ultimo snapshot: ${formatDelta(analysis.comparisons.followers.delta)}`}
          accent="bg-cyan-50"
        />
        <MetricCard
          label="Engagement"
          value={formatPercent(account.engagementRate)}
          helper={`Cambio ultimo snapshot: ${formatDelta(analysis.comparisons.engagement.delta, true)}`}
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
            subtitle="Evolucion del tamano de la comunidad"
            points={getSeries(analysis.history, "followers")}
            color="hsl(var(--chart-3))"
          />
          <MiniLineChart
            title="Engagement"
            subtitle="Respuesta de la audiencia en el tiempo"
            points={getSeries(analysis.history, "engagementRate")}
            color="hsl(var(--chart-4))"
            formatter={formatPercent}
          />
          <MiniLineChart
            title="Alcance 7d"
            subtitle="Capacidad de distribucion de la cuenta"
            points={getSeries(analysis.history, "reach7d")}
            color="hsl(var(--chart-1))"
          />
          <MiniLineChart
            title="Visitas al perfil 7d"
            subtitle="Interes generado hacia la marca"
            points={getSeries(analysis.history, "profileViews7d")}
            color="hsl(var(--chart-5))"
          />
        </div>

        <div className="space-y-4">
          <ComparisonBars
            title="Pulso actual del funnel"
            points={[
              {
                label: "Alcance 7d",
                value: account.reach7d,
                color: "hsl(var(--chart-1))"
              },
              {
                label: "Impresiones 7d",
                value: account.impressions7d,
                color: "hsl(var(--chart-4))"
              },
              {
                label: "Visitas perfil 7d",
                value: account.profileViews7d,
                color: "hsl(var(--chart-5))"
              },
              {
                label: "Interacciones recientes",
                value: account.interactionsRecentPosts,
                color: "hsl(var(--chart-3))"
              }
            ]}
          />

          <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
            <p className="text-sm font-bold">Lectura rapida</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase text-muted-foreground">
                  Senales positivas
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
                {formatMetric(analysis.topPost.interactions)} interacciones el{" "}
                {formatDate(analysis.topPost.publishedAt)}.
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <PostPerformanceList posts={account.posts} />
    </article>
  );
}
