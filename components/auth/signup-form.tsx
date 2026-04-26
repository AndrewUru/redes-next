"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function SignupForm() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const fullName = String(formData.get("fullName") ?? "");

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });

    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.user) {
      router.replace("/dashboard");
      router.refresh();
    }
  }

  return (
    <Card className="w-full space-y-5 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(239,246,255,0.92))]">
      <div>
        <CardTitle>Solicita tu acceso privado</CardTitle>
        <CardDescription>
          Crea tu acceso para compartir información, materiales y seguir el proceso de trabajo desde un solo espacio.
        </CardDescription>
      </div>
      <form action={onSubmit} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="fullName">Nombre</Label>
          <Input id="fullName" name="fullName" autoComplete="name" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="password">Contraseña</Label>
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-controls="password"
              aria-pressed={showPassword}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              minLength={8}
              autoComplete="new-password"
              className="pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-controls="password"
              aria-pressed={showPassword}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
            </button>
          </div>
          <p className="text-xs font-medium text-muted-foreground">
            Usa al menos 8 caracteres para proteger tu espacio privado.
          </p>
        </div>
        {error ? (
          <p className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        <Button className="w-full" disabled={loading}>
          {loading ? "Creando…" : "Crear acceso"}
        </Button>
      </form>
      <p className="text-sm text-muted-foreground">
        ¿Ya tienes acceso? <Link href="/login" className="underline">Entrar al espacio privado</Link>
      </p>
    </Card>
  );
}
