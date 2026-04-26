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
        <CardTitle> Cuéntame tu proyecto</CardTitle>
        <CardDescription>
          Si quieres trabajar conmigo tu estrategia de contenido, este es + el
          primer paso. Reviso tu caso y te respondo con una propuesta + de
          enfoque.
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
            required
            aria-describedby="login-email-help"
          />
          <p
            id="login-email-help"
            className="text-xs font-medium text-muted-foreground"
          >
            Usa el correo con el que recibiste acceso a tu espacio privado.
          </p>
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
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden />
              ) : (
                <Eye className="h-4 w-4" aria-hidden />
              )}
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              aria-describedby="login-password-help"
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
        {error ? (
          <p
            className="rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        ) : null}
        <Button className="w-full" disabled={loading}>
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
