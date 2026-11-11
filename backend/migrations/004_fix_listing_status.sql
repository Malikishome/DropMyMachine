-- Run this manually in the Supabase SQL editor (Dashboard > SQL Editor), same
-- as 002 and 003. Listings created before POST /api/listings switched to
-- 'active' were stored as 'pending', which the listing card renders as Filled.
update public.listings
  set status = 'active'
  where status = 'pending';

alter table public.listings
  alter column status set default 'active';
