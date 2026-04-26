import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "ElSaltoWeb | Sistema de marca y crecimiento",
  description:
    "Brand voice, estrategia de contenidos, comunidad y conversion en un solo flujo operativo."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const currentYear = new Date().getFullYear();

  return (
    <html lang="es">
      <body className="min-h-screen">
        <a
          href="#main-content"
          className="sr-only fixed left-4 top-4 z-50 rounded-[8px] border-2 border-border bg-background px-4 py-2 text-sm font-black shadow-[3px_4px_0_0_rgba(0,0,0,1)] focus:not-sr-only focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Saltar al contenido
        </a>
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
          <header className="flex items-center justify-between border-b-2 border-black py-4">
            <Link
              className="font-black uppercase tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              href="/"
            >
              ElSaltoWeb
            </Link>
            <nav className="flex items-center gap-4 text-sm font-semibold">
              <Link
                href="/privacy"
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Privacidad
              </Link>
              <Link
                href="/terms"
                className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Términos
              </Link>
            </nav>
          </header>

          <main id="main-content" className="flex-1 py-6">
            {children}
          </main>

          <footer className="mt-8 border-t-2 border-black py-4 text-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p>© {currentYear} ElSaltoWeb</p>
              <p>Sistema de marca y crecimiento</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
