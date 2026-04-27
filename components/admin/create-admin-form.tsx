"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateAdminForm() {
  const router = useRouter();
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
    const json = (await res.json()) as {
      error?: string;
      tempPassword?: string;
    };
    if (!res.ok) {
      setError(json.error ?? "No se pudo crear el administrador");
      return;
    }
    setDone(
      json.tempPassword
        ? `Administrador creado. Contraseña temporal: ${json.tempPassword}`
        : "Administrador creado."
    );
    router.refresh();
  }

  return (
    <form
      action={onSubmit}
      className="space-y-3 rounded-[8px] border-2 border-border bg-white/70 p-4"
    >
      <h3 className="text-lg font-black">Alta de administrador</h3>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <Label htmlFor="adminFullName">Nombre completo</Label>
          <Input
            id="adminFullName"
            name="fullName"
            autoComplete="name"
            placeholder="Ej. Ana García…"
            required
          />
        </div>
        <div>
          <Label htmlFor="adminEmail">Email del administrador</Label>
          <Input
            id="adminEmail"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            spellCheck={false}
            placeholder="Ej. admin@proyecto.com…"
            required
          />
        </div>
      </div>
      <div aria-live="polite" className="space-y-2">
        {error ? (
          <p className="text-sm font-medium text-red-700">{error}</p>
        ) : null}
        {done ? (
          <p className="text-sm font-medium text-emerald-800">{done}</p>
        ) : null}
      </div>
      <Button disabled={loading}>
        <ShieldPlus className="h-4 w-4" aria-hidden />
        {loading ? "Creando…" : "Crear administrador"}
      </Button>
    </form>
  );
}
