import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stepper({
  steps,
  currentStep,
  className
}: {
  steps: readonly string[];
  currentStep: number;
  className?: string;
}) {
  const progress = ((currentStep + 1) / steps.length) * 100;
  return (
    <div
      className={cn("space-y-3", className)}
      aria-label={`Paso ${currentStep + 1} de ${steps.length}: ${steps[currentStep]}`}
    >
      <div className="flex items-center justify-between gap-4 text-sm">
        <div className="min-w-0">
          <span className="font-semibold">
            Paso {currentStep + 1} de {steps.length}
          </span>
          <span className="ml-2 text-muted-foreground">
            {steps[currentStep]}
          </span>
        </div>
        <span className="shrink-0 font-semibold tabular-nums text-muted-foreground">
          {Math.round(progress)}%
        </span>
      </div>
      <div
        className="h-1.5 overflow-hidden rounded-full bg-secondary"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuenow={currentStep + 1}
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>
      <ol className="hidden grid-cols-10 gap-2 lg:grid" aria-hidden="true">
        {steps.map((step, index) => (
          <li key={step} className="flex min-w-0 items-center">
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px]",
                index < currentStep
                  ? "border-success bg-success text-success-foreground"
                  : index === currentStep
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface text-muted-foreground"
              )}
            >
              {index < currentStep ? (
                <Check className="h-3 w-3" aria-hidden="true" />
              ) : (
                index + 1
              )}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function AutosaveStatus({
  saving,
  completion,
  submitted
}: {
  saving: boolean;
  completion: number;
  submitted: boolean;
}) {
  return (
    <div
      className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground"
      aria-live="polite"
    >
      <span className="inline-flex items-center gap-1.5">
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            saving ? "animate-pulse bg-warning" : "bg-success"
          )}
          aria-hidden="true"
        />
        {saving ? "Guardando cambios…" : "Todos los cambios guardados"}
      </span>
      <span className="tabular-nums">{completion}% completado</span>
      <span>{submitted ? "Enviado" : "Borrador recuperable"}</span>
    </div>
  );
}
