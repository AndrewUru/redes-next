import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { SocialAccountRow } from "@/lib/db/types";

const createSocialAccountSchema = z.object({
  platform: z.enum(["instagram", "facebook"]),
  accountName: z.string().min(1).max(120),
  accountHandle: z.string().trim().max(120).optional().or(z.literal("")),
  externalAccountId: z.string().trim().max(120).optional().or(z.literal("")),
  metadata: z.record(z.unknown()).optional()
});

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

function sanitizeMetadata(metadata: Record<string, unknown> | null | undefined) {
  if (!metadata || typeof metadata !== "object") return {};
  const safe: Record<string, unknown> = { ...metadata };
  if ("oauth" in safe && safe.oauth && typeof safe.oauth === "object") {
    const oauth = { ...(safe.oauth as Record<string, unknown>) };
    delete oauth.access_token;
    delete oauth.refresh_token;
    delete oauth.token;
    delete oauth.token_ciphertext;
    delete oauth.token_iv;
    delete oauth.token_tag;
    delete oauth.user_token;
    delete oauth.page_token;
    safe.oauth = oauth;
  }
  return safe;
}

export async function GET() {
  const ctx = await getClientContext();
  if ("error" in ctx) return ctx.error;

  const { data, error } = await ctx.supabase
    .from("social_accounts")
    .select("*")
    .eq("client_id", ctx.clientId)
    .order("connected_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const safeAccounts = ((data ?? []) as SocialAccountRow[]).map((account) => ({
    ...account,
    metadata: sanitizeMetadata(account.metadata)
  }));

  return NextResponse.json({ accounts: safeAccounts });
}

export async function POST(request: Request) {
  const ctx = await getClientContext();
  if ("error" in ctx) return ctx.error;

  const parsed = createSocialAccountSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  const payload = parsed.data;
  const { data, error } = await ctx.supabase
    .from("social_accounts")
    .insert({
      client_id: ctx.clientId,
      platform: payload.platform,
      account_name: payload.accountName.trim(),
      account_handle: payload.accountHandle?.trim() || null,
      external_account_id: payload.externalAccountId?.trim() || null,
      metadata: payload.metadata ?? {},
      status: "connected"
    })
    .select("*")
    .single();

  if (error) {
    const status = error.code === "23505" ? 409 : 400;
    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json({ account: data as SocialAccountRow });
}

export async function DELETE(request: Request) {
  const ctx = await getClientContext();
  if ("error" in ctx) return ctx.error;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await ctx.supabase
    .from("social_accounts")
    .delete()
    .eq("id", id)
    .eq("client_id", ctx.clientId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
