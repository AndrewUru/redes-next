import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import type { AssetRow, BrandbookRow, SocialAccountRow } from "@/lib/db/types";

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
  const [
    { data: client },
    { data: intake },
    { data: assets },
    { data: brandbooks },
    { data: socialAccounts }
  ] =
    await Promise.all([
      supabase.from("clients").select("*").eq("id", clientId).maybeSingle(),
      supabase
        .from("intake_responses")
        .select("*")
        .eq("client_id", clientId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("assets")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })
        .returns<AssetRow[]>(),
      supabase
        .from("brandbooks")
        .select("*")
        .eq("client_id", clientId)
        .order("version", { ascending: false })
        .returns<BrandbookRow[]>(),
      supabase
        .from("social_accounts")
        .select("*")
        .eq("client_id", clientId)
        .order("updated_at", { ascending: false })
        .returns<SocialAccountRow[]>()
    ]);
  const brandbookList = brandbooks ?? [];
  const assetList = assets ?? [];

  return {
    client: client ?? null,
    intake: intake ?? null,
    assets: assetList,
    assetsCount: assetList.length,
    brandbooks: brandbookList,
    latestBrandbook: brandbookList[0] ?? null,
    socialAccounts: socialAccounts ?? []
  };
}
