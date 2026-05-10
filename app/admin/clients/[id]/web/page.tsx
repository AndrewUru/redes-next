import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BrandbookList } from "@/components/brandbook-list";
import {
  AdminAssetsGallery,
  AdminIntakeSummary,
  AdminSocialAccountsSummary
} from "@/components/admin/client-decision-panels";
import {
  WebProjectOverview,
  WebProgressBoard
} from "@/components/web-project/web-project-cards";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { getClientSummary } from "@/lib/db/server";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { IntakeData } from "@/lib/intake/schema";

export default async function AdminClientWebProjectPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("admin");
  const { id } = await params;
  const summary = await getClientSummary(id);
  if (!summary.client) notFound();

  const supabase = await createClient();
  const [brandbookLinks, assetLinks] = await Promise.all([
    Promise.all(
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
    ),
    Promise.all(
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
    )
  ]);
  const intakeData = (summary.intake?.data ??
    null) as Partial<IntakeData> | null;

  return (
    <div className="space-y-4">
      <Card className="bg-surface/90">
        <Link
          href={`/admin/clients/${summary.client.id}`}
          className="mb-4 inline-flex items-center gap-2 text-sm font-black underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Volver al cliente
        </Link>
        <CardDescription className="uppercase">Proyecto web</CardDescription>
        <CardTitle className="mt-1">{summary.client.display_name}</CardTitle>
        <p className="mt-2 max-w-3xl text-sm font-medium text-muted-foreground">
          Vista especifica para decidir estructura, materiales, guias y avances
          de la pagina web de este cliente.
        </p>
      </Card>

      <WebProjectOverview
        assetsCount={summary.assetsCount}
        brandbooksCount={summary.brandbooks.length}
        intakeCompletionPct={summary.intake?.completion_pct ?? 0}
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <AdminIntakeSummary intake={intakeData} />
        <AdminSocialAccountsSummary accounts={summary.socialAccounts} />
      </div>

      <AdminAssetsGallery assets={assetLinks} />

      <BrandbookList
        brandbooks={brandbookLinks}
        title="Guias disponibles para la web"
        description="Versiones de marca y direccion que pueden orientar la pagina."
      />

      <WebProgressBoard />
    </div>
  );
}
