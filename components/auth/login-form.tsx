"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function LoginForm() {
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
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    setLoading(false);

    if (signInError) {
      setError(
        "No se pudo iniciar sesión. Revisa el email y la contraseña e inténtalo de nuevo."
      );
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <Card className="w-full space-y-6 p-5 sm:p-6">
      <div className="space-y-2">
        <CardTitle>Entrar</CardTitle>
        <CardDescription>
          Usa las credenciales que recibiste para acceder a tu dashboard privado.
        </CardDescription>
      </div>

      <form action={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            spellCheck={false}
            required
            aria-describedby="login-email-help"
            placeholder="Ej. ana@proyecto.com"
          />
          <p id="login-email-help" className="text-sm text-muted-foreground">
            Usa el correo asociado a tu espacio privado.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              aria-describedby="login-password-help"
              placeholder="Tu contraseña"
              className="pr-14"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-1.5 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-controls="password"
              aria-pressed={showPassword}
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>
          <p id="login-password-help" className="text-sm text-muted-foreground">
            Puedes mostrarla para revisar lo que escribes antes de entrar.
          </p>
        </div>

        <div aria-live="polite">
          {error ? (
            <p
              className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
              role="alert"
            >
              {error}
            </p>
          ) : null}
        </div>

        <Button className="min-h-12 w-full" disabled={loading}>
          <LogIn className="h-4 w-4" aria-hidden="true" />
          {loading ? "Entrando…" : "Entrar al dashboard"}
        </Button>
      </form>

      <p className="border-t border-border pt-4 text-sm leading-6 text-muted-foreground">
        ¿Todavía no tienes acceso?{" "}
        <Link
          href="/signup"
          className="font-medium text-foreground underline underline-offset-4"
        >
          Solicitar acceso
        </Link>
      </p>
    </Card>
  );
}
