-- Run this manually in the Supabase SQL editor (Dashboard > SQL Editor).
-- This repo only holds SUPABASE_ANON_KEY (see backend/config/db.js), not a
-- service-role key, and there's no Supabase CLI set up, so the backend can't
-- run DDL itself - this script has to be pasted in and executed by hand.

-- Adds the columns item 4's TODO deferred, needed for build-plan item 11
-- (address blur / reveal-on-accept). All nullable: existing rows have none
-- of these values yet.
alter table public.listings
  add column if not exists location_type text,
  add column if not exists address text,
  add column if not exists foot_traffic text,
  add column if not exists revenue_split int;
