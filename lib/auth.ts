import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import type { Role } from "@/lib/db/types";

export const getSessionUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
});

export const getProfile = cache(async () => {
  const user = await getSessionUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, full_name, created_at")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw error;
  return data as { id: string; role: Role; full_name: string | null; created_at: string } | null;
});

export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireRole(role: Role) {
  await requireAuth();
  const profile = await getProfile();
  if (!profile) redirect("/dashboard");
  if (profile.role !== role) {
    redirect(profile?.role === "admin" ? "/admin/clients" : "/client");
  }
  return profile;
}

export async function getClientIdForCurrentUser() {
  const user = await requireAuth();
  const supabase = await createClient();
  const { data } = await supabase
    .from("client_users")
    .select("client_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  return data?.client_id ?? null;
}

function getDisplayName(email?: string | null, fullName?: string | null) {
  const cleanFullName = fullName?.trim();
  if (cleanFullName) return cleanFullName;

  const localPart = email?.split("@")[0]?.trim();
  if (localPart) return `Cliente ${localPart}`;

  return "Cliente nuevo";
}

export async function ensureClientOnboarding() {
  const user = await requireAuth();

  const { data: existingProfile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, role, full_name, created_at")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) throw profileError;

  const inferredName = (user.user_metadata?.full_name as string | undefined) ?? null;

  let profile =
    (existingProfile as { id: string; role: Role; full_name: string | null; created_at: string } | null) ??
    null;

  if (!profile) {
    const { data: createdProfile, error: createProfileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: user.id,
        role: "client",
        full_name: inferredName
      })
      .select("id, role, full_name, created_at")
      .maybeSingle();
    if (createProfileError) throw createProfileError;
    if (!createdProfile) throw new Error("No se pudo crear perfil de onboarding");
    profile = createdProfile as { id: string; role: Role; full_name: string | null; created_at: string };
  }

  if (profile.role === "admin") return profile;

  const { data: membership, error: membershipError } = await supabaseAdmin
    .from("client_users")
    .select("client_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (membershipError) throw membershipError;

  if (!membership?.client_id) {
    const { data: createdClient, error: createClientError } = await supabaseAdmin
      .from("clients")
      .insert({
        owner_admin_id: user.id,
        display_name: getDisplayName(user.email, profile.full_name ?? inferredName),
        status: "onboarding"
      })
      .select("id")
      .single();
    if (createClientError || !createdClient) {
      throw createClientError ?? new Error("No se pudo crear cliente de onboarding");
    }

    const { error: linkError } = await supabaseAdmin.from("client_users").upsert(
      {
        client_id: createdClient.id,
        user_id: user.id
      },
      { onConflict: "client_id,user_id" }
    );
    if (linkError) throw linkError;
  }

  return profile;
}
