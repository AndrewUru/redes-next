"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  BarChart3,
  ChevronRight,
  Code2,
  FolderOpen,
  LayoutDashboard,
  ListChecks,
  Menu,
  Search,
  Settings,
  UsersRound,
  X
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/auth/logout-button";
import { cn } from "@/lib/utils";

type ShellRole = "admin" | "client";

const clientNavigation = [
  {
    href: "/client",
    label: "Resumen",
    helper: "Estado del proyecto",
    icon: LayoutDashboard
  },
  {
    href: "/client/accounts",
    label: "Métricas",
    helper: "Cuentas y rendimiento",
    icon: BarChart3
  },
  {
    href: "/client/onboarding",
    label: "Onboarding",
    helper: "Información del proyecto",
    icon: ListChecks
  },
  {
    href: "/client/web",
    label: "Proyecto web",
    helper: "Brief, materiales y avances",
    icon: Code2
  },
  {
    href: "/client/assets",
    label: "Materiales",
    helper: "Archivos y referencias",
    icon: FolderOpen
  }
] as const;

const adminNavigation = [
  {
    href: "/admin/clients",
    label: "Clientes",
    helper: "Cuentas y operaciones",
    icon: UsersRound
  }
] as const;

function isCurrentPath(pathname: string, href: string) {
  return (
    pathname === href || (href !== "/client" && pathname.startsWith(`${href}/`))
  );
}

function getPageContext(pathname: string, role: ShellRole) {
  if (pathname.includes("/onboarding"))
    return { title: "Onboarding", parent: "Área de cliente" };
  if (pathname.includes("/accounts"))
    return { title: "Métricas", parent: "Área de cliente" };
  if (pathname.includes("/assets") || pathname.includes("/materiales"))
    return { title: "Materiales", parent: "Área de cliente" };
  if (pathname.includes("/web"))
    return {
      title: "Proyecto web",
      parent: role === "admin" ? "Clientes" : "Área de cliente"
    };
  if (role === "admin")
    return {
      title: pathname === "/admin/clients" ? "Clientes" : "Detalle de cliente",
      parent: "Administración"
    };
  return { title: "Resumen", parent: "Área de cliente" };
}

export function AppShell({
  role,
  userName,
  userEmail,
  children
}: {
  role: ShellRole;
  userName: string;
  userEmail?: string | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const navigation = role === "admin" ? adminNavigation : clientNavigation;
  const context = getPageContext(pathname, role);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-border px-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
          ES
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-[-0.01em]">
            ElSalto Workspace
          </p>
          <p className="text-xs text-muted-foreground">
            {role === "admin" ? "Administración" : "Área de cliente"}
          </p>
        </div>
      </div>

      <nav
        className="flex-1 space-y-1 overflow-y-auto p-3"
        aria-label={role === "admin" ? "Administración" : "Área de cliente"}
      >
        <p className="px-3 pb-2 pt-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          Espacio de trabajo
        </p>
        {navigation.map((item) => {
          const active = isCurrentPath(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href as Route}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                active
                  ? "bg-accent font-semibold text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon
                className="h-[18px] w-[18px] shrink-0"
                strokeWidth={1.8}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate">{item.label}</span>
                <span
                  className={cn(
                    "block truncate text-[11px] font-normal",
                    active
                      ? "text-accent-foreground/70"
                      : "text-muted-foreground"
                  )}
                >
                  {item.helper}
                </span>
              </span>
              {active ? (
                <span
                  className="h-1.5 w-1.5 rounded-full bg-primary"
                  aria-hidden="true"
                />
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div className="mb-2 flex items-center gap-3 rounded-lg px-2 py-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-xs font-semibold text-secondary-foreground">
            {userName.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{userName}</p>
            {userEmail ? (
              <p className="truncate text-xs text-muted-foreground">
                {userEmail}
              </p>
            ) : null}
          </div>
          <Settings
            className="h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
        <LogoutButton />
      </div>
    </div>
  );

  return (
    <div className="-mx-4 -my-6 min-h-[calc(100dvh-3rem)] bg-background sm:-mx-6 sm:-my-8 lg:-mx-8">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-surface lg:block">
        {sidebar}
      </aside>

      {open ? (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navegación"
        >
          <button
            className="absolute inset-0 bg-black/50"
            aria-label="Cerrar navegación"
            onClick={() => setOpen(false)}
          />
          <aside className="relative h-full w-[min(86vw,20rem)] border-r border-border bg-surface shadow-md">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Cerrar navegación"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
            {sidebar}
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/94 px-4 backdrop-blur-md sm:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-surface lg:hidden"
            aria-label="Abrir navegación"
            aria-expanded={open}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
              <span>{context.parent}</span>
              <ChevronRight className="h-3 w-3" aria-hidden="true" />
              <span>{context.title}</span>
            </div>
            <p className="truncate text-sm font-semibold sm:mt-0.5">
              {context.title}
            </p>
          </div>
          {role === "admin" ? (
            <form
              action="/admin/clients"
              className="relative hidden w-full max-w-xs md:block"
            >
              <label htmlFor="shell-search" className="sr-only">
                Buscar clientes
              </label>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <input
                id="shell-search"
                name="q"
                type="search"
                className="h-10 w-full rounded-lg border border-border bg-surface pl-9 pr-3 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                placeholder="Buscar clientes…"
              />
            </form>
          ) : null}
          <ThemeToggle />
        </header>
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
