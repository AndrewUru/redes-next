import { CheckCircle2, FileText, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { metrics, recentActivity, timeline } from "./content";

export function DashboardPreview() {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-border p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Vista del sistema
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              Panel de crecimiento
            </h2>
          </div>
          <Badge className="bg-surface">Activo</Badge>
        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-3">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-2xl border border-border bg-muted/45 p-4"
            >
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="mt-2 text-3xl font-semibold tabular-nums">
                {metric.value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-2xl border border-border p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="font-semibold">Ruta del proyecto</p>
              <FileText
                className="h-5 w-5 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <div className="space-y-3">
              {timeline.map((step, index) => (
                <div key={step} className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {index + 1}
                  </span>
                  <p className="text-sm text-muted-foreground">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="font-semibold">Actividad reciente</p>
              <MessageSquare
                className="h-5 w-5 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <div className="space-y-3">
              {recentActivity.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl bg-muted/55 p-3"
                >
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  <p className="text-sm font-medium">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
