"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateAdminForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setDone(null);
    const payload = {
      email: String(formData.get("email") ?? ""),
      fullName: String(formData.get("fullName") ?? "")
    };

    const res = await fetch("/api/admin/create-admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setLoading(false);
    const json = (await res.json()) as { error?: string; tempPassword?: string };
    if (!res.ok) {
      setError(json.error ?? "No se pudo crear el administrador");
      return;
    }
    setDone(
      json.tempPassword
        ? `Administrador creado. Contrasena temporal: ${json.tempPassword}`
        : "Administrador creado."
    );
    window.location.reload();
  }

  return (
    <form action={onSubmit} className="space-y-3 rounded-xl border border-border p-4">
      <h3 className="font-semibold">Alta de administrador</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <Label htmlFor="adminFullName">Nombre completo</Label>
          <Input id="adminFullName" name="fullName" required />
        </div>
        <div>
          <Label htmlFor="adminEmail">Email del administrador</Label>
          <Input id="adminEmail" name="email" type="email" required />
        </div>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {done ? <p className="text-sm text-green-700">{done}</p> : null}
      <Button disabled={loading}>{loading ? "Creando..." : "Crear administrador"}</Button>
    </form>
  );
}
