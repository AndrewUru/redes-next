"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, UserPlus } from "lucide-react";
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
      setError(
        "No pudimos crear la cuenta. Revisa los datos o prueba con otro correo."
      );
      return;
    }

    if (data.user) {
      router.replace("/dashboard");
      router.refresh();
    }
  }

  return (
    <Card className="w-full space-y-5 p-5 shadow-md sm:p-6">
      <div>
        <CardTitle>Crea tu dashboard privado</CardTitle>
        <CardDescription>
          Tendras un espacio para gestionar el trabajo conmigo: formularios,
          materiales, guías, avances y próximos pasos en un solo lugar.
        </CardDescription>
      </div>
      <form action={onSubmit} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="fullName">Nombre</Label>
          <Input
            id="fullName"
            name="fullName"
            autoComplete="name"
            placeholder="Ej. Ana García…"
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
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
        <div className="space-y-1">
          <Label htmlFor="password">Contraseña</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              minLength={8}
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres…"
              className="pr-12"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-0.5 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-controls="password"
              aria-pressed={showPassword}
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden />
              ) : (
                <Eye className="h-4 w-4" aria-hidden />
              )}
            </button>
          </div>
          <p className="text-xs font-medium text-muted-foreground">
            Usa al menos 8 caracteres para proteger tu espacio privado.
          </p>
        </div>
        <div aria-live="polite">
          {error ? (
            <p
              className="rounded-lg border border-danger/25 bg-danger/10 px-3 py-2 text-sm font-medium text-foreground"
              role="alert"
            >
              {error}
            </p>
          ) : null}
        </div>
        <Button className="w-full" disabled={loading}>
          <UserPlus className="h-4 w-4" aria-hidden />
          {loading ? "Creando…" : "Crear mi dashboard"}
        </Button>
      </form>
      <p className="text-sm text-muted-foreground">
        Ya tienes dashboard?{" "}
        <Link href="/login" className="underline">
          Entrar
        </Link>
      </p>
    </Card>
  );
}
