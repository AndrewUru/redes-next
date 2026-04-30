import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, BarChart3, FolderOpen, ListChecks } from "lucide-react";
import { BrandbookList } from "@/components/brandbook-list";
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
  const brandbookLinks = await Promise.all(
    summary.brandbooks.map(async (brandbook) => {
      const { data: signed } = await supabase.storage
        .from("brandbooks")
        .createSignedUrl(brandbook.pdf_path, 60 * 60);

      return {
        id: brandbook.id,
        version: brandbook.version,
        pdf_path: brandbook.pdf_path,
        created_at: brandbook.created_at,
        signedUrl: signed?.signedUrl ?? null
      };
    })
  );
  const brandbookUrl = brandbookLinks[0]?.signedUrl ?? null;
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
              Panel de cliente
            </CardDescription>
            <CardTitle className="mt-1">
              Tu espacio de trabajo
            </CardTitle>
            <p className="mt-1 text-sm font-semibold">
              Usuario: {userDisplayName}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Empieza por completar el primer formulario, subir tus materiales
              y revisar la evolucion de tus redes.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold">
            Etapa actual: {stageLabel}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-semibold">
            <p>Progreso del primer formulario</p>
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
                Tus metricas listas para revisar
              </CardTitle>
              <p className="mt-2 max-w-2xl text-sm font-medium text-muted-foreground">
                Entra al panel para revisar seguidores, alcance, interacciones
                y las publicaciones que mejor estan funcionando.
              </p>
            </div>
            <Link href="/client/accounts" className={primaryActionLinkClass}>
              <BarChart3 className="h-4 w-4" aria-hidden />
              Ver metricas
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
          <CardTitle>Accesos rapidos</CardTitle>
          <div className="grid gap-3">
            <Link
              href="/client/accounts"
              className="group rounded-[8px] border-2 border-border bg-white/90 p-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-[background-color,box-shadow,transform] hover:-translate-y-0.5 hover:bg-[#ecfeff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <p className="flex items-center justify-between gap-2 text-sm font-black">
                Abrir evolucion de redes
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                Seguidores, interacciones y comparativas sencillas.
              </p>
            </Link>
            <Link
              href="/client/accounts#conectar-redes"
              className="group rounded-[8px] border-2 border-border bg-white/90 p-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-[background-color,box-shadow,transform] hover:-translate-y-0.5 hover:bg-[#f0fdf4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <p className="flex items-center justify-between gap-2 text-sm font-black">
                Conectar o revisar Instagram
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                Conecta la cuenta para poder medir la evolucion.
              </p>
            </Link>
            <Link
              href="/client/accounts#insights"
              className="group rounded-[8px] border-2 border-border bg-white/90 p-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-[background-color,box-shadow,transform] hover:-translate-y-0.5 hover:bg-[#fff7ed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <p className="flex items-center justify-between gap-2 text-sm font-black">
                Ir al panel visual
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">
                Entra directo a tendencias y publicaciones destacadas.
              </p>
            </Link>
          </div>
        </Card>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <SummaryCard title="Fase de crecimiento" value={stageLabel} />
        <SummaryCard
          title="Primer formulario completado"
          value={`${onboardingPct}%`}
          subtitle={
            onboardingDone
              ? "Listo para avanzar."
              : "Aun hay campos pendientes."
          }
        />
        <SummaryCard
          title="Materiales subidos"
          value={String(assetsCount)}
          subtitle={
            assetsCount > 0
              ? "Material recibido."
              : "Aun no hay archivos cargados."
          }
        />
        <SummaryCard
          title="Guia de marca"
          value={
            summary.latestBrandbook
              ? `v${summary.latestBrandbook.version}`
              : "Sin version"
          }
        />
      </div>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="space-y-3 bg-white/90 lg:col-span-2">
          <CardTitle>Proximos pasos recomendados</CardTitle>
          <ul className="space-y-2 text-sm font-medium text-foreground">
            <li>
              {onboardingDone
                ? "Primer formulario finalizado. Buen trabajo."
                : "Completa el primer formulario del proyecto."}
            </li>
            <li>
              {assetsCount > 0
                ? "Sigue ampliando tus materiales con fotos e ideas visuales."
                : "Sube logo, fotos o ejemplos visuales. No hace falta subir tipografias."}
            </li>
            <li>
              {brandbookUrl
                ? "Tu guia de marca ya esta disponible para consultar."
                : "Cuando tengamos la informacion, prepararemos tu guia de marca."}
            </li>
          </ul>
          <div className="flex flex-wrap gap-2">
            <Link href="/client/onboarding" className={actionLinkClass}>
              <ListChecks className="h-4 w-4" aria-hidden />
              Abrir formulario
            </Link>
            <Link href="/client/assets" className={actionLinkClass}>
              <FolderOpen className="h-4 w-4" aria-hidden />
              Subir materiales
            </Link>
            <Link href="/client/accounts" className={actionLinkClass}>
              <BarChart3 className="h-4 w-4" aria-hidden />
              Abrir metricas y redes
            </Link>
          </div>
        </Card>

        <Card className="space-y-3 bg-white/90">
          <CardTitle>Estado rápido</CardTitle>
          <div className="space-y-2 text-sm">
            <p className="font-semibold">
              Formulario: {onboardingDone ? "Completo" : "En progreso"}
            </p>
            <p className="font-semibold">
              Materiales:{" "}
              {assetsCount > 0 ? `${assetsCount} cargados` : "Sin archivos"}
            </p>
            <p className="font-semibold">
              Guia:{" "}
              {summary.latestBrandbook
                ? `v${summary.latestBrandbook.version}`
                : "No generado"}
            </p>
          </div>
        </Card>
      </section>

      <BrandbookList
        brandbooks={brandbookLinks}
        title="Tus guias de marca"
        description="Aqui puedes consultar todas las versiones PDF que ya estan listas."
      />

      {brandbookUrl ? (
        <section className="neo-box flex flex-col gap-3 bg-white/90 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">
              Tu guia de marca en PDF ya esta disponible.
            </p>
            <p className="text-xs text-muted-foreground">
              Abre la version actual o descargala para compartir con tu equipo.
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
