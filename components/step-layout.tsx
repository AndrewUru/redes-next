import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function StepLayout({
  title,
  description,
  step,
  total,
  children
}: {
  title: string;
  description: string;
  step: number;
  total: number;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-xl border border-border bg-background p-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Bloque estrategico {step} de {total}
        </p>
        <Progress value={(step / total) * 100} />
      </div>
      <header>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className={cn("text-sm text-muted-foreground")}>{description}</p>
      </header>
      {children}
    </section>
  );
}
