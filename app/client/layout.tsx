import Link from "next/link";
import { headers } from "next/headers";
import {
  BarChart3,
  FolderOpen,
  LayoutDashboard,
  ListChecks
} from "lucide-react";
import { requireRole, getSessionUser } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/logout-button";

const navItems = [
  {
    href: "/client",
    label: "Panel",
    helper: "Resumen general",
    icon: LayoutDashboard
  },
  {
    href: "/client/accounts",
    label: "Métricas",
    helper: "Evolución y redes",
    icon: BarChart3
  },
  {
    href: "/client/onboarding",
    label: "Primer formulario",
    helper: "Cuentanos tu proyecto",
    icon: ListChecks
  },
  {
    href: "/client/assets",
    label: "Materiales",
    helper: "Fotos, logo e ideas",
    icon: FolderOpen
  }
] as const;

export default async function ClientLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [profile, user] = await Promise.all([
    requireRole("client"),
    getSessionUser()
  ]);
  const cleanName = profile.full_name?.trim();
  const emailName = user?.email?.split("@")[0]?.trim();
  const userDisplayName = cleanName || emailName || "Cliente";
  const pathname = (await headers()).get("x-current-path") ?? "/client";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <aside className="neo-box hidden bg-background lg:sticky lg:top-24 lg:block lg:self-start">
          <div className="border-b-2 border-border pb-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Area cliente
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl">Tu espacio</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Hola, {userDisplayName}
            </p>
          </div>

          <nav className="mt-4 grid gap-2">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/client" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`group flex items-center gap-3 rounded-[8px] border-2 px-3 py-3 transition-[background-color,transform,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isActive
                      ? "border-black bg-[#fde68a] shadow-[3px_4px_0_0_rgba(0,0,0,1)]"
                      : "border-border bg-background hover:-translate-y-0.5 hover:bg-muted hover:shadow-[3px_4px_0_0_rgba(0,0,0,1)]"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden />
                  <span className="min-w-0">
                    <span className="block text-sm font-black">
                      {item.label}
                    </span>
                    <span className="block truncate text-xs font-medium text-muted-foreground">
                      {item.helper}
                    </span>
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-5 rounded-[8px] border-2 border-border bg-[#eff6ff] p-3">
            <p className="text-xs font-bold uppercase text-muted-foreground">
              Foco recomendado
            </p>
            <p className="mt-2 text-sm font-bold text-foreground">
              Revisa tu evolucion
            </p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              Entra en Metricas para ver seguidores, alcance y publicaciones
              destacadas.
            </p>
            <Link
              href="/client/accounts"
              className="mt-3 inline-block text-sm font-bold underline"
            >
              Abrir metricas
            </Link>
          </div>

          <div className="mt-5 space-y-3 border-t-2 border-border pt-4">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-emerald-700 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              <span
                className="inline-block h-2 w-2 rounded-full bg-emerald-600"
                aria-hidden
              />
              Sesion iniciada
            </div>
            <div className="w-full">
              <LogoutButton />
            </div>
          </div>
        </aside>

        <section className="space-y-4">
          <header className="neo-box space-y-3 bg-background lg:hidden">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Navegacion
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/client" && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-3 rounded-[8px] border-2 px-3 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      isActive
                        ? "border-black bg-[#fde68a] shadow-[3px_4px_0_0_rgba(0,0,0,1)]"
                        : "border-border bg-white/80 hover:bg-muted/80"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" aria-hidden />
                    <span className="min-w-0">
                      <span className="block text-sm font-black">
                        {item.label}
                      </span>
                      <span className="block truncate text-xs font-medium text-muted-foreground">
                        {item.helper}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t-2 border-border pt-3">
              <div className="inline-flex items-center gap-2 rounded-full border-2 border-emerald-700 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                <span
                  className="inline-block h-2 w-2 rounded-full bg-emerald-600"
                  aria-hidden
                />
                Sesion iniciada
              </div>
              <LogoutButton />
            </div>
          </header>
          {children}
        </section>
      </div>
    </div>
  );
}
