import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminClientsLoading() {
  return (
    <div className="space-y-5" role="status" aria-label="Cargando clientes">
      <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="bg-[#fef3c7]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="w-full max-w-2xl space-y-3">
              <Skeleton className="h-4 w-40 bg-amber-200/80" />
              <Skeleton className="h-10 w-full max-w-md bg-amber-200/80" />
              <Skeleton className="h-5 w-full max-w-xl bg-amber-200/70" />
              <Skeleton className="h-5 w-2/3 bg-amber-200/70" />
            </div>
            <div className="flex w-full gap-2 lg:max-w-md">
              <Skeleton className="h-11 flex-1 bg-white/80" />
              <Skeleton className="h-11 w-24 bg-white/80" />
            </div>
          </div>
        </Card>

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          {["bg-white/80", "bg-[#dcfce7]", "bg-[#dbeafe]"].map((className) => (
            <div
              key={className}
              className={`${className} rounded-[8px] border-2 border-border p-4 shadow-[4px_5px_0_0_rgba(0,0,0,1)]`}
            >
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-3 h-9 w-16" />
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-36" />
        </Card>
        <Card className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-36" />
        </Card>
      </div>

      <Card>
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
          <Skeleton className="h-10 w-56" />
        </div>
        <div className="overflow-hidden rounded-[8px] border-2 border-border bg-white/75">
          <div className="grid min-w-[640px] grid-cols-[1.4fr_0.8fr_0.8fr_1fr_0.8fr] gap-0 border-b-2 border-border bg-muted px-4 py-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-4 w-20" />
            ))}
          </div>
          <div className="divide-y-2 divide-black/10">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="grid min-w-[640px] grid-cols-[1.4fr_0.8fr_0.8fr_1fr_0.8fr] items-center gap-0 px-4 py-4"
              >
                <div className="space-y-2">
                  <Skeleton className="h-5 w-44" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-7 w-24" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-9 w-28" />
                <Skeleton className="h-9 w-20" />
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
