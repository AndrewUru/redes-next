import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/logout-button";

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  await requireRole("admin");

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <header className="neo-box flex flex-col gap-4 bg-background sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl">Growth Control Room</h1>
          <nav className="mt-1 text-sm font-semibold text-muted-foreground">
            <Link href="/admin/clients" className="underline">
              Usuarios y posicionamiento
            </Link>
          </nav>
        </div>
        <div className="w-full sm:w-auto">
          <LogoutButton />
        </div>
      </header>
      {children}
    </div>
  );
}
