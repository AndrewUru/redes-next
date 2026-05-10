import Link from "next/link";
import { headers } from "next/headers";
import {
  BarChart3,
  Code2,
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
    href: "/client/web",
    label: "Proyecto web",
    helper: "Brief y avances",
    icon: Code2
  },
  {
    href: "/client/assets",
    label: "Materiales",
    helper: "Fotos, logo e ideas",
    icon: FolderOpen
  }
] as const;

function isCurrentPath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

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
    <div className="w-full bg-[radial-gradient(circle_at_top_left,hsl(199_89%_96%),transparent_34rem)] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto grid w-full max-w-[96rem] gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden rounded-2xl border border-border bg-surface/95 p-5 shadow-[0_24px_70px_hsl(222_47%_11%/0.08)] lg:sticky lg:top-24 lg:block lg:self-start">
          <div className="border-b border-border pb-5">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Area cliente
            </p>
            <h1 className="mt-2 text-3xl">Tu espacio</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Hola, {userDisplayName}
            </p>
          </div>

          <nav className="mt-5 grid gap-2">
            {navItems.map((item) => {
              const isActive = isCurrentPath(pathname, item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`group flex min-h-14 items-center gap-3 rounded-xl border px-3.5 py-3 transition-[background-color,border-color,color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isActive
                      ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-slate-900/10"
                      : "border-transparent bg-transparent text-foreground hover:border-border hover:bg-muted"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" aria-hidden />
                  <span className="min-w-0">
                    <span className="block text-sm font-black">
                      {item.label}
                    </span>
                    <span
                      className={`block truncate text-xs font-medium ${
                        isActive
                          ? "text-primary-foreground/75"
                          : "text-muted-foreground"
                      }`}
                    >
                      {item.helper}
                    </span>
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 rounded-2xl border border-sky-100 bg-sky-50/80 p-4">
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
              className="mt-3 inline-flex min-h-10 items-center rounded-full text-sm font-bold underline underline-offset-4"
            >
              Abrir metricas
            </Link>
          </div>

          <div className="mt-6 space-y-3 border-t border-border pt-5">
            <div className="inline-flex min-h-8 items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
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
          <header className="space-y-3 rounded-2xl border border-border bg-surface/95 p-4 shadow-sm lg:hidden">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Navegacion
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {navItems.map((item) => {
                const isActive = isCurrentPath(pathname, item.href);
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex min-h-14 items-center gap-3 rounded-xl border px-3 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-surface hover:bg-muted/80"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" aria-hidden />
                    <span className="min-w-0">
                      <span className="block text-sm font-black">
                        {item.label}
                      </span>
                      <span
                        className={`block truncate text-xs font-medium ${
                          isActive
                            ? "text-primary-foreground/75"
                            : "text-muted-foreground"
                        }`}
                      >
                        {item.helper}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
              <div className="inline-flex min-h-8 items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
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
