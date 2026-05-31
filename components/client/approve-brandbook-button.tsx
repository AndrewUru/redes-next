"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ApproveBrandbookButton({
  brandbookId,
  version
}: {
  brandbookId: string;
  version: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function approve() {
    const shouldApprove = window.confirm(
      `Quieres aprobar la guia de marca v${version}?`
    );
    if (!shouldApprove) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/client/brandbooks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: brandbookId, action: "approve" })
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(json.error ?? "No se pudo aprobar la guia.");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        onClick={() => void approve()}
        disabled={loading}
        className="w-full sm:w-auto"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <CheckCircle2 className="h-4 w-4" aria-hidden />
        )}
        Aprobar guia
      </Button>
      {error ? (
        <p className="max-w-xs text-xs font-medium text-red-700">{error}</p>
      ) : null}
    </div>
  );
}
