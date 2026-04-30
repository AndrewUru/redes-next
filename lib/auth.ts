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

async function getDefaultDeveloperAdminId() {
  const configuredAdminId = process.env.DEFAULT_ADMIN_ID?.trim();
  if (configuredAdminId) return configuredAdminId;

  const configuredAdminEmail = (
    process.env.DEFAULT_ADMIN_EMAIL ?? process.env.SEED_ADMIN_EMAIL
  )
    ?.trim()
    .toLowerCase();

  if (configuredAdminEmail) {
    const { data: listUsers, error: listUsersError } =
      await supabaseAdmin.auth.admin.listUsers();
    if (listUsersError) throw listUsersError;

    const adminUserId = listUsers.users.find(
      (candidate) => candidate.email?.toLowerCase() === configuredAdminEmail
    )?.id;

    if (adminUserId) {
      const { data: adminProfile, error: adminProfileError } =
        await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("id", adminUserId)
          .eq("role", "admin")
          .maybeSingle();
      if (adminProfileError) throw adminProfileError;
      if (adminProfile?.id) return String(adminProfile.id);
    }
  }

  const { data: firstAdmin, error: firstAdminError } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("role", "admin")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (firstAdminError) throw firstAdminError;

  return firstAdmin?.id ? String(firstAdmin.id) : null;
}

async function ensureClientOwnedByDeveloper(clientId: string, adminId: string) {
  const { data: client, error: clientError } = await supabaseAdmin
    .from("clients")
    .select("id,owner_admin_id,profiles:owner_admin_id(role)")
    .eq("id", clientId)
    .maybeSingle();
  if (clientError) throw clientError;
  if (!client) return;

  const ownerProfile = Array.isArray(client.profiles)
    ? client.profiles[0]
    : client.profiles;
  const ownerRole =
    ownerProfile &&
    typeof ownerProfile === "object" &&
    "role" in ownerProfile
      ? String(ownerProfile.role)
      : null;

  if (client.owner_admin_id === adminId || ownerRole === "admin") return;

  const { error: updateError } = await supabaseAdmin
    .from("clients")
    .update({ owner_admin_id: adminId })
    .eq("id", clientId);
  if (updateError) throw updateError;
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

  const developerAdminId = await getDefaultDeveloperAdminId();
  if (!developerAdminId) {
    throw new Error(
      "No hay un administrador configurado para asignar nuevos espacios de cliente."
    );
  }

  const { data: membership, error: membershipError } = await supabaseAdmin
    .from("client_users")
    .select("client_id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (membershipError) throw membershipError;

  if (membership?.client_id) {
    await ensureClientOwnedByDeveloper(membership.client_id, developerAdminId);
  } else {
    const { data: createdClient, error: createClientError } = await supabaseAdmin
      .from("clients")
      .insert({
        owner_admin_id: developerAdminId,
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
