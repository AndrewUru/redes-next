import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";

export async function getAdminClients(query?: string) {
  const user = await requireAuth();
  const supabase = await createClient();
  let request = supabase
    .from("clients")
    .select("*")
    .eq("owner_admin_id", user.id)
    .order("created_at", { ascending: false });
  if (query) {
    request = request.ilike("display_name", `%${query}%`);
  }
  const { data, error } = await request;
  if (error) throw error;
  return data ?? [];
}

export async function getClientSummary(clientId: string) {
  const supabase = await createClient();
  const [{ data: client }, { data: intake }, { count: assetsCount }, { data: brandbook }] =
    await Promise.all([
      supabase.from("clients").select("*").eq("id", clientId).maybeSingle(),
      supabase
        .from("intake_responses")
        .select("*")
        .eq("client_id", clientId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("assets").select("*", { count: "exact", head: true }).eq("client_id", clientId),
      supabase
        .from("brandbooks")
        .select("*")
        .eq("client_id", clientId)
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle()
    ]);
  return {
    client: client ?? null,
    intake: intake ?? null,
    assetsCount: assetsCount ?? 0,
    latestBrandbook: brandbook ?? null
  };
}
