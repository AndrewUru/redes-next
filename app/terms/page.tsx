import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Terminos del servicio | ElSaltoWeb",
  description: "Terminos del servicio para la plataforma redes.elsaltoweb.es"
};

export default function TermsPage() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
        <Card className="space-y-4 bg-white/90">
          <CardTitle>Terminos del servicio</CardTitle>
          <CardDescription>Ultima actualizacion: 21 de febrero de 2026</CardDescription>

          <p className="text-sm text-muted-foreground">
            Al usar redes.elsaltoweb.es aceptas estos terminos. Si no estas de acuerdo, no uses la
            plataforma.
          </p>

          <div className="space-y-2 text-sm">
            <p className="font-semibold">Uso permitido</p>
            <p>
              Debes usar el servicio de forma legal, sin intentar acceder a cuentas o datos de
              terceros sin autorizacion.
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <p className="font-semibold">Cuentas conectadas</p>
            <p>
              Puedes revocar en cualquier momento conexiones con plataformas externas desde tu panel
              o desde la propia plataforma de terceros.
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <p className="font-semibold">Disponibilidad</p>
            <p>
              El servicio puede tener mantenimiento, cambios o interrupciones sin garantia de
              disponibilidad continua.
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <p className="font-semibold">Contacto</p>
            <p>
              Para dudas legales o contractuales:{" "}
              <a className="underline" href="mailto:info@redes.elsaltoweb.es">
                info@redes.elsaltoweb.es
              </a>
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            Ver tambien: <Link className="underline" href="/privacy">Politica de privacidad</Link>{" "}
            y <Link className="underline" href="/data-deletion">Eliminacion de datos</Link>.
          </p>
        </Card>
      </section>
    </main>
  );
}
