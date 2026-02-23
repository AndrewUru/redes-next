import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const bodySchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1)
});

export async function POST(request: Request) {
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

  const json = await request.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  const tempPassword = randomBytes(9).toString("base64url");
  const { data: createdUser, error: userError } = await supabaseAdmin.auth.admin.createUser({
    email: parsed.data.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name: parsed.data.fullName }
  });
  if (userError || !createdUser.user) {
    return NextResponse.json(
      { error: userError?.message ?? "No se pudo crear usuario admin" },
      { status: 400 }
    );
  }

  const userId = createdUser.user.id;
  const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
    id: userId,
    role: "admin",
    full_name: parsed.data.fullName
  });
  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, tempPassword });
}
