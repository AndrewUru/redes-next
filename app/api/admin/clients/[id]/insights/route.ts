import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import {
  fetchInstagramInsights,
  AccountInsights,
  HistoryPoint
} from "@/lib/instagram/insights";
import type { SocialAccountRow } from "@/lib/db/types";

type SnapshotRow = {
  client_id: string;
  social_account_id: string;
  snapshot_date: string;
  followers: number | null;
  reach_7d: number | null;
  impressions_7d: number | null;
  profile_views_7d: number | null;
  interactions_recent_posts: number;
  engagement_rate: number | null;
};

export async function GET(request: Request) {
  await requireRole("admin");
  const pathname = new URL(request.url).pathname;
  const match = pathname.match(/\/api\/admin\/clients\/([^/]+)\/insights$/);
  const clientId = match?.[1] ?? null;
  if (!clientId) {
    return NextResponse.json(
      { error: "Cliente no encontrado en la ruta." },
      { status: 400 }
    );
  }
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("social_accounts")
    .select("*")
    .eq("client_id", clientId)
    .eq("platform", "instagram")
    .eq("status", "connected");

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  const accounts = (data ?? []) as SocialAccountRow[];
  if (accounts.length === 0)
    return NextResponse.json({ insights: [] as AccountInsights[] });

  const insights = await Promise.all(
    accounts.map((account) => fetchInstagramInsights(account))
  );

  const today = new Date().toISOString().slice(0, 10);
  const snapshotRows: SnapshotRow[] = insights
    .filter((item) => !item.error)
    .map((item) => ({
      client_id: clientId,
      social_account_id: item.accountId,
      snapshot_date: today,
      followers: item.followers,
      reach_7d: item.reach7d,
      impressions_7d: item.impressions7d,
      profile_views_7d: item.profileViews7d,
      interactions_recent_posts: item.interactionsRecentPosts,
      engagement_rate: item.engagementRate
    }));

  if (snapshotRows.length > 0) {
    const { error: snapshotUpsertError } = await supabase
      .from("social_account_daily_snapshots")
      .upsert(snapshotRows, { onConflict: "social_account_id,snapshot_date" });

    if (snapshotUpsertError) {
      return NextResponse.json(
        { error: snapshotUpsertError.message },
        { status: 400 }
      );
    }
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const fromDate = thirtyDaysAgo.toISOString().slice(0, 10);

  const accountIds = accounts.map((account) => account.id);
  const { data: historyRows, error: historyError } = await supabase
    .from("social_account_daily_snapshots")
    .select(
      "social_account_id,snapshot_date,followers,reach_7d,impressions_7d,profile_views_7d,interactions_recent_posts,engagement_rate"
    )
    .eq("client_id", clientId)
    .in("social_account_id", accountIds)
    .gte("snapshot_date", fromDate)
    .order("snapshot_date", { ascending: true });

  if (historyError) {
    return NextResponse.json({ error: historyError.message }, { status: 400 });
  }

  const historyByAccount = new Map<string, HistoryPoint[]>();
  for (const row of historyRows ?? []) {
    const record = row as Record<string, unknown>;
    const accountId = String(record.social_account_id ?? "");
    if (!accountId) continue;
    const list = historyByAccount.get(accountId) ?? [];
    list.push({
      date: String(record.snapshot_date ?? ""),
      followers: (record.followers as number | null) ?? null,
      reach7d: (record.reach_7d as number | null) ?? null,
      impressions7d: (record.impressions_7d as number | null) ?? null,
      profileViews7d: (record.profile_views_7d as number | null) ?? null,
      interactionsRecentPosts:
        (record.interactions_recent_posts as number | null) ?? null,
      engagementRate: (record.engagement_rate as number | null) ?? null
    });
    historyByAccount.set(accountId, list);
  }

  const enriched = insights.map((item) => ({
    ...item,
    history: historyByAccount.get(item.accountId) ?? []
  }));

  return NextResponse.json({ insights: enriched });
}
