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

  return (
    <main className="space-y-6">
      <Card className="space-y-4 bg-white/90">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle>Onboarding estrategico: donde empieza todo</CardTitle>
            <CardDescription className="mt-1">
              Este formulario define tu brand voice, posicionamiento, propuesta de valor, sistema
              de contenido y camino de conversion. Cuanto mejor lo completes, mejores decisiones
              podremos tomar en contenido, creatividad y crecimiento.
            </CardDescription>
          </div>
          <Badge>{status === "submitted" ? "Enviado" : "En progreso"}</Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span>Progreso del onboarding</span>
            <span>{completionPct}%</span>
          </div>
          <Progress value={completionPct} />
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border-2 border-border bg-background p-3">
            <p className="text-sm font-semibold">Por que importa</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Evita contenido sin foco y alinea toda la estrategia con objetivos reales.
            </p>
          </div>
          <div className="rounded-xl border-2 border-border bg-background p-3">
            <p className="text-sm font-semibold">Como completarlo mejor</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Responde con ejemplos concretos, pain points reales y lenguaje de tu audiencia.
            </p>
          </div>
          <div className="rounded-xl border-2 border-border bg-background p-3">
            <p className="text-sm font-semibold">Resultado esperado</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Un sistema claro para atraer, conectar y convertir sin improvisar cada semana.
            </p>
          </div>
        </div>
      </Card>

      <OnboardingWizard
        clientId={clientId}
        initialData={(data?.data ?? null) as Partial<IntakeData> | null}
        initialStatus={status}
      />
    </main>
  );
}
