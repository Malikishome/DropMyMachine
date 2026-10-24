# Feature: Create the `profiles` table

**From build-plan:** feature 8
**Status:** complete

## Goal

Create the `profiles` table in the connected Supabase project so that
`supabase.auth.signUp` in [authRoutes.js](backend/routes/authRoutes.js) no
longer fails on the follow-up insert with `Could not find the table
'public.profiles' in the schema cache`. This unblocks every other MVP item
(role-based routing, dashboards, listings ownership) that depends on a
profile row existing per user.

## In scope

- A SQL migration script (run by hand in the Supabase SQL editor, since this
  backend only holds the anon key, not a service-role key, and no Supabase
  CLI/migrations setup exists in this repo) that creates `public.profiles`
  with the exact columns from `project-overview.md`'s Data model: `id` (uuid,
  PK, references `auth.users`), `full_name` (text), `role` (text),
  `plan` (text, default `'free'`), `trust_level` (int, default `1`),
  `city` (text), `phone` (text), `verified_phone` (boolean, default
  `false`), `created_at` (timestamptz, default `now()`).
- Saving that script in the repo so it's reproducible, since there's no
  migrations folder yet.
- Whitelisting `role` in `POST /api/auth/signup` against
  `['operator', 'location_owner']` before the insert (closes findings
  ledger `F-02`). This insert currently fails upstream because the table
  doesn't exist - the moment this feature creates the table, the insert
  starts succeeding with whatever `role` string a client sends, unvalidated.
  Shipping the table without this guard ships that hole live.
- Confirming the real signup flow (`POST /api/auth/signup`) now succeeds
  end-to-end and actually inserts a profile row.

## Out of scope

- Row Level Security (explicitly deferred to build-plan item 25 - RLS stays
  off for dev per the design doc).
- Wiring frontend auth state, `AuthContext`, or `ProtectedRoute` (build-plan
  item 9).
- Any change to `roleMiddleware.js`'s missing `module.exports` (a separate
  confirmed TODO under item 3, not touched by this feature).
- Adding a Supabase CLI / formal migrations workflow - out of scope unless
  the user asks; this feature only needs the one table to exist.

## Build loop

Build one step at a time, never the whole feature at once.

1. Plan mode lays out the step before any code.
2. The AI implements just that step.
3. It shows the diff (not full files); you read it and understand it.
4. You approve, then choose whether to commit a checkpoint or roll straight on.
   Checkpoints are optional; `/complete` makes the real feature-level commit at the end.

Never accept a step you haven't read. If a diff is too big to review, the step was too big, so split it.

## Build steps

- [x] **Step 1 - Write the migration SQL** - add
      `backend/migrations/001_create_profiles.sql` with `create table
      public.profiles (...)` matching the Data model columns above, plus a
      comment noting it must be run manually in the Supabase SQL editor
      (dashboard) since this repo has no service-role key or Supabase CLI
      wired up. *Done when:* the file exists with all 8 columns, correct
      types/defaults, and `id` declared as both primary key and a foreign key
      to `auth.users(id)`.
- [x] **Step 2 - Run it against the real Supabase project** - paste the
      script into the connected project's SQL editor and execute it (you'll
      do this part directly in Supabase; I'll give you the exact script and
      wait for confirmation it ran). *Done when:* the Supabase dashboard's
      Table Editor shows `public.profiles` with the 8 columns.
- [x] **Step 3 - Whitelist `role` before the insert** - in
      [authRoutes.js](backend/routes/authRoutes.js)'s `/signup` handler,
      reject the request with `400` if `role` isn't exactly `'operator'` or
      `'location_owner'`, checked before the `profiles` insert call.
      *Done when:* `POST /api/auth/signup` with `role: 'admin'` (or any
      other value) returns `400` and never reaches the insert; `role:
      'operator'` or `'location_owner'` still proceeds normally.
- [x] **Step 4 - Verify signup end-to-end** - with the backend dev server
      running, `POST /api/auth/signup` with a throwaway test email/password/
      role/full_name. *Done when:* the response is `200` with a `user` and
      `session`, Supabase Auth shows the new user, and `public.profiles` has
      a matching row with the right `id`, `role`, and `full_name`.
- [x] **Step 5 - Repair F-01: add auth + ownership to listingRoutes.js** -
      unrelated to the profiles table itself, but added here because
      `/complete` refuses to merge while any P0/P1 finding is open, and
      F-01 is the only other one in the ledger. Add `authMiddleware` to
      `POST /`, `PUT /:id`, and `DELETE /:id`; derive `user_id` from
      `req.user.id` instead of `req.body.user_id` on create; add an
      ownership check (`.eq('user_id', req.user.id)`) on update and delete
      so one user can't modify another's listing. *Done when:* an
      unauthenticated request to any of the three routes gets `401`; an
      authenticated request to update/delete a listing owned by a
      different user gets `403`/`404`; creating a listing ignores any
      client-supplied `user_id` and uses the authenticated user's id
      instead.

## Files / areas

- `backend/migrations/001_create_profiles.sql` (new)
- `backend/routes/authRoutes.js` - add the `role` whitelist check in
  `/signup` (Step 3); the insert itself already has the right shape (`id`,
  `role`, `full_name`).

## Data / contracts

`public.profiles`:

| column | type | constraint |
|---|---|---|
| `id` | uuid | primary key, references `auth.users(id)` |
| `full_name` | text | |
| `role` | text | |
| `plan` | text | default `'free'` |
| `trust_level` | int | default `1` |
| `city` | text | |
| `phone` | text | |
| `verified_phone` | boolean | default `false` |
| `created_at` | timestamptz | default `now()` |

