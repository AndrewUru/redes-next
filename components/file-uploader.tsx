"use client";

import { useState } from "react";
import { Upload } from "lucide-react";
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
  const supabase = createClient();

  async function handleUpload(file?: File) {
    if (!file) return;
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
      onUploaded();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Input
        type="file"
        disabled={loading}
        onChange={(e) => void handleUpload(e.target.files?.[0])}
      />
      <Button variant="outline" disabled={loading}>
        <Upload className="mr-2 h-4 w-4" />
        {loading ? "Subiendo..." : "Subir asset"}
      </Button>
    </div>
  );
}
