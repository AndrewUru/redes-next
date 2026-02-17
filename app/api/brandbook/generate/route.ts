import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { intakeSchema } from "@/lib/intake/schema";
import { BrandbookDocument } from "@/lib/pdf/brandbook-document";

export const runtime = "nodejs";

const bodySchema = z.object({
  clientId: z.string().uuid()
});

export async function POST(request: Request) {
  const parsedBody = bodySchema.safeParse(await request.json());
  if (!parsedBody.success) {
    return NextResponse.json({ error: parsedBody.error.message }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [
    { data: profile },
    { data: client },
    { data: intake },
    { data: latest },
    { data: template },
    { data: membership }
  ] = await Promise.all([
      supabase.from("profiles").select("role").eq("id", user.id).single(),
      supabase.from("clients").select("id,display_name,owner_admin_id").eq("id", parsedBody.data.clientId).single(),
      supabase.from("intake_responses").select("*").eq("client_id", parsedBody.data.clientId).maybeSingle(),
      supabase
        .from("brandbooks")
        .select("version")
        .eq("client_id", parsedBody.data.clientId)
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("templates").select("id").eq("is_active", true).maybeSingle(),
      supabase
        .from("client_users")
        .select("client_id")
        .eq("client_id", parsedBody.data.clientId)
        .eq("user_id", user.id)
        .maybeSingle()
    ]);

  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const isAdminAllowed = profile?.role === "admin" && client.owner_admin_id === user.id;
  const isClientAllowed =
    profile?.role === "client" && intake?.status === "submitted" && !!membership;
  if (!isAdminAllowed && !isClientAllowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsedIntake = intakeSchema.safeParse(intake?.data);
  if (!parsedIntake.success) {
    return NextResponse.json({ error: "Intake incompleto o invalido" }, { status: 400 });
  }

  const version = (latest?.version ?? 0) + 1;
  const path = `${client.id}/v${version}.pdf`;
  const pdfBuffer = await renderToBuffer(
    BrandbookDocument({
      clientName: client.display_name,
      data: parsedIntake.data
    })
  );

  const upload = await supabaseAdmin.storage
    .from("brandbooks")
    .upload(path, pdfBuffer, { contentType: "application/pdf", upsert: false });
  if (upload.error) return NextResponse.json({ error: upload.error.message }, { status: 400 });

  const { error } = await supabaseAdmin.from("brandbooks").insert({
    client_id: client.id,
    version,
    template_id: template?.id ?? null,
    pdf_path: path
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const { data: signed, error: signedError } = await supabaseAdmin.storage
    .from("brandbooks")
    .createSignedUrl(path, 60 * 60);

  return NextResponse.json({
    ok: true,
    version,
    path,
    signedUrl: signedError ? null : signed?.signedUrl ?? null
  });
}
