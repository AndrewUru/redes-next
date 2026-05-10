"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  FileText,
  Globe2,
  MonitorSmartphone,
  MousePointerClick,
  Palette,
  Route,
  Search,
  Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const webbookSteps = [
  {
    title: "1. Diagnostico web",
    description:
      "Entendemos tu negocio, tus objetivos, tu publico y que debe conseguir la pagina.",
    icon: Search
  },
  {
    title: "2. Brandbook para web",
    description:
      "Traducimos tono, mensaje, estilo visual y estructura a una direccion clara para la web.",
    icon: FileText
  },
  {
    title: "3. Mapa y contenido",
    description:
      "Definimos secciones, textos clave, llamadas a la accion y recorrido del usuario.",
    icon: Route
  },
  {
    title: "4. Diseno y desarrollo",
    description:
      "Creamos una web clara, responsive y preparada para convertir visitas en oportunidades.",
    icon: Code2
  }
] as const;

const webDeliverables = [
  "Direccion de marca aplicada a web",
  "Mapa de paginas y secciones",
  "Copy base para cada bloque",
  "Diseno responsive",
  "Formulario o llamada a la accion",
  "Entrega lista para publicar"
] as const;

const previewItems = [
  { label: "Objetivo principal", value: "Reservas / leads" },
  { label: "Estructura", value: "Inicio, servicios, caso, contacto" },
  { label: "Estado", value: "Brief listo para diseno" }
] as const;

type FormState = { ok: true; id: string } | { ok: false; error: string } | null;

export default function WebCreationServicePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FormState>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const form = new FormData(event.currentTarget);
      const payload = {
        ...Object.fromEntries(form.entries()),
        source: "servicio-webs",
        service: "Creacion de paginas web"
      };

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
            "No se pudo enviar la solicitud. Revisa los campos e intentalo de nuevo."
        });
        return;
      }

      setResult({ ok: true, id: json.id });
      event.currentTarget.reset();
    } catch {
      setResult({
        ok: false,
        error:
          "No se pudo enviar la solicitud. Comprueba tu conexion e intentalo de nuevo."
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      <section className="mx-auto max-w-6xl space-y-12 px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="space-y-5">
            <Badge className="w-fit bg-surface/90">
              <Globe2 className="h-3.5 w-3.5" aria-hidden />
              Nuevo servicio
            </Badge>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl sm:text-5xl lg:text-6xl">
                Paginas web creadas desde una estrategia clara de marca
              </h1>
              <p className="max-w-2xl text-base font-medium leading-relaxed text-muted-foreground sm:text-lg">
                Antes de diseñar, ordenamos mensaje, estructura, estilo y
                objetivos. El resultado es una web con dirección, no solo una
                pantalla bonita.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="#solicitud-web"
                className={cn(buttonVariants(), "w-full sm:w-auto")}
              >
                Quiero mi web
                <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
              <Link
                href="/"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "w-full sm:w-auto"
                )}
              >
                Ver servicio de contenido
              </Link>
            </div>
          </div>

          <div className="neo-box overflow-hidden bg-surface/90 p-0">
            <div className="border-b-2 border-border bg-[#111] px-4 py-3 text-white">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-white/60">
                    Vista demo
                  </p>
                  <h2 className="text-2xl text-white">Webbook de proyecto</h2>
                </div>
                <Badge className="border-border bg-[#a8e6df] text-foreground">
                  En preparación
                </Badge>
              </div>
            </div>

            <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="space-y-3">
                {previewItems.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[8px] border-2 border-border bg-background p-3 shadow-[3px_4px_0_0_rgba(0,0,0,1)]"
                  >
                    <p className="text-xs font-bold uppercase text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm font-black">{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-[8px] border-2 border-border bg-[#f8f0ff] p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase text-muted-foreground">
                      Prototipo
                    </p>
                    <h3 className="text-2xl">Home orientada a conversion</h3>
                  </div>
                  <MonitorSmartphone className="h-6 w-6" aria-hidden />
                </div>
                <div className="space-y-3">
                  {["Hero", "Prueba social", "Servicios", "Contacto"].map(
                    (section, index) => (
                      <div key={section} className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-border bg-surface text-xs font-black">
                          {index + 1}
                        </span>
                        <div className="min-w-0 flex-1 rounded-[8px] border-2 border-border bg-surface px-3 py-2 text-sm font-bold">
                          {section}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {webbookSteps.map((step) => {
            const Icon = step.icon;

            return (
              <Card key={step.title} className="bg-surface/88">
                <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-[8px] border-2 border-border bg-[#fde68a] shadow-[2px_3px_0_0_rgba(0,0,0,1)]">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <CardTitle>{step.title}</CardTitle>
                <CardDescription className="mt-2">
                  {step.description}
                </CardDescription>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl">
              Una web pensada antes de construirse
            </h2>
            <p className="max-w-xl text-sm font-medium leading-relaxed text-muted-foreground sm:text-base">
              El proceso funciona como un brandbook enfocado en web: primero
              definimos la direccion y luego construimos cada seccion con una
              razon clara.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="bg-[#111] text-white">
              <Palette className="mb-5 h-7 w-7" aria-hidden />
              <CardTitle className="text-white">Identidad aplicada</CardTitle>
              <p className="mt-2 text-sm font-medium leading-relaxed text-white/70">
                Colores, tono, fotografias y estilo visual traducidos a una
                interfaz coherente.
              </p>
            </Card>
            <Card className="bg-surface/90">
              <MousePointerClick className="mb-5 h-7 w-7" aria-hidden />
              <CardTitle>Conversion sencilla</CardTitle>
              <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
                Cada bloque ayuda a explicar, generar confianza y acercar al
                usuario a la accion.
              </p>
            </Card>
          </div>
        </div>

        <section className="grid gap-6 rounded-[8px] border-2 border-border bg-surface/90 p-4 shadow-[7px_10px_0_3px_rgba(0,0,0,1)] sm:p-6 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="space-y-4">
            <Badge className="bg-[#f2d048]">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Incluye
            </Badge>
            <h2 className="text-3xl sm:text-4xl">
              Lo necesario para tomar buenas decisiones antes de lanzar
            </h2>
            <div className="grid gap-2">
              {webDeliverables.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-[8px] border-2 border-border bg-background px-3 py-2"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
                  <p className="text-sm font-bold">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <form
            id="solicitud-web"
            onSubmit={onSubmit}
            className="scroll-mt-24 space-y-4"
          >
            <div>
              <CardTitle>Cuéntame que web necesitas</CardTitle>
              <CardDescription className="mt-1">
                Te respondere con una propuesta de enfoque y siguientes pasos.
              </CardDescription>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="full_name">Nombre *</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  autoComplete="name"
                  required
                  placeholder="Ej. Ana Garcia"
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
                <Label htmlFor="phone">Telefono</Label>
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
              <Label htmlFor="message">Que deberia conseguir tu web? *</Label>
              <Textarea
                id="message"
                name="message"
                required
                rows={5}
                placeholder="Ej. explicar mis servicios, conseguir reservas, vender un producto, mostrar trabajos, captar leads..."
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
              {loading ? "Enviando..." : "Solicitar propuesta web"}
            </Button>

            <div aria-live="polite">
              {result?.ok === true ? (
                <p className="rounded-[8px] border-2 border-emerald-700 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
                  He recibido tu solicitud web. Te escribire pronto con los
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
