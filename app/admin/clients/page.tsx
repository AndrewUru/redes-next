import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CreateClientForm } from "@/components/admin/create-client-form";
import { getAdminClients } from "@/lib/db/server";

export default async function AdminClientsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const clients = await getAdminClients(q);

  return (
    <main className="space-y-4">
      <CreateClientForm />
      <Card>
        <div className="mb-4 space-y-1">
          <CardDescription className="uppercase tracking-[0.14em]">
            Buscar cliente o marca
          </CardDescription>
          <form>
            <Input
              name="q"
              defaultValue={q ?? ""}
              placeholder="Busca por marca, cuenta o proyecto..."
              className="bg-white/90"
            />
          </form>
        </div>
        <CardTitle className="mb-1">Pipeline de cuentas</CardTitle>
        <CardDescription className="mb-4">
          Gestiona posicionamiento, estado de onboarding y readiness para conversion.
        </CardDescription>
        {clients.length === 0 ? (
          <p className="text-sm font-medium text-muted-foreground">
            Aun no hay cuentas en pipeline.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border-2 border-border bg-white/70 p-2">
            <table className="min-w-[640px] w-full text-left text-sm">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="px-2 py-2">Cliente</th>
                  <th className="px-2 py-2">Fase</th>
                  <th className="px-2 py-2">Creado</th>
                  <th className="px-2 py-2">Strategy view</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr
                    key={client.id}
                    className="group border-b-2 border-black/20 transition-colors duration-150 hover:bg-primary/20"
                  >
                    <td className="px-2 py-3 font-semibold">{client.display_name}</td>
                    <td className="px-2 py-3">
                      <Badge>{client.status}</Badge>
                    </td>
                    <td className="px-2 py-3 font-medium">
                      {new Date(client.created_at).toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-2 py-3">
                      <Link
                        className="inline-flex rounded-full border-2 border-border bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wider shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-transform duration-150 group-hover:-translate-y-px"
                        href={`/admin/clients/${client.id}`}
                      >
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </main>
  );
}
