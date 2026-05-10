"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, LogIn, Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const publicLinks = [
  { href: "/", label: "Inicio" },
  { href: "/webs", label: "Webs" },
  { href: "/recomendaciones", label: "Recomendaciones" },
  { href: "/privacy", label: "Privacidad" },
  { href: "/terms", label: "Términos" }
] as const;

function isCurrentPath(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

export function AppHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isWorkspace =
    pathname.startsWith("/client") || pathname.startsWith("/admin");
  const showDashboardCta = authenticated || isWorkspace;
  const ctaHref = showDashboardCta ? "/dashboard" : "/login";
  const ctaLabel = showDashboardCta
    ? "Dashboard"
    : isAuthPage
      ? "Volver al acceso"
      : "Acceder";
  const CtaIcon = showDashboardCta ? LayoutDashboard : LogIn;

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (active) setAuthenticated(Boolean(data.user));
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(Boolean(session?.user));
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/88 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          className="rounded-full text-sm font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          href="/"
        >
          ElSaltoWeb
        </Link>

        <nav
          className="hidden items-center gap-1 text-sm font-medium sm:flex"
          aria-label="Principal"
        >
          {publicLinks.map((item) => {
            const isActive = isCurrentPath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "rounded-full px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                  isActive && "bg-muted text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <div className="ml-2 flex items-center gap-2">
            <ThemeToggle />
            <Link
              href={ctaHref}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <CtaIcon className="h-4 w-4" aria-hidden="true" />
              {ctaLabel}
            </Link>
          </div>
        </nav>

        <div className="flex items-center gap-2 sm:hidden">
          <ThemeToggle />
          <div className="relative">
            <button
              type="button"
              aria-label={
                mobileMenuOpen ? "Cerrar navegación" : "Abrir navegación"
              }
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-main-nav"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>

            <nav
              id="mobile-main-nav"
              className={cn(
                "absolute right-0 top-12 z-40 w-[min(86vw,20rem)] rounded-2xl border border-border bg-surface p-2 text-sm font-medium shadow-xl",
                mobileMenuOpen ? "grid gap-1" : "hidden"
              )}
              aria-label="Principal móvil"
            >
              {publicLinks.map((item) => {
                const isActive = isCurrentPath(pathname, item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "rounded-xl px-3 py-3 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      isActive && "bg-muted text-foreground"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href={ctaHref}
                className="mt-1 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-4 font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                <CtaIcon className="h-4 w-4" aria-hidden="true" />
                {ctaLabel}
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
