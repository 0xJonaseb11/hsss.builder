create table if not exists public.builders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_name text,
  abn text,
  contact_name text,
  contact_email text,
  contact_phone text,
  mobile text,
  service_type text not null default 'Supply & Install',
  region text,
  street_address text,
  suburb text,
  state text default 'QLD',
  postcode text,
  default_markup numeric not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists builders_user_id_key on public.builders(user_id);

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

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  builder_id uuid not null references public.builders(id) on delete cascade,
  reference text not null unique,
  label text,
  quote_kind text not null check (quote_kind in ('quick', 'order')),
  status text not null default 'saved' check (status in ('saved', 'converted')),
  total numeric not null default 0,
  payload jsonb not null default '{}',
  order_id uuid references public.orders(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists quotes_builder_id_idx on public.quotes(builder_id);
create index if not exists quotes_status_idx on public.quotes(status);
create index if not exists quotes_created_at_idx on public.quotes(created_at desc);

alter table public.quotes enable row level security;

drop policy if exists "quotes_select_own" on public.quotes;
create policy "quotes_select_own"
  on public.quotes for select
  using (
    builder_id in (
      select id from public.builders where user_id = auth.uid()
    )
  );

drop policy if exists "quotes_insert_own" on public.quotes;
create policy "quotes_insert_own"
  on public.quotes for insert
  with check (
    builder_id in (
      select id from public.builders where user_id = auth.uid()
    )
  );

drop policy if exists "quotes_update_own" on public.quotes;
create policy "quotes_update_own"
  on public.quotes for update
  using (
    builder_id in (
      select id from public.builders where user_id = auth.uid()
    )
  )
  with check (
    builder_id in (
      select id from public.builders where user_id = auth.uid()
    )
  );

drop policy if exists "quotes_delete_own" on public.quotes;
create policy "quotes_delete_own"
  on public.quotes for delete
  using (
    builder_id in (
      select id from public.builders where user_id = auth.uid()
    )
  );
