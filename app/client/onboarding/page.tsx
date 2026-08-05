import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getClientIdForCurrentUser } from "@/lib/auth";
import { OnboardingWizard } from "@/components/client/onboarding-wizard";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { IntakeData } from "@/lib/intake/schema";

export default async function ClientOnboardingPage() {
  const clientId = await getClientIdForCurrentUser();
  if (!clientId) notFound();

  const supabase = await createClient();
  const { data } = await supabase
    .from("intake_responses")
    .select("data,status,completion_pct")
    .eq("client_id", clientId)
    .maybeSingle();

  const status = (data?.status as "draft" | "submitted" | undefined) ?? "draft";
  const completionPct = data?.completion_pct ?? 0;
  const statusLabel = status === "submitted" ? "Enviado" : "En progreso";

  return (
    <div className="page-container">
      <Card className="space-y-5 overflow-hidden">
        <div className="relative flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-3xl">
            <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
              Primer formulario
            </p>
            <CardTitle className="text-2xl leading-tight sm:text-3xl">
              Cuéntanos lo importante de tu proyecto
            </CardTitle>
            <CardDescription className="mt-2 text-sm leading-relaxed">
              Responde con tus palabras. No buscamos tecnicismos: queremos
              entender que haces, a quien ayudas, que quieres conseguir y que
              estilo te representa.
            </CardDescription>
          </div>
          <Badge className="self-start border-warning/30 bg-warning/10 text-foreground">
            {statusLabel}
          </Badge>
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <div className="mb-2 flex items-center justify-between text-sm font-semibold">
            <span>Progreso del formulario</span>
            <span className="rounded-md border border-border bg-background px-2 py-0.5">
              {completionPct}%
            </span>
          </div>
          <Progress value={completionPct} />
        </div>

        <section className="grid gap-3 md:grid-cols-3">
          {[
            {
              title: "Por que importa",
              text: "Nos ayuda a crear contenido con una direccion clara."
            },
            {
              title: "Como completarlo",
              text: "Responde como se lo contarias a una persona, con ejemplos si puedes."
            },
            {
              title: "Que haremos despues",
              text: "Ordenaremos tus respuestas para preparar una guía y próximos pasos."
            }
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-lg border border-border bg-background p-3"
            >
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </section>
      </Card>

      <section>
        <OnboardingWizard
          clientId={clientId}
          initialData={(data?.data ?? null) as Partial<IntakeData> | null}
          initialStatus={status}
        />
      </section>
    </div>
  );
}
