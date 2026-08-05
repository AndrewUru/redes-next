import Link from "next/link";
import type { Route } from "next";
import {
  ArrowUpRight,
  CalendarDays,
  Search,
  UserRoundCheck,
  UsersRound
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader, SectionHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { CreateAdminForm } from "@/components/admin/create-admin-form";
import { CreateClientForm } from "@/components/admin/create-client-form";
import { DeleteClientButton } from "@/components/admin/delete-client-button";
import { getAdminClients, getAdminClientsReadiness } from "@/lib/db/server";
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
  lead: "border-primary/20 bg-accent text-accent-foreground",
  onboarding: "border-warning/25 bg-warning/10 text-foreground",
  activo: "border-success/25 bg-success/10 text-foreground",
  pausado: "border-danger/25 bg-danger/10 text-foreground"
};

export default async function AdminClientsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; view?: string }>;
}) {
  const { q, view } = await searchParams;
  const query = q?.trim() ?? "";
  const allowedViews = [
    "all",
    "blocked",
    "ready",
    "onboarding",
    "active"
  ] as const;
  const activeView = allowedViews.includes(
    view as (typeof allowedViews)[number]
  )
    ? (view as (typeof allowedViews)[number])
    : "all";
  const clients = (await getAdminClients(query)) as ClientRow[];
  const readinessByClient = await getAdminClientsReadiness(
    clients.map((client) => client.id)
  );
  const activeClients = clients.filter((client) => client.status === "activo");
  const onboardingClients = clients.filter(
    (client) => client.status === "onboarding"
  );
  const blockedClients = clients.filter(
    (client) => (readinessByClient.get(client.id)?.pendingCount ?? 4) > 1
  );
  const readyClients = clients.filter(
    (client) => readinessByClient.get(client.id)?.pendingCount === 0
  );
  const visibleClients = clients.filter((client) => {
    const readiness = readinessByClient.get(client.id);
    if (activeView === "blocked") return (readiness?.pendingCount ?? 4) > 1;
    if (activeView === "ready") return readiness?.pendingCount === 0;
    if (activeView === "onboarding") return client.status === "onboarding";
    if (activeView === "active") return client.status === "activo";
    return true;
  });
  const viewItems = [
    {
      view: "all",
      href: "/admin/clients",
      label: "Todos",
      count: clients.length
    },
    {
      view: "blocked",
      href: "/admin/clients?view=blocked",
      label: "Bloqueos",
      count: blockedClients.length
    },
    {
      view: "ready",
      href: "/admin/clients?view=ready",
      label: "Listos",
      count: readyClients.length
    },
    {
      view: "onboarding",
      href: "/admin/clients?view=onboarding",
      label: "Onboarding",
      count: onboardingClients.length
    },
    {
      view: "active",
      href: "/admin/clients?view=active",
      label: "Activos",
      count: activeClients.length
    }
  ] as const;

  return (
    <div className="page-container">
      <PageHeader
        eyebrow="Operaciones"
        title="Clientes"
        description="Controla el estado de cada cuenta, detecta bloqueos y mantén el onboarding en movimiento."
      />

      <section
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Resumen de clientes"
      >
        <StatCard
          label="Cuentas totales"
          value={String(clients.length)}
          detail="Clientes visibles con los filtros actuales"
          icon={UsersRound}
        />
        <StatCard
          label="Cuentas activas"
          value={String(activeClients.length)}
          detail="Proyectos actualmente en ejecución"
          icon={UserRoundCheck}
        />
        <StatCard
          label="En onboarding"
          value={String(onboardingClients.length)}
          detail="Pendientes de completar información"
          icon={CalendarDays}
        />
        <StatCard
          label="Con bloqueos"
          value={String(blockedClients.length)}
          detail="Requieren más de una acción"
          icon={ArrowUpRight}
        />
      </section>

      <Card className="space-y-4">
        <SectionHeader
          title="Buscar y filtrar"
          description={`${visibleClients.length} ${visibleClients.length === 1 ? "resultado" : "resultados"}`}
        />
        <form className="flex flex-col gap-2 md:flex-row">
          <Label htmlFor="client-search" className="sr-only">
            Buscar cliente o marca
          </Label>
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
              placeholder="Buscar por marca o contacto…"
              className="pl-9"
            />
          </div>
          {activeView !== "all" ? (
            <input type="hidden" name="view" value={activeView} />
          ) : null}
          <Button type="submit" variant="secondary">
            Buscar
          </Button>
          {query ? (
            <Link
              href="/admin/clients"
              className="inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Limpiar
            </Link>
          ) : null}
        </form>
        <nav
          className="flex gap-2 overflow-x-auto pb-1"
          aria-label="Vistas de clientes"
        >
          {viewItems.map((item) => {
            const isActive = activeView === item.view;
            const href = query
              ? `${item.href}${item.href.includes("?") ? "&" : "?"}q=${encodeURIComponent(query)}`
              : item.href;
            return (
              <Link
                key={item.view}
                href={href as Route}
                aria-current={isActive ? "page" : undefined}
                className={
                  isActive
                    ? "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground"
                    : "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                }
              >
                {item.label}
                <span className="rounded bg-black/5 px-1.5 py-0.5 text-xs tabular-nums dark:bg-white/10">
                  {item.count}
                </span>
              </Link>
            );
          })}
        </nav>
      </Card>

      <section className="space-y-4">
        <SectionHeader
          title="Alta de cuentas"
          description="Crea accesos para clientes o incorpora un nuevo administrador."
        />
        <div className="grid gap-4 xl:grid-cols-2">
          <CreateClientForm />
          <CreateAdminForm />
        </div>
      </section>

      <Card className="space-y-4">
        <SectionHeader
          title="Listado de clientes"
          description="Estado, readiness y acceso a cada espacio de trabajo."
        />
        {visibleClients.length === 0 ? (
          <EmptyState
            title={
              query || activeView !== "all"
                ? "No hay coincidencias"
                : "Aún no hay clientes"
            }
            description={
              query
                ? `No encontramos resultados para “${query}”. Prueba otra búsqueda o limpia los filtros.`
                : "Crea la primera cuenta para activar su onboarding y seguimiento."
            }
            icon={UsersRound}
          />
        ) : (
          <>
            <div className="grid gap-3 md:hidden">
              {visibleClients.map((client) => {
                const readiness = readinessByClient.get(client.id);
                const pendingCount = readiness?.pendingCount ?? 4;
                return (
                  <article
                    key={client.id}
                    className="rounded-lg border border-border bg-surface p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold">
                          {client.display_name}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Creado el{" "}
                          {dateFormatter.format(new Date(client.created_at))}
                        </p>
                      </div>
                      <Badge className={statusStyles[client.status]}>
                        {statusLabels[client.status]}
                      </Badge>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Readiness</span>
                        <span className="font-semibold tabular-nums">
                          {readiness?.completionPct ?? 0}% ·{" "}
                          {pendingCount === 0
                            ? "Listo"
                            : `${pendingCount} pendientes`}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                        <div
                          className={
                            pendingCount === 0
                              ? "h-full rounded-full bg-success"
                              : "h-full rounded-full bg-warning"
                          }
                          style={{ width: `${readiness?.completionPct ?? 0}%` }}
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
                      <Link
                        href={`/admin/clients/${client.id}`}
                        className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground"
                      >
                        Ver detalle
                        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                      <DeleteClientButton
                        clientId={client.id}
                        clientName={client.display_name}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
            <div className="hidden overflow-hidden rounded-lg border border-border md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/60">
                  <tr>
                    <th scope="col">Cliente</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Creado</th>
                    <th scope="col">Readiness</th>
                    <th scope="col">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {visibleClients.map((client) => {
                    const readiness = readinessByClient.get(client.id);
                    const pendingCount = readiness?.pendingCount ?? 4;
                    return (
                      <tr
                        key={client.id}
                        className="transition-colors hover:bg-muted/40"
                      >
                        <td>
                          <p className="font-semibold">{client.display_name}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            ID {client.id.slice(0, 8)}
                          </p>
                        </td>
                        <td>
                          <Badge className={statusStyles[client.status]}>
                            {statusLabels[client.status]}
                          </Badge>
                        </td>
                        <td className="tabular-nums">
                          {dateFormatter.format(new Date(client.created_at))}
                        </td>
                        <td>
                          <div className="min-w-40 space-y-2">
                            <div className="flex justify-between text-xs">
                              <span>
                                {pendingCount === 0
                                  ? "Listo"
                                  : `${pendingCount} pendientes`}
                              </span>
                              <span className="font-semibold tabular-nums">
                                {readiness?.completionPct ?? 0}%
                              </span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                              <div
                                className={
                                  pendingCount === 0
                                    ? "h-full rounded-full bg-success"
                                    : "h-full rounded-full bg-warning"
                                }
                                style={{
                                  width: `${readiness?.completionPct ?? 0}%`
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="flex justify-end gap-2">
                            <Link
                              href={`/admin/clients/${client.id}`}
                              className="inline-flex min-h-9 items-center gap-1 rounded-lg px-3 text-sm font-semibold text-primary hover:bg-accent"
                            >
                              Ver detalle
                              <ArrowUpRight
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                            </Link>
                            <DeleteClientButton
                              clientId={client.id}
                              clientName={client.display_name}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
