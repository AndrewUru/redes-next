import { notFound } from "next/navigation";
import { getClientIdForCurrentUser } from "@/lib/auth";
import { SocialAccountsManager } from "@/components/client/social-accounts-manager";
import { SocialPerformancePanel } from "@/components/client/social-performance-panel";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default async function ClientAccountsPage() {
  const clientId = await getClientIdForCurrentUser();
  if (!clientId) notFound();

  return (
    <div className="page-container">
      <Card>
        <div className="flex flex-col gap-2 lg:max-w-4xl">
          <p className="text-xs font-bold uppercase text-muted-foreground">
            Analítica de cliente
          </p>
          <CardTitle className="text-xl sm:text-2xl">
            Centro de cuentas y analítica
          </CardTitle>
          <CardDescription>
            Conecta perfiles y revisa la evolución de seguidores, likes,
            interacciones y señales de rendimiento en un panel claro.
          </CardDescription>
        </div>
      </Card>
      <SocialAccountsManager />
      <SocialPerformancePanel />
    </div>
  );
}
