import { CheckCircle2, LockKeyhole, Sparkles } from "lucide-react";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-11rem)] w-full max-w-5xl items-center py-8 sm:py-12">
      <section className="grid w-full gap-8 lg:grid-cols-[1fr_26rem] lg:items-center">
        <div className="max-w-xl space-y-6">
          <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium text-muted-foreground shadow-xs">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Tu proyecto, organizado desde el primer día
          </span>
          <div>
            <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
              Crea tu espacio privado.
            </h1>
            <p className="mt-3 text-base leading-7 text-muted-foreground">
              Centraliza el onboarding, los materiales, las métricas y cada
              entrega de tu proyecto.
            </p>
          </div>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-3">
              <CheckCircle2
                className="h-4 w-4 text-success"
                aria-hidden="true"
              />
              Guarda el avance y retómalo cuando quieras.
            </li>
            <li className="flex items-center gap-3">
              <LockKeyhole
                className="h-4 w-4 text-primary"
                aria-hidden="true"
              />
              Acceso protegido y datos separados por cliente.
            </li>
          </ul>
        </div>
        <SignupForm />
      </section>
    </div>
  );
}
