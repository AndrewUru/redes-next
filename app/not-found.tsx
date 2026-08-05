import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-lg items-center justify-center px-4 py-12">
      <section className="w-full rounded-xl border border-border bg-surface p-6 text-center shadow-sm">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-secondary-foreground"><FileQuestion className="h-5 w-5" aria-hidden="true" /></span>
        <h1 className="mt-4 text-xl font-semibold">Esta página no está disponible</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Puede que el enlace haya cambiado o que no tengas acceso a este contenido.</p>
        <Link href="/dashboard" className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Volver al panel</Link>
      </section>
    </div>
  );
}
