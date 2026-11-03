-- Run this manually in the Supabase SQL editor (Dashboard > SQL Editor), same
-- as 002. The revenue split is negotiated directly between operator and
-- location owner, so the app no longer stores it.
alter table public.listings
  drop column if exists revenue_split;
