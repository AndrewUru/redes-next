import Image from "next/image";
import {
  CheckCircle2,
  FileImage,
  Instagram,
  MessageSquareText,
  Target
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { SocialAccountRow } from "@/lib/db/types";
import type { IntakeData } from "@/lib/intake/schema";

export type AdminAssetItem = {
  id: string;
  type: string;
  storagePath: string;
  createdAt: string;
  previewUrl: string | null;
  originalName: string | null;
};

const assetTypeLabels: Record<string, string> = {
  logo: "Logo",
  typography: "Tipografia",
  photo: "Foto",
  reference: "Referencia"
};

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric"
});

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";
  return dateFormatter.format(date);
}

function joinList(
  value: readonly string[] | undefined,
  fallback = "Sin datos"
) {
  return value && value.length > 0 ? value.join(", ") : fallback;
}

export function AdminDecisionSnapshot({
  intake,
  assetsCount,
  brandbooksCount,
  socialAccounts
}: {
  intake: Partial<IntakeData> | null;
  assetsCount: number;
  brandbooksCount: number;
  socialAccounts: SocialAccountRow[];
}) {
  const connectedAccounts = socialAccounts.filter(
    (account) => account.status === "connected"
  ).length;

  const signals = [
    {
      label: "Objetivo",
      value: joinList(intake?.goals?.businessGoals, "Pendiente"),
      icon: Target
    },
    {
      label: "Audiencia",
      value: intake?.audience?.primaryAudience || "Pendiente",
      icon: MessageSquareText
    },
    {
      label: "Materiales",
      value: `${assetsCount} archivos`,
      icon: FileImage
    },
    {
      label: "Redes conectadas",
      value: `${connectedAccounts}/${socialAccounts.length}`,
      icon: Instagram
    }
  ];

  return (
    <Card className="space-y-4 bg-surface/90">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Vista de decision</CardTitle>
          <CardDescription className="mt-1">
            Resumen rapido para entender estado, oportunidades y material
            disponible antes de tomar decisiones.
          </CardDescription>
        </div>
        <Badge className="w-fit border-warning/25 bg-warning/10">
          {brandbooksCount} guías creadas
        </Badge>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {signals.map((signal) => {
          const Icon = signal.icon;

          return (
            <div
              key={signal.label}
              className="rounded-lg border border-border bg-surface p-3 shadow-xs"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <p className="text-xs font-bold uppercase text-muted-foreground">
                  {signal.label}
                </p>
              </div>
              <p className="line-clamp-3 text-sm font-black leading-snug">
                {signal.value}
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export function AdminIntakeSummary({
  intake
}: {
  intake: Partial<IntakeData> | null;
}) {
  const rows = [
    {
      label: "Propuesta",
      value: intake?.messaging?.coreMessage || "Sin mensaje central"
    },
    {
      label: "Diferenciales",
      value: joinList(intake?.messaging?.differentiators)
    },
    {
      label: "Temas de contenido",
      value: joinList(intake?.pillars?.contentPillars)
    },
    {
      label: "CTA principal",
      value: intake?.ctas?.primaryCTA || "Sin CTA definido"
    },
    {
      label: "Estilo visual",
      value: joinList(intake?.visual?.visualDo)
    },
    {
      label: "Evitar",
      value: joinList(intake?.visual?.visualDont, "Sin restricciones")
    }
  ];

  return (
    <Card className="space-y-4 bg-surface/90">
      <div>
        <CardTitle>Brief del usuario</CardTitle>
        <CardDescription className="mt-1">
          Lectura ordenada del formulario para orientar contenido, diseño y
          conversion.
        </CardDescription>
      </div>
      {!intake ? (
        <div className="rounded-lg border border-dashed border-border-strong bg-muted/30 p-6 text-sm text-muted-foreground">
          El usuario todavia no ha enviado informacion suficiente.
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {rows.map((row) => (
            <div
              key={row.label}
              className="rounded-lg border border-border bg-surface p-3"
            >
              <p className="text-xs font-bold uppercase text-muted-foreground">
                {row.label}
              </p>
              <p className="mt-1 text-sm font-semibold leading-relaxed">
                {row.value}
              </p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export function AdminAssetsGallery({ assets }: { assets: AdminAssetItem[] }) {
  return (
    <Card className="space-y-4 bg-surface/90">
      <div>
        <CardTitle>Materiales subidos</CardTitle>
        <CardDescription className="mt-1">
          Logo, fotos y referencias que sirven para evaluar identidad visual y
          preparar piezas.
        </CardDescription>
      </div>
      {assets.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border-strong bg-muted/30 p-6 text-sm text-muted-foreground">
          Todavia no hay materiales subidos por el usuario.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {assets.map((asset) => (
            <article
              key={asset.id}
              className="overflow-hidden rounded-lg border border-border bg-surface shadow-xs"
            >
              {asset.previewUrl ? (
                <Image
                  src={asset.previewUrl}
                  alt={
                    asset.originalName ??
                    assetTypeLabels[asset.type] ??
                    "Material"
                  }
                  width={640}
                  height={420}
                  unoptimized
                  className="h-44 w-full border-b-2 border-border object-cover"
                />
              ) : (
                <div className="flex h-44 items-center justify-center border-b-2 border-border bg-muted">
                  <FileImage className="h-10 w-10" aria-hidden />
                </div>
              )}
              <div className="space-y-2 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="border-primary/20 bg-accent text-accent-foreground">
                    {assetTypeLabels[asset.type] ?? "Archivo"}
                  </Badge>
                  <p className="text-xs font-medium text-muted-foreground">
                    {formatDate(asset.createdAt)}
                  </p>
                </div>
                <p className="truncate text-sm font-black">
                  {asset.originalName ?? asset.storagePath.split("/").at(-1)}
                </p>
                {asset.previewUrl ? (
                  <a
                    href={asset.previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex text-xs font-bold underline"
                  >
                    Abrir material
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </Card>
  );
}

export function AdminSocialAccountsSummary({
  accounts
}: {
  accounts: SocialAccountRow[];
}) {
  return (
    <Card className="space-y-4 bg-surface/90">
      <div>
        <CardTitle>Cuentas sociales</CardTitle>
        <CardDescription className="mt-1">
          Estado de conexiones disponibles para leer métricas y publicaciones.
        </CardDescription>
      </div>
      {accounts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border-strong bg-muted/30 p-6 text-sm text-muted-foreground">
          No hay cuentas conectadas todavia.
        </div>
      ) : (
        <ul className="space-y-2">
          {accounts.map((account) => (
            <li
              key={account.id}
              className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-black">
                  {account.platform}: {account.account_name}
                </p>
                <p className="text-xs font-medium text-muted-foreground">
                  {account.account_handle || "Sin usuario visible"} ·
                  Actualizada {formatDate(account.updated_at)}
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-md border border-border bg-background px-3 py-1 text-xs font-semibold">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                {account.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
