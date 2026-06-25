
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  builder_id uuid not null references public.builders(id) on delete cascade,
  reference text not null unique,
  job_ref text,
  status text not null default 'submitted' check (status in ('draft', 'submitted', 'confirmed')),
  total numeric not null default 0,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now(),
  email_sent_at timestamptz
);

create index if not exists orders_builder_id_idx on public.orders(builder_id);
create index if not exists orders_created_at_idx on public.orders(created_at desc);

alter table public.orders enable row level security;

drop policy if exists "orders_select_own" on public.orders;
create policy "orders_select_own"
  on public.orders for select
  using (
    builder_id in (
      select id from public.builders where user_id = auth.uid()
    )
  );

drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own"
  on public.orders for insert
  with check (
    builder_id in (
      select id from public.builders where user_id = auth.uid()
    )
  );

alter table public.builders enable row level security;

drop policy if exists "builders_select_own" on public.builders;
create policy "builders_select_own"
  on public.builders for select
  using (user_id = auth.uid());

drop policy if exists "builders_insert_own" on public.builders;
create policy "builders_insert_own"
  on public.builders for insert
  with check (user_id = auth.uid());

drop policy if exists "builders_update_own" on public.builders;
create policy "builders_update_own"
  on public.builders for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create unique index if not exists builders_user_id_key on public.builders(user_id);
