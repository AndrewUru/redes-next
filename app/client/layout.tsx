import Link from "next/link";
import { requireRole, getSessionUser } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/logout-button";

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

          <nav className="mt-4 grid gap-2 text-sm font-semibold">
            <Link
              href="/client"
              className="rounded-lg border-2 border-border bg-background px-3 py-2 transition-colors hover:bg-muted"
            >
              Dashboard
            </Link>
            <Link
              href="/client/onboarding"
              className="rounded-lg border-2 border-border bg-background px-3 py-2 transition-colors hover:bg-muted"
            >
              Strategy Onboarding
            </Link>
            <Link
              href="/client/assets"
              className="rounded-lg border-2 border-border bg-background px-3 py-2 transition-colors hover:bg-muted"
            >
              Asset Library
            </Link>
            <Link
              href="/client/accounts"
              className="rounded-lg border-2 border-border bg-background px-3 py-2 transition-colors hover:bg-muted"
            >
              Social Accounts
            </Link>
          </nav>

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
            <div className="mt-2 flex flex-wrap gap-2 text-sm font-semibold">
              <Link href="/client" className="underline">
                Dashboard
              </Link>
              <Link href="/client/onboarding" className="underline">
                Strategy Onboarding
              </Link>
              <Link href="/client/assets" className="underline">
                Asset Library
              </Link>
              <Link href="/client/accounts" className="underline">
                Social Accounts
              </Link>
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
