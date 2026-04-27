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
      setError(signInError.message);
      return;
    }
    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <Card className="w-full space-y-5 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,247,237,0.92))]">
      <div>
        <CardTitle>Entra a tu espacio privado</CardTitle>
        <CardDescription>
          Accede al panel para completar tu onboarding, subir materiales y ver
          el avance de tu sistema de marca.
        </CardDescription>
      </div>
      <form action={onSubmit} className="space-y-3">
        <div className="space-y-1">
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
            placeholder="Ej. ana@proyecto.com…"
          />
          <p
            id="login-email-help"
            className="text-xs font-medium text-muted-foreground"
          >
            Usa el correo con el que recibiste acceso a tu espacio privado.
          </p>
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">Contraseña</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              aria-describedby="login-password-help"
              placeholder="Tu contraseña…"
              className="pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
          <p
            id="login-password-help"
            className="text-xs font-medium text-muted-foreground"
          >
            Puedes mostrar la contraseña para revisar lo que escribes antes de
            entrar.
          </p>
        </div>
        <div aria-live="polite">
          {error ? (
            <p
              className="rounded-[8px] border-2 border-red-700 bg-red-50 px-3 py-2 text-sm font-medium text-red-800"
              role="alert"
            >
              {error}
            </p>
          ) : null}
        </div>
        <Button className="w-full" disabled={loading}>
          <LogIn className="h-4 w-4" aria-hidden />
          {loading ? "Entrando…" : "Entrar"}
        </Button>
      </form>
      <p className="text-sm text-muted-foreground">
        ¿Todavía no tienes acceso? Completa el formulario inicial y te
        responderé con los siguientes pasos.{" "}
        <Link href="/signup" className="underline">
          Solicitar acceso
        </Link>
      </p>
    </Card>
  );
}
