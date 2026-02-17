"use client";

import { useEffect, useState } from "react";
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

  return (
    <main className="space-y-4">
      <Card className="space-y-3">
        <CardTitle>Conectar social accounts</CardTitle>
        <CardDescription>
          Integra Instagram y Facebook para analisis platform-specific, retencion y conversion.
        </CardDescription>
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
        <div className="flex items-center gap-2">
          <Button onClick={connect} disabled={saving || form.accountName.trim().length === 0}>
            {saving ? "Conectando..." : "Conectar cuenta"}
          </Button>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
        </div>
      </Card>

      <Card>
        <CardTitle className="mb-4">Cuentas conectadas</CardTitle>
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
                className="flex items-center justify-between rounded-md border border-border p-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {platformLabel(account.platform)}: {account.account_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {account.account_handle || "sin handle"} | {account.status}
                  </p>
                </div>
                <Button variant="outline" onClick={() => void disconnect(account.id)}>
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
