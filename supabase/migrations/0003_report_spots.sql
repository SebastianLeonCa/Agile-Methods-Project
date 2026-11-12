-- 0003: logged-in users report spots and confirm a spot is still dirty.
-- Run once in Supabase → SQL Editor.

-- Spots: logged-in users add spots as themselves; new spots always start "dirty".
create policy "Users can report spots"
  on spots for insert
  to authenticated
  with check (created_by = auth.uid() and status = 'dirty');

create policy "Reporters can update their spots"
  on spots for update
  to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy "Reporters can delete their spots"
  on spots for delete
  to authenticated
  using (created_by = auth.uid());

-- "Confirm spot is still dirty": one row per user per spot (the primary key enforces it).
create table spot_confirmations (
  spot_id    uuid references spots(id) on delete cascade,
  user_id    uuid references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (spot_id, user_id)
);

alter table spot_confirmations enable row level security;

create policy "Anyone can read confirmations"
  on spot_confirmations for select
  to anon, authenticated
  using (true);

create policy "Users can confirm as themselves"
  on spot_confirmations for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can remove their own confirmation"
  on spot_confirmations for delete
  to authenticated
  using (user_id = auth.uid());
