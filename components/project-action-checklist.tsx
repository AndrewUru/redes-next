import Link from "next/link";
import type { Route } from "next";
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  FileImage,
  Instagram,
  ListChecks,
  MessageSquareText,
  Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { AssetRow, BrandbookRow, SocialAccountRow } from "@/lib/db/types";

type ChecklistAudience = "client" | "admin";

type ProjectActionChecklistProps = {
  audience: ChecklistAudience;
  onboardingPct: number;
  intakeStatus?: "draft" | "submitted" | string | null;
  assets: AssetRow[];
  brandbooks: BrandbookRow[];
  socialAccounts: SocialAccountRow[];
  adminClientPath?: string;
};

type ChecklistItem = {
  title: string;
  description: string;
  href: string;
  done: boolean;
  priority: "alta" | "media" | "baja";
  icon: typeof ListChecks;
};

const priorityStyles: Record<ChecklistItem["priority"], string> = {
  alta: "bg-red-50 text-red-900 dark:border-red-300/30 dark:bg-red-300/10 dark:text-red-100",
  media:
    "bg-amber-50 text-amber-950 dark:border-amber-300/30 dark:bg-amber-300/10 dark:text-amber-100",
  baja: "bg-emerald-50 text-emerald-950 dark:border-emerald-300/30 dark:bg-emerald-300/10 dark:text-emerald-100"
};

function hasAssetType(assets: AssetRow[], type: string) {
  return assets.some((asset) => asset.type === type);
}

function buildHref(
  audience: ChecklistAudience,
  clientHref: string,
  adminClientPath: string | undefined
) {
  if (audience === "client") return clientHref;
  return adminClientPath ?? "/admin/clients";
}

export function ProjectActionChecklist({
  audience,
  onboardingPct,
  intakeStatus,
  assets,
  brandbooks,
  socialAccounts,
  adminClientPath
}: ProjectActionChecklistProps) {
  const hasSubmittedIntake = intakeStatus === "submitted";
  const hasLogo = hasAssetType(assets, "logo");
  const hasPhotos = hasAssetType(assets, "photo");
  const connectedSocialAccounts = socialAccounts.filter(
    (account) => account.status === "connected"
  ).length;
  const hasBrandbook = brandbooks.length > 0;

  const items: ChecklistItem[] = [
    {
      title:
        audience === "client"
          ? "Completa el briefing inicial"
          : "Revisar briefing recibido",
      description: hasSubmittedIntake
        ? "El formulario ya esta enviado y listo para trabajar."
        : `Progreso actual: ${onboardingPct}%. Falta cerrar la base estrategica.`,
      href: buildHref(audience, "/client/onboarding", adminClientPath),
      done: hasSubmittedIntake,
      priority: hasSubmittedIntake ? "baja" : "alta",
      icon: ListChecks
    },
    {
      title:
        audience === "client"
          ? "Sube logo y fotos utiles"
          : "Validar materiales visuales",
      description:
        hasLogo && hasPhotos
          ? "Hay logo y fotos disponibles para preparar piezas."
          : "Conviene reunir logo, fotos del negocio y referencias visuales.",
      href: buildHref(audience, "/client/assets", adminClientPath),
      done: hasLogo && hasPhotos,
      priority: hasLogo || hasPhotos ? "media" : "alta",
      icon: FileImage
    },
    {
      title:
        audience === "client"
          ? "Conecta Instagram"
          : "Comprobar conexion social",
      description:
        connectedSocialAccounts > 0
          ? `${connectedSocialAccounts} cuenta conectada para medir evolucion.`
          : "Sin redes conectadas todavia; las metricas no pueden alimentarse.",
      href: buildHref(audience, "/client/accounts", adminClientPath),
      done: connectedSocialAccounts > 0,
      priority: connectedSocialAccounts > 0 ? "baja" : "media",
      icon: Instagram
    },
    {
      title:
        audience === "client"
          ? "Consulta la guia de marca"
          : "Generar o revisar brandbook",
      description: hasBrandbook
        ? `Hay ${brandbooks.length} version disponible para consulta.`
        : "Aun no hay brandbook generado para este cliente.",
      href: buildHref(audience, "/client", adminClientPath),
      done: hasBrandbook,
      priority: hasBrandbook ? "baja" : "media",
      icon: Sparkles
    }
  ];

  const pendingItems = items.filter((item) => !item.done);
  const completedCount = items.length - pendingItems.length;
  const highlightedItems = pendingItems.length > 0 ? pendingItems : items;

  return (
    <Card className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>
            {audience === "client" ? "Tareas pendientes" : "Bloqueos y tareas"}
          </CardTitle>
          <CardDescription className="mt-1">
            {pendingItems.length > 0
              ? "Acciones recomendadas para mantener el proyecto avanzando."
              : "La base operativa esta completa; toca revisar calidad y siguiente entrega."}
          </CardDescription>
        </div>
        <Badge className="w-fit bg-sky-50 text-sky-950 dark:border-sky-300/30 dark:bg-sky-300/10 dark:text-sky-100">
          {completedCount}/{items.length} listas
        </Badge>
      </div>

      <div className="grid gap-3">
        {highlightedItems.map((item) => {
          const Icon = item.icon;
          const StatusIcon = item.done ? CheckCircle2 : Circle;

          return (
            <Link
              key={item.title}
              href={item.href as Route}
              className="group grid gap-3 rounded-xl border border-border bg-surface/80 p-3 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:grid-cols-[auto_minmax(0,1fr)_auto]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-muted">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{item.title}</span>
                  <Badge className={priorityStyles[item.priority]}>
                    {item.priority}
                  </Badge>
                </span>
                <span className="mt-1 block text-sm leading-6 text-muted-foreground">
                  {item.description}
                </span>
              </span>
              <span className="flex items-center justify-between gap-3 sm:justify-end">
                <StatusIcon
                  className={
                    item.done
                      ? "h-5 w-5 text-emerald-700"
                      : "h-5 w-5 text-muted-foreground"
                  }
                  aria-hidden
                />
                <ArrowRight
                  className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1"
                  aria-hidden
                />
              </span>
            </Link>
          );
        })}
      </div>

      {pendingItems.length === 0 ? (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-950 dark:border-emerald-300/30 dark:bg-emerald-300/10 dark:text-emerald-100">
          <MessageSquareText className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>
            Siguiente mejora natural: pedir feedback o aprobar la siguiente
            pieza antes de producir mas contenido.
          </p>
        </div>
      ) : null}
    </Card>
  );
}
