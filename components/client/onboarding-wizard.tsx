"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Download,
  ExternalLink,
  Loader2
} from "lucide-react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { StepLayout } from "@/components/step-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
      title: "Tu proyecto en pocas palabras",
      description:
        "Queremos entender quien eres, que haces y como te gustaria que te vean."
    },
    goals: {
      title: "Que quieres conseguir",
      description:
        "Cuenta que seria un buen resultado para ti: mas reservas, ventas, mensajes o comunidad."
    },
    audience: {
      title: "A quien le hablamos",
      description:
        "Describe a las personas que quieres atraer y que necesitan resolver."
    },
    tone: {
      title: "Como quieres sonar",
      description:
        "Elige palabras sencillas para describir tu estilo: cercano, profesional, directo, alegre..."
    },
    pillars: {
      title: "Temas que vas a tratar",
      description:
        "Elegimos varios temas recurrentes para no improvisar cada semana."
    },
    messaging: {
      title: "Que ofreces y por que elegirte",
      description:
        "Cuentanos que vendes, que te diferencia y que genera confianza."
    },
    ctas: {
      title: "Como te contactan o compran",
      description:
        "Define la accion principal: escribir por DM, WhatsApp, reservar, comprar o visitar la web."
    },
    visual: {
      title: "Estilo visual",
      description:
        "Cuentanos colores, ejemplos y cosas que no te gustan. No hace falta saber de diseno."
    },
    references: {
      title: "Referencias y competidores",
      description:
        "Comparte cuentas, marcas o ejemplos que nos ayuden a entender tu mundo."
    },
    logistics: {
      title: "Como vamos a trabajar",
      description:
        "Dinos como prefieres revisar propuestas y que ritmo te resulta realista."
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

function asList(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function summaryValue(value: unknown, fallback = "Pendiente") {
  if (Array.isArray(value)) return asList(value).join(", ") || fallback;
  return typeof value === "string" && value.trim() ? value : fallback;
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
  const [brandbookUrl, setBrandbookUrl] = useState<string | null>(null);
  const [brandbookDownloadUrl, setBrandbookDownloadUrl] = useState<
    string | null
  >(null);
  const [brandbookVersion, setBrandbookVersion] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const currentStep = intakeStepOrder[stepIndex];
  const isLastStep = stepIndex === intakeStepOrder.length - 1;

  const defaultValues = useMemo(
    () => flattenStep(currentStep, draft),
    [currentStep, draft]
  );

  const form = useForm<FlatStepData>({ defaultValues });

  useEffect(() => {
    form.reset(defaultValues);
  }, [form, defaultValues]);

  const watched = form.watch();
  const watchedSignature = useMemo(() => JSON.stringify(watched), [watched]);
  const liveDraft = useMemo(
    () => ({
      ...draft,
      [currentStep]: inflateStep(currentStep, watched)
    }),
    [draft, currentStep, watched]
  );
  const completionPct = useMemo(
    () => calculateCompletionPct(liveDraft),
    [liveDraft]
  );
  const statusView =
    status === "submitted"
      ? {
          label: "Enviado",
          detail: "Onboarding recibido. Ya puedes descargar tu guia.",
          Icon: CheckCircle2,
          iconClass: "text-emerald-700",
          badgeClass: "border-emerald-500 bg-emerald-50"
        }
      : {
          label: "Borrador",
          detail: saving
            ? "Guardando los ultimos cambios..."
            : "Puedes salir y volver sin perder el avance.",
          Icon: saving ? Loader2 : Clock3,
          iconClass: saving ? "animate-spin text-amber-700" : "text-primary",
          badgeClass: saving
            ? "border-amber-400 bg-amber-50"
            : "border-border bg-primary/10"
        };

  useEffect(() => {
    if (status === "submitted") return;

    const timeout = setTimeout(async () => {
      const section = inflateStep(currentStep, form.getValues());
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
  }, [watchedSignature, currentStep, status]); // eslint-disable-line react-hooks/exhaustive-deps

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
    const pdfJson = (await pdfRes.json()) as {
      error?: string;
      path?: string;
      version?: number;
      signedUrl?: string | null;
      downloadUrl?: string | null;
    };
    if (!pdfRes.ok) {
      setMessage(
        `Formulario enviado, pero no se pudo generar el PDF: ${pdfJson.error ?? "error desconocido"}`
      );
      setDraft(finalParsed.data);
      setStatus("submitted");
      return;
    }

    setDraft(finalParsed.data);
    setStatus("submitted");
    setBrandbookUrl(pdfJson.signedUrl ?? null);
    setBrandbookDownloadUrl(pdfJson.downloadUrl ?? pdfJson.signedUrl ?? null);
    setBrandbookVersion(pdfJson.version ?? null);
    setMessage("Tu guia de marca esta lista para descargar.");
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

  const reviewRows = [
    {
      label: "Marca",
      value: summaryValue(liveDraft.identity?.brandName)
    },
    {
      label: "Objetivos",
      value: summaryValue(liveDraft.goals?.businessGoals)
    },
    {
      label: "Audiencia",
      value: summaryValue(liveDraft.audience?.primaryAudience)
    },
    {
      label: "Tono",
      value: summaryValue(liveDraft.tone?.voiceAttributes)
    },
    {
      label: "Temas",
      value: summaryValue(liveDraft.pillars?.contentPillars)
    },
    {
      label: "CTA",
      value: summaryValue(liveDraft.ctas?.primaryCTA)
    }
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="space-y-2 bg-surface/90">
          <p className="text-xs font-bold uppercase text-muted-foreground">
            Progreso
          </p>
          <p className="text-3xl font-black text-foreground">
            {completionPct}%
          </p>
          <p className="text-xs font-medium text-muted-foreground">
            Se actualiza automáticamente mientras completas cada bloque.
          </p>
        </Card>
        <Card className="space-y-2 bg-surface/90">
          <p className="text-xs font-bold uppercase text-muted-foreground">
            Bloque actual
          </p>
          <p className="text-lg font-black text-foreground">
            {stepMeta[currentStep].title}
          </p>
          <p className="text-xs font-medium text-muted-foreground">
            Paso {stepIndex + 1} de {intakeStepOrder.length}
          </p>
        </Card>
        <Card className="flex min-h-[132px] flex-col justify-between gap-4 bg-surface/90">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-2">
              <p className="text-xs font-bold uppercase text-muted-foreground">
                Estado
              </p>
              <p className="text-lg font-black text-foreground">
                {statusView.label}
              </p>
            </div>
            <span
              className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border-2 ${statusView.badgeClass}`}
              aria-hidden
            >
              <statusView.Icon className={`h-5 w-5 ${statusView.iconClass}`} />
            </span>
          </div>
          <p className="text-xs font-medium leading-relaxed text-muted-foreground">
            {statusView.detail}
          </p>
        </Card>
      </div>

      <StepLayout
        title={stepMeta[currentStep].title}
        description={stepMeta[currentStep].description}
        step={stepIndex + 1}
        total={intakeStepOrder.length}
      >
        <form className="space-y-4">
          {renderFields()}
          {isLastStep ? (
            <section className="rounded-[8px] border-2 border-border bg-surface/80 p-4">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-base font-black">Revision final</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Antes de enviar, comprueba que estas senales representan
                    bien tu proyecto.
                  </p>
                </div>
                <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs font-bold">
                  {completionPct}% completo
                </span>
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                {reviewRows.map((row) => (
                  <div
                    key={row.label}
                    className="rounded-[8px] border border-border bg-background/70 p-3"
                  >
                    <p className="text-xs font-bold uppercase text-muted-foreground">
                      {row.label}
                    </p>
                    <p className="mt-1 line-clamp-3 text-sm font-semibold leading-6">
                      {row.value}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              disabled={stepIndex === 0}
              onClick={() => setStepIndex((v) => Math.max(0, v - 1))}
              className="w-full sm:w-auto"
            >
              Atrás
            </Button>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={goNext}
                disabled={isLastStep}
                className="w-full sm:w-auto"
              >
                Siguiente bloque
              </Button>
              <Button
                type="button"
                onClick={submitFinal}
                disabled={saving || status === "submitted"}
                className="w-full sm:w-auto"
              >
                {status === "submitted" ? "Enviado" : "Enviar onboarding"}
              </Button>
            </div>
          </div>
        </form>
      </StepLayout>

      <div className="rounded-[8px] border-2 border-border bg-surface/85 px-3 py-2 text-sm font-medium text-muted-foreground">
        <p aria-live="polite">
          {saving ? "Guardando…" : "Guardado automático activo"} · Progreso:{" "}
          {completionPct}% · Estado:{" "}
          {status === "draft" ? "Borrador" : "Enviado"}
        </p>
      </div>
      {message ? (
        <p
          className="rounded-[8px] border-2 border-amber-500 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900"
          role="status"
        >
          {message}
        </p>
      ) : null}
      {brandbookDownloadUrl ? (
        <div
          className="rounded-[8px] border-2 border-emerald-700 bg-emerald-50 p-4 text-emerald-950 shadow-[4px_5px_0_0_rgba(0,0,0,1)]"
          role="status"
        >
          <p className="text-sm font-black">
            Guia de marca lista
            {brandbookVersion ? `: version ${brandbookVersion}` : ""}
          </p>
          <p className="mt-1 text-xs font-medium text-emerald-900">
            Puedes descargar el PDF ahora. Tambien quedara disponible en tu
            panel principal.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <a
              href={brandbookDownloadUrl}
              download
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] border-2 border-emerald-900 bg-surface px-4 py-2 text-sm font-black text-emerald-950 shadow-[2px_4px_0_0_rgba(0,0,0,1)] transition-[background-color,box-shadow,transform] hover:translate-y-[1px] hover:bg-emerald-100 hover:shadow-[2px_3px_0_0_rgba(0,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
            >
              <Download className="h-4 w-4" aria-hidden />
              Descargar PDF
            </a>
            {brandbookUrl ? (
              <a
                href={brandbookUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] border-2 border-emerald-900 bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-950 shadow-[2px_4px_0_0_rgba(0,0,0,1)] transition-[background-color,box-shadow,transform] hover:translate-y-[1px] hover:bg-surface hover:shadow-[2px_3px_0_0_rgba(0,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
              >
                <ExternalLink className="h-4 w-4" aria-hidden />
                Abrir PDF
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
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
        <Textarea
          id={name}
          placeholder={placeholder}
          autoComplete="off"
          {...form.register(name)}
        />
      ) : (
        <Input
          id={name}
          placeholder={placeholder}
          autoComplete="off"
          {...form.register(name)}
        />
      )}
      {helperText ? (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      ) : null}
    </div>
  );
}
