import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SocialAccountRow } from "@/lib/db/types";
import { decryptSecret } from "@/lib/security/encryption";

type EncryptedSecret = {
  token_ciphertext: string;
  token_iv: string;
  token_tag: string;
};

type InstagramProfile = {
  id: string;
  username?: string;
  followers_count?: number;
  follows_count?: number;
  media_count?: number;
  profile_picture_url?: string;
};

type InstagramInsightValue = {
  value?: number;
  end_time?: string;
};

type InstagramInsightMetric = {
  name?: string;
  values?: InstagramInsightValue[];
};

type InstagramMediaItem = {
  id: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp?: string;
  like_count?: number;
  comments_count?: number;
};

type GraphErrorPayload = {
  error?: {
    message?: string;
    code?: number;
    error_subcode?: number;
    type?: string;
  };
};

type HistoryPoint = {
  date: string;
  followers: number | null;
  reach7d: number | null;
  impressions7d: number | null;
  profileViews7d: number | null;
  interactionsRecentPosts: number | null;
  engagementRate: number | null;
};

type AccountInsights = {
  accountId: string;
  accountName: string;
  accountHandle: string | null;
  platform: "instagram";
  followers: number | null;
  following: number | null;
  mediaCount: number | null;
  reach7d: number | null;
  impressions7d: number | null;
  profileViews7d: number | null;
  interactionsRecentPosts: number;
  engagementRate: number | null;
  insightsStatus: "ok" | "limited" | "unavailable";
  insightsMessage?: string;
  posts: Array<{
    id: string;
    caption: string;
    mediaType: string;
    permalink: string | null;
    publishedAt: string | null;
    likeCount: number;
    commentCount: number;
    interactions: number;
    previewUrl: string | null;
  }>;
  history: HistoryPoint[];
  error?: string;
};

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

