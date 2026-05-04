"use client";

import { useMemo } from "react";
import { RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { AccountInsightsCard } from "./social-performance/account-insights-card";
import { AiSummaryPanel } from "./social-performance/ai-summary-panel";
import { useAiSocialSummary, useSocialInsights } from "./social-performance/hooks";
import { MetricCard } from "./social-performance/metric-card";
import type { SocialOverview } from "./social-performance/types";
import { buildOverview, formatMetric, formatPercent } from "./social-performance/utils";

type SocialPerformancePanelProps = {
  apiPath?: string;
  aiSummaryApiPath?: string | null;
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
  const { insights, loading, error, reload } = useSocialInsights(apiPath);
  const ai = useAiSocialSummary(aiSummaryApiPath);
  const overview = useMemo(() => buildOverview(insights), [insights]);
  const hasInsights = insights.length > 0;

  return (
    <Card className="space-y-6 overflow-hidden border-border/80 bg-white/95 shadow-[0_24px_70px_hsl(222_47%_11%/0.07)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
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
        <Button
          type="button"
          variant="outline"
          onClick={() => void reload()}
          disabled={loading}
          className="w-fit bg-white"
        >
          <RefreshCw
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            aria-hidden
          />
          {loading ? "Actualizando..." : "Actualizar metricas"}
        </Button>
      </div>

      <div aria-live="polite">
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
            {error}
          </div>
        ) : null}
      </div>

      {!loading && !hasInsights ? (
        <p className="rounded-xl border border-dashed border-border bg-white/70 p-4 text-sm font-medium text-muted-foreground">
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
