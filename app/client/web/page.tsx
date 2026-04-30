import { notFound } from "next/navigation";
import { getClientIdForCurrentUser } from "@/lib/auth";
import { getClientSummary } from "@/lib/db/server";
import { WebProjectOverview } from "@/components/web-project/web-project-cards";

export default async function ClientWebProjectPage() {
  const clientId = await getClientIdForCurrentUser();
  if (!clientId) notFound();

  const summary = await getClientSummary(clientId);
  if (!summary.client) notFound();

  return (
    <WebProjectOverview
      assetsCount={summary.assetsCount}
      brandbooksCount={summary.brandbooks.length}
      intakeCompletionPct={summary.intake?.completion_pct ?? 0}
    />
  );
}
