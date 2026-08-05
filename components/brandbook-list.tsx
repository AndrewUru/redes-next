import { FileText } from "lucide-react";
import { ApproveBrandbookButton } from "@/components/client/approve-brandbook-button";
import { DeleteBrandbookButton } from "@/components/client/delete-brandbook-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { BrandbookRow } from "@/lib/db/types";

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric"
});

export type BrandbookListItem = Pick<
  BrandbookRow,
  "id" | "version" | "pdf_path" | "created_at" | "approved_at"
> & {
  signedUrl: string | null;
};

export function BrandbookList({
  brandbooks,
  title = "Guias de marca creadas",
  description = "Consulta las versiones PDF que ya estan disponibles.",
  allowDelete = false,
  allowApprove = false
}: {
  brandbooks: BrandbookListItem[];
  title?: string;
  description?: string;
  allowDelete?: boolean;
  allowApprove?: boolean;
}) {
  return (
    <Card className="space-y-4 bg-surface/90">
      <div>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="mt-1">{description}</CardDescription>
      </div>

      {brandbooks.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border-strong bg-muted/30 p-6 text-sm text-muted-foreground">
          Todavia no hay guias de marca creadas.
        </div>
      ) : (
        <ul className="space-y-2">
          {brandbooks.map((brandbook) => (
            <li
              key={brandbook.id}
              className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                  <FileText className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-black">
                    Guia de marca v{brandbook.version}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Creada el{" "}
                      {dateFormatter.format(new Date(brandbook.created_at))}
                    </p>
                    {brandbook.approved_at ? (
                      <Badge className="border-success/25 bg-success/10 text-foreground">
                        Aprobada
                      </Badge>
                    ) : (
                      <Badge className="border-warning/25 bg-warning/10 text-foreground">
                        Pendiente de aprobacion
                      </Badge>
                    )}
                  </div>
                  {brandbook.approved_at ? (
                    <p className="mt-1 text-xs font-medium text-muted-foreground">
                      Aprobada el{" "}
                      {dateFormatter.format(new Date(brandbook.approved_at))}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:items-end">
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
                    <a
                      href={brandbook.signedUrl}
                      download
                      className="underline"
                    >
                      Descargar
                    </a>
                  </div>
                ) : (
                  <p className="text-xs font-medium text-muted-foreground">
                    Enlace no disponible ahora.
                  </p>
                )}
                {allowDelete ? (
                  <DeleteBrandbookButton
                    brandbookId={brandbook.id}
                    version={brandbook.version}
                  />
                ) : null}
                {allowApprove && !brandbook.approved_at ? (
                  <ApproveBrandbookButton
                    brandbookId={brandbook.id}
                    version={brandbook.version}
                  />
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
