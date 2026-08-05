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
    <section className="space-y-5 rounded-xl border border-border bg-surface p-4 shadow-xs sm:p-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Bloque estratégico {step} de {total}
        </p>
        <Progress value={(step / total) * 100} />
      </div>
      <header>
        <h2 className="text-xl font-semibold leading-tight sm:text-2xl">
          {title}
        </h2>
        <p className={cn("mt-1 text-sm leading-relaxed text-muted-foreground")}>
          {description}
        </p>
      </header>
      {children}
    </section>
  );
}
