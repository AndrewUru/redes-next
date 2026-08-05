import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { SkyOrb } from "./sky-orb";

export function HeroSection() {
  return (
    <section className="relative isolate grid min-h-[calc(100dvh-11rem)] overflow-hidden rounded-3xl border border-border bg-surface px-5 py-10 shadow-sm sm:px-8 sm:py-14 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-8 lg:px-12">
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_82%_45%,hsl(var(--primary)/0.12),transparent_38%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 space-y-7">
        <Badge className="bg-background/80 backdrop-blur-sm">
          Dashboard privado para marcas en crecimiento
        </Badge>
        <div className="space-y-5">
          <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.035em] sm:text-5xl lg:text-6xl xl:text-7xl">
            Estrategia de contenido con{" "}
            <span className="text-primary">orden, foco</span> y seguimiento.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
            ElSaltoWeb reúne briefing, materiales, dirección de marca y métricas
            para convertir tus redes en un sistema de trabajo claro.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href="#solicitud"
            className={cn(buttonVariants(), "min-h-12 w-full sm:w-auto")}
          >
            Solicitar propuesta
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "min-h-12 w-full sm:w-auto"
            )}
          >
            Acceso cliente
          </Link>
        </div>
      </div>

      <div className="relative mt-10 min-w-0 lg:mt-0">
        <SkyOrb />
      </div>
    </section>
  );
}
