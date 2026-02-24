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
        <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 sm:px-6 lg:px-8">
          <header className="flex items-center justify-between border-b-2 border-black py-4">
            <Link className="font-black uppercase tracking-wide" href="/">
              ElSaltoWeb
            </Link>
            <nav className="flex items-center gap-4 text-sm font-semibold">
              <Link href="/privacy">Privacidad</Link>
              <Link href="/terms">Términos</Link>
            </nav>
          </header>

          <main className="flex-1 py-6">{children}</main>

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
