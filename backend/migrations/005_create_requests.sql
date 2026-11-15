-- Run this manually in the Supabase SQL editor (Dashboard > SQL Editor), same
-- as 002-004. Placement requests (build-plan item 13): an operator asks to
-- place a machine at a listing. RLS stays off for now (build-plan item 25).

-- public.requests already existed in this project with id, created_at,
-- listing_id, operator_id, status (nullable, no foreign keys, no check,
-- no message column) - found while running this migration, so the
-- create-if-not-exists form did nothing. The table was empty, so the
-- not-null and constraint changes below are safe.
create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid,
  operator_id uuid,
  status text default 'pending',
  created_at timestamptz not null default now()
);

alter table public.requests
  add column if not exists message text,
  alter column listing_id set not null,
  alter column operator_id set not null,
  alter column status set not null,
  add constraint requests_listing_id_fkey
    foreign key (listing_id) references public.listings(id) on delete cascade,
  add constraint requests_operator_id_fkey
    foreign key (operator_id) references public.profiles(id) on delete cascade,
  add constraint requests_status_check
    check (status in ('pending', 'accepted', 'declined')),
  add constraint requests_listing_id_operator_id_key
    unique (listing_id, operator_id);

-- The dashboard-created table had RLS enabled by default, which blocks the
-- anon-key inserts the API makes. Every other table runs with RLS off during
-- development; build-plan item 25 turns it on everywhere before launch.
alter table public.requests disable row level security;
