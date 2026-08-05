import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminClientsLoading() {
  return (
    <div
      className="page-container"
      role="status"
      aria-label="Cargando clientes"
    >
      <header className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-full max-w-xl" />
      </header>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-40 max-w-full" />
          </Card>
        ))}
      </section>
      <Card className="space-y-4">
        <Skeleton className="h-5 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-11 flex-1" />
          <Skeleton className="h-11 w-24" />
        </div>
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-24 shrink-0" />
          ))}
        </div>
      </Card>
      <Card className="space-y-4">
        <Skeleton className="h-5 w-44" />
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-[1.4fr_0.7fr_0.8fr_1fr] items-center gap-4 border-t border-border py-4 first:border-0"
          >
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </Card>
      <span className="sr-only">Cargando…</span>
    </div>
  );
}
