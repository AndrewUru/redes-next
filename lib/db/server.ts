import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/lib/auth";
import type { AssetRow, BrandbookRow, SocialAccountRow } from "@/lib/db/types";

export type AdminClientReadiness = {
  completionPct: number;
  pendingCount: number;
  hasSubmittedIntake: boolean;
  hasKeyAssets: boolean;
  hasBrandbook: boolean;
  hasConnectedSocialAccount: boolean;
};

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

export async function getAdminClientsReadiness(clientIds: string[]) {
  if (clientIds.length === 0) {
    return new Map<string, AdminClientReadiness>();
  }

  const supabase = await createClient();
  const [
    { data: intakes },
    { data: assets },
    { data: brandbooks },
    { data: socialAccounts }
  ] = await Promise.all([
    supabase
      .from("intake_responses")
      .select("client_id,status,completion_pct,updated_at")
      .in("client_id", clientIds)
      .order("updated_at", { ascending: false }),
    supabase.from("assets").select("client_id,type").in("client_id", clientIds),
    supabase.from("brandbooks").select("client_id").in("client_id", clientIds),
    supabase
      .from("social_accounts")
      .select("client_id,status")
      .in("client_id", clientIds)
  ]);

  const latestIntakeByClient = new Map<
    string,
    { status: string | null; completion_pct: number | null }
  >();
  for (const intake of intakes ?? []) {
    if (!latestIntakeByClient.has(intake.client_id)) {
      latestIntakeByClient.set(intake.client_id, intake);
    }
  }

  const assetTypesByClient = new Map<string, Set<string>>();
  for (const asset of assets ?? []) {
    const current = assetTypesByClient.get(asset.client_id) ?? new Set<string>();
    current.add(asset.type);
    assetTypesByClient.set(asset.client_id, current);
  }

  const brandbookClients = new Set(
    (brandbooks ?? []).map((brandbook) => brandbook.client_id)
  );
  const connectedSocialClients = new Set(
    (socialAccounts ?? [])
      .filter((account) => account.status === "connected")
      .map((account) => account.client_id)
  );

  return new Map(
    clientIds.map((clientId) => {
      const intake = latestIntakeByClient.get(clientId);
      const assetTypes = assetTypesByClient.get(clientId) ?? new Set<string>();
      const hasSubmittedIntake = intake?.status === "submitted";
      const hasKeyAssets = assetTypes.has("logo") && assetTypes.has("photo");
      const hasBrandbook = brandbookClients.has(clientId);
      const hasConnectedSocialAccount = connectedSocialClients.has(clientId);
      const checks = [
        hasSubmittedIntake,
        hasKeyAssets,
        hasBrandbook,
        hasConnectedSocialAccount
      ];

      return [
        clientId,
        {
          completionPct: intake?.completion_pct ?? 0,
          pendingCount: checks.filter((check) => !check).length,
          hasSubmittedIntake,
          hasKeyAssets,
          hasBrandbook,
          hasConnectedSocialAccount
        }
      ];
    })
  );
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
