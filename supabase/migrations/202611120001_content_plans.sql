-- Editorial approval only: this table never triggers Instagram publication.
create table public.content_plans (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  week_start date not null check (extract(isodow from week_start) = 1),
  status text not null default 'draft' check (status in ('draft', 'approved')),
  content jsonb not null check (jsonb_typeof(content) = 'object'),
  revision integer not null default 1 check (revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (client_id, week_start)
);
alter table public.content_plans enable row level security;
create policy "content_plans_access" on public.content_plans for all to authenticated
using (public.admin_owns_client(client_id) or public.is_client_member(client_id))
with check (public.admin_owns_client(client_id) or public.is_client_member(client_id));
create trigger trg_content_plans_updated_at before update on public.content_plans
for each row execute function public.set_updated_at();
