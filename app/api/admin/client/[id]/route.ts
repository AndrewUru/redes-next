import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const bodySchema = z.object({
  status: z.enum(["lead", "onboarding", "activo", "pausado"]),
  notes: z.string().optional()
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  const { error } = await supabase
    .from("clients")
    .update({ status: parsed.data.status, notes: parsed.data.notes ?? null })
    .eq("id", id)
    .eq("owner_admin_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: members, error: membersError } = await supabase
    .from("client_users")
    .select("user_id")
    .eq("client_id", id);
  if (membersError) return NextResponse.json({ error: membersError.message }, { status: 400 });

  const userIds = [...new Set((members ?? []).map((member) => member.user_id))];

  const { error: deleteClientError } = await supabase
    .from("clients")
    .delete()
    .eq("id", id)
    .eq("owner_admin_id", user.id);
  if (deleteClientError) {
    return NextResponse.json({ error: deleteClientError.message }, { status: 400 });
  }

  for (const userId of userIds) {
    const { count, error: linksError } = await supabaseAdmin
      .from("client_users")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);
    if (linksError) {
      return NextResponse.json({ error: linksError.message }, { status: 400 });
    }
    if ((count ?? 0) > 0) continue;

    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteUserError) {
      return NextResponse.json({ error: deleteUserError.message }, { status: 400 });
    }
  }

  return NextResponse.json({ ok: true });
}
