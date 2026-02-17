"use client";

import { useEffect, useState } from "react";
import { FileUploader } from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";

type Asset = {
  id: string;
  type: string;
  storage_path: string;
  created_at: string;
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
                className="flex items-center justify-between rounded-md border border-border p-2"
              >
                <div>
                  <p className="text-sm font-medium">{asset.type}</p>
                  <p className="text-xs text-muted-foreground">{asset.storage_path}</p>
                </div>
                <Button variant="outline" onClick={() => void removeAsset(asset.id)}>
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
