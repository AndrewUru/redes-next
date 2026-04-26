"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, LogIn, Menu, X } from "lucide-react";

const publicLinks = [
  { href: "/privacy", label: "Privacidad" },
  { href: "/terms", label: "Términos" }
] as const;

function isCurrentPath(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

export function AppHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isWorkspace = pathname.startsWith("/client") || pathname.startsWith("/admin");
  const ctaHref = isWorkspace ? "/dashboard" : "/login";
  const ctaLabel = isWorkspace ? "Dashboard" : isAuthPage ? "Volver al acceso" : "Acceder";
  const CtaIcon = isWorkspace ? LayoutDashboard : LogIn;

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="border-b-2 border-black py-4">
      <div className="flex items-center justify-between gap-4">
        <Link
          className="rounded-[8px] font-black uppercase tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          href="/"
        >
          ElSaltoWeb
        </Link>

        <nav className="hidden items-center gap-2 text-sm font-semibold sm:flex" aria-label="Principal">
          {publicLinks.map((item) => {
            const isActive = isCurrentPath(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`rounded-[8px] px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isActive ? "bg-muted text-foreground" : "hover:bg-white/45"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href={ctaHref}
            className="inline-flex h-10 items-center gap-2 rounded-[8px] border-2 border-border bg-[#fde68a] px-3 text-sm font-black shadow-[2px_4px_0_0_rgba(0,0,0,1)] transition-[background-color,box-shadow,transform] hover:translate-y-[1px] hover:shadow-[2px_3px_0_0_rgba(0,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <CtaIcon className="h-4 w-4" aria-hidden />
            {ctaLabel}
          </Link>
        </nav>

        <div className="relative sm:hidden">
          <button
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-main-nav"
            className="inline-flex h-10 w-10 items-center justify-center rounded-[8px] border-2 border-border bg-background shadow-[2px_4px_0_0_rgba(0,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden />
            ) : (
              <Menu className="h-5 w-5" aria-hidden />
            )}
            <span className="sr-only">
              {mobileMenuOpen ? "Cerrar navegación" : "Abrir navegación"}
            </span>
          </button>

          <nav
            id="mobile-main-nav"
            className={`absolute right-0 top-12 z-40 w-[min(82vw,18rem)] rounded-[8px] border-2 border-border bg-background p-3 text-sm font-semibold shadow-[6px_8px_0_0_rgba(0,0,0,1)] ${
              mobileMenuOpen ? "grid gap-2" : "hidden"
            }`}
            aria-label="Principal móvil"
          >
            {publicLinks.map((item) => {
              const isActive = isCurrentPath(pathname, item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`rounded-[8px] border-2 border-border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isActive ? "bg-muted" : "bg-white/70"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              href={ctaHref}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[8px] border-2 border-border bg-[#fde68a] px-3 font-black shadow-[2px_4px_0_0_rgba(0,0,0,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              onClick={() => setMobileMenuOpen(false)}
            >
              <CtaIcon className="h-4 w-4" aria-hidden />
              {ctaLabel}
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
