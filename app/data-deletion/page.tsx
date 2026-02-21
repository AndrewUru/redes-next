import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Eliminacion de datos | ElSaltoWeb",
  description: "Instrucciones para eliminacion de datos de usuario en redes.elsaltoweb.es"
};

export default function DataDeletionPage() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
        <Card className="space-y-4 bg-white/90">
          <CardTitle>Eliminacion de datos de usuario</CardTitle>
          <CardDescription>Ultima actualizacion: 21 de febrero de 2026</CardDescription>

          <p className="text-sm text-muted-foreground">
            Puedes solicitar eliminacion total de tus datos asociados a tu cuenta y conexiones
            sociales.
          </p>

          <div className="space-y-2 text-sm">
            <p className="font-semibold">Como solicitarlo</p>
            <p>
              Envia un correo a{" "}
              <a className="underline" href="mailto:info@redes.elsaltoweb.es">
                info@redes.elsaltoweb.es
              </a>{" "}
              con asunto: <span className="font-semibold">Solicitud de eliminacion de datos</span>.
            </p>
            <p>Incluye el email de la cuenta y, si aplica, el usuario de Instagram conectado.</p>
          </div>

          <div className="space-y-2 text-sm">
            <p className="font-semibold">Plazo de respuesta</p>
            <p>Confirmamos recepcion y procesamos la solicitud en un plazo maximo de 30 dias.</p>
          </div>

          <div className="space-y-2 text-sm">
            <p className="font-semibold">Alcance</p>
            <p>
              Eliminamos registros de cuenta, metadatos operativos y datos de integraciones,
              excepto aquellos que deban conservarse por obligacion legal.
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            Ver tambien: <Link className="underline" href="/privacy">Politica de privacidad</Link>{" "}
            y <Link className="underline" href="/terms">Terminos</Link>.
          </p>
        </Card>
      </section>
    </main>
  );
}
