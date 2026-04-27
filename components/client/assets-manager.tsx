"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { FileUploader } from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

type Asset = {
  id: string;
  type: string;
  storage_path: string;
  created_at: string;
  preview_url?: string | null;
};

const assetTypes = ["logo", "typography", "photo", "reference"] as const;
const assetTypeLabels: Record<(typeof assetTypes)[number], string> = {
  logo: "Logo",
  typography: "Tipografía",
  photo: "Fotos",
  reference: "Referencias"
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

export function AssetsManager({ clientId }: { clientId: string }) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/client/assets");
      const json = (await res.json()) as { assets: Asset[] };
      setAssets(json.assets ?? []);
    } finally {
      setLoading(false);
    }
  }

  async function removeAsset(id: string) {
    const shouldDelete = window.confirm(
      "¿Quieres quitar este asset de la biblioteca?"
    );
    if (!shouldDelete) return;

    setDeletingId(id);
    try {
      await fetch(`/api/client/assets?id=${id}`, { method: "DELETE" });
      await load();
    } finally {
      setDeletingId(null);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <div className="mb-4">
          <CardTitle>Subir assets de identidad visual</CardTitle>
          <CardDescription className="mt-1">
            Ordena logos, tipografías, fotos y referencias para que el brandbook
            salga con mejor criterio.
          </CardDescription>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {assetTypes.map((type) => (
            <div
              key={type}
              className="rounded-[8px] border-2 border-border bg-white/70 p-3"
            >
              <p className="mb-1 text-sm font-black">{assetTypeLabels[type]}</p>
              <FileUploader clientId={clientId} type={type} onUploaded={load} />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-4">
          <CardTitle>Biblioteca visual de marca</CardTitle>
          <CardDescription className="mt-1">
            Revisa lo que ya está disponible antes de generar o actualizar el
            brandbook.
          </CardDescription>
        </div>
        {loading ? (
          <div className="rounded-[8px] border-2 border-dashed border-border bg-white/60 p-4 text-sm font-medium text-muted-foreground">
            Cargando biblioteca…
          </div>
        ) : assets.length === 0 ? (
          <div className="rounded-[8px] border-2 border-dashed border-border bg-white/60 p-4 text-sm font-medium text-muted-foreground">
            Aún no hay assets. Sube los primeros elementos para reforzar la
            identidad visual.
          </div>
        ) : (
          <ul className="space-y-2">
            {assets.map((asset) => (
              <li
                key={asset.id}
                className="flex flex-col gap-3 rounded-[8px] border-2 border-border bg-white/75 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 gap-3">
                  {asset.preview_url ? (
                    <Image
                      src={asset.preview_url}
                      alt={`Asset ${asset.type}`}
                      width={120}
                      height={120}
                      unoptimized
                      className="h-16 w-16 shrink-0 rounded-[8px] border border-border object-cover"
                    />
                  ) : null}
                  <div className="min-w-0">
                    <p className="text-sm font-black capitalize">
                      {asset.type}
                    </p>
                    <p className="text-xs font-medium text-muted-foreground">
                      Subido el {formatDate(asset.created_at)}
                    </p>
                    <p className="break-all text-xs text-muted-foreground">
                      {asset.storage_path}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => void removeAsset(asset.id)}
                  disabled={deletingId === asset.id}
                  className="w-full sm:w-auto"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                  Quitar asset
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
