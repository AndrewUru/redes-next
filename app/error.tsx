"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-lg items-center justify-center px-4 py-12">
      <section
        className="w-full rounded-xl border border-danger/25 bg-surface p-6 text-center shadow-sm"
        role="alert"
      >
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-danger/10 text-danger">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-xl font-semibold">
          No pudimos cargar esta vista
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Vuelve a intentarlo. Si el problema continúa, regresa al panel y
          comprueba tu conexión.
        </p>
        <Button className="mt-5" onClick={reset}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          Reintentar
        </Button>
      </section>
    </div>
  );
}
