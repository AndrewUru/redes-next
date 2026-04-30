import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrandbookList } from "@/components/brandbook-list";
import {
  AdminAssetsGallery,
  AdminDecisionSnapshot,
  AdminIntakeSummary,
  AdminSocialAccountsSummary
} from "@/components/admin/client-decision-panels";
import { GenerateBrandbookButton } from "@/components/admin/generate-brandbook-button";
import { ClientSettingsForm } from "@/components/admin/client-settings-form";
import { SocialPerformancePanel } from "@/components/client/social-performance-panel";
import { getClientSummary } from "@/lib/db/server";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { IntakeData } from "@/lib/intake/schema";

export default async function AdminClientDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("admin");
  const { id } = await params;
  const summary = await getClientSummary(id);
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
  const assetLinks = await Promise.all(
    summary.assets.map(async (asset) => {
      const { data: signed } = await supabase.storage
        .from("brand-assets")
        .createSignedUrl(asset.storage_path, 60 * 60);
      const originalName =
        typeof asset.metadata.originalName === "string"
          ? asset.metadata.originalName
          : null;

      return {
        id: asset.id,
        type: asset.type,
        storagePath: asset.storage_path,
        createdAt: asset.created_at,
        previewUrl: signed?.signedUrl ?? null,
        originalName
      };
    })
  );
  const intakeData = (summary.intake?.data ?? null) as Partial<IntakeData> | null;

  return (
    <div className="space-y-4">
      <Card>
        <CardTitle>{summary.client.display_name}</CardTitle>
        <CardDescription className="mt-2">
          {summary.client.notes ??
            "Sin notas aun. Usa este espacio para narrativa, posicionamiento y objeciones clave."}
        </CardDescription>
        <div className="mt-4 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <Badge>{summary.client.status}</Badge>
          <Link
            href={`/admin/clients/${summary.client.id}/web`}
            className="inline-flex min-h-10 items-center justify-center rounded-[8px] border-2 border-border bg-[#fde68a] px-4 py-2 text-sm font-black shadow-[2px_5px_0_0_rgba(0,0,0,1)] transition-[background-color,box-shadow,transform] hover:translate-y-[1px] hover:bg-[#f2d048] hover:shadow-[2px_4px_0_0_rgba(0,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Ver proyecto web
          </Link>
          <GenerateBrandbookButton clientId={id} />
        </div>
        <div className="mt-4">
          <ClientSettingsForm
            clientId={id}
            initialStatus={summary.client.status}
            initialNotes={summary.client.notes ?? ""}
          />
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardDescription>Brand strategy intake</CardDescription>
          <CardTitle className="mt-2">
            {summary.intake?.status ?? "sin draft"} (
            {summary.intake?.completion_pct ?? 0}%)
          </CardTitle>
        </Card>
        <Card>
          <CardDescription>Visual identity assets</CardDescription>
          <CardTitle className="mt-2">{String(summary.assetsCount)}</CardTitle>
        </Card>
        <Card>
          <CardDescription>Brandbook narrativo</CardDescription>
          <CardTitle className="mt-2">
            {summary.latestBrandbook
              ? `v${summary.latestBrandbook.version}`
              : "sin version"}
          </CardTitle>
          {brandbookUrl ? (
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
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
          ) : null}
        </Card>
      </div>

      <AdminDecisionSnapshot
        intake={intakeData}
        assetsCount={summary.assetsCount}
        brandbooksCount={summary.brandbooks.length}
        socialAccounts={summary.socialAccounts}
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <AdminIntakeSummary intake={intakeData} />
        <AdminSocialAccountsSummary accounts={summary.socialAccounts} />
      </div>

      <AdminAssetsGallery assets={assetLinks} />

      <BrandbookList
        brandbooks={brandbookLinks}
        title="Brandbooks creados"
        description="Historial de versiones PDF generadas para este cliente."
      />

      <Card>
        <CardTitle>Publicaciones y metricas sociales</CardTitle>
        <CardDescription className="mb-4">
          Visualiza el desempeno de Instagram, publicaciones recientes, top
          contenidos y ultimos snapshots para preparar informes y propuestas.
        </CardDescription>
        <SocialPerformancePanel
          apiPath={`/api/admin/clients/${summary.client.id}/insights`}
        />
      </Card>
    </div>
  );
}
