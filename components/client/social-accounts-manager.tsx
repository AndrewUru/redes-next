"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  ExternalLink,
  Instagram,
  Plus,
  Unplug
} from "lucide-react";
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [form, setForm] = useState<CreatePayload>({
    platform: "instagram",
    accountName: "",
    accountHandle: "",
    externalAccountId: ""
  });

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/client/social-accounts");
      const json = (await res.json()) as {
        error?: string;
        accounts?: SocialAccountRow[];
      };
      if (!res.ok) {
        setError(json.error ?? "No se pudieron cargar las cuentas conectadas.");
        return;
      }
      setAccounts(json.accounts ?? []);
    } catch {
      setError("No se pudieron cargar las cuentas conectadas.");
    } finally {
      setLoading(false);
    }
  }

  async function connect() {
    setSaving(true);
    setError(null);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/client/social-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          accountName: form.accountName.trim(),
          accountHandle: form.accountHandle?.trim(),
          externalAccountId: form.externalAccountId?.trim()
        })
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "No se pudo conectar la cuenta.");
        return;
      }
    } catch {
      setError(
        "No se pudo conectar la cuenta. Comprueba tu conexión e inténtalo de nuevo."
      );
      return;
    } finally {
      setSaving(false);
    }

    setForm({
      platform: form.platform,
      accountName: "",
      accountHandle: "",
      externalAccountId: ""
    });
    setStatusMessage("Cuenta guardada correctamente.");
    await load();
  }

  async function disconnect(id: string) {
    const shouldDisconnect = window.confirm(
      "¿Quieres desconectar esta cuenta?"
    );
    if (!shouldDisconnect) return;

    setDeletingId(id);
    setError(null);
    setStatusMessage(null);
    try {
      const res = await fetch(`/api/client/social-accounts?id=${id}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const json = (await res.json()) as { error?: string };
        setError(json.error ?? "No se pudo desconectar la cuenta.");
        return;
      }
      setStatusMessage("Cuenta desconectada.");
      await load();
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const oauthState = searchParams.get("oauth");
  const oauthReason = searchParams.get("reason");
  const hasAccounts = accounts.length > 0;

  return (
    <div className="space-y-4">
      <Card
        id="conectar-redes"
        className="space-y-5 overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(254,249,195,0.92))]"
      >
        <div className="grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-3">
            <CardTitle>Conectar cuentas sociales</CardTitle>
            <CardDescription>
              Integra Instagram y Facebook para medir evolución, retención y
              conversión desde un único panel.
            </CardDescription>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-[8px] border-2 border-border bg-white/90 p-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <p className="text-xs font-bold uppercase text-muted-foreground">
                  Paso 1
                </p>
                <p className="mt-1 text-sm font-black">Conecta la cuenta</p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  Autoriza Instagram para leer perfil, posts y señales clave.
                </p>
              </div>
              <div className="rounded-[8px] border-2 border-border bg-white/90 p-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <p className="text-xs font-bold uppercase text-muted-foreground">
                  Paso 2
                </p>
                <p className="mt-1 text-sm font-black">Capturamos snapshots</p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  Seguidores, alcance, engagement e interacciones quedan
                  guardados.
                </p>
              </div>
              <div className="rounded-[8px] border-2 border-border bg-white/90 p-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <p className="text-xs font-bold uppercase text-muted-foreground">
                  Paso 3
                </p>
                <p className="mt-1 text-sm font-black">Lees la evolución</p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  Entra al dashboard para ver tendencia y top publicaciones.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[8px] border-2 border-border bg-[#eff6ff] p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <p className="text-sm font-black">Preview del panel de métricas</p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {hasAccounts
                ? "Ya puedes entrar al análisis visual de evolución."
                : "Conecta al menos una cuenta para desbloquear el análisis completo."}
            </p>
            <div className="mt-4 space-y-3">
              <div className="rounded-[8px] border border-border bg-white/90 p-3">
                <div className="flex items-end gap-2">
                  {[28, 34, 47, 53, 61, 74].map((bar, index) => (
                    <div
                      key={`preview-followers-${index}`}
                      className="h-20 flex-1 rounded-t-md bg-[linear-gradient(180deg,#0ea5e9,#22c55e)]"
                      style={{ height: `${bar}%` }}
                    />
                  ))}
                </div>
                <p className="mt-2 text-xs font-bold text-foreground">
                  Seguidores y alcance
                </p>
              </div>
              <div className="rounded-[8px] border border-border bg-white/90 p-3">
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
            <Link
              href="/client/accounts#insights"
              className="mt-4 inline-flex items-center gap-2 text-sm font-black underline"
            >
              <BarChart3 className="h-4 w-4" aria-hidden />
              Ir al dashboard de evolución
            </Link>
          </div>
        </div>

        <div className="rounded-[8px] border-2 border-border bg-white/75 p-3">
          <p className="mb-2 flex items-center gap-2 text-sm font-black">
            <Instagram className="h-4 w-4" aria-hidden />
            Instagram OAuth (Meta)
          </p>
          <p className="mb-3 text-xs text-muted-foreground">
            Este flujo autoriza tu cuenta real y valida lectura de perfil/media.
          </p>
          <Button
            type="button"
            onClick={() => {
              window.location.href =
                "/api/client/social-accounts/instagram/start";
            }}
            className="w-full sm:w-auto"
          >
            <Instagram className="h-4 w-4" aria-hidden />
            Conectar con Instagram (OAuth)
          </Button>
        </div>
        <div aria-live="polite" className="space-y-2">
          {oauthState === "success" ? (
            <p className="flex items-center gap-2 rounded-[8px] border-2 border-emerald-700 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              Instagram conectada y verificada correctamente.
            </p>
          ) : null}
          {oauthState === "error" ? (
            <p className="flex items-center gap-2 rounded-[8px] border-2 border-red-700 bg-red-50 px-3 py-2 text-sm font-medium text-red-800">
              <AlertCircle className="h-4 w-4" aria-hidden />
              Fallo OAuth de Instagram{oauthReason ? ` (${oauthReason})` : ""}.
            </p>
          ) : null}
          {statusMessage ? (
            <p className="flex items-center gap-2 rounded-[8px] border-2 border-emerald-700 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              {statusMessage}
            </p>
          ) : null}
          {error ? (
            <p className="flex items-center gap-2 rounded-[8px] border-2 border-red-700 bg-red-50 px-3 py-2 text-sm font-medium text-red-800">
              <AlertCircle className="h-4 w-4" aria-hidden />
              {error}
            </p>
          ) : null}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="platform">Plataforma</Label>
            <select
              id="platform"
              name="platform"
              className="min-h-10 w-full rounded-[8px] border-2 border-border bg-background px-3 text-sm shadow-[2px_3px_0_0_rgba(0,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              value={form.platform}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  platform: e.target.value as SocialPlatform
                }))
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
              name="accountName"
              autoComplete="off"
              value={form.accountName}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  accountName: e.target.value
                }))
              }
              placeholder="Ej. Marca o proyecto…"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="accountHandle">Handle (opcional)</Label>
            <Input
              id="accountHandle"
              name="accountHandle"
              autoComplete="off"
              spellCheck={false}
              value={form.accountHandle}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  accountHandle: e.target.value
                }))
              }
              placeholder="Ej. @mi_marca…"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="externalAccountId">ID externo (opcional)</Label>
            <Input
              id="externalAccountId"
              name="externalAccountId"
              autoComplete="off"
              inputMode="numeric"
              value={form.externalAccountId}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  externalAccountId: e.target.value
                }))
              }
              placeholder="Ej. 123456789…"
            />
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button
            type="button"
            onClick={connect}
            disabled={saving || form.accountName.trim().length === 0}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" aria-hidden />
            {saving ? "Guardando…" : "Guardar cuenta manual"}
          </Button>
        </div>
      </Card>

      <Card id="insights">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Cuentas conectadas</CardTitle>
            <CardDescription className="mt-1">
              Desde aquí validas si ya hay base suficiente para revisar la
              evolución completa.
            </CardDescription>
          </div>
          <Link
            href="/client/accounts"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[8px] border-2 border-border bg-[#fde68a] px-4 py-2 text-sm font-black shadow-[2px_5px_0_0_rgba(0,0,0,1)] transition-[background-color,border-color,box-shadow,transform] hover:translate-y-[1px] hover:bg-[#f2d048] hover:shadow-[2px_4px_0_0_rgba(0,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
            Ver métricas completas
          </Link>
        </div>
        {loading ? (
          <p className="rounded-[8px] border-2 border-dashed border-border bg-white/60 p-4 text-sm font-medium text-muted-foreground">
            Cargando cuentas…
          </p>
        ) : accounts.length === 0 ? (
          <div className="rounded-[8px] border-2 border-dashed border-border bg-white/60 p-4 text-sm font-medium text-muted-foreground">
            Aún no hay cuentas conectadas. Conecta Instagram para activar
            métricas específicas de plataforma.
          </div>
        ) : (
          <ul className="space-y-2">
            {accounts.map((account) => (
              <li
                key={account.id}
                className="flex flex-col gap-3 rounded-[8px] border-2 border-border bg-white/75 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-black">
                    {platformLabel(account.platform)}: {account.account_name}
                  </p>
                  <p className="break-all text-xs text-muted-foreground">
                    {account.account_handle || "sin handle"} · {account.status}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void disconnect(account.id)}
                  disabled={deletingId === account.id}
                  className="w-full sm:w-auto"
                >
                  <Unplug className="h-4 w-4" aria-hidden />
                  Desconectar cuenta
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
