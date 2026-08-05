"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateClientForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setDone(null);
    const payload = {
      displayName: String(formData.get("displayName") ?? ""),
      email: String(formData.get("email") ?? ""),
      fullName: String(formData.get("fullName") ?? "")
    };

    const res = await fetch("/api/admin/create-client", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setLoading(false);
    const json = (await res.json()) as {
      error?: string;
      tempPassword?: string;
    };
    if (!res.ok) {
      setError(json.error ?? "No se pudo crear la cuenta en el pipeline");
      return;
    }
    setDone(
      json.tempPassword
        ? `Cuenta creada. Contraseña temporal: ${json.tempPassword}`
        : "Cuenta creada."
    );
    router.refresh();
  }

  return (
    <form
      action={onSubmit}
      className="space-y-4 rounded-xl border border-border bg-surface p-4 shadow-xs sm:p-5"
    >
      <h3 className="text-base font-semibold">
        Alta de cliente y posicionamiento inicial
      </h3>
      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <Label htmlFor="displayName">Nombre de marca</Label>
          <Input
            id="displayName"
            name="displayName"
            autoComplete="organization"
            placeholder="Ej. Estudio Norte…"
            required
          />
        </div>
        <div>
          <Label htmlFor="fullName">Nombre del contacto</Label>
          <Input
            id="fullName"
            name="fullName"
            autoComplete="name"
            placeholder="Ej. Ana García…"
            required
          />
        </div>
        <div>
          <Label htmlFor="email">Email del cliente</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            spellCheck={false}
            placeholder="Ej. ana@proyecto.com…"
            required
          />
        </div>
      </div>
      <div aria-live="polite" className="space-y-2">
        {error ? (
          <p className="text-sm font-medium text-danger" role="alert">
            {error}
          </p>
        ) : null}
        {done ? (
          <p className="text-sm font-medium text-success">{done}</p>
        ) : null}
      </div>
      <Button disabled={loading}>
        <UserPlus className="h-4 w-4" aria-hidden />
        {loading ? "Creando…" : "Crear cuenta + activar onboarding"}
      </Button>
    </form>
  );
}
