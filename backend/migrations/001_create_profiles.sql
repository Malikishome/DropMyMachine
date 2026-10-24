-- Run this manually in the Supabase SQL editor (Dashboard > SQL Editor).
-- This repo only holds SUPABASE_ANON_KEY (see backend/config/db.js), not a
-- service-role key, and there's no Supabase CLI set up, so the backend can't
-- run DDL itself - this script has to be pasted in and executed by hand.

-- public.profiles already exists in this project with id, full_name, role,
-- created_at (found while running this migration - not a fresh table, as
-- build-plan item 8 originally assumed). This adds only the missing columns
-- from project-overview.md's Data model.

alter table public.profiles
  add column if not exists plan text default 'free',
  add column if not exists trust_level int default 1,
  add column if not exists city text,
  add column if not exists phone text,
  add column if not exists verified_phone boolean default false;

-- id is already the primary key but isn't linked to auth.users yet (found
-- while running this migration). The table is empty right now, so this is
-- safe to add with no existing rows to violate it.
alter table public.profiles
  add constraint profiles_id_fkey foreign key (id) references auth.users(id);
