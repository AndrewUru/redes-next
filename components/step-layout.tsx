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
    <section className="space-y-4 rounded-[8px] border-2 border-border bg-background p-4 shadow-[5px_6px_0_0_rgba(0,0,0,1)] sm:p-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-muted-foreground">
          Bloque estratégico {step} de {total}
        </p>
        <Progress value={(step / total) * 100} />
      </div>
      <header>
        <h2 className="text-2xl font-black leading-tight">{title}</h2>
        <p className={cn("mt-1 text-sm leading-relaxed text-muted-foreground")}>
          {description}
        </p>
      </header>
      {children}
    </section>
  );
}
