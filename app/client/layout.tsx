import { AppShell } from "@/components/app-shell";
import { getSessionUser, requireRole } from "@/lib/auth";

export default async function ClientLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [profile, user] = await Promise.all([
    requireRole("client"),
    getSessionUser()
  ]);
  const userName =
    profile.full_name?.trim() || user?.email?.split("@")[0] || "Cliente";

  return (
    <AppShell role="client" userName={userName} userEmail={user?.email}>
      {children}
    </AppShell>
  );
}
