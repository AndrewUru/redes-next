import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clapperboard, FileVideo, Sparkles } from "lucide-react";
import { BrandVideoPreview } from "@/components/client/brand-video-preview";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { getClientIdForCurrentUser } from "@/lib/auth";
import { getClientSummary } from "@/lib/db/server";
import type { ClientStatus } from "@/lib/db/types";
import type { BrandSnapshotProps } from "@/remotion/BrandSnapshotVideo";

const stageLabels: Record<ClientStatus, string> = {
  lead: "Lead",
  onboarding: "Onboarding",
  activo: "Activo",
  pausado: "Pausado"
};

function buildSnapshotProps({
  brandName,
  status,
  onboardingPct,
  assetsCount,
  brandbookVersion
}: {
  brandName: string;
  status: ClientStatus;
  onboardingPct: number;
  assetsCount: number;
  brandbookVersion: number | null;
}): BrandSnapshotProps {
  const onboardingDone = onboardingPct >= 100;
  const brandbookStatus = brandbookVersion ? `Brandbook v${brandbookVersion}` : "Brandbook pendiente";
  const headline = onboardingDone
    ? "Tu sistema de marca ya tiene base estratégica para activar contenido con más intención."
    : "Tu sistema de marca está tomando forma; falta cerrar los datos que afinan el contenido.";

  return {
    brandName,
    stageLabel: stageLabels[status] ?? String(status),
    onboardingPct,
    assetsCount,
    brandbookStatus,
    headline,
    focus: [
      onboardingDone
        ? "Usar el onboarding como briefing vivo para cada bloque de contenido."
        : "Completar el onboarding para cerrar mensaje, tono y objetivos.",
      assetsCount > 0
        ? "Seleccionar los assets que mejor representan la identidad actual."
        : "Subir logo, fotos y referencias visuales antes de renderizar piezas finales.",
      brandbookVersion
        ? "Mantener el brandbook vigente como referencia para diseño y copy."
        : "Generar el primer brandbook cuando el briefing esté completo."
    ],
    metrics: [
      {
        label: "Onboarding",
        value: `${onboardingPct}%`,
        detail: onboardingDone ? "Brief completo" : "Brief en progreso"
      },
      {
        label: "Assets",
        value: String(assetsCount),
        detail: assetsCount === 1 ? "Archivo listo" : "Archivos listos"
      },
      {
        label: "Brandbook",
        value: brandbookVersion ? `v${brandbookVersion}` : "0",
        detail: brandbookVersion ? "Documento activo" : "Pendiente"
      }
    ]
  };
}

export default async function ClientVideoPage() {
  const clientId = await getClientIdForCurrentUser();
  if (!clientId) notFound();

  const summary = await getClientSummary(clientId);
  if (!summary.client) notFound();

  const status = summary.client.status as ClientStatus;
  const onboardingPct = Math.max(0, Math.min(100, summary.intake?.completion_pct ?? 0));
  const brandbookVersion =
    typeof summary.latestBrandbook?.version === "number"
      ? summary.latestBrandbook.version
      : null;
  const snapshotProps = buildSnapshotProps({
    brandName: summary.client.display_name,
    status,
    onboardingPct,
    assetsCount: summary.assetsCount,
    brandbookVersion
  });

  return (
    <main className="space-y-6">
      <Link
        href="/client"
        className="inline-flex items-center gap-2 text-sm font-black underline decoration-2 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Volver al panel
      </Link>

      <section className="grid gap-5 xl:grid-cols-[minmax(320px,0.82fr)_1fr] xl:items-start">
        <div className="space-y-4">
          <Card className="space-y-3 bg-white/90">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[8px] border-2 border-border bg-[#fde68a] shadow-[3px_4px_0_0_rgba(0,0,0,1)]">
                <Clapperboard className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <CardDescription className="uppercase tracking-[0.14em]">
                  Remotion Studio
                </CardDescription>
                <CardTitle className="mt-1 text-3xl [text-wrap:balance]">
                  Video snapshot de marca
                </CardTitle>
              </div>
            </div>
            <p className="text-sm font-medium leading-relaxed text-muted-foreground">
              Preview vertical con datos reales del panel: onboarding, assets,
              etapa y brandbook activo.
            </p>
          </Card>

          <BrandVideoPreview inputProps={snapshotProps} />
        </div>

        <div className="space-y-4">
          <Card className="space-y-4 bg-white/90">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[8px] border-2 border-border bg-[#d9f99d] shadow-[3px_4px_0_0_rgba(0,0,0,1)]">
                <Sparkles className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <CardDescription className="uppercase tracking-[0.14em]">
                  Datos Actuales
                </CardDescription>
                <CardTitle className="mt-1 text-2xl">
                  {snapshotProps.brandName}
                </CardTitle>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {snapshotProps.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-[8px] border-2 border-border bg-background p-3 shadow-[3px_4px_0_0_rgba(0,0,0,1)]"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-3xl font-black tabular-nums">
                    {metric.value}
                  </p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    {metric.detail}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-3 bg-[#fff7ed]">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[8px] border-2 border-border bg-white shadow-[3px_4px_0_0_rgba(0,0,0,1)]">
                <FileVideo className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <CardDescription className="uppercase tracking-[0.14em]">
                  Guion del video
                </CardDescription>
                <CardTitle className="mt-1 text-2xl [text-wrap:balance]">
                  {snapshotProps.headline}
                </CardTitle>
              </div>
            </div>

            <ul className="grid gap-3">
              {snapshotProps.focus.map((item, index) => (
                <li
                  key={item}
                  className="flex gap-3 rounded-[8px] border-2 border-border bg-white/90 p-3 shadow-[3px_4px_0_0_rgba(0,0,0,1)]"
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 border-border bg-[#f08cb6] text-xs font-black">
                    {index + 1}
                  </span>
                  <span className="min-w-0 text-sm font-semibold leading-relaxed">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>
    </main>
  );
}
