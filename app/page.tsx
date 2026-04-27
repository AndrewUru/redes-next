"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const serviceBlocks = [
  {
    title: "1. Mensaje y posicionamiento",
    points: [
      "Definimos qué quieres transmitir y cómo hacerlo más claro.",
      "Ordenamos tu propuesta para que tu contenido tenga dirección.",
      "Trabajamos una base más sólida para comunicar con coherencia."
    ]
  },
  {
    title: "2. Ideas y estructura de contenido",
    points: [
      "Detectamos líneas de contenido útiles para tu perfil.",
      "Dejamos atrás la improvisación constante.",
      "Creamos una base más sostenible para publicar con sentido."
    ]
  },
  {
    title: "3. Presencia de marca",
    points: [
      "Afinamos tono, estilo y coherencia visual.",
      "Buscamos que tu perfil se vea más claro y profesional.",
      "Mostramos mejor tu valor real sin forzar una imagen artificial."
    ]
  },
  {
    title: "4. Organización del proceso",
    points: [
      "Tendrás un espacio privado para compartir materiales y referencias.",
      "Todo queda más ordenado desde el inicio.",
      "Menos mensajes sueltos, menos archivos perdidos, más claridad."
    ]
  },
  {
    title: "5. Seguimiento y avances",
    points: [
      "Puedes ver cómo va el proceso y en qué punto estamos.",
      "Tienes una visión más clara del trabajo en marcha.",
      "Seguimiento real, no trabajo a ciegas."
    ]
  },
  {
    title: "6. Conversión con sentido",
    points: [
      "No se trata solo de publicar más.",
      "Buscamos conectar con la gente adecuada.",
      "Preparamos el contenido para acercarte a reservas, ventas o colaboraciones."
    ]
  }
] as const;

type FormState = { ok: true; id: string } | { ok: false; error: string } | null;

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FormState>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setResult(null);

    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    const response = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const json = (await response.json()) as { id?: string; error?: string };
    setLoading(false);

    if (!response.ok || !json.id) {
      setResult({
        ok: false,
        error: json.error ?? "Error enviando el formulario"
      });
      return;
    }

    setResult({ ok: true, id: json.id });
    event.currentTarget.reset();
  }

  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div className="neo-box space-y-4 bg-white/85">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Estrategia de contenido y seguimiento
            </p>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl">
              Estrategia, contenido y seguimiento real para creadores que quieren crecer con orden
            </h1>

            <p className="text-base leading-relaxed text-muted-foreground">
              Te ayudo a definir qué comunicar, cómo organizar tu contenido y
              cómo convertir tu presencia en redes en algo más claro, constante
              y profesional.
            </p>
            <p className="text-sm font-medium leading-relaxed text-muted-foreground">
              Además, tendrás un espacio privado donde compartir información,
              subir material y ver el avance del trabajo.
            </p>
            <div className="pt-2">
              <Link href="/login" className="inline-block w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto">
                  Quiero empezar
                </Button>
              </Link>
              <p className="mt-2 text-xs font-medium text-muted-foreground">
                Completa tus datos y te indicaré cómo podríamos trabajar juntos.
              </p>
            </div>
          </div>

          <Card className="space-y-4 bg-white/90">
            <div>
              <CardTitle>Cuéntame tu proyecto</CardTitle>
              <CardDescription className="mt-1">
                Si quieres trabajar conmigo tu estrategia de contenido, este es
                el primer paso. Reviso tu caso y te respondo con una propuesta
                de enfoque.
              </CardDescription>
            </div>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1">
                  <Label htmlFor="full_name">Nombre *</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    required
                    placeholder="Tu nombre completo"
                  />
                </label>
                <label className="space-y-1">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="tu@email.com"
                  />
                </label>
              </div>

              <label className="space-y-1">
                <Label htmlFor="company">Empresa / proyecto</Label>
                <Input
                  id="company"
                  name="company"
                  placeholder="Nombre de tu proyecto o perfil"
                />
              </label>

              <label className="space-y-1">
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" name="phone" placeholder="+34 600 000 000" />
              </label>

              <label className="space-y-1">
                <Label htmlFor="message">¿Qué necesitas exactamente? *</Label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  placeholder="Cuéntame qué haces, qué publicas ahora, qué te está costando y qué te gustaría mejorar."
                />
              </label>

              <input
                name="website"
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
              />

              <Button disabled={loading} className="w-full">
                {loading ? "Enviando…" : "Enviar solicitud"}
              </Button>

              {result?.ok === true ? (
                <p className="text-sm font-medium text-muted-foreground">
                  He recibido tu solicitud. Te escribiré pronto con los siguientes pasos. (ref: {result.id})
                </p>
              ) : null}
              {result?.ok === false ? (
                <p className="text-sm text-red-700">{result.error}</p>
              ) : null}
            </form>
          </Card>
        </div>

        <div className="mt-10 space-y-4">
          <h2 className="text-3xl sm:text-4xl">Qué podemos trabajar juntos</h2>
          <p className="text-sm font-medium text-muted-foreground">
            Una base clara para que tu contenido tenga dirección, coherencia y seguimiento.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {serviceBlocks.map((block) => (
              <Card key={block.title} className="space-y-3 bg-white/85">
                <CardTitle className="text-2xl">{block.title}</CardTitle>
                <ul className="space-y-2 text-sm">
                  {block.points.map((point) => (
                    <li key={point} className="font-medium text-foreground">
                      {point}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
