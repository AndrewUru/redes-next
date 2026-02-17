"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { StepLayout } from "@/components/step-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  intakeSchema,
  intakeStepOrder,
  intakeStepSchemas,
  type IntakeData,
  type IntakeStepKey
} from "@/lib/intake/schema";
import { calculateCompletionPct } from "@/lib/intake/completion";

const stepMeta: Record<IntakeStepKey, { title: string; description: string }> =
  {
    identity: {
      title: "Tu marca en 1 minuto",
      description:
        "Queremos entender quién eres y cómo quieres que te perciban. Con esto armamos la base del contenido."
    },
    goals: {
      title: "Qué quieres conseguir",
      description:
        "Define objetivos concretos (ventas, reservas, mensajes, comunidad). Así medimos si vamos bien."
    },
    audience: {
      title: "A quién le hablamos",
      description:
        "Cuanto más específico seas, más fácil es crear contenido que conecte y convierta."
    },
    tone: {
      title: "Tu estilo al comunicar",
      description:
        "El tono y las palabras importan. Aquí definimos tu voz para que todo suene coherente."
    },
    pillars: {
      title: "Temas que vas a tratar",
      description:
        "Elegimos 3–6 temas recurrentes para no improvisar y mantener constancia."
    },
    messaging: {
      title: "Qué vendes y por qué tú",
      description:
        "Tu propuesta de valor: qué ofreces, qué te diferencia y qué genera confianza."
    },
    ctas: {
      title: "Cómo te contactan o compran",
      description:
        "Definimos la acción principal que queremos que hagan (DM, WhatsApp, web, reserva, compra)."
    },
    visual: {
      title: "Estilo visual",
      description:
        "Colores, referencias y cosas a evitar para que el feed se vea profesional y consistente."
    },
    references: {
      title: "Referencias y competidores",
      description:
        "Para entender el mercado y alinear expectativas: qué te gusta, qué no, y contra quién compites."
    },
    logistics: {
      title: "Cómo vamos a trabajar",
      description:
        "Aprobaciones, ritmo de publicaciones y cómo coordinamos para que sea fácil y sostenible."
    }
  };

