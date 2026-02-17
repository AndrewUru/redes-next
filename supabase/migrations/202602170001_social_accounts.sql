create table if not exists public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  platform text not null check (platform in ('instagram', 'facebook')),
  account_name text not null,
  account_handle text,
  external_account_id text,
  status text not null check (status in ('connected', 'error', 'disconnected')) default 'connected',
  metadata jsonb not null default '{}'::jsonb,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_social_accounts_unique
on public.social_accounts(client_id, platform, account_name);

create index if not exists idx_social_accounts_client
on public.social_accounts(client_id);

alter table public.social_accounts enable row level security;

drop trigger if exists trg_social_accounts_updated_at on public.social_accounts;
create trigger trg_social_accounts_updated_at
before update on public.social_accounts
for each row
execute function public.set_updated_at();

drop policy if exists "social_accounts_admin_all" on public.social_accounts;
create policy "social_accounts_admin_all"
on public.social_accounts for all
to authenticated
using (public.admin_owns_client(client_id))
with check (public.admin_owns_client(client_id));

drop policy if exists "social_accounts_client_all_own" on public.social_accounts;
create policy "social_accounts_client_all_own"
on public.social_accounts for all
to authenticated
using (public.is_client_member(client_id))
with check (public.is_client_member(client_id));
