import Link from "next/link";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreateAdminForm } from "@/components/admin/create-admin-form";
import { CreateClientForm } from "@/components/admin/create-client-form";
import { DeleteClientButton } from "@/components/admin/delete-client-button";
import { getAdminClients } from "@/lib/db/server";

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric"
});

export default async function AdminClientsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const clients = await getAdminClients(q);

  return (
    <div className="space-y-4">
      <CreateAdminForm />
      <CreateClientForm />
      <Card>
        <div className="mb-4 space-y-1">
          <CardDescription className="uppercase">
            Buscar cliente o marca
          </CardDescription>
          <form className="flex flex-col gap-2 sm:flex-row">
            <Label htmlFor="client-search" className="sr-only">
              Buscar cliente o marca
            </Label>
            <Input
              id="client-search"
              name="q"
              defaultValue={q ?? ""}
              autoComplete="off"
              placeholder="Busca por marca, cuenta o proyecto…"
              className="bg-white/90"
            />
            <Button type="submit" variant="outline" className="sm:w-auto">
              <Search className="h-4 w-4" aria-hidden />
              Buscar
            </Button>
          </form>
        </div>
        <CardTitle className="mb-1">Pipeline de cuentas</CardTitle>
        <CardDescription className="mb-4">
          Gestiona posicionamiento, estado de onboarding y readiness para
          conversion.
        </CardDescription>
        {clients.length === 0 ? (
          <div className="rounded-[8px] border-2 border-dashed border-border bg-white/60 p-4 text-sm font-medium text-muted-foreground">
            Aún no hay cuentas en pipeline.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[8px] border-2 border-border bg-white/70 p-2">
            <table className="min-w-[640px] w-full text-left text-sm">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="px-2 py-2">Cliente</th>
                  <th className="px-2 py-2">Fase</th>
                  <th className="px-2 py-2">Creado</th>
                  <th className="px-2 py-2">Strategy view</th>
                  <th className="px-2 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr
                    key={client.id}
                    className="group border-b-2 border-black/20 transition-colors duration-150 hover:bg-primary/20"
                  >
                    <td className="px-2 py-3 font-semibold">
                      {client.display_name}
                    </td>
                    <td className="px-2 py-3">
                      <Badge>{client.status}</Badge>
                    </td>
                    <td className="px-2 py-3 font-medium">
                      {dateFormatter.format(new Date(client.created_at))}
                    </td>
                    <td className="px-2 py-3">
                      <Link
                        className="inline-flex rounded-full border-2 border-border bg-muted px-3 py-1 text-xs font-semibold uppercase shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-transform duration-150 group-hover:-translate-y-px"
                        href={`/admin/clients/${client.id}`}
                      >
                        Ver detalle
                      </Link>
                    </td>
                    <td className="px-2 py-3">
                      <DeleteClientButton
                        clientId={client.id}
                        clientName={client.display_name}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
