"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteClientButton({
  clientId,
  clientName
}: {
  clientId: string;
  clientName: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function removeClient() {
    const confirmed = window.confirm(
      `Esto eliminará el cliente "${clientName}" y su usuario de acceso. Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/client/${clientId}`, {
        method: "DELETE"
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        setError(json.error ?? "No se pudo eliminar este usuario.");
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
        onClick={() => void removeClient()}
        disabled={loading}
        className="w-full text-danger hover:bg-danger/10 sm:w-auto"
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
