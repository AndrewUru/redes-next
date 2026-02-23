"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
      `Esto eliminara el cliente "${clientName}" y su usuario de acceso. Esta accion no se puede deshacer.`
    );
    if (!confirmed) return;

    setLoading(true);
    setError(null);

    const res = await fetch(`/api/admin/client/${clientId}`, { method: "DELETE" });
    const json = (await res.json().catch(() => ({}))) as { error?: string };

    setLoading(false);

    if (!res.ok) {
      setError(json.error ?? "No se pudo eliminar este usuario.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-1">
      <Button
        type="button"
        variant="outline"
        onClick={() => void removeClient()}
        disabled={loading}
        className="w-full border-red-700 text-red-700 hover:bg-red-50 sm:w-auto"
      >
        {loading ? "Eliminando..." : "Eliminar"}
      </Button>
      {error ? <p className="text-xs text-red-700">{error}</p> : null}
    </div>
  );
}
