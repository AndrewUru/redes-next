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
    title: "1. Marca: qué dices y cómo te recuerdan",
    points: [
      "Voz de marca: la forma en que hablas para que se note que eres tú (en posts, vídeos y mensajes).",
      "Personalidad de marca: si comunicas como guía, como experta/o o como alguien más rompedor (según tu estilo).",
      "Historia de marca: cómo cuentas quién eres, qué haces y por qué es diferente, sin sonar a publicidad.",
      "Marca personal: lo que te hace confiable por tu experiencia, valores y forma de trabajar.",
      "Presencia + autoridad: aparecer con constancia y con ideas claras, no por hacer ruido.",
      "Coherencia: que la gente te reconozca rápido aunque vea solo una publicación.",
      "Estilo propio: un look y una forma de escribir que te diferencie (diseño + textos + formatos)."
    ]
  },
  {
    title: "2. Contenido: qué publicamos y en qué formato",
    points: [
      "Contenido corto: piezas rápidas que captan atención en segundos.",
      "Contenido profundo: explicaciones con más contexto cuando hace falta (para que entiendan tu valor).",
      "Contenido que no caduca: publicaciones que sirven hoy y dentro de meses.",
      "Piezas base del perfil: contenidos principales que sostienen tu temática y ordenan tu cuenta.",
      "Contar historias + enseñar sin aburrir: que se entienda, pero se sienta humano.",
      "Mostrar el proceso: detrás de cámaras, trabajo real, avances, ensayo/error (sin postureo)."
    ]
  },
  {
    title: "3. Comunidad: cómo hacemos que la gente participe",
    points: [
      "Calidad de interacción: medir si la gente se queda, entiende y reacciona (no solo likes).",
      "Publicaciones que abren conversación: contenido que invita a responder de verdad.",
      "Contenido que conecta: cosas que la gente comparte, guarda o envía porque le sirve.",
      "Llevar gente a mensajes privados: crear momentos que hacen que te escriban.",
      "Pruebas de confianza: reseñas, ejemplos, resultados, y señales que bajan la desconfianza."
    ]
  },
  {
    title: "4. Estrategia: cómo crecemos sin improvisar",
    points: [
      "Crecimiento sin anuncios: avanzar con contenido y sistema, no solo pagando.",
      "Decidir con datos: usar números básicos para ajustar, en vez de hacerlo a ojo.",
      "Atraer a la gente correcta: no más seguidores, sino gente con interés real.",
      "Camino completo: de que te descubran -> a que confíen -> a que te contacten -> a que compren/reserven.",
      "Mensajes por etapa: qué decir a quien recién te conoce vs. a quien ya está por decidir.",
      "Reutilizar contenido: sacar más piezas de lo mismo sin duplicar trabajo.",
      "Sistema sostenible: que el plan se pueda mantener sin quemarte."
    ]
  },
  {
    title: "5. Contexto digital: estar al día sin perder identidad",
    points: [
      "Tendencias con criterio: usar lo que funciona sin convertirte en otra persona.",
      "Mejorar alcance: crear publicaciones que la plataforma muestre más (por cómo están hechas).",
      "Adaptar por red: no es lo mismo Instagram que TikTok o LinkedIn.",
      "Competir por atención: entender que hoy compites contra mucho contenido y hay que ser claro.",
      "Cuidar tu imagen: lo que publicas deja huella y construye (o destruye) confianza."
    ]
  },
  {
    title: "6. Ventas: cómo lo convertimos en clientes/reservas",
    points: [
      "Siguiente paso claro: que la gente sepa qué hacer después (sin pensar demasiado).",
      "Regalo útil / recurso: ofrecer algo de valor para que te conozcan y confien.",
      "Ofertas y precios: cómo presentar servicios/productos para que se entiendan y se sientan coherentes.",
      "Propuesta de valor: explicar el beneficio real conectado a un problema real.",
      "Resolver dudas típicas: anticipar miedos y objeciones sin presionar."
    ]
  },
  {
    title: "7. Tono: moderno, humano y directo",
    points: [
      "Intencional y auténtico: que se note real, sin frases vacías.",
      "Claro y directo: menos vueltas, más entendible y accionable.",
      "Con propósito humano: estrategia, sí; pero sin volverte una cuenta fría.",
      "Menos ruido, más resultados: publicar con intención, no por obligación."
    ]
  },
  {
    title: "8. Ideas clave (2026) en lenguaje normal",
    points: [
      "Menos ruido, más señal: mejor poco y bueno que mucho y olvidable.",
      "Audiencia de calidad: mejor 200 personas interesadas que 5.000 mirando sin intención.",
      "Mostrar proceso: lo real engancha más que lo perfecto.",
      "Crecimiento sostenible: constancia sin agotamiento.",
      "Presencia y valor primero: lo bonito ayuda, pero lo que retiene es el mensaje."
    ]
  },
  {
    title: "9. Acciones que vamos a ejecutar",
    points: [
      "Construir, ordenar, simplificar, mejorar, medir.",
      "Atraer, posicionar, conectar, nutrir, convertir."
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
            <h1 className="text-3xl sm:text-4xl lg:text-5xl">
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
                Depth over reach: calidad de audiencia por encima de nÃºmeros
                vacÃ­os.
              </li>
              <li>Value-first: primero valor, luego conversiÃ³n.</li>
            </ul>
            <div className="pt-2">
              <Link href="/login" className="inline-block w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto">
                  Soy de acciÃ³n: vamos al grano con el onboarding.
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
            Marco de trabajo: de identidad a conversiÃ³n
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

