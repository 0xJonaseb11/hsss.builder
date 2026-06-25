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
