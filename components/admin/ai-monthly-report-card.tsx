"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

type MonthlyReport = {
  headline: string;
  executiveSummary: string;
  clientContext: string;
  performanceRead: string;
  opportunities: string[];
  risks: string[];
  nextActions: Array<{
    title: string;
    owner: string;
    priority: "alta" | "media" | "baja";
    rationale: string;
  }>;
  contentRecommendations: Array<{
    pillar: string;
    format: string;
    idea: string;
    hook: string;
  }>;
  clientMessageDraft: string;
};

export function AiMonthlyReportCard({ clientId }: { clientId: string }) {
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateReport() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/clients/${clientId}/ai/monthly-report`,
        {
          method: "POST",
          cache: "no-store"
        }
      );
      const json = (await response.json()) as {
        error?: string;
        report?: MonthlyReport;
      };

      if (!response.ok || !json.report) {
        setError(json.error ?? "No se pudo generar el informe.");
        return;
      }

      setReport(json.report);
    } catch {
      setError("No se pudo generar el informe.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="space-y-4 border-violet-100 bg-violet-50/60">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-700" aria-hidden />
            <CardTitle>Informe mensual con IA</CardTitle>
          </div>
          <CardDescription className="mt-2">
            Genera una lectura estrategica para preparar seguimiento, acciones
            del mes y mensaje al cliente.
          </CardDescription>
        </div>
        <Button
          type="button"
          onClick={() => void generateReport()}
          disabled={loading}
          className="w-fit bg-violet-700 text-white hover:bg-violet-800"
        >
          <Sparkles className="h-4 w-4" aria-hidden />
          {loading ? "Generando..." : "Generar informe"}
        </Button>
      </div>

      <div aria-live="polite">
        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
            {error}
          </p>
        ) : null}
      </div>

      {report ? (
        <div className="grid gap-4">
          <div className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase text-muted-foreground">
              Resumen ejecutivo
            </p>
            <h3 className="mt-2 text-xl font-bold">{report.headline}</h3>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {report.executiveSummary}
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <InfoBlock title="Contexto del cliente" text={report.clientContext} />
            <InfoBlock title="Lectura de rendimiento" text={report.performanceRead} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <ListBlock title="Oportunidades" items={report.opportunities} />
            <ListBlock title="Riesgos" items={report.risks} />
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <p className="text-sm font-bold">Proximas acciones</p>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {report.nextActions.map((action) => (
                <div
                  key={action.title}
                  className="rounded-xl border border-border bg-slate-50 p-3"
                >
                  <span className="rounded-full bg-white px-2 py-1 text-[11px] font-bold uppercase text-muted-foreground">
                    {action.priority} · {action.owner}
                  </span>
                  <p className="mt-3 text-sm font-bold">{action.title}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {action.rationale}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <p className="text-sm font-bold">Recomendaciones de contenido</p>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {report.contentRecommendations.map((item) => (
                <div
                  key={`${item.pillar}-${item.hook}`}
                  className="rounded-xl border border-border bg-slate-50 p-3"
                >
                  <p className="text-xs font-bold uppercase text-muted-foreground">
                    {item.pillar} · {item.format}
                  </p>
                  <p className="mt-2 text-sm font-bold">{item.idea}</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {item.hook}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <p className="text-sm font-bold">Mensaje para cliente</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {report.clientMessageDraft}
            </p>
          </div>
        </div>
      ) : null}
    </Card>
  );
}

function InfoBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
      <p className="text-sm font-bold">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
      <p className="text-sm font-bold">{title}</p>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
