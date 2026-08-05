"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

type UploadType = "logo" | "typography" | "photo" | "reference";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

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
  const helpId = useId();
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
      setError("Solo puedes subir imágenes JPG, PNG o WEBP.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError(
        "El archivo supera el límite de 10 MB. Reduce su tamaño e inténtalo de nuevo."
      );
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
          metadata: {
            originalName: file.name,
            size: file.size,
            mimeType: file.type
          }
        })
      });
      setSelectedFile(null);
      if (inputRef.current) inputRef.current.value = "";
      onUploaded();
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "No se pudo subir la imagen. Inténtalo de nuevo."
      );
    } finally {
      setLoading(false);
    }
  }

  function setFileCandidate(file: File | null) {
    setSelectedFile(file);
    setError(
      file && !file.type.startsWith("image/")
        ? "Solo puedes subir imágenes JPG, PNG o WEBP."
        : file && file.size > MAX_FILE_SIZE
          ? "El archivo supera el límite de 10 MB."
          : null
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Elige una imagen desde tu ordenador o movil. Si estas en el movil,
        tambien puedes hacer una foto.
      </p>
      <div
        role="button"
        tabIndex={0}
        aria-label="Elegir imagen"
        aria-describedby={helpId}
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
        className={`cursor-pointer rounded-lg border border-dashed p-4 text-center transition-[background-color,border-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          isDragging
            ? "border-primary bg-accent shadow-xs"
            : "border-border bg-surface/60 hover:bg-muted/40"
        }`}
      >
        <p className="text-sm font-medium">
          {isDragging
            ? "Suelta la imagen aqui"
            : "Haz clic para elegir una imagen"}
        </p>
      </div>
      <p id={helpId} className="sr-only">
        Se aceptan imágenes JPG, PNG y WEBP de hasta 10 MB.
      </p>
      <Input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        disabled={loading}
        onChange={(e) => setFileCandidate(e.target.files?.[0] ?? null)}
        className="hidden"
      />
      <div aria-live="polite">
        {error ? (
          <p className="text-xs font-medium text-danger" role="alert">
            {error}
          </p>
        ) : null}
      </div>
      {selectedFile ? (
        <div className="rounded-lg border border-border bg-surface p-3">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt={`Preview de ${selectedFile.name}`}
              width={1200}
              height={800}
              unoptimized
              className="mb-3 h-40 w-full rounded-lg border border-border object-cover sm:h-48"
            />
          ) : null}
          <p className="text-sm font-medium">{selectedFile.name}</p>
          <p className="text-xs text-muted-foreground">
            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
      ) : null}
      {loading ? <Progress value={70} className="h-1.5" /> : null}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          disabled={loading || !selectedFile}
          onClick={() => void handleUpload(selectedFile ?? undefined)}
          className="w-full sm:w-auto"
        >
          <Upload className="h-4 w-4" aria-hidden />
          {loading ? "Subiendo…" : "Subir imagen"}
        </Button>
        {selectedFile ? (
          <Button
            type="button"
            variant="ghost"
            disabled={loading}
            onClick={() => {
              setSelectedFile(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4" aria-hidden />
            Limpiar
          </Button>
        ) : null}
      </div>
    </div>
  );
}
