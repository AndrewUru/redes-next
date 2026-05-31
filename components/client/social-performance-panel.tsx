"use client";

import { useMemo, useState } from "react";
import { Printer, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { AccountInsightsCard } from "./social-performance/account-insights-card";
import { AiSummaryPanel } from "./social-performance/ai-summary-panel";
import {
  useAiSocialSummary,
  useSocialInsights
} from "./social-performance/hooks";
import { MetricCard } from "./social-performance/metric-card";
import type { HistoryRange, SocialOverview } from "./social-performance/types";
import {
  buildOverview,
  formatMetric,
  formatPercent
} from "./social-performance/utils";

type SocialPerformancePanelProps = {
  apiPath?: string;
  aiSummaryApiPath?: string | null;
};

const historyRanges: Array<{ value: HistoryRange; label: string }> = [
  { value: "6m", label: "6 meses" },
  { value: "12m", label: "1 año" },
  { value: "all", label: "Desde inicio" }
];

const rangeLabels: Record<HistoryRange, string> = {
  "6m": "Ultimos 6 meses",
  "12m": "Ultimo ano",
  all: "Desde inicio"
};

function OverviewMetrics({ overview }: { overview: SocialOverview }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        label="Cuentas conectadas"
        value={formatMetric(overview.connectedAccounts)}
        helper={
          overview.accountsWithHistory > 0
            ? `${formatMetric(overview.accountsWithHistory)} con historico util`
            : "El historico todavia se esta formando"
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
        helper="Referencia rapida entre cuentas"
        accent="bg-amber-50"
      />
    </section>
  );
}

export function SocialPerformancePanel({
  apiPath = "/api/client/social-accounts/insights",
  aiSummaryApiPath = "/api/client/ai/social-summary"
}: SocialPerformancePanelProps) {
  const [historyRange, setHistoryRange] = useState<HistoryRange>("6m");
  const { insights, loading, error, reload } = useSocialInsights(
    apiPath,
    historyRange
  );
  const ai = useAiSocialSummary(aiSummaryApiPath);
  const overview = useMemo(() => buildOverview(insights), [insights]);
  const hasInsights = insights.length > 0;
  const generatedAt = useMemo(
    () =>
      new Intl.DateTimeFormat("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }).format(new Date()),
    []
  );

  return (
    <Card className="space-y-6 overflow-hidden border-border/80 bg-surface/95 shadow-[0_24px_70px_hsl(222_47%_11%/0.07)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-2">
          <Badge className="w-fit border-sky-200 bg-sky-50 text-sky-900">
            Instagram analytics
          </Badge>
          <CardTitle className="text-2xl">
            Analisis completo de evolucion y rendimiento
          </CardTitle>
          <CardDescription>
            Seguimos la evolucion de seguidores, alcance, impresiones, visitas
            al perfil y engagement para convertir metricas sueltas en decisiones
            mas claras.
          </CardDescription>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div
            className="inline-flex w-fit rounded-full border border-border bg-surface p-1 shadow-sm"
            aria-label="Rango de historial"
          >
            {historyRanges.map((range) => {
              const isActive = historyRange === range.value;

              return (
                <button
                  key={range.value}
                  type="button"
                  className={`min-h-9 rounded-full px-3 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  aria-pressed={isActive}
                  onClick={() => setHistoryRange(range.value)}
                >
                  {range.label}
                </button>
              );
            })}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => void reload()}
            disabled={loading}
            className="w-fit bg-surface"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              aria-hidden
            />
            {loading ? "Actualizando..." : "Actualizar metricas"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => window.print()}
            disabled={!hasInsights}
            className="w-fit bg-surface"
          >
            <Printer className="h-4 w-4" aria-hidden />
            Imprimir informe
          </Button>
        </div>
      </div>

      {hasInsights ? (
        <section className="rounded-xl border border-border bg-muted/35 p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">
                Informe
              </p>
              <p className="mt-1 text-sm font-semibold">
                Rendimiento social
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">
                Periodo
              </p>
              <p className="mt-1 text-sm font-semibold">
                {rangeLabels[historyRange]}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-muted-foreground">
                Generado
              </p>
              <p className="mt-1 text-sm font-semibold">{generatedAt}</p>
            </div>
          </div>
        </section>
      ) : null}

      <div aria-live="polite">
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
            {error}
          </div>
        ) : null}
      </div>

      {!loading && !hasInsights ? (
        <p className="rounded-xl border border-dashed border-border bg-surface/70 p-4 text-sm font-medium text-muted-foreground">
          No hay cuentas de Instagram conectadas con OAuth para mostrar
          analisis.
        </p>
      ) : null}

      <AiSummaryPanel
        enabled={Boolean(aiSummaryApiPath)}
        hasInsights={hasInsights}
        summary={ai.summary}
        loading={ai.loading}
        error={ai.error}
        onGenerate={() => void ai.generate()}
      />

      {hasInsights ? <OverviewMetrics overview={overview} /> : null}

      <div className="space-y-6">
        {insights.map((account) => (
          <AccountInsightsCard key={account.accountId} account={account} />
        ))}
      </div>
    </Card>
  );
}
