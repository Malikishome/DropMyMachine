# Current Feature

## Title: Fix fake login success and Register's dead-end error screen

**Type:** Fix

**Branch:** `fix/login-register-error-handling`

## The problem

Found via `/debug`, confirmed by tracing the exact handler logic in both files:

1. **Login accepts any credentials.** [Login.jsx](client/src/pages/Login.jsx)
   `handleSubmit` never called the backend. After a hardcoded 1s
   `setTimeout`, it unconditionally did `setSuccess(true)` and
   `navigate('/dashboard')` regardless of what was typed, or if fields were
   left empty.
2. **Register's mismatch error was a dead end.** [Register.jsx](client/src/pages/Register.jsx)
   `handleSubmit` returned early on password mismatch with
   `setError('Passwords do not match')`, and the render logic swapped to a
   full-screen error with no way back to the form short of a page reload.

## What was actually built

The fix grew beyond the original two-bug scope during implementation -
logged here rather than in the original plan, since the plan undersold what
shipped.

**Login.jsx**
- Real `POST {VITE_API_URL}/api/auth/login` call, replacing the fake
  `setTimeout` success.
- Added `client/.env` (gitignored, `.env`/`.env.local` added to
  `client/.gitignore` since neither was ignored before) with
  `VITE_API_URL=http://localhost:3000`.
- Required-field checks now `return` instead of falling through.
- On success: session stored in `localStorage`, navigates to `/dashboard`.
- On failure: error shown, no navigation.
- **Design change from the original plan:** rather than a "Try again" button
  on a full-screen error swap, the error now renders inline above the form -
  the page never leaves `/login`. Submit button shows "Logging in..." and
  disables while loading, replacing the old full-screen loading swap.
- Fixed the three `useNavigate = '...'` assignments
  (`handleRegisterRedirect`, `handleForgotPasswordRedirect`,
  `handleGoogleLogin`) to call `navigate(...)` instead. Originally scoped
  out as "unused, doesn't affect this fix," but it turned out to be a hard
  `npm run build` failure (`ASSIGN_TO_IMPORT`) regardless of whether the
  handlers are called - had to fix it to get a passing build.
- Removed the broken `{Dashboard()}` call in the old success branch (called
  a component as a plain function, and `Dashboard` wasn't even imported)
  along with the rest of the old success-screen logic.

**Register.jsx**
- Same inline-error pattern as Login instead of a "Try again" button: error
  renders above the form, form stays visible and populated so the user can
  just fix the confirm-password field and resubmit.

**FloatingInput.jsx**
- Added a `dark` prop (default `false`) so inputs can render with dark
  styling without affecting any caller that doesn't pass it.

**Dark mode made consistent app-wide** (user request, beyond the original
bug fix): `Login.jsx`, `Register.jsx`, `Dashboard.jsx`, and
`ForgotPassword.jsx` now all share the same palette already used by
`Home.jsx` - `bg-gray-900` page, `bg-gray-800` cards, white primary text,
gray-400 secondary text, blue-500 accent.

**ForgotPassword.jsx** (user request, beyond the original bug fix)
- Restyled to the shared dark palette (was light/`bg-gray-100`).
- After "Reset link sent!", shows a live countdown ("Redirecting to login in
  3s... 2s... 1s...") and auto-redirects to `/login` via `useEffect` +
  `useNavigate`.
- Still fully client-side simulated - no backend route exists for this yet.
  Logged as build-plan item 16.

**Explicitly tried and reverted:** a red-border + shake animation on
invalid fields, per user request, then undone per a follow-up "nevermind" -
`index.css`, `FloatingInput.jsx` (the `error` prop variant), `Login.jsx`,
and `Register.jsx` are all back to their pre-shake state.

**blueprint/build-plan.md** - added item 16 ("Forgot Password backend
route") since `ForgotPassword.jsx`'s simulated flow surfaced a real gap;
added item 17 ("Create the missing `profiles` table") found while
`/check`-testing a real signup; added a status note to item 8 clarifying
Login is wired to real auth but Register still isn't.

## Must not break

The existing Supabase signup flow ([authRoutes.js](backend/routes/authRoutes.js)),
the `/register` -> `/login` redirect on successful registration, or the
`FloatingInput` component's props contract for existing callers that don't
pass `dark`.

## Out of scope

- Real Google OAuth for `handleGoogleLogin` (still navigates straight to
  `/dashboard`, just no longer via the import-assignment bug).
- A real backend route for Forgot Password (logged as build-plan item 16).
- Per-field validation state (Login/Register still use a single shared
  `error` string, not per-field errors).
- Wiring Register.jsx to the real `/api/auth/signup` call (still the
  simulated `setTimeout`; tracked in build-plan item 8's status note).
- Creating the missing `profiles` table in Supabase (tracked as build-plan
  item 17).

## Build steps

- [x] 1. Wire `Login.jsx` to the real `/api/auth/login` endpoint; add the
      client `VITE_API_URL` env var; show login errors inline on the form
      instead of a full-screen swap; fix the build-breaking `useNavigate`
      assignment bug in the three redirect handlers.
      **Done when:** submitting valid Supabase credentials navigates to
      `/dashboard`; submitting wrong or empty credentials shows an inline
      error and stays on `/login`; `npm run build` passes.
- [x] 2. Show Register's password-mismatch error inline on the form instead
      of a full-screen dead end.
      **Done when:** submitting mismatched passwords shows the error inline,
      form stays visible and populated for immediate correction.
- [x] 3. Make dark mode consistent across Login, Register, Dashboard, and
      ForgotPassword (matching Home.jsx's existing palette).
      **Done when:** all five routes render the same dark palette.
- [x] 4. Add a live countdown and auto-redirect to `/login` on
      ForgotPassword's success screen; log the missing backend route as
      build-plan item 16.
      **Done when:** the success screen counts down and redirects; item 16
      exists in `build-plan.md`.

## Verify

- `npm run build` (client) - passes clean after every step, including the
  final state.
- `npm run lint` (client) - same pre-existing errors throughout (unused
  `React` imports app-wide, two still-unwired Login redirect handlers, one
  unused `setError` in ForgotPassword); nothing new introduced by this fix.
- `/check` run against the real app with Playwright, Supabase reachable:
  - Login wrong credentials: screenshot confirmed inline "Invalid
    credentials", page stayed on `/login`, no navigation - reproduced both
    with a fake address and with a real (unconfirmed) Supabase account.
  - Register password mismatch: screenshot confirmed inline "Passwords do
    not match", form stayed visible and populated.
  - ForgotPassword: screenshot confirmed the live countdown
    ("Redirecting to login in 2s..."), then confirmed landing on `/login`
    after it elapsed.
  - Dark palette: screenshot-confirmed on Login, Register, Dashboard, and
    ForgotPassword, matching Home.
  - Login with valid credentials -> `/dashboard` could not be fully proven
    end-to-end: blocked by two pre-existing, unrelated issues surfaced
    during testing (now build-plan items 17 and the item 8 status note),
    not by this fix's code. The error path was exercised against a real
    Supabase response (not just a mock), which is the strongest available
    evidence that the success path is correctly implemented from the same
    code.
- No test runner is configured for this stack (see
  `blueprint/context/coding-standards.md`), so this fix rides on manual,
  build/lint, and `/check` verification rather than a test gate.
