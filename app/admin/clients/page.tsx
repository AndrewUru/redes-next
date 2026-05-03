import Link from "next/link";
import { ArrowUpRight, CalendarDays, Search, UsersRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreateAdminForm } from "@/components/admin/create-admin-form";
import { CreateClientForm } from "@/components/admin/create-client-form";
import { DeleteClientButton } from "@/components/admin/delete-client-button";
import { getAdminClients } from "@/lib/db/server";
import type { ClientRow, ClientStatus } from "@/lib/db/types";

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric"
});

const statusLabels: Record<ClientStatus, string> = {
  lead: "Lead",
  onboarding: "Onboarding",
  activo: "Activo",
  pausado: "Pausado"
};

const statusStyles: Record<ClientStatus, string> = {
  lead: "bg-[#bfdbfe]",
  onboarding: "bg-[#fde68a]",
  activo: "bg-[#bbf7d0]",
  pausado: "bg-[#fecaca]"
};

export default async function AdminClientsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const clients = (await getAdminClients(query)) as ClientRow[];
  const activeClients = clients.filter((client) => client.status === "activo");
  const onboardingClients = clients.filter(
    (client) => client.status === "onboarding"
  );
  const latestClient = clients[0];

  return (
    <div className="space-y-5">
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="bg-[#fef3c7]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <CardDescription className="uppercase tracking-[0.08em]">
                Operación comercial
              </CardDescription>
              <h2 className="mt-2 text-3xl font-black leading-tight text-pretty sm:text-4xl">
                Pipeline de cuentas
              </h2>
              <p className="mt-3 max-w-xl text-sm font-medium leading-relaxed text-muted-foreground sm:text-base">
                Prioriza onboarding, readiness y seguimiento de cada marca
                desde una vista rápida.
              </p>
            </div>
            <form className="w-full lg:max-w-md">
              <Label htmlFor="client-search" className="sr-only">
                Buscar cliente o marca
              </Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative min-w-0 flex-1">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <Input
                    id="client-search"
                    name="q"
                    defaultValue={query}
                    autoComplete="off"
                    placeholder="Ej. Estudio Norte…"
                    className="bg-white/95 pl-9"
                  />
                </div>
                <Button type="submit" variant="outline" className="sm:w-auto">
                  Buscar
                </Button>
              </div>
              {query ? (
                <Link
                  href="/admin/clients"
                  className="mt-2 inline-flex text-sm font-semibold underline decoration-2 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  Limpiar búsqueda
                </Link>
              ) : null}
            </form>
          </div>
        </Card>

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          <div className="rounded-[8px] border-2 border-border bg-white/80 p-4 shadow-[4px_5px_0_0_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <UsersRound className="h-4 w-4" aria-hidden="true" />
              Cuentas
            </div>
            <p className="mt-2 text-3xl font-black tabular-nums">
              {clients.length}
            </p>
          </div>
          <div className="rounded-[8px] border-2 border-border bg-[#dcfce7] p-4 shadow-[4px_5px_0_0_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              Activas
            </div>
            <p className="mt-2 text-3xl font-black tabular-nums">
              {activeClients.length}
            </p>
          </div>
          <div className="rounded-[8px] border-2 border-border bg-[#dbeafe] p-4 shadow-[4px_5px_0_0_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              Onboarding
            </div>
            <p className="mt-2 text-3xl font-black tabular-nums">
              {onboardingClients.length}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <CreateAdminForm />
        <CreateClientForm />
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <CardTitle>Listado de clientes</CardTitle>
            <CardDescription className="mt-1">
              Gestiona posicionamiento, estado de onboarding y readiness para
              conversión.
            </CardDescription>
          </div>
          {latestClient ? (
            <p className="rounded-[8px] border-2 border-border bg-muted px-3 py-2 text-xs font-semibold">
              Última alta:{" "}
              <span className="font-black">{latestClient.display_name}</span>
            </p>
          ) : null}
        </div>
        {clients.length === 0 ? (
          <div className="rounded-[8px] border-2 border-dashed border-border bg-white/70 p-6 text-sm font-medium text-muted-foreground">
            <p className="text-base font-black text-foreground">
              {query ? "Sin resultados" : "Aún no hay cuentas en pipeline"}
            </p>
            <p className="mt-1 max-w-xl">
              {query
                ? `No hay coincidencias para "${query}". Prueba con el nombre de marca o limpia la búsqueda.`
                : "Crea la primera cuenta de cliente para activar su onboarding y seguimiento."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[8px] border-2 border-border bg-white/75">
            <table className="min-w-[640px] w-full text-left text-sm">
              <thead className="border-b-2 border-border bg-muted text-muted-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3">
                    Cliente
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Fase
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Creado
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Strategy View
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black/10">
                {clients.map((client) => (
                  <tr
                    key={client.id}
                    className="group transition-colors duration-150 hover:bg-primary/15"
                  >
                    <td className="max-w-[280px] px-4 py-4">
                      <p
                        className="truncate font-black"
                        title={client.display_name}
                      >
                        {client.display_name}
                      </p>
                      <p className="mt-1 text-xs font-medium text-muted-foreground">
                        ID: <span translate="no">{client.id.slice(0, 8)}</span>
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <Badge className={statusStyles[client.status]}>
                        {statusLabels[client.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 font-semibold tabular-nums">
                      {dateFormatter.format(new Date(client.created_at))}
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        className="inline-flex min-h-9 items-center justify-center gap-2 rounded-[8px] border-2 border-border bg-muted px-3 py-1.5 text-xs font-black uppercase shadow-[2px_3px_0_0_rgba(0,0,0,1)] transition-[background-color,box-shadow,transform] duration-150 hover:translate-y-[1px] hover:bg-white hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        href={`/admin/clients/${client.id}`}
                      >
                        Ver detalle
                        <ArrowUpRight
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                      </Link>
                    </td>
                    <td className="px-4 py-4">
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
