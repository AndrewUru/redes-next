import Link from "next/link";
import { headers } from "next/headers";
import { requireRole, getSessionUser } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/logout-button";

const navItems = [
  { href: "/client", label: "Dashboard", helper: "Resumen general" },
  { href: "/client/accounts", label: "Metricas", helper: "Evolucion y redes" },
  { href: "/client/onboarding", label: "Onboarding", helper: "Estrategia y brief" },
  { href: "/client/assets", label: "Assets", helper: "Biblioteca visual" }
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
        <aside className="neo-box hidden bg-background lg:block">
          <div className="border-b-2 border-border pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Area cliente
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl">Ecosistema Usuario</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Hola, {userDisplayName}
            </p>
          </div>

          <nav className="mt-4 grid gap-2">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || (item.href !== "/client" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl border-2 px-3 py-3 transition-colors ${
                    isActive
                      ? "border-black bg-[#fde68a]"
                      : "border-border bg-background hover:bg-muted"
                  }`}
                >
                  <p className="text-sm font-black">{item.label}</p>
                  <p className="text-xs font-medium text-muted-foreground">{item.helper}</p>
                </Link>
              );
            })}
          </nav>

          <div className="mt-5 rounded-2xl border-2 border-border bg-[#eff6ff] p-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Foco recomendado
            </p>
            <p className="mt-2 text-sm font-bold text-foreground">Revisa tus metricas de evolucion</p>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              Entra en Metricas para ver seguidores, alcance, engagement y top publicaciones.
            </p>
            <Link href="/client/accounts" className="mt-3 inline-block text-sm font-bold underline">
              Abrir panel de metricas
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
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Navegacion
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href || (item.href !== "/client" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-xl border-2 px-3 py-3 ${
                      isActive
                        ? "border-black bg-[#fde68a]"
                        : "border-border bg-background"
                    }`}
                  >
                    <p className="text-sm font-black">{item.label}</p>
                    <p className="text-xs font-medium text-muted-foreground">{item.helper}</p>
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
