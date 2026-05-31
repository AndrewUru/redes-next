"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Camera,
  FileImage,
  Grid2X2,
  Image as ImageIcon,
  List,
  Trash2
} from "lucide-react";
import { FileUploader } from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

type Asset = {
  id: string;
  type: string;
  storage_path: string;
  created_at: string;
  metadata?: Record<string, unknown>;
  preview_url?: string | null;
};

type AssetFilter = "all" | (typeof assetTypes)[number];
type ViewMode = "grid" | "list";

const assetTypes = ["logo", "photo", "reference"] as const;
const assetTypeLabels: Record<(typeof assetTypes)[number], string> = {
  logo: "Logo",
  photo: "Fotos del negocio",
  reference: "Ideas visuales"
};

const assetTypeDescriptions: Record<(typeof assetTypes)[number], string> = {
  logo: "Sube el logo o una captura donde se vea bien.",
  photo: "Fotos de producto, local, equipo, trabajos o resultados.",
  reference: "Ejemplos de estilos, publicaciones o marcas que te gustan."
};

const assetTypeIcons: Record<(typeof assetTypes)[number], typeof FileImage> = {
  logo: FileImage,
  photo: Camera,
  reference: ImageIcon
};

const storedAssetLabels: Record<string, string> = {
  logo: "Logo",
  typography: "Tipografia guardada",
  photo: "Foto",
  reference: "Idea visual"
};

function getAssetLabel(type: string) {
  return storedAssetLabels[type] ?? "Archivo";
}

function getAssetName(asset: Asset) {
  const originalName = asset.metadata?.originalName;
  if (typeof originalName === "string" && originalName.trim()) {
    return originalName;
  }
  return asset.storage_path.split("/").at(-1) ?? getAssetLabel(asset.type);
}

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
  const [filter, setFilter] = useState<AssetFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const assetCounts = useMemo(() => {
    const counts: Record<AssetFilter, number> = {
      all: assets.length,
      logo: 0,
      photo: 0,
      reference: 0
    };
    assets.forEach((asset) => {
      if (asset.type in counts) {
        counts[asset.type as AssetFilter] += 1;
      }
    });
    return counts;
  }, [assets]);

  const visibleAssets = useMemo(
    () =>
      filter === "all"
        ? assets
        : assets.filter((asset) => asset.type === filter),
    [assets, filter]
  );

  const filterOptions: Array<{ value: AssetFilter; label: string }> = [
    { value: "all", label: "Todo" },
    { value: "logo", label: "Logo" },
    { value: "photo", label: "Fotos" },
    { value: "reference", label: "Ideas" }
  ];

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
      "Quieres quitar este archivo de la biblioteca?"
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
          <CardTitle>Sube tus archivos de marca</CardTitle>
          <CardDescription className="mt-1">
            No necesitas preparar nada tecnico. Sube el logo, fotos y ejemplos
            visuales que ayuden a entender tu estilo.
          </CardDescription>
        </div>
        <div className="mb-4 rounded-[8px] border-2 border-border bg-[#eff6ff] p-3 text-sm font-medium text-muted-foreground">
          Si no tienes logo o fotos profesionales, no pasa nada: sube lo que
          tengas ahora. El objetivo es darnos contexto, no entregar una carpeta
          perfecta.
        </div>
        <div className="grid gap-3 xl:grid-cols-3">
          {assetTypes.map((type) => {
            const Icon = assetTypeIcons[type];

            return (
              <div
                key={type}
                className="rounded-[8px] border-2 border-border bg-surface/70 p-3"
              >
                <div className="mb-3 flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border-2 border-border bg-[#fde68a]">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-black">
                      {assetTypeLabels[type]}
                    </p>
                    <p className="mt-1 text-xs font-medium text-muted-foreground">
                      {assetTypeDescriptions[type]}
                    </p>
                  </div>
                </div>
                <FileUploader
                  clientId={clientId}
                  type={type}
                  onUploaded={load}
                />
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>Material recibido</CardTitle>
            <CardDescription className="mt-1">
              Aqui veras las imagenes que ya tenemos para preparar tu guia de
              marca y tus contenidos.
            </CardDescription>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-wrap gap-2" aria-label="Filtrar archivos">
              {filterOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={filter === option.value ? "default" : "outline"}
                  onClick={() => setFilter(option.value)}
                  className="min-h-9 px-3 text-xs"
                >
                  {option.label}
                  <span className="tabular-nums">
                    {assetCounts[option.value]}
                  </span>
                </Button>
              ))}
            </div>
            <div
              className="flex w-fit rounded-full border border-border bg-surface p-1"
              aria-label="Cambiar vista"
            >
              <Button
                type="button"
                variant={viewMode === "grid" ? "default" : "ghost"}
                onClick={() => setViewMode("grid")}
                className="min-h-9 rounded-full px-3"
                aria-label="Vista en cuadricula"
              >
                <Grid2X2 className="h-4 w-4" aria-hidden />
              </Button>
              <Button
                type="button"
                variant={viewMode === "list" ? "default" : "ghost"}
                onClick={() => setViewMode("list")}
                className="min-h-9 rounded-full px-3"
                aria-label="Vista en lista"
              >
                <List className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="rounded-[8px] border-2 border-dashed border-border bg-surface/60 p-4 text-sm font-medium text-muted-foreground">
            Cargando archivos...
          </div>
        ) : assets.length === 0 ? (
          <div className="rounded-[8px] border-2 border-dashed border-border bg-surface/60 p-4 text-sm font-medium text-muted-foreground">
            Aun no hay archivos. Empieza por el logo o por algunas fotos del
            proyecto.
          </div>
        ) : visibleAssets.length === 0 ? (
          <div className="rounded-[8px] border-2 border-dashed border-border bg-surface/60 p-4 text-sm font-medium text-muted-foreground">
            No hay archivos en este filtro. Prueba otra categoria o sube un
            nuevo material.
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visibleAssets.map((asset) => (
              <article
                key={asset.id}
                className="overflow-hidden rounded-[8px] border-2 border-border bg-surface/75 shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
              >
                {asset.preview_url ? (
                  <a href={asset.preview_url} target="_blank" rel="noreferrer">
                    <Image
                      src={asset.preview_url}
                      alt={getAssetName(asset)}
                      width={640}
                      height={420}
                      unoptimized
                      className="h-48 w-full border-b-2 border-border object-cover"
                    />
                  </a>
                ) : (
                  <div className="flex h-48 items-center justify-center border-b-2 border-border bg-muted">
                    <FileImage className="h-10 w-10" aria-hidden />
                  </div>
                )}
                <div className="space-y-3 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-[#fde68a]">
                      {getAssetLabel(asset.type)}
                    </Badge>
                    <p className="text-xs font-medium text-muted-foreground">
                      {formatDate(asset.created_at)}
                    </p>
                  </div>
                  <p className="truncate text-sm font-black">
                    {getAssetName(asset)}
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => void removeAsset(asset.id)}
                    disabled={deletingId === asset.id}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                    Quitar archivo
                  </Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <ul className="space-y-2">
            {visibleAssets.map((asset) => (
              <li
                key={asset.id}
                className="flex flex-col gap-3 rounded-[8px] border-2 border-border bg-surface/75 p-3 sm:flex-row sm:items-center sm:justify-between"
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
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-black">
                        {getAssetName(asset)}
                      </p>
                      <Badge className="bg-[#fde68a]">
                        {getAssetLabel(asset.type)}
                      </Badge>
                    </div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Subido el {formatDate(asset.created_at)}
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
                  Quitar archivo
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
