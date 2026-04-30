"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  FileText,
  FolderOpen,
  LineChart,
  MessageSquare,
  Sparkles,
  Target,
  UploadCloud,
  Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const dashboardStats = [
  { label: "Avance del plan", value: "74%", detail: "Estrategia en marcha" },
  { label: "Ideas listas", value: "28", detail: "Publicaciones priorizadas" },
  { label: "Materiales", value: "16", detail: "Archivos organizados" }
] as const;

const platformModules = [
  {
    title: "Estrategia clara",
    description:
      "Mensaje, posicionamiento y objetivos visibles desde el primer día.",
    icon: Target,
    tone: "bg-[#f7a9c9]"
  },
  {
    title: "Calendario útil",
    description:
      "Ideas ordenadas por prioridad para publicar con intención, no por inercia.",
    icon: CalendarCheck,
    tone: "bg-[#f2d048]"
  },
  {
    title: "Materiales reunidos",
    description:
      "Referencias, archivos y notas del proyecto en un espacio privado.",
    icon: FolderOpen,
    tone: "bg-[#a8e6df]"
  },
  {
    title: "Seguimiento real",
    description:
      "Estado del trabajo, próximos pasos y avances sin conversaciones perdidas.",
    icon: LineChart,
    tone: "bg-[#c7b7ef]"
  }
] as const;

const activityItems = [
  {
    title: "Base de marca actualizada",
    detail: "Tono, pilares y enfoque editorial revisados.",
    icon: FileText
  },
  {
    title: "Material recibido",
    detail: "Nuevas fotos y referencias añadidas al espacio privado.",
    icon: UploadCloud
  },
  {
    title: "Próximo bloque definido",
    detail: "Contenido de conversión preparado para validación.",
    icon: CheckCircle2
  }
] as const;

