import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const createAssetSchema = z.object({
  type: z.enum(["logo", "typography", "photo", "reference"]),
  storagePath: z.string().min(3),
  metadata: z.record(z.any()).optional()
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

export async function GET() {
  const ctx = await getClientContext();
  if ("error" in ctx) return ctx.error;

  const { data, error } = await ctx.supabase
    .from("assets")
    .select("*")
    .eq("client_id", ctx.clientId)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const assetsWithPreview = await Promise.all(
    (data ?? []).map(async (asset) => {
      const { data: signed } = await ctx.supabase.storage
        .from("brand-assets")
        .createSignedUrl(asset.storage_path, 60 * 60);

      return {
        ...asset,
        preview_url: signed?.signedUrl ?? null
      };
    })
  );

  return NextResponse.json({ assets: assetsWithPreview });
}

export async function POST(request: Request) {
  const ctx = await getClientContext();
  if ("error" in ctx) return ctx.error;

  const parsed = createAssetSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  const { error } = await ctx.supabase.from("assets").insert({
    client_id: ctx.clientId,
    type: parsed.data.type,
    storage_path: parsed.data.storagePath,
    metadata: parsed.data.metadata ?? {}
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const ctx = await getClientContext();
  if ("error" in ctx) return ctx.error;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { data: target } = await ctx.supabase
    .from("assets")
    .select("id,storage_path")
    .eq("id", id)
    .eq("client_id", ctx.clientId)
    .maybeSingle();
  if (!target) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await ctx.supabase.storage.from("brand-assets").remove([target.storage_path]);
  const { error } = await ctx.supabase.from("assets").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
