"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
    <Card className="w-full space-y-4">
      <div>
        <CardTitle>Crear cuenta</CardTitle>
        <CardDescription>
          Activa tu espacio para definir brand voice, pilares y estrategia de conversion.
        </CardDescription>
      </div>
      <form action={onSubmit} className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="fullName">Nombre</Label>
          <Input id="fullName" name="fullName" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">Contrasena</Label>
          <Input id="password" name="password" type="password" minLength={8} required />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <Button className="w-full" disabled={loading}>
          {loading ? "Creando..." : "Crear cuenta y arrancar"}
        </Button>
      </form>
      <p className="text-sm text-muted-foreground">
        Ya tienes cuenta: <Link href="/login" className="underline">inicia sesion</Link>
      </p>
    </Card>
  );
}
