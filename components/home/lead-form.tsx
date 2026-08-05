"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type FormState = { ok: true; id: string } | { ok: false; error: string } | null;

export function LeadForm() {
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
          <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-300/30 dark:bg-emerald-300/10 dark:text-emerald-100">
            He recibido tu solicitud. Te escribiré pronto con los siguientes
            pasos. Ref: {result.id}
          </p>
        ) : null}
        {result?.ok === false ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-300/30 dark:bg-red-300/10 dark:text-red-100">
            {result.error}
          </p>
        ) : null}
      </div>
    </form>
  );
}
