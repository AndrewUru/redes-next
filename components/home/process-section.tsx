import { Badge } from "@/components/ui/badge";
import { timeline } from "./content";

export function ProcessSection() {
  return (
    <section className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
      <div className="space-y-4">
        <Badge>Cómo trabajamos</Badge>
        <h2 className="max-w-xl text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
          Menos improvisación. Más sistema.
        </h2>
        <p className="max-w-xl leading-7 text-muted-foreground">
          Cada proyecto entra en un flujo simple: entender tu marca, ordenar los
          materiales, definir dirección y medir lo que pasa después.
        </p>
      </div>
      <div className="grid gap-3">
        {timeline.map((step, index) => (
          <div
            key={step}
            className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm"
          >
            <span className="text-sm font-semibold text-muted-foreground tabular-nums">
              0{index + 1}
            </span>
            <p className="font-medium">{step}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
