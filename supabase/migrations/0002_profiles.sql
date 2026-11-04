-- 0002: user profiles + photo storage.
-- Run once in Supabase → SQL Editor.

create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique not null check (username ~ '^[a-z0-9_]{3,30}$'),
  avatar_url  text,
  home_area   text check (char_length(home_area) <= 100),
  home_lat    double precision check (home_lat between -90 and 90),
  home_lng    double precision check (home_lng between -180 and 180),
  created_at  timestamptz not null default now()
);

-- Now that profiles exist, link spots to their reporter.
alter table spots
  add constraint spots_created_by_fkey foreign key (created_by) references profiles(id) on delete set null;

-- Create a profile for every new auth user.
-- Username comes from the sign-up form (metadata) or the email; a number is added if it is taken.
create function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  base      text;
  candidate text;
begin
  base := lower(coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)));
  base := left(regexp_replace(base, '[^a-z0-9_]', '', 'g'), 24);
  if char_length(base) < 3 then
    base := 'user' || base;
  end if;

  candidate := base;
  while exists (select 1 from profiles where username = candidate) loop
    candidate := base || floor(random() * 10000)::int;
  end loop;

  insert into profiles (id, username) values (new.id, candidate);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Profiles for users created before this migration (e.g. test users).
insert into profiles (id, username)
select u.id, 'user' || left(replace(u.id::text, '-', ''), 8)
from auth.users u
where not exists (select 1 from profiles p where p.id = u.id);

-- RLS: anyone can see profiles (usernames show on spots and events); users edit only their own.
-- No insert policy: rows are created by the trigger above.
alter table profiles enable row level security;

create policy "Anyone can read profiles"
  on profiles for select
  to anon, authenticated
  using (true);

create policy "Users can update their own profile"
  on profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Storage: public bucket for spot photos and avatars. Path: <user_id>/<uuid>.jpg
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('spot-photos', 'spot-photos', true, 5242880, array['image/jpeg', 'image/webp', 'image/png'])
on conflict (id) do nothing;

create policy "Users upload photos to their own folder"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'spot-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users update photos in their own folder"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'spot-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users delete photos in their own folder"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'spot-photos' and (storage.foldername(name))[1] = auth.uid()::text);
