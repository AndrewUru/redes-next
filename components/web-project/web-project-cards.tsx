import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import {
  webBriefQuestions,
  webProjectDeliverables,
  webProjectMilestones,
  webProjectSteps,
  webProgressSignals
} from "@/components/web-project/workflow";

export function WebProjectOverview({
  assetsCount,
  brandbooksCount,
  intakeCompletionPct
}: {
  assetsCount: number;
  brandbooksCount: number;
  intakeCompletionPct: number;
}) {
  return (
    <div className="space-y-4">
      <Card className="space-y-4 bg-surface/90">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardDescription className="uppercase">
              Proyecto web
            </CardDescription>
            <CardTitle className="mt-1">Dashboard de creacion web</CardTitle>
            <p className="mt-2 max-w-3xl text-sm font-medium text-muted-foreground">
              Aqui reunimos brief, materiales, direccion visual y avances de la
              web para trabajar con orden.
            </p>
          </div>
          <Badge className="w-fit bg-[#fde68a]">En preparacion</Badge>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <StatCard label="Brief base" value={`${intakeCompletionPct}%`} />
          <StatCard label="Materiales" value={String(assetsCount)} />
          <StatCard label="Guias" value={String(brandbooksCount)} />
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <Card className="space-y-4 bg-surface/90">
          <CardTitle>Ruta del proyecto</CardTitle>
          <div className="grid gap-3 md:grid-cols-2">
            {webProjectSteps.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.title}
                  className="rounded-[8px] border-2 border-border bg-surface/75 p-3"
                >
                  <Icon className="mb-3 h-5 w-5" aria-hidden />
                  <p className="text-sm font-black">{step.title}</p>
                  <p className="mt-1 text-xs font-medium leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="space-y-4 bg-surface/90">
          <CardTitle>Acciones rapidas</CardTitle>
          <div className="grid gap-3">
            <ActionLink href="/client/web/brief" title="Completar brief web" />
            <ActionLink
              href="/client/web/materiales"
              title="Subir materiales para la web"
            />
            <ActionLink href="/client/web/avances" title="Ver avances" />
          </div>
        </Card>
      </div>
    </div>
  );
}

export function WebBriefGuide() {
  return (
    <div className="space-y-4">
      <Card className="space-y-4 bg-surface/90">
        <div>
          <CardDescription className="uppercase">Brief web</CardDescription>
          <CardTitle className="mt-1">
            Lo que necesito saber antes de construir tu web
          </CardTitle>
          <p className="mt-2 max-w-3xl text-sm font-medium text-muted-foreground">
            Responde estas preguntas en el primer formulario o en los materiales
            que subas. Sirven para decidir estructura, contenido y prioridad.
          </p>
        </div>
        <div className="grid gap-3">
          {webBriefQuestions.map((question, index) => (
            <div
              key={question}
              className="flex gap-3 rounded-[8px] border-2 border-border bg-surface/75 p-3"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-border bg-[#fde68a] text-sm font-black">
                {index + 1}
              </span>
              <p className="text-sm font-semibold leading-relaxed">
                {question}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="space-y-4 bg-surface/90">
        <CardTitle>Entregables esperados</CardTitle>
        <div className="grid gap-2 sm:grid-cols-2">
          {webProjectDeliverables.map((item) => (
            <div
              key={item}
              className="rounded-[8px] border-2 border-border bg-background px-3 py-2 text-sm font-bold"
            >
              {item}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function WebProgressBoard() {
  return (
    <div className="space-y-4">
      <Card className="space-y-4 bg-surface/90">
        <div>
          <CardDescription className="uppercase">Avances</CardDescription>
          <CardTitle className="mt-1">Estado del proyecto web</CardTitle>
          <p className="mt-2 max-w-3xl text-sm font-medium text-muted-foreground">
            Este tablero resume las fases del proyecto. Iremos actualizando el
            estado conforme avance el trabajo.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {webProgressSignals.map((signal) => {
            const Icon = signal.icon;

            return (
              <div
                key={signal.label}
                className="rounded-[8px] border-2 border-border bg-surface/75 p-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
              >
                <Icon className="mb-3 h-5 w-5" aria-hidden />
                <p className="text-xs font-bold uppercase text-muted-foreground">
                  {signal.label}
                </p>
                <p className="mt-1 text-sm font-black">{signal.value}</p>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-3">
        {webProjectMilestones.map((milestone, index) => (
          <Card key={milestone.title} className="bg-surface/90">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-border bg-[#fde68a] text-sm font-black">
                  {index + 1}
                </span>
                <div>
                  <CardTitle className="text-2xl">{milestone.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {milestone.detail}
                  </CardDescription>
                </div>
              </div>
              <Badge className="w-fit bg-surface">{milestone.status}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[8px] border-2 border-border bg-background p-3 shadow-[3px_4px_0_0_rgba(0,0,0,1)]">
      <p className="text-xs font-bold uppercase text-muted-foreground">
        {label}
      </p>
      <p className="number mt-1 text-foreground">{value}</p>
    </div>
  );
}

type ClientWebRoute =
  | "/client/web"
  | "/client/web/brief"
  | "/client/web/materiales"
  | "/client/web/avances";

function ActionLink({ href, title }: { href: ClientWebRoute; title: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-3 rounded-[8px] border-2 border-border bg-surface/80 px-3 py-3 text-sm font-black shadow-[3px_4px_0_0_rgba(0,0,0,1)] transition-[background-color,transform,box-shadow] hover:-translate-y-0.5 hover:bg-[#eff6ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {title}
      <ArrowRight
        className="h-4 w-4 transition-transform group-hover:translate-x-1"
        aria-hidden
      />
    </Link>
  );
}
