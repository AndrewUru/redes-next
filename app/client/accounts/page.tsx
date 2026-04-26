import { notFound } from "next/navigation";
import { getClientIdForCurrentUser } from "@/lib/auth";
import { SocialAccountsManager } from "@/components/client/social-accounts-manager";
import { SocialPerformancePanel } from "@/components/client/social-performance-panel";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default async function ClientAccountsPage() {
  const clientId = await getClientIdForCurrentUser();
  if (!clientId) notFound();

  return (
    <main className="space-y-6">
      <Card className="space-y-2 bg-white/90">
        <CardTitle>Centro de cuentas y analítica</CardTitle>
        <CardDescription>
          Desde aquí puedes conectar perfiles y revisar un análisis visual de la
          evolución de seguidores, likes, interacciones y señales de
          rendimiento.
        </CardDescription>
      </Card>
      <SocialAccountsManager />
      <SocialPerformancePanel />
    </main>
  );
}
