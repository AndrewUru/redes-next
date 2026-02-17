import { notFound } from "next/navigation";
import { SummaryCard } from "@/components/summary-card";
import { getClientIdForCurrentUser } from "@/lib/auth";
import { getClientSummary } from "@/lib/db/server";
import { createClient } from "@/lib/supabase/server";

export default async function ClientHomePage() {
  const clientId = await getClientIdForCurrentUser();
  if (!clientId) notFound();

  const summary = await getClientSummary(clientId);
  if (!summary.client) notFound();
  const supabase = await createClient();
  const pdfPath = summary.latestBrandbook?.pdf_path ?? null;
  const { data: signed } = pdfPath
    ? await supabase.storage.from("brandbooks").createSignedUrl(pdfPath, 60 * 60)
    : { data: null };
  const brandbookUrl = signed?.signedUrl ?? null;

  return (
    <main className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <SummaryCard title="Fase de crecimiento" value={summary.client.status} />
        <SummaryCard
          title="Onboarding estrategico completado"
          value={`${summary.intake?.completion_pct ?? 0}%`}
        />
        <SummaryCard title="Visual assets listos" value={String(summary.assetsCount)} />
        <SummaryCard
          title="Brandbook activo"
          value={summary.latestBrandbook ? `v${summary.latestBrandbook.version}` : "Sin version"}
        />
      </div>
      {brandbookUrl ? (
        <section className="neo-box flex flex-wrap items-center justify-between gap-3 bg-white/90">
          <div>
            <p className="text-sm font-semibold">Tu brandbook PDF ya esta disponible.</p>
            <p className="text-xs text-muted-foreground">
              Abre la version actual o descargala para compartir con tu equipo.
            </p>
          </div>
          <div className="flex gap-3 text-sm font-semibold">
            <a href={brandbookUrl} target="_blank" rel="noreferrer" className="underline">
              Ver PDF
            </a>
            <a href={brandbookUrl} download className="underline">
              Descargar PDF
            </a>
          </div>
        </section>
      ) : null}
    </main>
  );
}