function toList(value: string): string[] {
  return value
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function fromList(value: unknown): string {
  return Array.isArray(value) ? value.join(", ") : "";
}

type FlatStepData = Record<string, string>;

function flattenStep(
  step: IntakeStepKey,
  data: Partial<IntakeData>
): FlatStepData {
  const section = (data[step] ?? {}) as Record<string, unknown>;
  const flat: FlatStepData = {};
  Object.entries(section).forEach(([key, value]) => {
    flat[key] = Array.isArray(value) ? fromList(value) : String(value ?? "");
  });
  return flat;
}

function inflateStep(step: IntakeStepKey, values: FlatStepData) {
  const withArrays: Partial<Record<IntakeStepKey, ReadonlyArray<string>>> = {
    goals: ["businessGoals"],
    audience: ["painPoints"],
    tone: ["voiceAttributes", "forbiddenWords"],
    pillars: ["contentPillars"],
    messaging: ["differentiators"],
    visual: ["colorPreferences", "visualDo", "visualDont"],
    references: ["competitors", "inspirationLinks"]
  };

  const arrayKeys = withArrays[step] ?? [];
  const inflated: Record<string, unknown> = {};
  Object.entries(values).forEach(([key, value]) => {
    inflated[key] = arrayKeys.includes(key) ? toList(value) : value.trim();
  });
  return inflated;
}

export function OnboardingWizard({
  clientId,
  initialData,
  initialStatus
}: {
  clientId: string;
  initialData: Partial<IntakeData> | null;
  initialStatus: "draft" | "submitted";
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<Partial<IntakeData>>(initialData ?? {});
  const [status, setStatus] = useState<"draft" | "submitted">(initialStatus);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const currentStep = intakeStepOrder[stepIndex];

  const defaultValues = useMemo(
    () => flattenStep(currentStep, draft),
    [currentStep, draft]
  );

  const form = useForm<FlatStepData>({ defaultValues });

  useEffect(() => {
    form.reset(defaultValues);
  }, [form, defaultValues]);

  const watched = form.watch();

  useEffect(() => {
    if (status === "submitted") return;

    const timeout = setTimeout(async () => {
      const section = inflateStep(currentStep, watched);
      const nextDraft = { ...draft, [currentStep]: section };
      const pct = calculateCompletionPct(nextDraft);
      setSaving(true);
      setDraft(nextDraft);
      await fetch("/api/client/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "draft",
          data: nextDraft,
          completionPct: pct
        })
      });
      setSaving(false);
    }, 700);
    return () => clearTimeout(timeout);
  }, [watched, currentStep, status]); // eslint-disable-line react-hooks/exhaustive-deps

  async function goNext() {
    const section = inflateStep(currentStep, form.getValues());
    const parsed = intakeStepSchemas[currentStep].safeParse(section);
    if (!parsed.success) {
      setMessage(
        parsed.error.issues[0]?.message ??
          "Hay un campo por completar o ajustar antes de avanzar."
      );
      return;
    }
    setMessage(null);
    if (stepIndex < intakeStepOrder.length - 1) setStepIndex((v) => v + 1);
  }

  async function submitFinal() {
    const merged = {
      ...draft,
      [currentStep]: inflateStep(currentStep, form.getValues())
    };
    const finalParsed = intakeSchema.safeParse(merged);
    if (!finalParsed.success) {
      setMessage(`Error final: ${finalParsed.error.issues[0]?.path.join(".")}`);
      return;
    }

    const res = await fetch("/api/client/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "submitted",
        data: finalParsed.data,
        completionPct: 100
      })
    });
    if (!res.ok) {
      setMessage("No se pudo enviar el onboarding.");
      return;
    }

    const pdfRes = await fetch("/api/brandbook/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId })
    });
    const pdfJson = (await pdfRes.json()) as { error?: string; path?: string };
    if (!pdfRes.ok) {
      setMessage(
        `Onboarding enviado, pero no se pudo generar el PDF: ${pdfJson.error ?? "error desconocido"}`
      );
      setDraft(finalParsed.data);
      setStatus("submitted");
      return;
    }

    setDraft(finalParsed.data);
    setStatus("submitted");
    setMessage(`Onboarding enviado y PDF generado: ${pdfJson.path ?? "ok"}`);
  }

  function renderFields() {
    switch (currentStep) {
      case "identity":
        return (
          <>
            <Field
              label="Nombre de marca (como quieres que aparezca en redes)"
              name="brandName"
              form={form}
              placeholder="Ej: Clinica X / Juan Perez Nutricion"
            />
            <Field
              label="Frase corta que te define (opcional)"
              name="tagline"
              form={form}
              placeholder="Ej: Entrena sin dolor / Cuidamos tu sonrisa"
            />
            <Field
              label="Que haces y por que lo haces (2-5 lineas)"
              name="mission"
              form={form}
              textarea
              placeholder="Ej: Ayudo a personas con ... para que ... Mi enfoque es ... y me diferencia ..."
            />
          </>
        );
      case "goals":
        return (
          <>
            <Field
              label="Que objetivos quieres en redes (separados por coma)"
              name="businessGoals"
              form={form}
              placeholder="Ej: mas reservas, mas mensajes, vender un servicio, crecer comunidad"
              helperText="Pon 2-4 objetivos. Esto guia el plan de contenido."
            />
            <Field
              label="Que te gustaria lograr en 30-60 dias (y como lo notarias)"
              name="shortTermGoals"
              form={form}
              textarea
              placeholder="Ej: 10 consultas por DM al mes, 5 reservas semanales, +500 seguidores reales..."
            />
          </>
        );
      case "audience":
        return (
          <>
            <Field
              label="Tu cliente ideal (quien es y que busca)"
              name="primaryAudience"
              form={form}
              placeholder="Ej: mujeres 30-45 en Valencia que quieren ..."
            />
            <Field
              label="Problemas o dudas tipicas de esa audiencia (separados por coma)"
              name="painPoints"
              form={form}
              placeholder="Ej: no se por donde empezar, me falta tiempo, miedo a equivocarme..."
            />
          </>
        );
      case "tone":
        return (
          <>
            <Field
              label="Como quieres sonar (separado por coma)"
              name="voiceAttributes"
              form={form}
              placeholder="Ej: cercano, profesional, directo, calido, divertido"
              helperText="Esto nos ayuda a escribir copies que suenen a ti."
            />
            <Field
              label="Palabras/estilos que NO quieres usar (separado por coma)"
              name="forbiddenWords"
              form={form}
              placeholder="Ej: 'oferton', 'imperdible', 'guru', 'magico'..."
            />
          </>
        );
      case "pillars":
        return (
          <Field
            label="Temas principales de tu contenido (separados por coma)"
            name="contentPillars"
            form={form}
            placeholder="Ej: casos reales, tips, detras de camaras, educacion, testimonios"
            helperText="Recomendado: 3-6 temas."
          />
        );
      case "messaging":
        return (
          <>
            <Field
              label="Mensaje central (que ofreces en una frase clara)"
              name="coreMessage"
              form={form}
              textarea
              placeholder="Ej: Ayudo a X a conseguir Y sin Z."
            />
            <Field
              label="Que te diferencia / pruebas de confianza (separado por coma)"
              name="differentiators"
              form={form}
              placeholder="Ej: anos de experiencia, certificaciones, resultados, resenas, metodo propio"
            />
          </>
        );
      case "ctas":
        return (
          <>
            <Field
              label="Accion principal que quieres que hagan"
              name="primaryCTA"
              form={form}
              placeholder="Ej: Enviar DM, pedir cita, visitar web, reservar por WhatsApp"
            />
            <Field
              label="Accion secundaria (opcional)"
              name="secondaryCTA"
              form={form}
              placeholder="Ej: descargar guia, apuntarse a lista, pedir presupuesto"
            />
          </>
        );
      case "visual":
        return (
          <>
            <Field
              label="Colores que te gustan (separados por coma)"
              name="colorPreferences"
              form={form}
              placeholder="Ej: azul, blanco, negro / o #1D4ED8, #FFFFFF..."
            />
            <Field
              label="Estilo visual que SI te gusta (ejemplos)"
              name="visualDo"
              form={form}
              placeholder="Ej: limpio, minimal, tipografia grande, fotos naturales..."
              helperText="Puedes describirlo con palabras o ejemplos."
            />
            <Field
              label="Estilo visual que NO quieres (evitar)"
              name="visualDont"
              form={form}
              placeholder="Ej: demasiado recargado, colores neon, muchos stickers..."
            />
          </>
        );
      case "references":
        return (
          <>
            <Field
              label="Competidores o cuentas similares (separados por coma)"
              name="competitors"
              form={form}
              placeholder="Ej: @cuenta1, @cuenta2 o marcas del sector"
            />
            <Field
              label="Links de inspiracion (URLs separadas por coma)"
              name="inspirationLinks"
              form={form}
              placeholder="Ej: https://instagram.com/... , https://www.pinterest.com/..."
            />
          </>
        );
      case "logistics":
        return (
          <>
            <Field
              label="Como prefieres aprobar el contenido"
              name="approvalsFlow"
              form={form}
              textarea
              placeholder="Ej: me lo enviais por WhatsApp los lunes, respondo ok/cambios en 24-48h..."
            />
            <Field
              label="Ritmo ideal de publicaciones"
              name="postingFrequency"
              form={form}
              placeholder="Ej: 3 posts/semana + 5 stories/semana"
              helperText="Si no lo sabes, pon tu disponibilidad y lo proponemos nosotros."
            />
          </>
        );
      default:
        return null;
    }
  }

  return (
    <div className="space-y-4">
      <StepLayout
        title={stepMeta[currentStep].title}
        description={stepMeta[currentStep].description}
        step={stepIndex + 1}
        total={intakeStepOrder.length}
      >
        <form className="space-y-4">
          {renderFields()}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              disabled={stepIndex === 0}
              onClick={() => setStepIndex((v) => Math.max(0, v - 1))}
              className="w-full sm:w-auto"
            >
              Atras
            </Button>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button type="button" variant="outline" onClick={goNext} className="w-full sm:w-auto">
                Siguiente bloque
              </Button>
              <Button
                type="button"
                onClick={submitFinal}
                disabled={status === "submitted"}
                className="w-full sm:w-auto"
              >
                {status === "submitted" ? "Enviado" : "Enviar onboarding"}
              </Button>
            </div>
          </div>
        </form>
      </StepLayout>

      <p className="text-sm text-muted-foreground">
        {saving ? "Guardando..." : "Guardado automatico activo"} | Estado:{" "}
        {status === "draft" ? "Borrador" : "Enviado"}
      </p>
      {message ? <p className="text-sm text-amber-700">{message}</p> : null}
    </div>
  );
}

function Field({
  label,
  name,
  form,
  textarea,
  placeholder,
  helperText
}: {
  label: string;
  name: string;
  form: UseFormReturn<FlatStepData>;
  textarea?: boolean;
  placeholder?: string;
  helperText?: string;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={name}>{label}</Label>
      {textarea ? (
        <Textarea id={name} placeholder={placeholder} {...form.register(name)} />
      ) : (
        <Input id={name} placeholder={placeholder} {...form.register(name)} />
      )}
      {helperText ? <p className="text-xs text-muted-foreground">{helperText}</p> : null}
    </div>
  );
}
