import { notFound } from "next/navigation";
import { getClientIdForCurrentUser } from "@/lib/auth";
import { SocialAccountsManager } from "@/components/client/social-accounts-manager";
import { SocialPerformancePanel } from "@/components/client/social-performance-panel";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default async function ClientAccountsPage() {
  const clientId = await getClientIdForCurrentUser();
  if (!clientId) notFound();

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-border/80 bg-surface/95 shadow-[0_20px_60px_hsl(222_47%_11%/0.06)]">
        <div className="flex flex-col gap-2 lg:max-w-4xl">
          <p className="text-xs font-bold uppercase text-muted-foreground">
            Analitica de cliente
          </p>
          <CardTitle className="text-2xl">
            Centro de cuentas y anal�tica
          </CardTitle>
          <CardDescription>
            Conecta perfiles y revisa la evoluci�n de seguidores, likes,
            interacciones y se�ales de rendimiento en un panel claro.
          </CardDescription>
        </div>
      </Card>
      <SocialAccountsManager />
      <SocialPerformancePanel />
    </div>
  );
}
