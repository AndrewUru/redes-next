"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FileUploader } from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

type Asset = {
  id: string;
  type: string;
  storage_path: string;
  created_at: string;
  preview_url?: string | null;
};

const assetTypes = ["logo", "typography", "photo", "reference"] as const;

export function AssetsManager({ clientId }: { clientId: string }) {
  const [assets, setAssets] = useState<Asset[]>([]);

  async function load() {
    const res = await fetch("/api/client/assets");
    const json = (await res.json()) as { assets: Asset[] };
    setAssets(json.assets ?? []);
  }

  async function removeAsset(id: string) {
    await fetch(`/api/client/assets?id=${id}`, { method: "DELETE" });
    await load();
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="space-y-4">
      <Card>
        <CardTitle className="mb-4">Subir assets de identidad visual</CardTitle>
        <div className="space-y-3">
          {assetTypes.map((type) => (
            <div key={type}>
              <p className="mb-1 text-sm font-medium capitalize">{type}</p>
              <FileUploader clientId={clientId} type={type} onUploaded={load} />
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle className="mb-4">Biblioteca visual de marca</CardTitle>
        {assets.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay assets aun. Sube elementos para reforzar tu visual identity.
          </p>
        ) : (
          <ul className="space-y-2">
            {assets.map((asset) => (
              <li
                key={asset.id}
                className="flex flex-col gap-2 rounded-md border border-border p-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 gap-3">
                  {asset.preview_url ? (
                    <Image
                      src={asset.preview_url}
                      alt={`Asset ${asset.type}`}
                      width={120}
                      height={120}
                      unoptimized
                      className="h-16 w-16 shrink-0 rounded-md border border-border object-cover"
                    />
                  ) : null}
                  <div className="min-w-0">
                  <p className="text-sm font-medium">{asset.type}</p>
                  <p className="break-all text-xs text-muted-foreground">{asset.storage_path}</p>
                </div>
                </div>
                <Button variant="outline" onClick={() => void removeAsset(asset.id)} className="w-full sm:w-auto">
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
