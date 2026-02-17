import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { calculateCompletionPct } from "@/lib/intake/completion";
import { intakeSchema } from "@/lib/intake/schema";

const saveSchema = z.object({
  status: z.enum(["draft", "submitted"]),
  data: z.record(z.any()),
  completionPct: z.number().int().min(0).max(100).optional()
});

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: link } = await supabase
    .from("client_users")
    .select("client_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!link?.client_id) return NextResponse.json({ data: null });

  const { data, error } = await supabase
    .from("intake_responses")
    .select("*")
    .eq("client_id", link.client_id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: link } = await supabase
    .from("client_users")
    .select("client_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!link?.client_id) return NextResponse.json({ error: "No client linked" }, { status: 400 });

  const parsed = saveSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  if (parsed.data.status === "submitted") {
    const result = intakeSchema.safeParse(parsed.data.data);
    if (!result.success) {
      return NextResponse.json(
        { error: "Payload invalido para envio final." },
        { status: 400 }
      );
    }
  }

  const completionPct =
    parsed.data.completionPct ?? calculateCompletionPct(parsed.data.data as never);

  const { error } = await supabase.from("intake_responses").upsert(
    {
      client_id: link.client_id,
      status: parsed.data.status,
      completion_pct: completionPct,
      data: parsed.data.data,
      schema_version: 1
    },
    { onConflict: "client_id" }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
