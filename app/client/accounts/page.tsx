import { notFound } from "next/navigation";
import { getClientIdForCurrentUser } from "@/lib/auth";
import { SocialAccountsManager } from "@/components/client/social-accounts-manager";
import { SocialPerformancePanel } from "@/components/client/social-performance-panel";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default async function ClientAccountsPage() {
  const clientId = await getClientIdForCurrentUser();
  if (!clientId) notFound();

  return (
    <main className="space-y-4">
      <Card className="space-y-2 bg-white/90">
        <CardTitle>Aviso sobre vinculación con Meta</CardTitle>
        <CardDescription>
          Actualmente Meta todavía no nos ha aprobado la vinculación automática de cuentas para esta
          app. Por seguridad, este proceso se está realizando manualmente con cada cliente que nos
          autoriza la gestión de sus cuentas. Estamos trabajando para dejar la experiencia lo más
          funcional y automatizada posible dentro de las políticas de Meta.
        </CardDescription>
      </Card>
      <SocialAccountsManager />
      <SocialPerformancePanel />
    </main>
  );
}
