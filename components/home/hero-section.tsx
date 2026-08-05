import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DashboardPreview } from "./dashboard-preview";

export function HeroSection() {
  return (
    <section className="grid min-h-[calc(100dvh-11rem)] gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
      <div className="space-y-7">
        <Badge>Dashboard privado para marcas en crecimiento</Badge>
        <div className="space-y-5">
          <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.03em] sm:text-6xl lg:text-7xl">
            Estrategia de contenido con orden, foco y seguimiento.
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

      <DashboardPreview />
    </section>
  );
}
