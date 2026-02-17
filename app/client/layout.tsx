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
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
      <header className="neo-box flex flex-col gap-4 bg-background sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl">Ecosistema Cliente</h1>
          <nav className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-muted-foreground">
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
        <div className="w-full sm:w-auto">
          <LogoutButton />
        </div>
      </header>
      {children}
    </div>
  );
}
