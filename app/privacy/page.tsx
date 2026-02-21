import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Politica de privacidad | ElSaltoWeb",
  description: "Politica de privacidad para la plataforma redes.elsaltoweb.es"
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen">
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
        <Card className="space-y-4 bg-white/90">
          <CardTitle>Politica de privacidad</CardTitle>
          <CardDescription>Ultima actualizacion: 21 de febrero de 2026</CardDescription>

          <p className="text-sm text-muted-foreground">
            En ElSaltoWeb tratamos datos personales para operar el sistema de marca, onboarding y
            conexion de redes sociales. Solo procesamos informacion necesaria para prestar el
            servicio.
          </p>

          <div className="space-y-2 text-sm">
            <p className="font-semibold">Datos que podemos procesar</p>
            <p>Nombre, email, datos de cuenta social conectada, contenido autorizado y metadatos tecnicos.</p>
          </div>

          <div className="space-y-2 text-sm">
            <p className="font-semibold">Finalidad</p>
            <p>Gestion de cuentas, analitica de rendimiento, soporte, seguridad y mejora del producto.</p>
          </div>

          <div className="space-y-2 text-sm">
            <p className="font-semibold">Conservacion</p>
            <p>
              Conservamos los datos mientras exista relacion activa de servicio o hasta recibir una
              solicitud valida de eliminacion.
            </p>
          </div>

          <div className="space-y-2 text-sm">
            <p className="font-semibold">Contacto</p>
            <p>
              Para consultas de privacidad o ejercicio de derechos:{" "}
              <a className="underline" href="mailto:info@redes.elsaltoweb.es">
                info@redes.elsaltoweb.es
              </a>
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            Ver tambien: <Link className="underline" href="/terms">Terminos</Link> y{" "}
            <Link className="underline" href="/data-deletion">Eliminacion de datos</Link>.
          </p>
        </Card>
      </section>
    </main>
  );
}
