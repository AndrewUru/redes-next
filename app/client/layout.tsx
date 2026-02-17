import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/logout-button";

export default async function ClientLayout({
  children
}: {
  children: React.ReactNode;
}) {
  await requireRole("client");

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-6 py-8">
      <header className="neo-box flex items-center justify-between bg-background">
        <div>
          <h1 className="text-4xl">Ecosistema Cliente</h1>
          <nav className="mt-1 flex gap-4 text-sm font-semibold text-muted-foreground">
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
          </nav>
        </div>
        <LogoutButton />
      </header>
      {children}
    </div>
  );
}
