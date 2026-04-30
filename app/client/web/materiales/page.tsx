import { notFound } from "next/navigation";
import { getClientIdForCurrentUser } from "@/lib/auth";
import { AssetsManager } from "@/components/client/assets-manager";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default async function ClientWebMaterialsPage() {
  const clientId = await getClientIdForCurrentUser();
  if (!clientId) notFound();

  return (
    <div className="space-y-4">
      <Card className="bg-white/90">
        <CardDescription className="uppercase">Materiales web</CardDescription>
        <CardTitle className="mt-1">
          Archivos para construir tu pagina
        </CardTitle>
        <p className="mt-2 max-w-3xl text-sm font-medium text-muted-foreground">
          Sube logo, fotos, ejemplos visuales y referencias. Usaremos estos
          materiales para definir diseno, secciones y contenido de la web.
        </p>
      </Card>
      <AssetsManager clientId={clientId} />
    </div>
  );
}
