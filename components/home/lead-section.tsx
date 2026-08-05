import { Badge } from "@/components/ui/badge";
import { LeadForm } from "./lead-form";

export function LeadSection() {
  return (
    <section
      id="solicitud"
      className="grid scroll-mt-24 gap-8 rounded-3xl border border-border bg-surface p-5 shadow-sm sm:p-8 lg:grid-cols-[0.85fr_1.15fr]"
    >
      <div className="space-y-4">
        <Badge>Primer paso</Badge>
        <h2 className="text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
          Cuéntame tu proyecto
        </h2>
        <p className="leading-7 text-muted-foreground">
          Completa tus datos y reviso cómo podríamos ordenar tu estrategia, tus
          contenidos y tu seguimiento dentro del dashboard.
        </p>
      </div>

      <LeadForm />
    </section>
  );
}
