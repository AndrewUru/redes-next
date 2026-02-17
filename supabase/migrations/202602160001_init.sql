create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'client')) default 'client',
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  owner_admin_id uuid not null references public.profiles(id) on delete cascade,
  display_name text not null,
  status text not null check (status in ('lead', 'onboarding', 'activo', 'pausado')) default 'lead',
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.client_users (
  client_id uuid not null references public.clients(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  primary key (client_id, user_id)
);

create table if not exists public.intake_responses (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  status text not null check (status in ('draft', 'submitted')) default 'draft',
  completion_pct int not null default 0 check (completion_pct >= 0 and completion_pct <= 100),
  data jsonb not null default '{}'::jsonb,
  schema_version int not null default 1,
  updated_at timestamptz not null default now(),
  unique (client_id)
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  type text not null,
  storage_path text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  schema_version int not null default 1,
  sections jsonb not null default '[]'::jsonb,
  is_active bool not null default false
);

create table if not exists public.brandbooks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  version int not null check (version > 0),
  template_id uuid references public.templates(id) on delete set null,
  pdf_path text not null,
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  unique (client_id, version)
);

create index if not exists idx_clients_owner on public.clients(owner_admin_id);
create index if not exists idx_client_users_user on public.client_users(user_id);
create index if not exists idx_assets_client on public.assets(client_id);
create index if not exists idx_brandbooks_client on public.brandbooks(client_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_intake_updated_at on public.intake_responses;
create trigger trg_intake_updated_at
before update on public.intake_responses
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name)
  values (new.id, 'client', coalesce(new.raw_user_meta_data->>'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists(
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.admin_owns_client(target_client_id uuid)
returns boolean
language sql
stable
as $$
  select exists(
    select 1 from public.clients c
    where c.id = target_client_id
      and c.owner_admin_id = auth.uid()
  );
$$;

create or replace function public.is_client_member(target_client_id uuid)
returns boolean
language sql
stable
as $$
  select exists(
    select 1 from public.client_users cu
    where cu.client_id = target_client_id
      and cu.user_id = auth.uid()
  );
$$;

create or replace function public.can_access_client(target_client_id uuid)
returns boolean
language sql
stable
as $$
  select public.admin_owns_client(target_client_id) or public.is_client_member(target_client_id);
$$;

create or replace function public.path_client_id(path text)
returns uuid
language plpgsql
immutable
as $$
declare
  first_part text;
begin
  first_part := split_part(path, '/', 1);
  return first_part::uuid;
exception when others then
  return null;
end;
$$;

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.client_users enable row level security;
alter table public.intake_responses enable row level security;
alter table public.assets enable row level security;
alter table public.templates enable row level security;
alter table public.brandbooks enable row level security;

drop policy if exists "profiles_select_self" on public.profiles;
create policy "profiles_select_self"
on public.profiles for select
to authenticated
using (id = auth.uid());

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "clients_admin_all" on public.clients;
create policy "clients_admin_all"
on public.clients for all
to authenticated
using (owner_admin_id = auth.uid())
with check (owner_admin_id = auth.uid());

drop policy if exists "clients_client_select_own" on public.clients;
create policy "clients_client_select_own"
on public.clients for select
to authenticated
using (public.is_client_member(id));

drop policy if exists "clients_client_update_own" on public.clients;
create policy "clients_client_update_own"
on public.clients for update
to authenticated
using (public.is_client_member(id))
with check (public.is_client_member(id));

drop policy if exists "client_users_admin_all" on public.client_users;
create policy "client_users_admin_all"
on public.client_users for all
to authenticated
using (public.admin_owns_client(client_id))
with check (public.admin_owns_client(client_id));

drop policy if exists "client_users_user_select_self" on public.client_users;
create policy "client_users_user_select_self"
on public.client_users for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "intake_admin_all" on public.intake_responses;
create policy "intake_admin_all"
on public.intake_responses for all
to authenticated
using (public.admin_owns_client(client_id))
with check (public.admin_owns_client(client_id));

drop policy if exists "intake_client_select_update_own" on public.intake_responses;
create policy "intake_client_select_update_own"
on public.intake_responses for select
to authenticated
using (public.is_client_member(client_id));

drop policy if exists "intake_client_insert_own" on public.intake_responses;
create policy "intake_client_insert_own"
on public.intake_responses for insert
to authenticated
with check (public.is_client_member(client_id));

drop policy if exists "intake_client_update_own" on public.intake_responses;
create policy "intake_client_update_own"
on public.intake_responses for update
to authenticated
using (public.is_client_member(client_id))
with check (public.is_client_member(client_id));

drop policy if exists "assets_admin_all" on public.assets;
create policy "assets_admin_all"
on public.assets for all
to authenticated
using (public.admin_owns_client(client_id))
with check (public.admin_owns_client(client_id));

drop policy if exists "assets_client_all_own" on public.assets;
create policy "assets_client_all_own"
on public.assets for all
to authenticated
using (public.is_client_member(client_id))
with check (public.is_client_member(client_id));

drop policy if exists "templates_authenticated_select" on public.templates;
create policy "templates_authenticated_select"
on public.templates for select
to authenticated
using (true);

drop policy if exists "templates_admin_all" on public.templates;
create policy "templates_admin_all"
on public.templates for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "brandbooks_admin_all" on public.brandbooks;
create policy "brandbooks_admin_all"
on public.brandbooks for all
to authenticated
using (public.admin_owns_client(client_id))
with check (public.admin_owns_client(client_id));

drop policy if exists "brandbooks_client_select_own" on public.brandbooks;
create policy "brandbooks_client_select_own"
on public.brandbooks for select
to authenticated
using (public.is_client_member(client_id));

insert into storage.buckets (id, name, public)
values ('brand-assets', 'brand-assets', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('brandbooks', 'brandbooks', false)
on conflict (id) do nothing;

drop policy if exists "brand_assets_select" on storage.objects;
create policy "brand_assets_select"
on storage.objects for select
to authenticated
using (
  bucket_id = 'brand-assets'
  and public.can_access_client(public.path_client_id(name))
);

drop policy if exists "brand_assets_insert" on storage.objects;
create policy "brand_assets_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'brand-assets'
  and public.can_access_client(public.path_client_id(name))
);

drop policy if exists "brand_assets_update" on storage.objects;
create policy "brand_assets_update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'brand-assets'
  and public.can_access_client(public.path_client_id(name))
)
with check (
  bucket_id = 'brand-assets'
  and public.can_access_client(public.path_client_id(name))
);

drop policy if exists "brand_assets_delete" on storage.objects;
create policy "brand_assets_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'brand-assets'
  and public.can_access_client(public.path_client_id(name))
);

drop policy if exists "brandbooks_select" on storage.objects;
create policy "brandbooks_select"
on storage.objects for select
to authenticated
using (
  bucket_id = 'brandbooks'
  and public.can_access_client(public.path_client_id(name))
);

drop policy if exists "brandbooks_insert" on storage.objects;
create policy "brandbooks_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'brandbooks'
  and public.can_access_client(public.path_client_id(name))
);

drop policy if exists "brandbooks_update" on storage.objects;
create policy "brandbooks_update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'brandbooks'
  and public.admin_owns_client(public.path_client_id(name))
)
with check (
  bucket_id = 'brandbooks'
  and public.admin_owns_client(public.path_client_id(name))
);

drop policy if exists "brandbooks_delete" on storage.objects;
create policy "brandbooks_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'brandbooks'
  and public.admin_owns_client(public.path_client_id(name))
);

insert into public.templates (name, schema_version, sections, is_active)
values (
  'Default Brandbook Template',
  1,
  '["identidad","tono","publico","pilares","mensajes","ctas","visual","referencias"]'::jsonb,
  true
)
on conflict (name) do nothing;
