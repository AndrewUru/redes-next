"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateClientForm() {
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
    const json = (await res.json()) as { error?: string; tempPassword?: string };
    if (!res.ok) {
      setError(json.error ?? "No se pudo crear la cuenta en el pipeline");
      return;
    }
    setDone(
      json.tempPassword
        ? `Cuenta creada. Contrasena temporal: ${json.tempPassword}`
        : "Cuenta creada."
    );
    window.location.reload();
  }

  return (
    <form action={onSubmit} className="space-y-3 rounded-xl border border-border p-4">
      <h3 className="font-semibold">Alta de cliente y posicionamiento inicial</h3>
      <div className="grid gap-3 md:grid-cols-3">
        <div>
          <Label htmlFor="displayName">Nombre de marca</Label>
          <Input id="displayName" name="displayName" required />
        </div>
        <div>
          <Label htmlFor="fullName">Nombre del contacto</Label>
          <Input id="fullName" name="fullName" required />
        </div>
        <div>
          <Label htmlFor="email">Email del cliente</Label>
          <Input id="email" name="email" type="email" required />
        </div>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {done ? <p className="text-sm text-green-700">{done}</p> : null}
      <Button disabled={loading}>
        {loading ? "Creando..." : "Crear cuenta + activar onboarding"}
      </Button>
    </form>
  );
}
