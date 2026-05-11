import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  FileText,
  FolderOpen,
  ListChecks
} from "lucide-react";
import { BrandbookList } from "@/components/brandbook-list";
import { Badge } from "@/components/ui/badge";
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
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";
const primaryActionLinkClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

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

  const essentials = [
    {
      title: "Formulario",
      value: `${onboardingPct}%`,
      description: onboardingDone ? "Completo" : "Pendiente de completar",
      href: "/client/onboarding",
      icon: ListChecks
    },
    {
      title: "Materiales",
      value: String(assetsCount),
      description: assetsCount > 0 ? "Archivos recibidos" : "Sin archivos",
      href: "/client/assets",
      icon: FolderOpen
    },
    {
      title: "Guía de marca",
      value: summary.latestBrandbook
        ? `v${summary.latestBrandbook.version}`
        : "No lista",
      description: brandbookUrl ? "PDF disponible" : "En preparación",
      href: "/client",
      externalHref: brandbookUrl,
      icon: BookOpen
    }
  ] as const;

  const nextSteps = [
    onboardingDone
      ? "Revisa si el briefing sigue reflejando tu dirección actual."
      : "Completa el formulario inicial para cerrar la base estratégica.",
    assetsCount > 0
      ? "Añade nuevas fotos o referencias cuando cambie tu oferta."
      : "Sube logo, fotos o referencias visuales para contextualizar el proyecto.",
    brandbookUrl
      ? "Consulta la última guía de marca antes de crear nuevas piezas."
      : "La guía de marca aparecerá aquí cuando esté generada."
  ];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <section className="grid gap-6 lg:grid-cols-[1fr_0.36fr]">
        <Card className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl">
              <Badge>Panel de cliente</Badge>
              <h1 className="mt-4 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
                Hola, {userDisplayName}
              </h1>
              <p className="mt-3 leading-7 text-muted-foreground">
                Este es tu espacio para centralizar briefing, materiales, guías
                y métricas del proyecto.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-muted/45 px-4 py-3 text-sm">
              <p className="text-muted-foreground">Etapa actual</p>
              <p className="mt-1 font-semibold">{stageLabel}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4 text-sm">
              <p className="font-medium">Progreso del primer formulario</p>
              <p className="font-semibold tabular-nums">{onboardingPct}%</p>
            </div>
            <Progress value={onboardingPct} />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/client/onboarding" className={primaryActionLinkClass}>
              <ListChecks className="h-4 w-4" aria-hidden="true" />
              Abrir formulario
            </Link>
            <Link href="/client/assets" className={actionLinkClass}>
              <FolderOpen className="h-4 w-4" aria-hidden="true" />
              Subir materiales
            </Link>
            <Link href="/client/accounts" className={actionLinkClass}>
              <BarChart3 className="h-4 w-4" aria-hidden="true" />
              Ver métricas
            </Link>
          </div>
        </Card>

        <Card className="space-y-4">
          <CardDescription>Resumen</CardDescription>
          <div className="space-y-3">
            <div>
              <p className="text-3xl font-semibold tabular-nums">
                {onboardingPct}%
              </p>
              <p className="text-sm text-muted-foreground">Briefing inicial</p>
            </div>
            <div className="border-t border-border pt-3">
              <p className="text-3xl font-semibold tabular-nums">
                {assetsCount}
              </p>
              <p className="text-sm text-muted-foreground">
                Materiales subidos
              </p>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {essentials.map((item) => {
          const Icon = item.icon;
          const externalHref =
            "externalHref" in item ? item.externalHref : null;
          const cardClassName =
            "group rounded-2xl border border-border bg-surface p-5 shadow-sm transition-colors hover:bg-muted/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";
          const cardContent = (
            <>
              <div className="flex items-start justify-between gap-4">
                <Icon
                  className="h-5 w-5 text-muted-foreground"
                  aria-hidden="true"
                />
                <ArrowRight
                  className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </div>
              <p className="mt-5 text-sm text-muted-foreground">{item.title}</p>
              <p className="mt-1 text-2xl font-semibold">{item.value}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {item.description}
              </p>
            </>
          );

          if (externalHref) {
            return (
              <a
                key={item.title}
                href={externalHref}
                target="_blank"
                rel="noreferrer"
                className={cardClassName}
              >
                {cardContent}
              </a>
            );
          }

          return (
            <Link key={item.title} href={item.href} className={cardClassName}>
              {cardContent}
            </Link>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.72fr_0.28fr]">
        <Card className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Próximos pasos</CardTitle>
              <CardDescription className="mt-2">
                Acciones recomendadas para mantener el proyecto desbloqueado.
              </CardDescription>
            </div>
            <FileText
              className="h-5 w-5 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
          <div className="divide-y divide-border rounded-2xl border border-border">
            {nextSteps.map((step, index) => (
              <div key={step} className="flex gap-4 p-4">
                <span className="text-sm font-semibold text-muted-foreground tabular-nums">
                  0{index + 1}
                </span>
                <p className="text-sm leading-6">{step}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-3">
          <CardTitle>Estado rápido</CardTitle>
          <div className="space-y-3 text-sm">
            <p className="flex justify-between gap-3">
              <span className="text-muted-foreground">Formulario</span>
              <span className="font-medium">
                {onboardingDone ? "Completo" : "En progreso"}
              </span>
            </p>
            <p className="flex justify-between gap-3">
              <span className="text-muted-foreground">Materiales</span>
              <span className="font-medium">
                {assetsCount > 0 ? `${assetsCount} cargados` : "Sin archivos"}
              </span>
            </p>
            <p className="flex justify-between gap-3">
              <span className="text-muted-foreground">Guía</span>
              <span className="font-medium">
                {summary.latestBrandbook
                  ? `v${summary.latestBrandbook.version}`
                  : "No generada"}
              </span>
            </p>
          </div>
        </Card>
      </section>

      <BrandbookList
        brandbooks={brandbookLinks}
        title="Tus guías de marca"
        description="Aquí puedes consultar todas las versiones PDF que ya están listas."
        allowDelete
      />

      {brandbookUrl ? (
        <section className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">Guía de marca disponible</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Abre la versión actual o descárgala para compartir con tu equipo.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm font-semibold">
            <a
              href={brandbookUrl}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4"
            >
              Ver PDF
            </a>
            <a
              href={brandbookUrl}
              download
              className="underline underline-offset-4"
            >
              Descargar PDF
            </a>
          </div>
        </section>
      ) : null}
    </div>
  );
}
