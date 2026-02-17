import { redirect } from "next/navigation";
import { ensureClientOnboarding } from "@/lib/auth";

export default async function DashboardPage() {
  const profile = await ensureClientOnboarding();
  if (profile?.role === "admin") redirect("/admin/clients");
  redirect("/client");
}
