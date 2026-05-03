"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileText,
  FolderOpen,
  LineChart,
  MessageSquare,
  Target
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const metrics = [
  { label: "Plan activo", value: "74%" },
  { label: "Ideas listas", value: "28" },
  { label: "Materiales", value: "16" }
] as const;

const modules = [
  {
    title: "Estrategia",
    description: "Mensaje, pilares y posicionamiento en una sola vista.",
    icon: Target
  },
  {
    title: "Materiales",
    description: "Archivos, referencias y notas organizadas por proyecto.",
    icon: FolderOpen
  },
  {
    title: "Seguimiento",
    description: "Próximos pasos, avances y decisiones siempre visibles.",
    icon: LineChart
  }
] as const;

const timeline = [
  "Diagnóstico inicial",
  "Dirección estratégica",
  "Materiales y briefing",
  "Plan de contenido",
  "Medición y ajustes"
] as const;

type FormState = { ok: true; id: string } | { ok: false; error: string } | null;

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FormState>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const form = new FormData(event.currentTarget);
      const payload = Object.fromEntries(form.entries());

      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const json = (await response.json()) as { id?: string; error?: string };

      if (!response.ok || !json.id) {
        setResult({
          ok: false,
          error:
            json.error ??
            "No se pudo enviar el formulario. Revisa los campos e inténtalo de nuevo."
        });
        return;
      }

      setResult({ ok: true, id: json.id });
      event.currentTarget.reset();
    } catch {
      setResult({
        ok: false,
        error:
          "No se pudo enviar el formulario. Comprueba tu conexión e inténtalo de nuevo."
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-20 py-6 sm:py-10">
      <section className="grid min-h-[calc(100dvh-11rem)] gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="space-y-7">
          <Badge>Dashboard privado para marcas en crecimiento</Badge>
          <div className="space-y-5">
            <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.03em] sm:text-6xl lg:text-7xl">
              Estrategia de contenido con orden, foco y seguimiento.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
              ElSaltoWeb reúne briefing, materiales, dirección de marca y
              métricas para convertir tus redes en un sistema de trabajo claro.
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

        <Card className="overflow-hidden p-0">
          <div className="border-b border-border p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Vista del sistema
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Panel de crecimiento
                </h2>
              </div>
              <Badge className="bg-white">Activo</Badge>
            </div>
          </div>
          <div className="space-y-6 p-5 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-3">
              {metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-border bg-muted/45 p-4"
                >
                  <p className="text-sm text-muted-foreground">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-3xl font-semibold tabular-nums">
                    {metric.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-2xl border border-border p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="font-semibold">Ruta del proyecto</p>
                  <FileText className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                </div>
                <div className="space-y-3">
                  {timeline.map((step, index) => (
                    <div key={step} className="flex items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                        {index + 1}
                      </span>
                      <p className="text-sm text-muted-foreground">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="font-semibold">Actividad reciente</p>
                  <MessageSquare
                    className="h-5 w-5 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
                <div className="space-y-3">
                  {[
                    "Brief actualizado",
                    "Material visual recibido",
                    "Próximo bloque definido"
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-xl bg-muted/55 p-3"
                    >
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      <p className="text-sm font-medium">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon;

          return (
            <Card key={module.title}>
              <Icon className="mb-5 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <CardTitle>{module.title}</CardTitle>
              <CardDescription className="mt-2">
                {module.description}
              </CardDescription>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div className="space-y-4">
          <Badge>Cómo trabajamos</Badge>
          <h2 className="max-w-xl text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
            Menos improvisación. Más sistema.
          </h2>
          <p className="max-w-xl leading-7 text-muted-foreground">
            Cada proyecto entra en un flujo simple: entender tu marca, ordenar
            los materiales, definir dirección y medir lo que pasa después.
          </p>
        </div>
        <div className="grid gap-3">
          {timeline.map((step, index) => (
            <div
              key={step}
              className="flex items-center gap-4 rounded-2xl border border-border bg-white p-4"
            >
              <span className="text-sm font-semibold text-muted-foreground tabular-nums">
                0{index + 1}
              </span>
              <p className="font-medium">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="solicitud"
        className="grid scroll-mt-24 gap-8 rounded-3xl border border-border bg-white p-5 shadow-sm sm:p-8 lg:grid-cols-[0.85fr_1.15fr]"
      >
        <div className="space-y-4">
          <Badge>Primer paso</Badge>
          <h2 className="text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
            Cuéntame tu proyecto
          </h2>
          <p className="leading-7 text-muted-foreground">
            Completa tus datos y reviso cómo podríamos ordenar tu estrategia,
            tus contenidos y tu seguimiento dentro del dashboard.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nombre *</Label>
              <Input
                id="full_name"
                name="full_name"
                autoComplete="name"
                required
                placeholder="Ej. Ana García"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                spellCheck={false}
                required
                placeholder="Ej. ana@proyecto.com"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company">Empresa / proyecto</Label>
              <Input
                id="company"
                name="company"
                autoComplete="organization"
                placeholder="Ej. Estudio Norte"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="Ej. +34 600 000 000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Qué necesitas exactamente *</Label>
            <Textarea
              id="message"
              name="message"
              required
              rows={5}
              placeholder="Cuéntame qué haces, qué publicas ahora y qué te gustaría mejorar."
            />
          </div>

          <input
            name="website"
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />

          <Button disabled={loading} className="w-full sm:w-auto">
            {loading ? "Enviando…" : "Enviar solicitud"}
          </Button>

          <div aria-live="polite">
            {result?.ok === true ? (
              <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                He recibido tu solicitud. Te escribiré pronto con los
                siguientes pasos. Ref: {result.id}
              </p>
            ) : null}
            {result?.ok === false ? (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800">
                {result.error}
              </p>
            ) : null}
          </div>
        </form>
      </section>

      <section className="flex flex-col items-start justify-between gap-4 rounded-3xl bg-primary p-6 text-primary-foreground sm:flex-row sm:items-center sm:p-8">
        <div>
          <h2 className="text-2xl font-semibold">
            ¿Ya tienes acceso privado?
          </h2>
          <p className="mt-1 text-sm text-primary-foreground/70">
            Entra para revisar briefing, materiales, guías y métricas.
          </p>
        </div>
        <Link
          href="/login"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "border-white/20 bg-white text-foreground hover:bg-white/90"
          )}
        >
          Entrar al dashboard
          <BarChart3 className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
