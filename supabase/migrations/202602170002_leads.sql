create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  company text,
  phone text,
  message text,
  status text not null default 'new' check (status in ('new', 'contacted', 'qualified', 'discarded')),
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

grant insert on table public.leads to anon;

drop policy if exists "leads_public_insert" on public.leads;
create policy "leads_public_insert"
on public.leads for insert
to anon
with check (true);
