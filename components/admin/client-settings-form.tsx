"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const statuses = ["lead", "onboarding", "activo", "pausado"] as const;

export function ClientSettingsForm({
  clientId,
  initialStatus,
  initialNotes
}: {
  clientId: string;
  initialStatus: (typeof statuses)[number];
  initialNotes: string;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [notes, setNotes] = useState(initialNotes);
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/client/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes })
      });
      setMsg(
        res.ok
          ? "Estrategia actualizada."
          : "No se pudo guardar la configuración."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-2">
      <div>
        <Label htmlFor="status">Fase del funnel</Label>
        <select
          id="status"
          name="status"
          className="mt-1 min-h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as (typeof statuses)[number])
          }
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="notes">Notas de posicionamiento y objeciones</Label>
        <Textarea
          id="notes"
          name="notes"
          value={notes}
          rows={5}
          autoComplete="off"
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      <Button type="button" variant="outline" onClick={save} disabled={saving}>
        {saving ? "Guardando…" : "Guardar estrategia"}
      </Button>
      <div aria-live="polite">
        {msg ? (
          <p className="text-xs font-medium text-muted-foreground">{msg}</p>
        ) : null}
      </div>
    </div>
  );
}
