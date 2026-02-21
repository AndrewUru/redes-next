import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { encryptSecret } from "@/lib/security/encryption";

const OAUTH_STATE_COOKIE = "ig_oauth_state";

const completeSchema = z.object({
  state: z.string().min(8),
  accessToken: z.string().min(10).optional(),
  longLivedToken: z.string().min(10).optional()
});

type FacebookPageWithInstagram = {
  id: string;
  name: string;
  access_token?: string;
  instagram_business_account?: {
    id: string;
    username?: string;
    name?: string;
  } | null;
};

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

function asRecord(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
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

export async function POST(request: Request) {
  const ctx = await getClientContext();
  if ("error" in ctx) return ctx.error;

  const body = completeSchema.safeParse(await request.json());
  if (!body.success) {
    return NextResponse.json({ error: body.error.message }, { status: 400 });
  }

  const cookieStore = await cookies();
  const cookieState = cookieStore.get(OAUTH_STATE_COOKIE)?.value ?? null;
  if (!cookieState || body.data.state !== cookieState) {
    return NextResponse.json({ error: "Invalid state" }, { status: 400 });
  }
  if (!cookieState.startsWith(`${ctx.clientId}:`)) {
    return NextResponse.json({ error: "Invalid client state" }, { status: 400 });
  }

  const userAccessToken = body.data.longLivedToken ?? body.data.accessToken;
  if (!userAccessToken) {
    return NextResponse.json({ error: "Missing token from login fragment" }, { status: 400 });
  }

  const pagesRes = await fetch(
    `https://graph.facebook.com/v22.0/me/accounts?fields=id,name,access_token,instagram_business_account{id,username,name}&access_token=${encodeURIComponent(userAccessToken)}`
  );
  if (!pagesRes.ok) {
    return NextResponse.json({ error: "Failed to read pages from Graph API" }, { status: 400 });
  }
  const pagesJson = (await pagesRes.json()) as { data?: FacebookPageWithInstagram[] };
  const page = (pagesJson.data ?? []).find((candidate) => candidate.instagram_business_account?.id);
  if (!page?.instagram_business_account?.id) {
    return NextResponse.json({ error: "No Instagram Business account linked to available pages" }, { status: 400 });
  }
  if (!page.access_token) {
    return NextResponse.json({ error: "Missing page access token" }, { status: 400 });
  }

  const igAccountId = page.instagram_business_account.id;
  const pageAccessToken = page.access_token;

  const profileRes = await fetch(
    `https://graph.facebook.com/v22.0/${igAccountId}?fields=id,username,name,profile_picture_url,biography,media_count&access_token=${encodeURIComponent(pageAccessToken)}`
  );
  if (!profileRes.ok) return NextResponse.json({ error: "Failed to read Instagram profile" }, { status: 400 });
  const profile = (await profileRes.json()) as InstagramProfile;
  if (!profile.id || !profile.username) {
    return NextResponse.json({ error: "Invalid Instagram profile payload" }, { status: 400 });
  }

  const mediaRes = await fetch(
    `https://graph.facebook.com/v22.0/${igAccountId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=3&access_token=${encodeURIComponent(pageAccessToken)}`
  );
  const mediaJson = mediaRes.ok
    ? ((await mediaRes.json()) as { data?: InstagramMedia[] })
    : { data: [] as InstagramMedia[] };

  const encryptedUserToken = encryptSecret(userAccessToken);
  const encryptedPageToken = encryptSecret(pageAccessToken);
  const verifiedAt = new Date().toISOString();

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
    connected_via: "facebook_login_business",
    verified_at: verifiedAt,
    provider: "facebook_login_instagram_graph",
    page_id: page.id,
    page_name: page.name,
    profile_name: profile.name ?? null,
    profile_picture_url: profile.profile_picture_url ?? null,
    biography: profile.biography ?? null,
    media_count: profile.media_count ?? null,
    media_sample: mediaJson.data ?? [],
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

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }
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
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(OAUTH_STATE_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0
  });
  return response;
}
