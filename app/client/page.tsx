import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BarChart3, FolderOpen, ListChecks } from "lucide-react";
import { SummaryCard } from "@/components/summary-card";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  getClientIdForCurrentUser,
  getProfile,
  getSessionUser
} from "@/lib/auth";
import type { ClientStatus } from "@/lib/db/types";
import { getClientSummary } from "@/lib/db/server";
import { createClient } from "@/lib/supabase/server";

const actionLinkClass =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] border-2 border-border bg-background px-4 py-2 text-sm font-semibold shadow-[2px_5px_0_0_rgba(0,0,0,1)] transition-[background-color,border-color,box-shadow,transform] hover:translate-y-[1px] hover:bg-muted hover:shadow-[2px_4px_0_0_rgba(0,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";
const primaryActionLinkClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-[8px] border-2 border-border bg-[#fde68a] px-4 py-2 text-sm font-black shadow-[2px_5px_0_0_rgba(0,0,0,1)] transition-[background-color,border-color,box-shadow,transform] hover:translate-y-[1px] hover:bg-[#f2d048] hover:shadow-[2px_4px_0_0_rgba(0,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export default async function ClientHomePage() {
  const [clientId, profile, user] = await Promise.all([
    getClientIdForCurrentUser(),
    getProfile(),
    getSessionUser()
  ]);
  if (!clientId) notFound();

  const summary = await getClientSummary(clientId);
  if (!summary.client) notFound();
  const supabase = await createClient();
  const pdfPath = summary.latestBrandbook?.pdf_path ?? null;
  const { data: signed } = pdfPath
    ? await supabase.storage
        .from("brandbooks")
        .createSignedUrl(pdfPath, 60 * 60)
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
  const cleanName = profile?.full_name?.trim();
  const emailName = user?.email?.split("@")[0]?.trim();
  const userDisplayName = cleanName || emailName || "Cliente";
  const metricsPreview = [
    {
      title: "Evolución de seguidores",
      helper: "Detecta si la comunidad crece o se estanca.",
      bars: [34, 48, 44, 62, 76, 82]
    },
    {
      title: "Engagement y respuesta",
      helper: "Comprueba si el contenido genera interacción real.",
      bars: [22, 28, 36, 31, 46, 54]
    },
    {
      title: "Top publicaciones",
      helper: "Encuentra los formatos que mas tiran del perfil.",
      bars: [40, 72, 58, 81, 49, 67]
    }
  ] as const;

  return (
    <div className="space-y-6">
      <Card className="space-y-4 bg-white/90">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardDescription className="uppercase">
              Panel de usuario
            </CardDescription>
            <CardTitle className="mt-1">
              Tu sistema de marca y crecimiento
            </CardTitle>
            <p className="mt-1 text-sm font-semibold">
              Usuario: {userDisplayName}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Prioriza lo siguiente: completar onboarding, subir assets y
              consolidar tu brandbook.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold">
            Etapa actual: {stageLabel}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-semibold">
            <p>Progreso de onboarding</p>
            <p className="tabular-nums">{onboardingPct}%</p>
          </div>
          <Progress value={onboardingPct} />
        </div>
      </Card>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-4 overflow-hidden bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(239,246,255,0.94))]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardDescription className="uppercase">
                Nuevo foco
              </CardDescription>
              <CardTitle className="mt-1">
                Métricas de evolución listas para revisar
              </CardTitle>
              <p className="mt-2 max-w-2xl text-sm font-medium text-muted-foreground">
                Entra al panel de métricas para revisar seguidores, engagement,
                alcance, impresiones y las publicaciones que mejor estan
                funcionando.
              </p>
            </div>
            <Link href="/client/accounts" className={primaryActionLinkClass}>
              <BarChart3 className="h-4 w-4" aria-hidden />
              Métricas completas
            </Link>
          </div>

          <div className="grid gap-3 lg:grid-cols-3">
            {metricsPreview.map((item) => (
              <div
                key={item.title}
                className="rounded-[8px] border-2 border-border bg-white/90 p-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
              >
                <p className="text-sm font-black">{item.title}</p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  {item.helper}
                </p>
                <div className="mt-4 flex h-20 items-end gap-2 rounded-[8px] border border-border bg-[#f8fafc] p-2">
                  {item.bars.map((bar, index) => (
                    <div
                      key={`${item.title}-${index}`}
                      className="flex-1 rounded-t-md bg-[linear-gradient(180deg,#f97316,#fb7185)]"
                      style={{ height: `${bar}%` }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-3 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(254,243,199,0.92))]">
          <CardTitle>Accesos rápidos</CardTitle>
          <div className="grid gap-3">
            <Link
              href="/client/accounts"
              className="group rounded-[8px] border-2 border-border bg-white/90 p-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-[background-color,box-shadow,transform] hover:-translate-y-0.5 hover:bg-[#ecfeff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <p className="flex items-center justify-between gap-2 text-sm font-black">
                Abrir evolución de redes
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                Seguidores, likes, engagement y comparativas historicas.
              </p>
            </Link>
            <Link
              href="/client/accounts#conectar-redes"
              className="group rounded-[8px] border-2 border-border bg-white/90 p-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-[background-color,box-shadow,transform] hover:-translate-y-0.5 hover:bg-[#f0fdf4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <p className="flex items-center justify-between gap-2 text-sm font-black">
                Conectar o revisar cuentas
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                Gestiona Instagram y prepara la base de datos para el analisis.
              </p>
            </Link>
            <Link
              href="/client/accounts#insights"
              className="group rounded-[8px] border-2 border-border bg-white/90 p-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-[background-color,box-shadow,transform] hover:-translate-y-0.5 hover:bg-[#fff7ed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <p className="flex items-center justify-between gap-2 text-sm font-black">
                Ir al dashboard visual
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                Entra directo a la lectura de tendencias y top publicaciones.
              </p>
            </Link>
          </div>
        </Card>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <SummaryCard title="Fase de crecimiento" value={stageLabel} />
        <SummaryCard
          title="Onboarding estratégico completado"
          value={`${onboardingPct}%`}
          subtitle={
            onboardingDone
              ? "Listo para ejecución."
              : "Aún hay campos pendientes."
          }
        />
        <SummaryCard
          title="Visual assets listos"
          value={String(assetsCount)}
          subtitle={
            assetsCount > 0
              ? "Biblioteca en construcción."
              : "Aún no hay archivos cargados."
          }
        />
        <SummaryCard
          title="Brandbook activo"
          value={
            summary.latestBrandbook
              ? `v${summary.latestBrandbook.version}`
              : "Sin version"
          }
        />
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="space-y-3 bg-white/90 lg:col-span-2">
          <CardTitle>Próximos pasos recomendados</CardTitle>
          <ul className="space-y-2 text-sm font-medium text-foreground">
            <li>
              {onboardingDone
                ? "Onboarding finalizado. Buen trabajo."
                : "Completa el onboarding estratégico."}
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
            <Link href="/client/onboarding" className={actionLinkClass}>
              <ListChecks className="h-4 w-4" aria-hidden />
              Abrir onboarding
            </Link>
            <Link href="/client/assets" className={actionLinkClass}>
              <FolderOpen className="h-4 w-4" aria-hidden />
              Gestionar assets
            </Link>
            <Link href="/client/accounts" className={actionLinkClass}>
              <BarChart3 className="h-4 w-4" aria-hidden />
              Abrir métricas y redes
            </Link>
          </div>
        </Card>

        <Card className="space-y-3 bg-white/90">
          <CardTitle>Estado rápido</CardTitle>
          <div className="space-y-2 text-sm">
            <p className="font-semibold">
              Onboarding: {onboardingDone ? "Completo" : "En progreso"}
            </p>
            <p className="font-semibold">
              Assets:{" "}
              {assetsCount > 0 ? `${assetsCount} cargados` : "Sin archivos"}
            </p>
            <p className="font-semibold">
              Brandbook:{" "}
              {summary.latestBrandbook
                ? `v${summary.latestBrandbook.version}`
                : "No generado"}
            </p>
          </div>
        </Card>
      </section>

      {brandbookUrl ? (
        <section className="neo-box flex flex-col gap-3 bg-white/90 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">
              Tu brandbook PDF ya está disponible.
            </p>
            <p className="text-xs text-muted-foreground">
              Abre la versión actual o descárgala para compartir con tu equipo.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm font-semibold">
            <a
              href={brandbookUrl}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Ver PDF
            </a>
            <a href={brandbookUrl} download className="underline">
              Descargar PDF
            </a>
          </div>
        </section>
      ) : null}
    </div>
  );
}
