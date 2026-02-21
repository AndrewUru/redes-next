import { notFound } from "next/navigation";
import Link from "next/link";
import { SummaryCard } from "@/components/summary-card";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { getClientIdForCurrentUser } from "@/lib/auth";
import type { ClientStatus } from "@/lib/db/types";
import { getClientSummary } from "@/lib/db/server";
import { createClient } from "@/lib/supabase/server";

export default async function ClientHomePage() {
  const clientId = await getClientIdForCurrentUser();
  if (!clientId) notFound();

  const summary = await getClientSummary(clientId);
  if (!summary.client) notFound();
  const supabase = await createClient();
  const pdfPath = summary.latestBrandbook?.pdf_path ?? null;
  const { data: signed } = pdfPath
    ? await supabase.storage.from("brandbooks").createSignedUrl(pdfPath, 60 * 60)
    : { data: null };
  const brandbookUrl = signed?.signedUrl ?? null;
  const onboardingPct = summary.intake?.completion_pct ?? 0;
  const onboardingDone = onboardingPct >= 100;
  const assetsCount = summary.assetsCount;
  const stageLabels: Record<ClientStatus, string> = {
    lead: "Lead",
    onboarding: "Onboarding",
    activo: "Activo",
    pausado: "Pausado"
  };
  const clientStatus = summary.client.status as ClientStatus;
  const stageLabel = stageLabels[clientStatus] ?? String(summary.client.status);

  return (
    <main className="space-y-5">
      <Card className="space-y-4 bg-white/90">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardDescription className="uppercase tracking-[0.14em]">Panel del cliente</CardDescription>
            <CardTitle className="mt-1">Tu sistema de marca y crecimiento</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              Prioriza lo siguiente: completar onboarding, subir assets y consolidar tu brandbook.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold">
            Etapa actual: {stageLabel}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-semibold">
            <p>Progreso de onboarding</p>
            <p>{onboardingPct}%</p>
          </div>
          <div className="h-3 overflow-hidden rounded-full border border-border bg-background">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${Math.min(100, Math.max(0, onboardingPct))}%` }}
              aria-hidden
            />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <SummaryCard title="Fase de crecimiento" value={stageLabel} />
        <SummaryCard
          title="Onboarding estratégico completado"
          value={`${onboardingPct}%`}
          subtitle={onboardingDone ? "Listo para ejecución." : "Aún hay campos pendientes."}
        />
        <SummaryCard
          title="Visual assets listos"
          value={String(assetsCount)}
          subtitle={assetsCount > 0 ? "Biblioteca en construcción." : "Aún no hay archivos cargados."}
        />
        <SummaryCard
          title="Brandbook activo"
          value={summary.latestBrandbook ? `v${summary.latestBrandbook.version}` : "Sin version"}
        />
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="space-y-3 bg-white/90 lg:col-span-2">
          <CardTitle>Próximos pasos recomendados</CardTitle>
          <ul className="space-y-2 text-sm font-medium text-foreground">
            <li>
              {onboardingDone ? "Onboarding finalizado. Buen trabajo." : "Completa el onboarding estratégico."}
            </li>
            <li>
              {assetsCount > 0
                ? "Sigue ampliando tu biblioteca visual con referencias y fotos de producto."
                : "Sube logo, tipografías, fotos y referencias para activar consistencia visual."}
            </li>
            <li>
              {brandbookUrl
                ? "Comparte tu brandbook con el equipo y usa la versión vigente en producción."
                : "Genera tu primer brandbook para alinear diseño, tono y mensajes."}
            </li>
          </ul>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/client/onboarding"
              className="inline-flex h-10 items-center rounded-xl border-2 border-border bg-background px-4 text-sm font-semibold shadow-[2px_5px_0_0_rgba(0,0,0,1)] transition-all hover:translate-y-[1px] hover:shadow-[2px_4px_0_0_rgba(0,0,0,1)]"
            >
              Abrir onboarding
            </Link>
            <Link
              href="/client/assets"
              className="inline-flex h-10 items-center rounded-xl border-2 border-border bg-background px-4 text-sm font-semibold shadow-[2px_5px_0_0_rgba(0,0,0,1)] transition-all hover:translate-y-[1px] hover:shadow-[2px_4px_0_0_rgba(0,0,0,1)]"
            >
              Gestionar assets
            </Link>
            <Link
              href="/client/accounts"
              className="inline-flex h-10 items-center rounded-xl border-2 border-border bg-background px-4 text-sm font-semibold shadow-[2px_5px_0_0_rgba(0,0,0,1)] transition-all hover:translate-y-[1px] hover:shadow-[2px_4px_0_0_rgba(0,0,0,1)]"
            >
              Conectar redes
            </Link>
          </div>
        </Card>

        <Card className="space-y-3 bg-white/90">
          <CardTitle>Estado rápido</CardTitle>
          <div className="space-y-2 text-sm">
            <p className="font-semibold">Onboarding: {onboardingDone ? "Completo" : "En progreso"}</p>
            <p className="font-semibold">Assets: {assetsCount > 0 ? `${assetsCount} cargados` : "Sin archivos"}</p>
            <p className="font-semibold">
              Brandbook: {summary.latestBrandbook ? `v${summary.latestBrandbook.version}` : "No generado"}
            </p>
          </div>
        </Card>
      </section>

      {brandbookUrl ? (
        <section className="neo-box flex flex-col gap-3 bg-white/90 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Tu brandbook PDF ya está disponible.</p>
            <p className="text-xs text-muted-foreground">
              Abre la versión actual o descárgala para compartir con tu equipo.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm font-semibold">
            <a href={brandbookUrl} target="_blank" rel="noreferrer" className="underline">
              Ver PDF
            </a>
            <a href={brandbookUrl} download className="underline">
              Descargar PDF
            </a>
          </div>
        </section>
      ) : null}
    </main>
  );
}
