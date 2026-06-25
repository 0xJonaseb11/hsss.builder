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
