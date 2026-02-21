import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const OAUTH_STATE_COOKIE = "ig_oauth_state";

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
  return { clientId: link.client_id };
}

export async function GET() {
  const ctx = await getClientContext();
  if ("error" in ctx) return ctx.error;

  const clientId = process.env.META_APP_ID ?? process.env.INSTAGRAM_APP_ID;
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Missing META_APP_ID/INSTAGRAM_APP_ID or INSTAGRAM_REDIRECT_URI" },
      { status: 500 }
    );
  }

  const state = `${ctx.clientId}:${randomUUID()}`;
  const scopes =
    process.env.META_OAUTH_SCOPES ??
    "instagram_business_basic,pages_show_list,pages_read_engagement,business_management";
  const authorizeUrl = new URL("https://www.facebook.com/v22.0/dialog/oauth");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", redirectUri);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", scopes);
  authorizeUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(authorizeUrl);
  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15
  });

  return response;
}
