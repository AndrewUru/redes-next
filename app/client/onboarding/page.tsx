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
    <div className="space-y-6">
      <Card className="onboarding-reveal space-y-5 overflow-hidden bg-white/90">
        <div className="relative flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-3xl">
            <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
              Bloque de estrategia
            </p>
            <CardTitle className="text-4xl leading-[0.95] sm:text-5xl">
              Onboarding estrategico: donde empieza todo
            </CardTitle>
            <CardDescription className="mt-2 text-sm leading-relaxed">
              Este formulario define tu brand voice, posicionamiento, propuesta
              de valor, sistema de contenido y camino de conversion. Cuanto
              mejor lo completes, mejores decisiones podremos tomar en
              contenido, creatividad y crecimiento.
            </CardDescription>
          </div>
          <Badge className="self-start bg-[#f2d048] text-black">
            {statusLabel}
          </Badge>
        </div>

        <div className="onboarding-reveal-delay-1 rounded-[8px] border-2 border-border bg-white/70 p-3">
          <div className="mb-2 flex items-center justify-between text-sm font-semibold">
            <span>Progreso del onboarding</span>
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
              text: "Evita contenido sin foco y alinea toda la estrategia con objetivos reales."
            },
            {
              title: "Como completarlo mejor",
              text: "Responde con ejemplos concretos, pain points reales y lenguaje de tu audiencia."
            },
            {
              title: "Resultado esperado",
              text: "Un sistema claro para atraer, conectar y convertir sin improvisar cada semana."
            }
          ].map((item, index) => (
            <div
              key={item.title}
              className={`rounded-[8px] border-2 border-border bg-background p-3 onboarding-reveal-delay-${index + 1}`}
            >
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </section>
      </Card>

      <section className="onboarding-reveal-delay-2">
        <OnboardingWizard
          clientId={clientId}
          initialData={(data?.data ?? null) as Partial<IntakeData> | null}
          initialStatus={status}
        />
      </section>
    </div>
  );
}
