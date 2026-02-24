import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { encryptSecret } from "@/lib/security/encryption";

const OAUTH_STATE_COOKIE = "ig_oauth_state";

type InstagramProfile = {
  id: string;
  username: string;
  name?: string;
  profile_picture_url?: string;
  biography?: string;
  media_count?: number;
};

type InstagramMedia = {
  id: string;
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp?: string;
  caption?: string;
};

type FacebookPageWithInstagram = {
  id: string;
  name: string;
  access_token: string;
  instagram_business_account?: {
    id: string;
    username?: string;
    name?: string;
  } | null;
};

async function getClientContext() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthorized" as const };

  const { data: link } = await supabase
    .from("client_users")
    .select("client_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!link?.client_id) return { error: "no_client" as const };

  return { supabase, clientId: link.client_id };
}

function redirectToAccounts(request: Request, reason: string) {
  const url = new URL("/client/accounts", request.url);
  if (reason === "success") {
    url.searchParams.set("oauth", "success");
  } else {
    url.searchParams.set("oauth", "error");
    url.searchParams.set("reason", reason);
  }
  const response = NextResponse.redirect(url);
  response.cookies.set(OAUTH_STATE_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
  return response;
}

function asRecord(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const providerError = requestUrl.searchParams.get("error");
  if (providerError) return redirectToAccounts(request, providerError);

  const state = requestUrl.searchParams.get("state");
  const code = requestUrl.searchParams.get("code");

  const cookieStore = await cookies();
  const cookieState = cookieStore.get(OAUTH_STATE_COOKIE)?.value ?? null;

  if (!state || !code || !cookieState || state !== cookieState) {
    return redirectToAccounts(request, "invalid_state");
  }

  const ctx = await getClientContext();
  if ("error" in ctx) return redirectToAccounts(request, ctx.error ?? "auth_failed");
  if (!state.startsWith(`${ctx.clientId}:`)) return redirectToAccounts(request, "invalid_client");

  const appId = process.env.INSTAGRAM_APP_ID;
  const appSecret = process.env.META_APP_SECRET ?? process.env.INSTAGRAM_APP_SECRET;
  const effectiveAppId = process.env.META_APP_ID ?? appId;
  const redirectUri =
    process.env.META_BUSINESS_REDIRECT_URI ?? process.env.INSTAGRAM_REDIRECT_URI;
  if (!effectiveAppId || !appSecret || !redirectUri) {
    return redirectToAccounts(request, "missing_env");
  }

  const tokenUrl = new URL("https://graph.facebook.com/v22.0/oauth/access_token");
  tokenUrl.searchParams.set("client_id", effectiveAppId);
  tokenUrl.searchParams.set("client_secret", appSecret);
  tokenUrl.searchParams.set("redirect_uri", redirectUri);
  tokenUrl.searchParams.set("code", code);
  const tokenRes = await fetch(tokenUrl);

  if (!tokenRes.ok) return redirectToAccounts(request, "token_exchange_failed");

  const tokenJson = (await tokenRes.json()) as {
    access_token?: string;
    token_type?: string;
    expires_in?: number;
  };
  if (!tokenJson.access_token) return redirectToAccounts(request, "missing_access_token");

  let userAccessToken = tokenJson.access_token;
  let expiresIn: number | null = null;

  const longLivedUrl = new URL("https://graph.facebook.com/v22.0/oauth/access_token");
  longLivedUrl.searchParams.set("grant_type", "fb_exchange_token");
  longLivedUrl.searchParams.set("client_id", effectiveAppId);
  longLivedUrl.searchParams.set("client_secret", appSecret);
  longLivedUrl.searchParams.set("fb_exchange_token", tokenJson.access_token);
  const longLivedRes = await fetch(longLivedUrl);
  if (longLivedRes.ok) {
    const longLivedJson = (await longLivedRes.json()) as { access_token?: string; expires_in?: number };
    if (longLivedJson.access_token) {
      userAccessToken = longLivedJson.access_token;
      expiresIn = longLivedJson.expires_in ?? null;
    }
  }

  const pagesRes = await fetch(
    `https://graph.facebook.com/v22.0/me/accounts?fields=id,name,access_token,instagram_business_account{id,username,name}&access_token=${encodeURIComponent(userAccessToken)}`
  );
  if (!pagesRes.ok) return redirectToAccounts(request, "pages_read_failed");
  const pagesJson = (await pagesRes.json()) as { data?: FacebookPageWithInstagram[] };
  const page = (pagesJson.data ?? []).find((candidate) => candidate.instagram_business_account?.id);
  if (!page?.instagram_business_account?.id) {
    return redirectToAccounts(request, "no_instagram_business_account");
  }
  if (!page.access_token) return redirectToAccounts(request, "missing_page_access_token");

  const igAccountId = page.instagram_business_account.id;
  const pageAccessToken = page.access_token;

  const profileRes = await fetch(
    `https://graph.facebook.com/v22.0/${igAccountId}?fields=id,username,name,profile_picture_url,biography,media_count&access_token=${encodeURIComponent(pageAccessToken)}`
  );
  if (!profileRes.ok) return redirectToAccounts(request, "profile_read_failed");
  const profile = (await profileRes.json()) as InstagramProfile;
  if (!profile.id || !profile.username) return redirectToAccounts(request, "invalid_profile");

  const mediaRes = await fetch(
    `https://graph.facebook.com/v22.0/${igAccountId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=3&access_token=${encodeURIComponent(pageAccessToken)}`
  );
  const mediaJson = mediaRes.ok
    ? ((await mediaRes.json()) as { data?: InstagramMedia[] })
    : { data: [] as InstagramMedia[] };

  const encryptedUserToken = encryptSecret(userAccessToken);
  const encryptedPageToken = encryptSecret(pageAccessToken);
  const verifiedAt = new Date().toISOString();
  const tokenExpiresAt =
    expiresIn && Number.isFinite(expiresIn)
      ? new Date(Date.now() + expiresIn * 1000).toISOString()
      : null;

  const { data: existingByExternal } = await ctx.supabase
    .from("social_accounts")
    .select("id,metadata")
    .eq("client_id", ctx.clientId)
    .eq("platform", "instagram")
    .eq("external_account_id", profile.id)
    .maybeSingle();

  const { data: existingByHandle } = existingByExternal
    ? { data: null }
    : await ctx.supabase
        .from("social_accounts")
        .select("id,metadata")
        .eq("client_id", ctx.clientId)
        .eq("platform", "instagram")
        .eq("account_handle", `@${profile.username}`)
        .maybeSingle();

  const current = existingByExternal ?? existingByHandle;
  const currentMetadata = asRecord(current?.metadata);
  const oauthMetadata = {
    connected_via: "oauth",
    verified_at: verifiedAt,
    provider: "facebook_login_instagram_graph",
    page_id: page.id,
    page_name: page.name,
    profile_name: profile.name ?? null,
    profile_picture_url: profile.profile_picture_url ?? null,
    biography: profile.biography ?? null,
    media_count: profile.media_count ?? null,
    media_sample: mediaJson.data ?? [],
    token_expires_at: tokenExpiresAt,
    user_token: encryptedUserToken,
    page_token: encryptedPageToken
  };

  if (current?.id) {
    const { error: updateError } = await ctx.supabase
      .from("social_accounts")
      .update({
        account_name: profile.username,
        account_handle: `@${profile.username}`,
        external_account_id: profile.id,
        status: "connected",
        metadata: {
          ...currentMetadata,
          oauth: oauthMetadata
        }
      })
      .eq("id", current.id)
      .eq("client_id", ctx.clientId);

    if (updateError) return redirectToAccounts(request, "db_update_failed");
  } else {
    const { error: insertError } = await ctx.supabase.from("social_accounts").insert({
      client_id: ctx.clientId,
      platform: "instagram",
      account_name: profile.username,
      account_handle: `@${profile.username}`,
      external_account_id: profile.id,
      status: "connected",
      metadata: {
        oauth: oauthMetadata
      }
    });
    if (insertError) return redirectToAccounts(request, "db_insert_failed");
  }

  return redirectToAccounts(request, "success");
}