function asRecord(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function asEncryptedSecret(value: unknown): EncryptedSecret | null {
  const record = asRecord(value);
  const token_ciphertext = record.token_ciphertext;
  const token_iv = record.token_iv;
  const token_tag = record.token_tag;
  if (
    typeof token_ciphertext !== "string" ||
    typeof token_iv !== "string" ||
    typeof token_tag !== "string"
  ) {
    return null;
  }
  return { token_ciphertext, token_iv, token_tag };
}

function sumLatest7(values: InstagramInsightValue[] | undefined) {
  if (!values || values.length === 0) return null;
  const normalized = values
    .filter((value) => typeof value.value === "number")
    .sort((a, b) => (new Date(b.end_time ?? 0).getTime() || 0) - (new Date(a.end_time ?? 0).getTime() || 0))
    .slice(0, 7);

  if (normalized.length === 0) return null;
  return normalized.reduce((acc, item) => acc + (item.value ?? 0), 0);
}

function inferInsightsMessage(payload: GraphErrorPayload | null) {
  const code = payload?.error?.code;
  const subcode = payload?.error?.error_subcode;
  const message = payload?.error?.message?.toLowerCase() ?? "";
  const permissionCodes = new Set([10, 200, 190]);

  if (
    permissionCodes.has(code ?? -1) ||
    message.includes("permission") ||
    message.includes("advanced access") ||
    message.includes("not approved") ||
    subcode === 33
  ) {
    return "Meta no devolvio insights para esta cuenta. Suele requerir acceso avanzado/revision de permisos en la app y cuenta Business/Creator vinculada.";
  }

  return "Meta no devolvio insights para esta cuenta en este momento. Puedes seguir viendo posts y engagement mientras se habilitan metricas avanzadas.";
}

async function getClientContext() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  const { data: link } = await supabase
    .from("client_users")
    .select("client_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!link?.client_id) return { error: NextResponse.json({ error: "No client" }, { status: 400 }) };
  return { supabase, clientId: link.client_id };
}

async function fetchInstagramInsights(account: SocialAccountRow): Promise<AccountInsights> {
  const base: AccountInsights = {
    accountId: account.id,
    accountName: account.account_name,
    accountHandle: account.account_handle,
    platform: "instagram",
    followers: null,
    following: null,
    mediaCount: null,
    reach7d: null,
    impressions7d: null,
    profileViews7d: null,
    interactionsRecentPosts: 0,
    engagementRate: null,
    insightsStatus: "unavailable",
    posts: [],
    history: []
  };

  const metadata = asRecord(account.metadata);
  const oauth = asRecord(metadata.oauth);
  const encryptedPageToken = asEncryptedSecret(oauth.page_token);
  const igAccountId = account.external_account_id;

  if (!encryptedPageToken || !igAccountId) {
    return {
      ...base,
      error: "Cuenta sin token OAuth valido o sin ID de Instagram."
    };
  }

  let pageToken = "";
  try {
    pageToken = decryptSecret(encryptedPageToken);
  } catch {
    return {
      ...base,
      error: "No se pudo descifrar el token de la cuenta."
    };
  }

  const [profileRes, insightsRes, postsRes] = await Promise.all([
    fetch(
      `https://graph.facebook.com/v22.0/${igAccountId}?fields=id,username,followers_count,follows_count,media_count,profile_picture_url&access_token=${encodeURIComponent(pageToken)}`,
      { cache: "no-store" }
    ),
    fetch(
      `https://graph.facebook.com/v22.0/${igAccountId}/insights?metric=impressions,reach,profile_views&period=day&access_token=${encodeURIComponent(pageToken)}`,
      { cache: "no-store" }
    ),
    fetch(
      `https://graph.facebook.com/v22.0/${igAccountId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&limit=12&access_token=${encodeURIComponent(pageToken)}`,
      { cache: "no-store" }
    )
  ]);

  if (!profileRes.ok || !postsRes.ok) {
    return {
      ...base,
      error: "Meta Graph API rechazo la lectura de perfil o publicaciones."
    };
  }

  const profile = (await profileRes.json()) as InstagramProfile;
  const postsJson = (await postsRes.json()) as { data?: InstagramMediaItem[] };

  const insightsPayload = insightsRes.ok
    ? ((await insightsRes.json()) as { data?: InstagramInsightMetric[] })
    : ((await insightsRes.json()) as GraphErrorPayload);

  const insightsData = "data" in insightsPayload ? insightsPayload.data ?? [] : [];

  const reach7d = sumLatest7(insightsData.find((item) => item.name === "reach")?.values);
  const impressions7d = sumLatest7(insightsData.find((item) => item.name === "impressions")?.values);
  const profileViews7d = sumLatest7(insightsData.find((item) => item.name === "profile_views")?.values);

  const posts = (postsJson.data ?? []).map((post) => {
    const likes = typeof post.like_count === "number" ? post.like_count : 0;
    const comments = typeof post.comments_count === "number" ? post.comments_count : 0;
    return {
      id: post.id,
      caption: post.caption ?? "",
      mediaType: post.media_type ?? "UNKNOWN",
      permalink: post.permalink ?? null,
      publishedAt: post.timestamp ?? null,
      likeCount: likes,
      commentCount: comments,
      interactions: likes + comments,
      previewUrl: post.thumbnail_url ?? post.media_url ?? null
    };
  });

  const interactionsRecentPosts = posts.reduce((acc, post) => acc + post.interactions, 0);
  const engagementRate =
    typeof profile.followers_count === "number" && profile.followers_count > 0
      ? Number(((interactionsRecentPosts / profile.followers_count) * 100).toFixed(2))
      : null;

  const hasInsights = reach7d !== null || impressions7d !== null || profileViews7d !== null;

  return {
    ...base,
    followers: profile.followers_count ?? null,
    following: profile.follows_count ?? null,
    mediaCount: profile.media_count ?? null,
    reach7d,
    impressions7d,
    profileViews7d,
    interactionsRecentPosts,
    engagementRate,
    insightsStatus: hasInsights ? "ok" : insightsRes.ok ? "limited" : "unavailable",
    insightsMessage: hasInsights
      ? undefined
      : insightsRes.ok
        ? "Meta no devolvio metricas de insights para esta cuenta. Esto suele requerir acceso avanzado/revision o una cuenta Instagram Business/Creator bien vinculada."
        : inferInsightsMessage(insightsPayload as GraphErrorPayload),
    posts
  };
}

export async function GET() {
  const ctx = await getClientContext();
  if ("error" in ctx) return ctx.error;

  const { data, error } = await ctx.supabase
    .from("social_accounts")
    .select("*")
    .eq("client_id", ctx.clientId)
    .eq("platform", "instagram")
    .eq("status", "connected");

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const accounts = (data ?? []) as SocialAccountRow[];
  if (accounts.length === 0) return NextResponse.json({ insights: [] as AccountInsights[] });

  const insights = await Promise.all(accounts.map((account) => fetchInstagramInsights(account)));

  const today = new Date().toISOString().slice(0, 10);
  const snapshotRows: SnapshotRow[] = insights
    .filter((item) => !item.error)
    .map((item) => ({
      client_id: ctx.clientId,
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
    const { error: snapshotUpsertError } = await ctx.supabase
      .from("social_account_daily_snapshots")
      .upsert(snapshotRows, { onConflict: "social_account_id,snapshot_date" });

    if (snapshotUpsertError) {
      return NextResponse.json({ error: snapshotUpsertError.message }, { status: 400 });
    }
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const fromDate = thirtyDaysAgo.toISOString().slice(0, 10);

  const accountIds = accounts.map((account) => account.id);
  const { data: historyRows, error: historyError } = await ctx.supabase
    .from("social_account_daily_snapshots")
    .select(
      "social_account_id,snapshot_date,followers,reach_7d,impressions_7d,profile_views_7d,interactions_recent_posts,engagement_rate"
    )
    .eq("client_id", ctx.clientId)
    .in("social_account_id", accountIds)
    .gte("snapshot_date", fromDate)
    .order("snapshot_date", { ascending: true });

  if (historyError) {
    return NextResponse.json({ error: historyError.message }, { status: 400 });
  }

  const historyByAccount = new Map<string, HistoryPoint[]>();
  for (const row of historyRows ?? []) {
    const accountId = String((row as Record<string, unknown>).social_account_id ?? "");
    if (!accountId) continue;
    const list = historyByAccount.get(accountId) ?? [];
    list.push({
      date: String((row as Record<string, unknown>).snapshot_date ?? ""),
      followers: ((row as Record<string, unknown>).followers as number | null) ?? null,
      reach7d: ((row as Record<string, unknown>).reach_7d as number | null) ?? null,
      impressions7d: ((row as Record<string, unknown>).impressions_7d as number | null) ?? null,
      profileViews7d: ((row as Record<string, unknown>).profile_views_7d as number | null) ?? null,
      interactionsRecentPosts:
        ((row as Record<string, unknown>).interactions_recent_posts as number | null) ?? null,
      engagementRate: ((row as Record<string, unknown>).engagement_rate as number | null) ?? null
    });
    historyByAccount.set(accountId, list);
  }

  const enriched = insights.map((item) => ({
    ...item,
    history: historyByAccount.get(item.accountId) ?? []
  }));

  return NextResponse.json({ insights: enriched });
}