const workflowSteps = [
  "Diagnóstico inicial",
  "Propuesta de dirección",
  "Organización de material",
  "Plan de contenido",
  "Seguimiento y ajustes"
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
    <div className="min-h-screen">
      <section className="mx-auto max-w-6xl space-y-12 px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
        <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div className="space-y-5">
            <Badge className="bg-white/90">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Dashboard privado para crecer con orden
            </Badge>

            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl sm:text-5xl lg:text-6xl">
                Tu estrategia de contenido, organizada como una plataforma de
                trabajo
              </h1>
              <p className="max-w-2xl text-base font-medium leading-relaxed text-muted-foreground sm:text-lg">
                Definimos qué comunicar, ordenamos tus ideas y convertimos tu
                presencia en redes en un sistema claro, constante y medible.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="#solicitud"
                className={cn(buttonVariants(), "w-full sm:w-auto")}
              >
                Solicitar propuesta
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full sm:w-auto"
                )}
              >
                Ver acceso cliente
              </Link>
            </div>
          </div>

          <div className="neo-box bg-white/90 p-0">
            <div className="border-b-2 border-border bg-[#111] px-4 py-3 text-white">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-white/60">
                    Vista demo
                  </p>
                  <h2 className="text-2xl text-white">Panel de crecimiento</h2>
                </div>
                <Badge className="border-white bg-[#f2d048] text-foreground">
                  Activo
                </Badge>
              </div>
            </div>

            <div className="space-y-4 p-4 sm:p-5">
              <div className="grid gap-3 sm:grid-cols-3">
                {dashboardStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[8px] border-2 border-border bg-background p-3 shadow-[3px_4px_0_0_rgba(0,0,0,1)]"
                  >
                    <p className="text-xs font-bold uppercase text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="number mt-1 text-foreground">{stat.value}</p>
                    <p className="text-xs font-semibold text-muted-foreground">
                      {stat.detail}
                    </p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                <div className="rounded-[8px] border-2 border-border bg-[#f8f0ff] p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase text-muted-foreground">
                        Próximos pasos
                      </p>
                      <h3 className="text-2xl">Plan editorial</h3>
                    </div>
                    <ClipboardList className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="space-y-3">
                    {workflowSteps.map((step, index) => (
                      <div key={step} className="flex items-center gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-border bg-white text-xs font-black">
                          {index + 1}
                        </span>
                        <div className="h-3 min-w-0 flex-1 rounded-full border-2 border-border bg-white">
                          <div
                            className="h-full rounded-full bg-[#f7a9c9]"
                            style={{ width: `${92 - index * 12}%` }}
                          />
                        </div>
                        <p className="w-24 text-xs font-bold sm:w-28">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[8px] border-2 border-border bg-white p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase text-muted-foreground">
                        Actividad
                      </p>
                      <h3 className="text-2xl">Trabajo visible</h3>
                    </div>
                    <MessageSquare className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="space-y-3">
                    {activityItems.map((item) => {
                      const Icon = item.icon;

                      return (
                        <div
                          key={item.title}
                          className="flex gap-3 rounded-[8px] border-2 border-border bg-background p-3"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] border-2 border-border bg-[#a8e6df]">
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <div>
                            <p className="text-sm font-bold">{item.title}</p>
                            <p className="text-xs font-medium leading-relaxed text-muted-foreground">
                              {item.detail}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {platformModules.map((module) => {
            const Icon = module.icon;

            return (
              <Card key={module.title} className="bg-white/88">
                <span
                  className={cn(
                    "mb-4 flex h-11 w-11 items-center justify-center rounded-[8px] border-2 border-border shadow-[2px_3px_0_0_rgba(0,0,0,1)]",
                    module.tone
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <CardTitle>{module.title}</CardTitle>
                <CardDescription className="mt-2">
                  {module.description}
                </CardDescription>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl">
              Menos improvisación. Más sistema.
            </h2>
            <p className="max-w-xl text-sm font-medium leading-relaxed text-muted-foreground sm:text-base">
              La plataforma funciona como una sala de trabajo compartida:
              estrategia, materiales, tareas y evolución del contenido en un
              mismo lugar.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="bg-[#111] text-white">
              <Users className="mb-5 h-7 w-7" aria-hidden="true" />
              <CardTitle className="text-white">Perfil claro</CardTitle>
              <p className="mt-2 text-sm font-medium leading-relaxed text-white/70">
                Una presencia más coherente para que se entienda tu valor.
              </p>
            </Card>
            <Card className="bg-[#f2d048]">
              <BarChart3 className="mb-5 h-7 w-7" aria-hidden="true" />
              <CardTitle>Contenido medible</CardTitle>
              <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
                Ideas conectadas con reservas, ventas o colaboraciones.
              </p>
            </Card>
            <Card className="bg-white/90">
              <CheckCircle2 className="mb-5 h-7 w-7" aria-hidden="true" />
              <CardTitle>Avance visible</CardTitle>
              <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
                Seguimiento real para saber qué está hecho y qué viene después.
              </p>
            </Card>
          </div>
        </div>

        <section
          id="solicitud"
          className="grid scroll-mt-24 gap-6 rounded-[8px] border-2 border-border bg-white/90 p-4 shadow-[7px_10px_0_3px_rgba(0,0,0,1)] sm:p-6 lg:grid-cols-[0.82fr_1.18fr]"
        >
          <div className="space-y-4">
            <Badge className="bg-[#a8e6df]">Primer paso</Badge>
            <div className="space-y-3">
              <h2 className="text-3xl sm:text-4xl">
                Cuéntame tu proyecto y preparo el enfoque
              </h2>
              <p className="text-sm font-medium leading-relaxed text-muted-foreground sm:text-base">
                Completa tus datos y revisaré cómo podríamos trabajar tu
                estrategia de contenido, tu organización y el seguimiento dentro
                de la plataforma.
              </p>
            </div>
            <div className="rounded-[8px] border-2 border-border bg-background p-4">
              <p className="text-sm font-bold">Después de enviarlo:</p>
              <ul className="mt-3 space-y-2 text-sm font-medium text-muted-foreground">
                <li>Reviso tu situación actual y tus objetivos.</li>
                <li>Te respondo con una propuesta de dirección.</li>
                <li>Si encaja, activamos tu espacio privado de trabajo.</li>
              </ul>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="full_name">Nombre *</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  autoComplete="name"
                  required
                  placeholder="Ej. Ana García"
                />
              </div>
              <div className="space-y-1">
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
              <div className="space-y-1">
                <Label htmlFor="company">Empresa / proyecto</Label>
                <Input
                  id="company"
                  name="company"
                  autoComplete="organization"
                  placeholder="Ej. Estudio Norte"
                />
              </div>
              <div className="space-y-1">
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

            <div className="space-y-1">
              <Label htmlFor="message">¿Qué necesitas exactamente? *</Label>
              <Textarea
                id="message"
                name="message"
                required
                rows={5}
                placeholder="Cuéntame qué haces, qué publicas ahora, qué te está costando y qué te gustaría mejorar."
              />
            </div>

            <input
              name="website"
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
            />

            <Button disabled={loading} className="w-full">
              {loading ? "Enviando..." : "Enviar solicitud"}
            </Button>

            <div aria-live="polite">
              {result?.ok === true ? (
                <p className="rounded-[8px] border-2 border-emerald-700 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
                  He recibido tu solicitud. Te escribiré pronto con los
                  siguientes pasos. (ref: {result.id})
                </p>
              ) : null}
              {result?.ok === false ? (
                <p className="rounded-[8px] border-2 border-red-700 bg-red-50 px-3 py-2 text-sm font-medium text-red-800">
                  {result.error}
                </p>
              ) : null}
            </div>
          </form>
        </section>
      </section>
    </div>
  );
}
