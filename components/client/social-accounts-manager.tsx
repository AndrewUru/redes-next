"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SocialAccountRow, SocialPlatform } from "@/lib/db/types";

type CreatePayload = {
  platform: SocialPlatform;
  accountName: string;
  accountHandle?: string;
  externalAccountId?: string;
};

const platforms: SocialPlatform[] = ["instagram", "facebook"];

function platformLabel(platform: SocialPlatform) {
  return platform === "instagram" ? "Instagram" : "Facebook";
}

export function SocialAccountsManager() {
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<SocialAccountRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CreatePayload>({
    platform: "instagram",
    accountName: "",
    accountHandle: "",
    externalAccountId: ""
  });

  async function load() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/client/social-accounts");
    const json = (await res.json()) as { error?: string; accounts?: SocialAccountRow[] };
    setLoading(false);
    if (!res.ok) {
      setError(json.error ?? "No se pudo cargar");
      return;
    }
    setAccounts(json.accounts ?? []);
  }

  async function connect() {
    setSaving(true);
    setError(null);
    const res = await fetch("/api/client/social-accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const json = (await res.json()) as { error?: string };
    setSaving(false);
    if (!res.ok) {
      setError(json.error ?? "No se pudo conectar cuenta");
      return;
    }
    setForm({
      platform: form.platform,
      accountName: "",
      accountHandle: "",
      externalAccountId: ""
    });
    await load();
  }

  async function disconnect(id: string) {
    const res = await fetch(`/api/client/social-accounts?id=${id}`, { method: "DELETE" });
    if (!res.ok) {
      const json = (await res.json()) as { error?: string };
      setError(json.error ?? "No se pudo desconectar");
      return;
    }
    await load();
  }

  useEffect(() => {
    void load();
  }, []);

  const oauthState = searchParams.get("oauth");
  const oauthReason = searchParams.get("reason");
  const hasAccounts = accounts.length > 0;

  return (
    <main className="space-y-4">
      <Card id="conectar-redes" className="space-y-4 overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(254,249,195,0.92))]">
        <div className="grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-3">
            <CardTitle>Conectar social accounts</CardTitle>
            <CardDescription>
              Integra Instagram y Facebook para analisis platform-specific, retencion y conversion.
            </CardDescription>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border-2 border-border bg-white/90 p-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Paso 1
                </p>
                <p className="mt-1 text-sm font-black">Conecta la cuenta</p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  Autoriza Instagram para leer perfil, posts y señales clave.
                </p>
              </div>
              <div className="rounded-2xl border-2 border-border bg-white/90 p-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Paso 2
                </p>
                <p className="mt-1 text-sm font-black">Capturamos snapshots</p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  Seguidores, alcance, engagement e interacciones quedan guardados.
                </p>
              </div>
              <div className="rounded-2xl border-2 border-border bg-white/90 p-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  Paso 3
                </p>
                <p className="mt-1 text-sm font-black">Lees la evolucion</p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  Entra al dashboard para ver tendencia y top publicaciones.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-border bg-[#eff6ff] p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <p className="text-sm font-black">Preview del panel de metricas</p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {hasAccounts
                ? "Ya puedes entrar al analisis visual de evolucion."
                : "Conecta al menos una cuenta para desbloquear el analisis completo."}
            </p>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-border bg-white/90 p-3">
                <div className="flex items-end gap-2">
                  {[28, 34, 47, 53, 61, 74].map((bar, index) => (
                    <div
                      key={`preview-followers-${index}`}
                      className="h-20 flex-1 rounded-t-md bg-[linear-gradient(180deg,#0ea5e9,#22c55e)]"
                      style={{ height: `${bar}%` }}
                    />
                  ))}
                </div>
                <p className="mt-2 text-xs font-bold text-foreground">Seguidores y alcance</p>
              </div>
              <div className="rounded-xl border border-border bg-white/90 p-3">
                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>Engagement</span>
                  <span>Top posts</span>
                </div>
                <div className="mt-2 grid gap-2">
                  <div className="h-3 rounded-full border border-border bg-white">
                    <div className="h-full w-[68%] rounded-full bg-[#f97316]" />
                  </div>
                  <div className="h-3 rounded-full border border-border bg-white">
                    <div className="h-full w-[84%] rounded-full bg-[#8b5cf6]" />
                  </div>
                </div>
              </div>
            </div>
            <Link href="/client/accounts#insights" className="mt-4 inline-block text-sm font-black underline">
              Ir al dashboard de evolucion
            </Link>
          </div>
        </div>

        <CardTitle>Conectar social accounts</CardTitle>
        <CardDescription>
          Integra Instagram y Facebook para analisis platform-specific, retencion y conversion.
        </CardDescription>
        <div className="rounded-md border border-border bg-muted/20 p-3">
          <p className="mb-2 text-sm font-medium">Instagram OAuth (Meta)</p>
          <p className="mb-3 text-xs text-muted-foreground">
            Este flujo autoriza tu cuenta real y valida lectura de perfil/media.
          </p>
          <Button
            type="button"
            onClick={() => {
              window.location.href = "/api/client/social-accounts/instagram/start";
            }}
            className="w-full sm:w-auto"
          >
            Conectar con Instagram (OAuth)
          </Button>
        </div>
        {oauthState === "success" ? (
          <p className="text-sm text-green-700">Instagram conectada y verificada correctamente.</p>
        ) : null}
        {oauthState === "error" ? (
          <p className="text-sm text-red-600">
            Fallo OAuth de Instagram{oauthReason ? ` (${oauthReason})` : ""}.
          </p>
        ) : null}
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="platform">Plataforma</Label>
            <select
              id="platform"
              className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={form.platform}
              onChange={(e) =>
                setForm((current) => ({ ...current, platform: e.target.value as SocialPlatform }))
              }
            >
              {platforms.map((platform) => (
                <option key={platform} value={platform}>
                  {platformLabel(platform)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="accountName">Nombre de la cuenta</Label>
            <Input
              id="accountName"
              value={form.accountName}
              onChange={(e) => setForm((current) => ({ ...current, accountName: e.target.value }))}
              placeholder="Marca o proyecto"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="accountHandle">Handle (opcional)</Label>
            <Input
              id="accountHandle"
              value={form.accountHandle}
              onChange={(e) => setForm((current) => ({ ...current, accountHandle: e.target.value }))}
              placeholder="@mi_marca"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="externalAccountId">ID externo (opcional)</Label>
            <Input
              id="externalAccountId"
              value={form.externalAccountId}
              onChange={(e) =>
                setForm((current) => ({ ...current, externalAccountId: e.target.value }))
              }
              placeholder="123456789"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            onClick={connect}
            disabled={saving || form.accountName.trim().length === 0}
            className="w-full sm:w-auto"
          >
            {saving ? "Guardando..." : "Guardar cuenta manual"}
          </Button>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
      </Card>

      <Card id="insights">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Cuentas conectadas</CardTitle>
            <CardDescription className="mt-1">
              Desde aqui validas si ya hay base suficiente para revisar la evolucion completa.
            </CardDescription>
          </div>
          <Link
            href="/client/accounts"
            className="inline-flex h-10 items-center justify-center rounded-xl border-2 border-border bg-[#fde68a] px-4 text-sm font-black shadow-[2px_5px_0_0_rgba(0,0,0,1)] transition-all hover:translate-y-[1px] hover:shadow-[2px_4px_0_0_rgba(0,0,0,1)]"
          >
            Ver metricas completas
          </Link>
        </div>
        {loading ? (
          <p className="text-sm text-muted-foreground">Cargando...</p>
        ) : accounts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aun no hay cuentas conectadas. Sin esto no hay metricas platform-specific.
          </p>
        ) : (
          <ul className="space-y-2">
            {accounts.map((account) => (
              <li
                key={account.id}
                className="flex flex-col gap-2 rounded-md border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">
                    {platformLabel(account.platform)}: {account.account_name}
                  </p>
                  <p className="break-all text-xs text-muted-foreground">
                    {account.account_handle || "sin handle"} | {account.status}
                  </p>
                </div>
                <Button variant="outline" onClick={() => void disconnect(account.id)} className="w-full sm:w-auto">
                  Desconectar cuenta
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </main>
  );
}
