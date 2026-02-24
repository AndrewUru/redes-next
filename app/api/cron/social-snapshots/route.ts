import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { decryptSecret } from "@/lib/security/encryption";

type EncryptedSecret = {
  token_ciphertext: string;
  token_iv: string;
  token_tag: string;
};

type SocialAccountLite = {
  id: string;
  client_id: string;
  platform: "instagram" | "facebook";
  account_name: string;
  account_handle: string | null;
  external_account_id: string | null;
  status: "connected" | "error" | "disconnected";
  metadata: Record<string, unknown>;
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
  like_count?: number;
  comments_count?: number;
};

type SnapshotInsert = {
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

type BuildSnapshotResult =
  | { ok: false; error: string }
  | { ok: true; snapshot: SnapshotInsert };

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

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const authHeader = request.headers.get("authorization");
  const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  const headerSecret = request.headers.get("x-cron-secret") ?? "";

  return bearer === secret || headerSecret === secret;
}

async function buildSnapshot(
  account: SocialAccountLite,
  snapshotDate: string
): Promise<BuildSnapshotResult> {
  const metadata = asRecord(account.metadata);
  const oauth = asRecord(metadata.oauth);
  const encryptedPageToken = asEncryptedSecret(oauth.page_token);

  if (!encryptedPageToken || !account.external_account_id) {
    return { ok: false, error: "missing_oauth_data" };
  }

  let pageToken = "";
  try {
    pageToken = decryptSecret(encryptedPageToken);
  } catch {
    return { ok: false, error: "decrypt_failed" };
  }

  const igAccountId = account.external_account_id;
  const [profileRes, insightsRes, postsRes] = await Promise.all([
    fetch(
      `https://graph.facebook.com/v22.0/${igAccountId}?fields=followers_count&access_token=${encodeURIComponent(pageToken)}`,
      { cache: "no-store" }
    ),
    fetch(
      `https://graph.facebook.com/v22.0/${igAccountId}/insights?metric=impressions,reach,profile_views&period=day&access_token=${encodeURIComponent(pageToken)}`,
      { cache: "no-store" }
    ),
    fetch(
      `https://graph.facebook.com/v22.0/${igAccountId}/media?fields=id,like_count,comments_count&limit=12&access_token=${encodeURIComponent(pageToken)}`,
      { cache: "no-store" }
    )
  ]);

  if (!profileRes.ok || !postsRes.ok) {
    return { ok: false, error: "graph_read_failed" };
  }

  const profile = (await profileRes.json()) as { followers_count?: number };
  const insights = insightsRes.ok
    ? ((await insightsRes.json()) as { data?: InstagramInsightMetric[] })
    : { data: [] as InstagramInsightMetric[] };
  const postsJson = (await postsRes.json()) as { data?: InstagramMediaItem[] };

  const reach7d = sumLatest7(insights.data?.find((item) => item.name === "reach")?.values);
  const impressions7d = sumLatest7(insights.data?.find((item) => item.name === "impressions")?.values);
  const profileViews7d = sumLatest7(insights.data?.find((item) => item.name === "profile_views")?.values);

  const interactionsRecentPosts = (postsJson.data ?? []).reduce((acc, post) => {
    const likes = typeof post.like_count === "number" ? post.like_count : 0;
    const comments = typeof post.comments_count === "number" ? post.comments_count : 0;
    return acc + likes + comments;
  }, 0);

  const followers = profile.followers_count ?? null;
  const engagementRate =
    typeof followers === "number" && followers > 0
      ? Number(((interactionsRecentPosts / followers) * 100).toFixed(2))
      : null;

  const snapshot: SnapshotInsert = {
    client_id: account.client_id,
    social_account_id: account.id,
    snapshot_date: snapshotDate,
    followers,
    reach_7d: reach7d,
    impressions_7d: impressions7d,
    profile_views_7d: profileViews7d,
    interactions_recent_posts: interactionsRecentPosts,
    engagement_rate: engagementRate
  };

  return { ok: true, snapshot };
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.INSTAGRAM_TOKEN_ENCRYPTION_KEY) {
    return NextResponse.json({ error: "Missing INSTAGRAM_TOKEN_ENCRYPTION_KEY" }, { status: 500 });
  }

  const { data: accounts, error: accountsError } = await supabaseAdmin
    .from("social_accounts")
    .select("id,client_id,platform,account_name,account_handle,external_account_id,status,metadata")
    .eq("platform", "instagram")
    .eq("status", "connected");

  if (accountsError) {
    return NextResponse.json({ error: accountsError.message }, { status: 400 });
  }

  const rows = (accounts ?? []) as SocialAccountLite[];
  const snapshotDate = new Date().toISOString().slice(0, 10);
  const failures: Array<{ accountId: string; reason: string }> = [];
  const inserts: SnapshotInsert[] = [];

  for (const account of rows) {
    const result = await buildSnapshot(account, snapshotDate);
    if (!result.ok) {
      failures.push({ accountId: account.id, reason: result.error });
      continue;
    }
    inserts.push(result.snapshot);
  }

  if (inserts.length > 0) {
    const { error: upsertError } = await supabaseAdmin
      .from("social_account_daily_snapshots")
      .upsert(inserts, { onConflict: "social_account_id,snapshot_date" });

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 400 });
    }
  }

  return NextResponse.json({
    ok: true,
    processed: rows.length,
    saved: inserts.length,
    failed: failures.length,
    failures
  });
}
