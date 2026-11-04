-- 0001: litter spots (read-only for now).
-- Run once in Supabase → SQL Editor.

create type spot_type   as enum ('park', 'beach', 'street', 'river', 'other');
create type urgency     as enum ('low', 'medium', 'high');
create type spot_status as enum ('dirty', 'planned', 'clean');

create table spots (
  id               uuid primary key default gen_random_uuid(),
  created_by       uuid,                         -- FK to profiles(id) added in 0002 when profiles exists
  title            text not null,
  description      text,
  type             spot_type not null default 'other',
  urgency          urgency not null default 'medium',
  status           spot_status not null default 'dirty',
  lat              double precision not null check (lat between -90 and 90),
  lng              double precision not null check (lng between -180 and 180),
  address          text,
  before_photo_url text,
  after_photo_url  text,
  dangerous_waste  boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Keep updated_at current on every update.
create function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger spots_set_updated_at
  before update on spots
  for each row execute function set_updated_at();

-- RLS: anyone (logged in or not) can read spots. Insert/update policies come in Sprint 3.
alter table spots enable row level security;

create policy "Anyone can read spots"
  on spots for select
  to anon, authenticated
  using (true);
