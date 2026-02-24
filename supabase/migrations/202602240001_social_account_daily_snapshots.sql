create table if not exists public.social_account_daily_snapshots (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  social_account_id uuid not null references public.social_accounts(id) on delete cascade,
  snapshot_date date not null,
  followers int,
  reach_7d int,
  impressions_7d int,
  profile_views_7d int,
  interactions_recent_posts int not null default 0,
  engagement_rate numeric(7,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (social_account_id, snapshot_date)
);

create index if not exists idx_social_snapshots_client_date
on public.social_account_daily_snapshots(client_id, snapshot_date desc);

create index if not exists idx_social_snapshots_account_date
on public.social_account_daily_snapshots(social_account_id, snapshot_date desc);

alter table public.social_account_daily_snapshots enable row level security;

drop trigger if exists trg_social_account_daily_snapshots_updated_at on public.social_account_daily_snapshots;
create trigger trg_social_account_daily_snapshots_updated_at
before update on public.social_account_daily_snapshots
for each row
execute function public.set_updated_at();

drop policy if exists "social_snapshots_admin_all" on public.social_account_daily_snapshots;
create policy "social_snapshots_admin_all"
on public.social_account_daily_snapshots for all
to authenticated
using (public.admin_owns_client(client_id))
with check (public.admin_owns_client(client_id));

drop policy if exists "social_snapshots_client_all_own" on public.social_account_daily_snapshots;
create policy "social_snapshots_client_all_own"
on public.social_account_daily_snapshots for all
to authenticated
using (public.is_client_member(client_id))
with check (public.is_client_member(client_id));
