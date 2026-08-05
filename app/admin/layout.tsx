import { AppShell } from "@/components/app-shell";
import { getSessionUser, requireRole } from "@/lib/auth";

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [profile, user] = await Promise.all([
    requireRole("admin"),
    getSessionUser()
  ]);
  const userName =
    profile.full_name?.trim() || user?.email?.split("@")[0] || "Administrador";

  return (
    <AppShell role="admin" userName={userName} userEmail={user?.email}>
      {children}
    </AppShell>
  );
}
