import { notFound } from "next/navigation";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GenerateBrandbookButton } from "@/components/admin/generate-brandbook-button";
import { ClientSettingsForm } from "@/components/admin/client-settings-form";
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
  const pdfPath = summary.latestBrandbook?.pdf_path ?? null;
  const { data: signed } = pdfPath
    ? await supabase.storage.from("brandbooks").createSignedUrl(pdfPath, 60 * 60)
    : { data: null };
  const brandbookUrl = signed?.signedUrl ?? null;

  return (
    <main className="space-y-4">
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
            {summary.intake?.status ?? "sin draft"} ({summary.intake?.completion_pct ?? 0}%)
          </CardTitle>
        </Card>
        <Card>
          <CardDescription>Visual identity assets</CardDescription>
          <CardTitle className="mt-2">{String(summary.assetsCount)}</CardTitle>
        </Card>
        <Card>
          <CardDescription>Brandbook narrativo</CardDescription>
          <CardTitle className="mt-2">
            {summary.latestBrandbook ? `v${summary.latestBrandbook.version}` : "sin version"}
          </CardTitle>
          {brandbookUrl ? (
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
              <a href={brandbookUrl} target="_blank" rel="noreferrer" className="underline">
                Ver PDF
              </a>
              <a href={brandbookUrl} download className="underline">
                Descargar PDF
              </a>
            </div>
          ) : null}
        </Card>
      </div>
    </main>
  );
}
