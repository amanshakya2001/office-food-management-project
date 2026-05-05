-- Run this entire file in your Supabase SQL Editor

create table if not exists persons (
  id bigint generated always as identity primary key,
  name text not null,
  phone_number text not null default '',
  splitwise_user_id text,
  splitwise_user_name text,
  created_at timestamptz not null default now()
);

create table if not exists day_entries (
  id bigint generated always as identity primary key,
  date text not null unique,
  total_cost numeric,
  paid_by_person_id bigint references persons(id),
  splitwise_expense_id text,
  splitwise_synced boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists meal_entries (
  id bigint generated always as identity primary key,
  day_entry_id bigint not null references day_entries(id) on delete cascade,
  person_id bigint not null references persons(id) on delete cascade,
  meal_description text not null
);

-- Allow anyone with the anon key to read and write all tables
-- (ownership/write gating is handled in the app, not the DB)
alter table persons enable row level security;
alter table day_entries enable row level security;
alter table meal_entries enable row level security;

create policy "public read persons" on persons for select using (true);
create policy "public write persons" on persons for insert with check (true);
create policy "public update persons" on persons for update using (true);
create policy "public delete persons" on persons for delete using (true);

create policy "public read day_entries" on day_entries for select using (true);
create policy "public write day_entries" on day_entries for insert with check (true);
create policy "public update day_entries" on day_entries for update using (true);
create policy "public delete day_entries" on day_entries for delete using (true);

create policy "public read meal_entries" on meal_entries for select using (true);
create policy "public write meal_entries" on meal_entries for insert with check (true);
create policy "public update meal_entries" on meal_entries for update using (true);
create policy "public delete meal_entries" on meal_entries for delete using (true);
