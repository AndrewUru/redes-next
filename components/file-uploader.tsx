"use client";

import { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type UploadType = "logo" | "typography" | "photo" | "reference";

export function FileUploader({
  clientId,
  type,
  onUploaded
}: {
  clientId: string;
  type: UploadType;
  onUploaded: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!selectedFile || !selectedFile.type.startsWith("image/")) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  async function handleUpload(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten imagenes (JPG, PNG, WEBP, etc.)");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      const cleanName = file.name.replace(/\s+/g, "-").toLowerCase();
      const path = `${clientId}/${type}/${Date.now()}-${cleanName}`;
      const { error } = await supabase.storage
        .from("brand-assets")
        .upload(path, file, { upsert: false });
      if (error) throw error;

      await fetch("/api/client/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          storagePath: path,
          metadata: { originalName: file.name, size: file.size, mimeType: file.type }
        })
      });
      setSelectedFile(null);
      onUploaded();
    } finally {
      setLoading(false);
    }
  }

  function setFileCandidate(file: File | null) {
    setSelectedFile(file);
    setError(file && !file.type.startsWith("image/") ? "Solo se permiten imagenes." : null);
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Desde PC: selecciona un archivo. Desde movil: puedes abrir camara o galeria.
      </p>
      <div
        role="button"
        tabIndex={0}
        aria-label="Zona para arrastrar y soltar imagen"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!isDragging) setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0] ?? null;
          setFileCandidate(file);
        }}
        className={`cursor-pointer rounded-md border border-dashed p-4 text-center transition-colors ${
          isDragging ? "border-primary bg-primary/10" : "border-border bg-muted/20 hover:bg-muted/30"
        }`}
      >
        <p className="text-sm font-medium">
          {isDragging ? "Suelta la imagen aqui" : "Arrastra una imagen aqui o haz click para elegir"}
        </p>
      </div>
      <Input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        disabled={loading}
        onChange={(e) => setFileCandidate(e.target.files?.[0] ?? null)}
        className="hidden"
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {selectedFile ? (
        <div className="rounded-md border border-border bg-muted/30 p-3">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt={`Preview de ${selectedFile.name}`}
              width={1200}
              height={800}
              unoptimized
              className="mb-3 h-40 w-full rounded-md border border-border object-cover sm:h-48"
            />
          ) : null}
          <p className="text-sm font-medium">{selectedFile.name}</p>
          <p className="text-xs text-muted-foreground">
            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      ) : null}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          disabled={loading || !selectedFile}
          onClick={() => void handleUpload(selectedFile ?? undefined)}
          className="w-full sm:w-auto"
        >
          <Upload className="mr-2 h-4 w-4" />
          {loading ? "Subiendo..." : "Subir asset"}
        </Button>
        {selectedFile ? (
          <Button
            type="button"
            variant="ghost"
            disabled={loading}
            onClick={() => setSelectedFile(null)}
            className="w-full sm:w-auto"
          >
            Limpiar
          </Button>
        ) : null}
      </div>
    </div>
  );
}
