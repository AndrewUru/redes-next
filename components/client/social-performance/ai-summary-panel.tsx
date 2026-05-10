import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AiSocialSummary } from "./types";

type AiSummaryPanelProps = {
  enabled: boolean;
  hasInsights: boolean;
  summary: AiSocialSummary | null;
  loading: boolean;
  error: string | null;
  onGenerate: () => void;
};

export function AiSummaryPanel({
  enabled,
  hasInsights,
  summary,
  loading,
  error,
  onGenerate
}: AiSummaryPanelProps) {
  if (!enabled || !hasInsights) return null;

  return (
    <section className="rounded-3xl border border-violet-100 bg-violet-50/60 p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-700" aria-hidden />
            <p className="text-sm font-bold text-violet-950">Lectura con IA</p>
          </div>
          <p className="text-sm leading-6 text-muted-foreground">
            Genera una interpretacion ejecutiva con oportunidades, riesgos,
            proximas acciones e ideas de contenido.
          </p>
        </div>
        <Button
          type="button"
          onClick={onGenerate}
          disabled={loading}
          className="w-fit bg-violet-700 text-white hover:bg-violet-800"
        >
          <Sparkles className="h-4 w-4" aria-hidden />
          {loading ? "Generando..." : "Generar lectura con IA"}
        </Button>
      </div>

      <div aria-live="polite">
        {error ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
            {error}
          </p>
        ) : null}
      </div>

      {summary ? (
        <div className="mt-4 grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-2xl border border-violet-100 bg-surface p-4 shadow-sm">
            <p className="text-xs font-bold uppercase text-muted-foreground">
              Resumen
            </p>
            <h4 className="mt-2 text-xl font-bold text-foreground">
              {summary.headline}
            </h4>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {summary.executiveSummary}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
              <p className="text-sm font-bold">Oportunidades</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-foreground">
                {summary.opportunities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
              <p className="text-sm font-bold">Riesgos</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-foreground">
                {summary.risks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm xl:col-span-2">
            <p className="text-sm font-bold">Proximas acciones</p>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {summary.nextActions.map((action) => (
                <div
                  key={action.title}
                  className="rounded-xl border border-border bg-slate-50 p-3"
                >
                  <span className="rounded-full bg-surface px-2 py-1 text-[11px] font-bold uppercase text-muted-foreground">
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

          <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm xl:col-span-2">
            <p className="text-sm font-bold">Ideas de contenido</p>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {summary.contentIdeas.map((idea) => (
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
  );
}
