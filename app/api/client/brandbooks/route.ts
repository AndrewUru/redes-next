import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const deleteBrandbookSchema = z.object({
  id: z.string().uuid()
});

async function getClientContext() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    };
  }

  const { data: link } = await supabase
    .from("client_users")
    .select("client_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (!link?.client_id) {
    return {
      error: NextResponse.json({ error: "No client" }, { status: 400 })
    };
  }

  return { supabase, clientId: link.client_id };
}

export async function DELETE(request: Request) {
  const ctx = await getClientContext();
  if ("error" in ctx) return ctx.error;

  const parsed = deleteBrandbookSchema.safeParse({
    id: new URL(request.url).searchParams.get("id")
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Missing or invalid id" },
      { status: 400 }
    );
  }

  const { data: target, error: targetError } = await ctx.supabase
    .from("brandbooks")
    .select("id,pdf_path")
    .eq("id", parsed.data.id)
    .eq("client_id", ctx.clientId)
    .maybeSingle();
  if (targetError) {
    return NextResponse.json({ error: targetError.message }, { status: 400 });
  }
  if (!target) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { error: storageError } = await supabaseAdmin.storage
    .from("brandbooks")
    .remove([target.pdf_path]);
  if (storageError) {
    return NextResponse.json({ error: storageError.message }, { status: 400 });
  }

  const { error: deleteError } = await supabaseAdmin
    .from("brandbooks")
    .delete()
    .eq("id", parsed.data.id)
    .eq("client_id", ctx.clientId);
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
