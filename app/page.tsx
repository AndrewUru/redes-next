"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const conceptBlocks = [
  {
    title: "1. Branding y posicionamiento",
    points: [
      "Brand voice: voz de marca con tono consistente en cada post, reel y DM.",
      "Brand archetype: arquetipo para decidir si la marca actua como guia, experta o rebelde.",
      "Brand narrative: historia que conecta proposito, oferta y diferenciacion.",
      "Personal brand: marca personal basada en experiencia y valores.",
      "Brand presence + authority: presencia constante con autoridad real en tu nicho.",
      "Brand consistency + recall: coherencia para que te recuerden sin estar gritando.",
      "Signature style + visual identity: estilo distintivo en diseno, copy y formato."
    ]
  },
  {
    title: "2. Contenido y formatos",
    points: [
      "Short-form content + snackable content para captar atencion en segundos.",
      "Long-form value para profundidad: contexto, metodo y educacion.",
      "Evergreen content para construir biblioteca de valor atemporal.",
      "Hero content y pillar content para ordenar el ecosistema de contenidos.",
      "Storytelling y edutainment para educar sin sonar academico.",
      "Behind the scenes, raw content y unfiltered para mostrar proceso real."
    ]
  },
  {
    title: "3. Engagement y comunidad",
    points: [
      "Engagement rate y audience retention para medir calidad real, no solo likes.",
      "Community-driven y conversation starter para activar comentarios utiles.",
      "Relatable, share-worthy y save-worthy para contenido que conecta y se guarda.",
      "DM trigger para mover audiencia a conversaciones privadas.",
      "Social proof y trust signals para reducir friccion y aumentar confianza."
    ]
  },
  {
    title: "4. Estrategia y crecimiento",
    points: [
      "Growth strategy + organic growth para crecer sin depender solo de ads.",
      "Data-driven para decidir con metricas, no con intuicion aislada.",
      "High-intent audience para atraer publico con probabilidad de comprar.",
      "Content ecosystem + funnel: desde visibilidad hasta conversion.",
      "Top / Mid / Bottom of funnel para ordenar mensajes por etapa.",
      "Distribution strategy + repurposing para escalar sin duplicar esfuerzo.",
      "Scalable para que el sistema crezca sin quemar al equipo."
    ]
  },
  {
    title: "5. Tendencias y cultura digital",
    points: [
      "Trend-aligned y culture-first para estar en contexto sin perder identidad.",
      "Algorithm-friendly para mejorar alcance y retencion.",
      "Native content y platform-specific para adaptar mensaje por red.",
      "Creator economy y attention economy para competir con criterio.",
      "Digital footprint para cuidar la huella digital de la marca."
    ]
  },
  {
    title: "6. Conversion y ventas",
    points: [
      "CTA claros y low-friction para que el siguiente paso sea obvio.",
      "Lead magnet y conversion-focused para captar demanda con valor.",
      "High-ticket / low-ticket y offer positioning segun objetivo comercial.",
      "Value proposition centrada en pain points reales.",
      "Objection handling y trust-based selling para vender sin presion."
    ]
  },
  {
    title: "7. Tono moderno",
    points: [
      "Intentional, aligned y authentic: coherencia sin postureo.",
      "Bold y clear: mensaje directo, simple y accionable.",
      "Purpose-driven y human-centered: estrategia con enfoque humano.",
      "Impactful, meaningful y focused: menos ruido, mas resultado."
    ]
  },
  {
    title: "8. Expresiones 2026",
    points: [
      "Signal > Noise y depth over reach para priorizar relevancia.",
      "Quality audience antes que volumen vacio.",
      "Built in public y creator-led para mostrar proceso real.",
      "Slow growth + sustainable visibility para crecer sin burnout.",
      "Real over polished, presence-based y value-first como norte."
    ]
  },
  {
    title: "9. Verbos de accion",
    points: [
      "Build, scale, connect, convert, engage.",
      "Attract, position, amplify, nurture, monetize."
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
              Noelia | Branding, contenido y conversion
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl">
              Creemos una marca con voz propia que atraiga, conecte y convierta.
            </h1>
            <p className="text-base leading-relaxed text-muted-foreground">
              Este framework une brand positioning, content ecosystem y growth
              strategy para pasar de publicar por intuicion a publicar con
              sistema.
            </p>
            <ul className="space-y-2 text-sm font-medium text-foreground">
              <li>
                Signal {">"} Noise: menos ruido, mas contenido con impacto.
              </li>
              <li>
                Depth over reach: calidad de audiencia por encima de números
                vacíos.
              </li>
              <li>Value-first: primero valor, luego conversión.</li>
            </ul>
            <div className="pt-2">
              <Link href="/signup" className="inline-block w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto">
                  Soy de acción: vamos al grano con el onboarding.
                </Button>
              </Link>
              <p className="mt-2 text-xs font-medium text-muted-foreground">
                Si te va el caos controlado, entras y empezamos hoy mismo.
              </p>
            </div>
          </div>

          <Card className="space-y-4 bg-white/90">
            <div>
              <CardTitle>Cuestionario inicial</CardTitle>
              <CardDescription className="mt-1">
                Te respondemos con enfoque de posicionamiento, contenido y
                conversion.
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
                    placeholder="Andres Tobio"
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
                  placeholder="Nombre del negocio (opcional)"
                />
              </label>

              <label className="space-y-1">
                <Label htmlFor="phone">Telefono</Label>
                <Input id="phone" name="phone" placeholder="+34 ..." />
              </label>

              <label className="space-y-1">
                <Label htmlFor="message">Que necesitas exactamente *</Label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  placeholder="Tu contexto, pain points, oferta actual, objetivo y canal principal."
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
                {loading ? "Enviando..." : "Enviar"}
              </Button>

              {result?.ok === true ? (
                <p className="text-sm font-medium text-muted-foreground">
                  Recibido. Te escribimos pronto con primeros siguientes pasos.
                  (ref: {result.id})
                </p>
              ) : null}
              {result?.ok === false ? (
                <p className="text-sm text-red-700">{result.error}</p>
              ) : null}
            </form>
          </Card>
        </div>

        <div className="mt-10 space-y-4">
          <h2 className="text-3xl sm:text-4xl">
            Marco de trabajo: de identidad a conversión
          </h2>
          <p className="text-sm font-medium text-muted-foreground">
            Este es el lenguaje que usamos en estrategia, onboarding y reportes
            para tomar decisiones claras.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {conceptBlocks.map((block) => (
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
