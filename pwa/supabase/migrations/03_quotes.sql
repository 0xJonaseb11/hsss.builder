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
