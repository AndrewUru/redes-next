import { FileText } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { BrandbookRow } from "@/lib/db/types";

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric"
});

export type BrandbookListItem = Pick<
  BrandbookRow,
  "id" | "version" | "pdf_path" | "created_at"
> & {
  signedUrl: string | null;
};

export function BrandbookList({
  brandbooks,
  title = "Guias de marca creadas",
  description = "Consulta las versiones PDF que ya estan disponibles."
}: {
  brandbooks: BrandbookListItem[];
  title?: string;
  description?: string;
}) {
  return (
    <Card className="space-y-4 bg-white/90">
      <div>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="mt-1">{description}</CardDescription>
      </div>

      {brandbooks.length === 0 ? (
        <div className="rounded-[8px] border-2 border-dashed border-border bg-white/60 p-4 text-sm font-medium text-muted-foreground">
          Todavia no hay guias de marca creadas.
        </div>
      ) : (
        <ul className="space-y-2">
          {brandbooks.map((brandbook) => (
            <li
              key={brandbook.id}
              className="flex flex-col gap-3 rounded-[8px] border-2 border-border bg-white/75 p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[8px] border-2 border-border bg-[#fde68a]">
                  <FileText className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-black">
                    Guia de marca v{brandbook.version}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground">
                    Creada el{" "}
                    {dateFormatter.format(new Date(brandbook.created_at))}
                  </p>
                </div>
              </div>

              {brandbook.signedUrl ? (
                <div className="flex flex-wrap gap-3 text-sm font-semibold">
                  <a
                    href={brandbook.signedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="underline"
                  >
                    Ver PDF
                  </a>
                  <a href={brandbook.signedUrl} download className="underline">
                    Descargar
                  </a>
                </div>
              ) : (
                <p className="text-xs font-medium text-muted-foreground">
                  Enlace no disponible ahora.
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
