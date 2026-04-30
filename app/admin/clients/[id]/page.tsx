import { notFound } from "next/navigation";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrandbookList } from "@/components/brandbook-list";
import { GenerateBrandbookButton } from "@/components/admin/generate-brandbook-button";
import { ClientSettingsForm } from "@/components/admin/client-settings-form";
import { SocialPerformancePanel } from "@/components/client/social-performance-panel";
import { getClientSummary } from "@/lib/db/server";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

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

      <BrandbookList
        brandbooks={brandbookLinks}
        title="Brandbooks creados"
        description="Historial de versiones PDF generadas para este cliente."
      />

      <Card>
        <CardTitle>Métricas sociales</CardTitle>
        <CardDescription className="mb-4">
          Visualiza el desempeño de Instagram y los últimos snapshots para
          preparar informes y propuestas.
        </CardDescription>
        <SocialPerformancePanel
          apiPath={`/api/admin/clients/${summary.client.id}/insights`}
        />
      </Card>
    </div>
  );
}
