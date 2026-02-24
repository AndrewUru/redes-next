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
  error?: string;
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
  const metadata = asRecord(account.metadata);
  const oauth = asRecord(metadata.oauth);
  const encryptedPageToken = asEncryptedSecret(oauth.page_token);
  const igAccountId = account.external_account_id;

  if (!encryptedPageToken || !igAccountId) {
    return {
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
      posts: [],
      error: "Cuenta sin token OAuth válido o sin ID de Instagram."
    };
  }

  let pageToken = "";
  try {
    pageToken = decryptSecret(encryptedPageToken);
  } catch {
    return {
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
      posts: [],
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
      posts: [],
      error: "Meta Graph API rechazó la lectura de perfil o publicaciones."
    };
  }

  const profile = (await profileRes.json()) as InstagramProfile;
  const insights = insightsRes.ok
    ? ((await insightsRes.json()) as { data?: InstagramInsightMetric[] })
    : { data: [] as InstagramInsightMetric[] };
  const postsJson = (await postsRes.json()) as { data?: InstagramMediaItem[] };

  const reach7d = sumLatest7(insights.data?.find((item) => item.name === "reach")?.values);
  const impressions7d = sumLatest7(insights.data?.find((item) => item.name === "impressions")?.values);
  const profileViews7d = sumLatest7(insights.data?.find((item) => item.name === "profile_views")?.values);

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

  return {
    accountId: account.id,
    accountName: account.account_name,
    accountHandle: account.account_handle,
    platform: "instagram",
    followers: profile.followers_count ?? null,
    following: profile.follows_count ?? null,
    mediaCount: profile.media_count ?? null,
    reach7d,
    impressions7d,
    profileViews7d,
    interactionsRecentPosts,
    engagementRate,
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
  return NextResponse.json({ insights });
}
