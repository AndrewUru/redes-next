import type { Metadata, Viewport } from "next";
import { Public_Sans } from "next/font/google";
import { AppHeader } from "@/components/app-header";
import "./globals.css";

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-public-sans"
});

export const metadata: Metadata = {
  title: "ElSaltoWeb | Sistema de marca y crecimiento",
  description:
    "Brand voice, estrategia de contenidos, comunidad y conversión en un solo flujo operativo."
};

export const viewport: Viewport = {
  themeColor: "#f8fafc"
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  const currentYear = new Date().getFullYear();

  return (
    <html lang="es">
      <body
        className={`${publicSans.variable} min-h-screen overflow-x-hidden text-foreground antialiased`}
      >
        <a
          href="#main-content"
          className="sr-only fixed left-4 top-4 z-50 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold shadow-sm focus:not-sr-only focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Saltar al contenido
        </a>

        <AppHeader />

        <main
          id="main-content"
          tabIndex={-1}
          className="w-full flex-1 px-4 py-6 outline-none sm:px-6 sm:py-8 lg:px-8"
        >
          {children}
        </main>

        <footer className="mx-auto mt-8 w-full max-w-7xl border-t border-border px-4 py-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-sm sm:px-6 lg:px-8">
          <div className="flex flex-col gap-1 text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>© {currentYear} ElSaltoWeb</p>
            <p>Sistema de marca y crecimiento</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