This is the load-bearing shape for every later MVP item (9, 12, 13) that
reads or writes a profile - matches `project-overview.md`'s Data model
exactly, no deviation.

## Testing

No test runner is configured in `backend/` (per `coding-standards.md`, testing
is opt-in via `/tests`). Most of this feature is schema + a one-time manual
SQL run, verified via the Step 4 `curl`/Thunder Client check and visually
confirming the table shape in the Supabase dashboard. Step 3's role
whitelist is pure validation logic that would normally get a unit test if a
runner were configured - since none is, verify it with the two `curl` calls
described in Step 3's done-when (rejected invalid role, accepted valid
role) instead.

## Notes for the AI

- The backend only has `SUPABASE_ANON_KEY` in `.env` (see `db.js`), not a
  service-role key, so this feature's AI side cannot execute DDL against
  Supabase directly - the SQL has to be handed to the user to run in the
  dashboard. Say this plainly when Step 2 comes up; don't attempt a
  workaround.
- Match the exact column set in `project-overview.md`'s Data model - don't
  add convenience columns (e.g. `email`, `updated_at`) that aren't specified
  there, since later features lock onto this exact shape.
- `role` and `plan` are left as plain `text`, not a Postgres enum, matching
  how `project-overview.md` specifies them - don't upgrade to an enum type
  without that being a separate, explicit decision.
- Step 3 closes findings ledger entry `F-02` (unvalidated client role on
  signup). Mark it `fixed` in `blueprint/context/findings.md` once the step
  lands; a later `/audit` pass moves it to `closed` after re-review. Don't
  touch `F-01` (listingRoutes.js has no auth at all) - that's unrelated to
  this feature's files, left for its own fix.

## Findings

### 08/F-01 [P0] closed - No auth or authorization on listing mutation routes

**File:** backend/routes/listingRoutes.js:22-70
**Found:** 2026-10-18 by /audit (scope: current; lens: all - out-of-scope critical risk)
**Why it matters:** `POST /`, `PUT /:id`, and `DELETE /:id` in `listingRoutes.js`
run with no `authMiddleware` at all - any unauthenticated caller can create,
edit, or delete any listing. `POST /` additionally trusts a client-supplied
`user_id` instead of deriving it from a verified session (already flagged as
a known gap in `coding-standards.md`, but that note doesn't cover the missing
auth on `PUT`/`DELETE`, which is a strictly larger hole). This was encountered
incidentally while checking where `roleMiddleware`/`authMiddleware` are used
(answer: nowhere) and is outside feature 8's scope (the `profiles` table), but
is too severe to leave unrecorded.
**Suggested fix:** Add `authMiddleware` to all three mutating routes, and
derive `user_id` from `req.user.id` instead of `req.body.user_id`; add an
ownership check on `PUT`/`DELETE` (`.eq('user_id', req.user.id)`) so one user
can't modify another's listing.
**Resolution:** fixed 2026-10-24 in `backend/routes/listingRoutes.js` -
added `authMiddleware` to `POST`/`PUT`/`DELETE`, `POST` now derives
`user_id` from `req.user.id`, `PUT`/`DELETE` add `.eq('user_id',
req.user.id)` + `.select()` and return `404` when no row matches. Verified
live: all three routes return `401` with no auth header, `GET /` still
works unauthenticated (no regression). The ownership-mismatch (403/404)
and user_id-spoofing paths are verified by code review only, not live -
this session couldn't obtain a second authenticated session (Supabase
project requires email confirmation; no service-role key to mint one, and
the test mailbox received nothing). Re-reviewed 2026-10-24 by /audit
(scope: current) - `listingRoutes.js` re-read fresh: `authMiddleware` is on
all three mutating routes, `POST` derives `user_id` from `req.user.id`,
`PUT`/`DELETE` scope by `.eq('user_id', req.user.id)` and 404 on no match.
Original defect confirmed gone, no new defect introduced. Closed on
code-review evidence; the 403/404 ownership path itself is still not
live-proven (see above) - note this if a later pass has a way to get a
second confirmed session.

### 08/F-02 [P1] closed - Signup writes an unvalidated client-supplied role into profiles

**File:** backend/routes/authRoutes.js:27,42
**Found:** 2026-10-18 by /audit (scope: current; lens: security)
**Why it matters:** `router.post('/signup', ...)` takes `role` straight from
`req.body` and inserts it into `profiles.role` with no whitelist against the
two valid values (`'operator'` | `'location_owner'` per
`project-overview.md`'s Data model). This insert currently fails upstream
(the table doesn't exist yet - build-plan item 8/feature 8, in progress), so
the path is dead today, but feature 8 is specifically about to make this
insert succeed. Once it does, any signup payload can set an arbitrary role
string, and every later role-gated feature (items 3, 9, 12, 13) trusts
`profiles.role` as the source of truth - an unvalidated value here undermines
all of them from day one.
**Suggested fix:** Whitelist `role` against `['operator', 'location_owner']`
in the signup handler before the insert, returning a `400` on anything else.
**Resolution:** fixed 2026-10-24 in `backend/routes/authRoutes.js` - added a
`VALID_ROLES` check that returns `400` before Supabase is called at all.
Verified via curl: `role: 'admin'` and a missing `role` both now `400`.
Re-reviewed 2026-10-24 by /audit (scope: current) - `authRoutes.js`
re-read fresh: the `VALID_ROLES` check runs before `supabase.auth.signUp`
is ever called, so no orphaned auth user gets created on a bad role
either. Original defect confirmed gone, no new defect introduced. Closed.
