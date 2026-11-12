"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { currentMonday, type ContentPlan } from "@/lib/content/schema";

const days = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo"
];
const inputClass =
  "w-full rounded-lg border border-border bg-background p-3 text-sm";

export default function ContentPage() {
  const [plans, setPlans] = useState<ContentPlan[]>([]);
  const [selected, setSelected] = useState<ContentPlan | null>(null);
  const [week, setWeek] = useState(currentMonday);
  const [count, setCount] = useState(4);
  const [busy, setBusy] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const response = await fetch("/api/client/content-plans");
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        if (active) setPlans(data.plans);
      } catch (error) {
        if (active)
          setMessage(
            error instanceof Error
              ? error.message
              : "No se pudieron cargar los planes."
          );
      } finally {
        if (active) setBusy(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  async function submit(method: "POST" | "PATCH", status = "draft") {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/client/content-plans", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          method === "POST"
            ? { week, count }
            : {
                id: selected?.id,
                revision: selected?.revision,
                content: selected?.content,
                status
              }
        )
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setPlans((old) =>
        [data.plan, ...old.filter((p) => p.id !== data.plan.id)].sort((a, b) =>
          b.week_start.localeCompare(a.week_start)
        )
      );
      setSelected(data.plan);
      setDirty(false);
      setMessage(
        status === "approved"
          ? "Plan aprobado para producción. No se ha publicado en Instagram."
          : "Borrador guardado."
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "No se pudo completar la operación."
      );
    } finally {
      setBusy(false);
    }
  }

  function exportPlan() {
    if (!selected) return;
    const url = URL.createObjectURL(
      new Blob(
        [
          JSON.stringify(
            {
              schemaVersion: 1,
              timezone: "Europe/Madrid",
              weekStart: selected.week_start,
              editorialStatus: selected.status,
              ...selected.content
            },
            null,
            2
          )
        ],
        { type: "application/json" }
      )
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `plan-${selected.week_start}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-8">
      <header>
        <h1 className="text-3xl font-semibold">Contenido semanal</h1>
        <p className="mt-2 text-muted-foreground">
          Prepara guiones y copies a partir de tu marca. Revisa el lote y
          expórtalo para producir las piezas.
        </p>
      </header>
      <form
        className="flex flex-wrap items-end gap-4 rounded-xl border border-border p-5"
        onSubmit={(event) => {
          event.preventDefault();
          void submit("POST");
        }}
      >
        <label className="space-y-2 text-sm">
          Semana (lunes)
          <input
            required
            type="date"
            className={inputClass}
            value={week}
            disabled={busy}
            onChange={(event) => setWeek(event.target.value)}
          />
        </label>
        <label className="space-y-2 text-sm">
          Publicaciones
          <input
            required
            type="number"
            min={1}
            max={7}
            className={inputClass}
            value={count}
            disabled={busy}
            onChange={(event) => setCount(Number(event.target.value))}
          />
        </label>
        <Button disabled={busy || dirty} type="submit">
          {busy ? "Procesando…" : "Generar semana con IA"}
        </Button>
        <p className="w-full text-xs text-muted-foreground">
          Requiere el onboarding completo. Cada generación utiliza la API de IA
          configurada. No genera archivos de vídeo ni programa publicaciones.
        </p>
      </form>
      <p role="status" aria-live="polite">
        {message}
      </p>
      {plans.length === 0 && !busy && (
        <p className="rounded-xl bg-muted p-6">
          Todavía no hay planes. Elige un lunes para preparar el primero.
        </p>
      )}
      <div className="flex flex-wrap gap-2" aria-label="Planes guardados">
        {plans.map((plan) => (
          <Button
            key={plan.id}
            variant="outline"
            disabled={busy || dirty}
            aria-pressed={selected?.id === plan.id}
            onClick={() => {
              setSelected(plan);
              setMessage("");
            }}
          >
            Semana {plan.week_start} ·{" "}
            {plan.status === "approved" ? "Aprobada" : "Borrador"}
          </Button>
        ))}
      </div>
      {selected && (
        <section className="space-y-5" aria-label="Revisión del plan">
          <div className="rounded-xl bg-muted p-5">
            <h2 className="font-semibold">Semana del {selected.week_start}</h2>
            <p className="mt-2 whitespace-pre-wrap text-sm">
              {selected.content.rationale}
            </p>
          </div>
          {selected.content.items.map((item, index) => (
            <article
              className="space-y-4 rounded-xl border border-border p-5"
              key={`${selected.id}-${index}`}
            >
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-semibold">Pieza {index + 1}</h3>
                <select
                  aria-label={`Día de la pieza ${index + 1}`}
                  className="rounded border border-border bg-background p-2 text-sm"
                  disabled={busy}
                  value={item.day}
                  onChange={(event) => {
                    const day = Number(event.target.value);
                    setSelected({
                      ...selected,
                      status: "draft",
                      content: {
                        ...selected.content,
                        items: selected.content.items.map((value, position) =>
                          position === index ? { ...value, day } : value
                        )
                      }
                    });
                    setDirty(true);
                  }}
                >
                  {days.map((day, number) => (
                    <option key={day} value={number}>
                      {day}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-muted-foreground">
                  {item.format === "carousel"
                    ? "Carrusel"
                    : item.format === "reel"
                      ? "Reel"
                      : "Imagen"}
                </span>
              </div>
              {(
                [
                  ["title", "Tema"],
                  ["objective", "Objetivo"],
                  ["hook", "Gancho"],
                  ["script", "Guion / diapositivas"],
                  ["caption", "Copy"],
                  ["materials", "Material necesario"]
                ] as const
              ).map(([field, label]) => (
                <label className="block space-y-2 text-sm" key={field}>
                  <span className="font-medium">{label}</span>
                  <textarea
                    className={inputClass}
                    rows={field === "script" || field === "caption" ? 5 : 2}
                    disabled={busy}
                    value={item[field]}
                    onChange={(event) => {
                      const value = event.target.value;
                      setSelected({
                        ...selected,
                        status: "draft",
                        content: {
                          ...selected.content,
                          items: selected.content.items.map(
                            (entry, position) =>
                              position === index
                                ? { ...entry, [field]: value }
                                : entry
                          )
                        }
                      });
                      setDirty(true);
                    }}
                  />
                </label>
              ))}
            </article>
          ))}
          <div className="flex flex-wrap gap-3">
            <Button disabled={busy} onClick={() => void submit("PATCH")}>
              Guardar borrador
            </Button>
            <Button
              disabled={busy}
              onClick={() => void submit("PATCH", "approved")}
            >
              Aprobar para producción
            </Button>
            <Button
              variant="outline"
              disabled={busy || dirty}
              onClick={exportPlan}
            >
              Exportar JSON
            </Button>
            {dirty && (
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => {
                  setSelected(
                    plans.find((plan) => plan.id === selected.id) ?? null
                  );
                  setDirty(false);
                }}
              >
                Descartar cambios
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {dirty
              ? "Hay cambios sin guardar. Guarda o descarta antes de cambiar de semana o exportar."
              : "La aprobación es editorial. La producción del vídeo y la publicación en Instagram aún no están conectadas."}
          </p>
        </section>
      )}
    </div>
  );
}
