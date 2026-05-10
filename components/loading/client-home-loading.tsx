import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ClientHomeLoading() {
  return (
    <div
      className="mx-auto w-full max-w-7xl space-y-6"
      role="status"
      aria-label="Cargando panel de cliente"
    >
      <section className="grid gap-6 lg:grid-cols-[1fr_0.36fr]">
        <Card className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="w-full max-w-2xl space-y-3">
              <Skeleton className="h-7 w-36" />
              <Skeleton className="h-12 w-full max-w-md" />
              <Skeleton className="h-5 w-full max-w-xl" />
              <Skeleton className="h-5 w-2/3" />
            </div>
            <Skeleton className="h-16 w-40" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-4 w-10" />
            </div>
            <Skeleton className="h-3 w-full rounded-full" />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Skeleton className="h-11 w-full sm:w-40" />
            <Skeleton className="h-11 w-full sm:w-40" />
            <Skeleton className="h-11 w-full sm:w-36" />
          </div>
        </Card>

        <Card className="space-y-4">
          <Skeleton className="h-4 w-24" />
          <div className="space-y-4">
            <div>
              <Skeleton className="h-9 w-20" />
              <Skeleton className="mt-2 h-4 w-32" />
            </div>
            <div className="border-t border-border pt-3">
              <Skeleton className="h-9 w-16" />
              <Skeleton className="mt-2 h-4 w-36" />
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-border bg-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-4 w-4" />
            </div>
            <Skeleton className="mt-5 h-4 w-24" />
            <Skeleton className="mt-2 h-8 w-28" />
            <Skeleton className="mt-3 h-4 w-full" />
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.72fr_0.28fr]">
        <Card className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-72 max-w-full" />
            </div>
            <Skeleton className="h-5 w-5" />
          </div>
          <div className="divide-y divide-border rounded-2xl border border-border">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex gap-4 p-4">
                <Skeleton className="h-5 w-6" />
                <Skeleton className="h-5 flex-1" />
              </div>
            ))}
          </div>
        </Card>

        <Card className="space-y-4">
          <Skeleton className="h-6 w-32" />
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex justify-between gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </Card>
      </section>
    </div>
  );
}
