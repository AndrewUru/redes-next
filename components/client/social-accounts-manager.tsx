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
  Unplug
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { SocialAccountRow, SocialPlatform } from "@/lib/db/types";

function platformLabel(platform: SocialPlatform) {
  return platform === "instagram" ? "Instagram" : "Facebook";
}

export function SocialAccountsManager() {
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState<SocialAccountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

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
      <Card id="conectar-redes" className="space-y-5 overflow-hidden">
        <div className="grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-3">
            <CardTitle>Conecta tu Instagram</CardTitle>
            <CardDescription>
              Inicia sesion con Instagram para que podamos leer datos basicos de
              tu perfil y preparar una lectura clara de la evolución.
            </CardDescription>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-border bg-slate-50 p-4 shadow-sm">
                <p className="text-xs font-bold uppercase text-muted-foreground">
                  Paso 1
                </p>
                <p className="mt-1 text-sm font-bold">Pulsa conectar</p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  Instagram te pedira permiso de forma segura.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-slate-50 p-4 shadow-sm">
                <p className="text-xs font-bold uppercase text-muted-foreground">
                  Paso 2
                </p>
                <p className="mt-1 text-sm font-bold">Recogemos datos</p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  Guardamos seguidores, alcance e interacciones para ver
                  cambios.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-slate-50 p-4 shadow-sm">
                <p className="text-xs font-bold uppercase text-muted-foreground">
                  Paso 3
                </p>
                <p className="mt-1 text-sm font-semibold">Ves la evolución</p>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  El panel traduce los números en señales útiles.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4 shadow-sm">
            <p className="text-sm font-bold">Vista previa de resultados</p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              {hasAccounts
                ? "Ya puedes revisar el panel completo."
                : "Conecta Instagram para activar el analisis completo."}
            </p>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl border border-border bg-surface/95 p-3">
                <div className="flex items-end gap-2">
                  {[28, 34, 47, 53, 61, 74].map((bar, index) => (
                    <div
                      key={`preview-followers-${index}`}
                      className="h-20 flex-1 rounded-t-md bg-primary"
                      style={{ height: `${bar}%` }}
                    />
                  ))}
                </div>
                <p className="mt-2 text-xs font-bold text-foreground">
                  Seguidores y alcance
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface/95 p-3">
                <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                  <span>Engagement</span>
                  <span>Top posts</span>
                </div>
                <div className="mt-2 grid gap-2">
                  <div className="h-2.5 rounded-full bg-slate-100">
                    <div className="h-full w-[68%] rounded-full bg-warning" />
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100">
                    <div className="h-full w-[84%] rounded-full bg-primary" />
                  </div>
                </div>
              </div>
            </div>
            <Link
              href="/client/accounts#insights"
              className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-bold underline underline-offset-4"
            >
              <BarChart3 className="h-4 w-4" aria-hidden />
              Ir al panel de evolución
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-slate-50/80 p-4">
          <p className="mb-2 flex items-center gap-2 text-sm font-bold">
            <Instagram className="h-4 w-4" aria-hidden />
            Conexion segura con Instagram
          </p>
          <p className="mb-3 text-xs text-muted-foreground">
            Te llevaremos a Instagram para confirmar el permiso. No pedimos tu
            contrasena dentro de esta web.
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
            Conectar Instagram
          </Button>
        </div>
        <div aria-live="polite" className="space-y-2">
          {oauthState === "success" ? (
            <p className="flex items-center gap-2 rounded-lg border border-success/25 bg-success/10 px-3 py-2 text-sm font-medium text-foreground">
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              Instagram conectado correctamente.
            </p>
          ) : null}
          {oauthState === "error" ? (
            <p
              className="flex items-center gap-2 rounded-lg border border-danger/25 bg-danger/10 px-3 py-2 text-sm font-medium text-foreground"
              role="alert"
            >
              <AlertCircle className="h-4 w-4" aria-hidden />
              No se pudo conectar Instagram
              {oauthReason ? ` (${oauthReason})` : ""}.
            </p>
          ) : null}
          {statusMessage ? (
            <p className="flex items-center gap-2 rounded-lg border border-success/25 bg-success/10 px-3 py-2 text-sm font-medium text-foreground">
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              {statusMessage}
            </p>
          ) : null}
          {error ? (
            <p
              className="flex items-center gap-2 rounded-lg border border-danger/25 bg-danger/10 px-3 py-2 text-sm font-medium text-foreground"
              role="alert"
            >
              <AlertCircle className="h-4 w-4" aria-hidden />
              {error}
            </p>
          ) : null}
        </div>
      </Card>

      <Card id="insights">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Cuentas conectadas</CardTitle>
            <CardDescription className="mt-1">
              Aquí verás las cuentas que ya están listas para medir.
            </CardDescription>
          </div>
          <Link
            href="/client/accounts"
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-bold shadow-sm transition-[background-color,border-color,box-shadow] hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
            Ver métricas
          </Link>
        </div>
        {loading ? (
          <p className="rounded-xl border border-dashed border-border bg-surface/70 p-4 text-sm font-medium text-muted-foreground">
            Cargando cuentas…
          </p>
        ) : accounts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface/70 p-4 text-sm font-medium text-muted-foreground">
            Aún no hay cuentas conectadas. Conecta Instagram para activar las
            métricas.
          </div>
        ) : (
          <ul className="space-y-2">
            {accounts.map((account) => (
              <li
                key={account.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-surface/85 p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold">
                    {platformLabel(account.platform)}: {account.account_name}
                  </p>
                  <p className="break-all text-xs text-muted-foreground">
                    {account.account_handle || "Sin usuario visible"}
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
