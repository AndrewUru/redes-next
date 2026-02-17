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

  async function save() {
    const res = await fetch(`/api/admin/client/${clientId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, notes })
    });
    setMsg(res.ok ? "Estrategia actualizada." : "No se pudo guardar la configuracion.");
  }

  return (
    <div className="space-y-2">
      <div>
        <Label htmlFor="status">Fase del funnel</Label>
        <select
          id="status"
          className="mt-1 h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
          value={status}
          onChange={(e) => setStatus(e.target.value as (typeof statuses)[number])}
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
        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <Button variant="outline" onClick={save}>
        Guardar estrategia
      </Button>
      {msg ? <p className="text-xs text-muted-foreground">{msg}</p> : null}
    </div>
  );
}
