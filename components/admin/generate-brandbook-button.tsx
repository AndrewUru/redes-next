"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function GenerateBrandbookButton({ clientId }: { clientId: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/brandbook/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId })
    });
    const json = (await res.json()) as { error?: string; path?: string; signedUrl?: string | null };
    setLoading(false);
    setPdfUrl(json.signedUrl ?? null);
    setMessage(
      json.error
        ? `Error al generar el brandbook: ${json.error}`
        : `Brandbook generado y listo para revision: ${json.path}`
    );
  }

  return (
    <div className="space-y-2">
      <Button onClick={generate} disabled={loading}>
        {loading ? "Generando..." : "Generar brandbook PDF"}
      </Button>
      {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
      {pdfUrl ? (
        <a
          href={pdfUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-semibold underline"
        >
          Ver PDF ahora
        </a>
      ) : null}
    </div>
  );
}
