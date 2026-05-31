export type Role = "admin" | "client";
export type ClientStatus = "lead" | "onboarding" | "activo" | "pausado";
export type IntakeStatus = "draft" | "submitted";
export type SocialPlatform = "instagram" | "facebook";
export type SocialAccountStatus = "connected" | "error" | "disconnected";

export interface ProfileRow {
  id: string;
  role: Role;
  full_name: string | null;
  created_at: string;
}

export interface ClientRow {
  id: string;
  owner_admin_id: string;
  display_name: string;
  status: ClientStatus;
  notes: string | null;
  created_at: string;
}

export interface SocialAccountRow {
  id: string;
  client_id: string;
  platform: SocialPlatform;
  account_name: string;
  account_handle: string | null;
  external_account_id: string | null;
  status: SocialAccountStatus;
  metadata: Record<string, unknown>;
  connected_at: string;
  updated_at: string;
}

export interface BrandbookRow {
  id: string;
  client_id: string;
  version: number;
  template_id: string | null;
  pdf_path: string;
  created_at: string;
  approved_at: string | null;
}

export interface AssetRow {
  id: string;
  client_id: string;
  type: string;
  storage_path: string;
  metadata: Record<string, unknown>;
  created_at: string;
}
