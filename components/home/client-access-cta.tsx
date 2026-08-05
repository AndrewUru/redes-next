import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export function ClientAccessCta() {
  return (
    <section className="flex flex-col items-start justify-between gap-4 rounded-3xl bg-primary p-6 text-primary-foreground sm:flex-row sm:items-center sm:p-8">
      <div>
        <h2 className="text-2xl font-semibold">¿Ya tienes acceso privado?</h2>
        <p className="mt-1 text-sm text-primary-foreground/70">
          Entra para revisar briefing, materiales, guías y métricas.
        </p>
      </div>
      <Link
        href="/login"
        className={cn(
          buttonVariants({ variant: "outline" }),
          "border-border bg-surface text-foreground hover:bg-muted"
        )}
      >
        Entrar al dashboard
        <BarChart3 className="h-4 w-4" aria-hidden="true" />
      </Link>
    </section>
  );
}
