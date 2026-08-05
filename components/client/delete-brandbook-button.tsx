"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteBrandbookButton({
  brandbookId,
  version
}: {
  brandbookId: string;
  version: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function removeBrandbook() {
    const confirmed = window.confirm(
      `¿Quieres eliminar la guía de marca v${version}? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/client/brandbooks?id=${brandbookId}`, {
        method: "DELETE"
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setError(json.error ?? "No se pudo eliminar esta guía.");
        return;
      }

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-1">
      <Button
        type="button"
        variant="outline"
        onClick={() => void removeBrandbook()}
        disabled={loading}
        className="min-h-10 text-danger hover:bg-danger/10"
      >
        <Trash2 className="h-4 w-4" aria-hidden />
        {loading ? "Eliminando…" : "Eliminar"}
      </Button>
      <div aria-live="polite">
        {error ? (
          <p className="text-xs font-medium text-danger" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
