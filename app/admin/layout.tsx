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
    <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
      <header className="neo-box flex items-center justify-between bg-background">
        <div>
          <h1 className="text-4xl">Growth Control Room</h1>
          <nav className="mt-1 text-sm font-semibold text-muted-foreground">
            <Link href="/admin/clients" className="underline">
              Clientes y posicionamiento
            </Link>
          </nav>
        </div>
        <LogoutButton />
      </header>
      {children}
    </div>
  );
}
