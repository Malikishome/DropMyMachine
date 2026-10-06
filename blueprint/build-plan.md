# Build Plan

The features that make up this project, high level and in rough build order, one
line each. Completed items are checked off to reflect the app as it exists
today; the rest is the roadmap.

## MVP

- [x] 1. Project scaffolding - Express backend + Vite/React frontend, Tailwind,
      React Router.
- [x] 2. Supabase auth backend - `/api/auth/signup` and `/api/auth/login`
      routes, profile row (role + full_name) created on signup.
- [x] 3. Auth/role middleware - `authMiddleware` validates a Supabase JWT and
      attaches `req.user`; `roleMiddleware` gates routes by role.
      > TODO (confirm): `roleMiddleware.js` is currently missing its
      > `module.exports`, so it can't be required elsewhere yet - fix as part
      > of whichever feature first wires it into a route.
- [x] 4. Listings API - CRUD routes (`GET /`, `POST /`, `GET /:id`,
      `PUT /:id`, `DELETE /:id`) backed by the Supabase `listings` table, with
      city/machine_type filtering.
- [x] 5. Marketing home page - gradient hero, login/register CTAs.
- [x] 6. Auth page shells - Login, Register, Forgot Password pages with
      floating-label inputs and client-side validation.
- [x] 7. Listing card component - `ListingCards.jsx` renders a listing
      (title, description, price, machine_type, location). Built but not yet
      imported or rendered anywhere.
- [ ] 8. Wire frontend auth to the real backend - replace the simulated
      `setTimeout` success in Login.jsx/Register.jsx with real calls to
      `/api/auth/login` and `/api/auth/signup`, store the session, and protect
      `/dashboard`.
      > Status: Login.jsx now calls `/api/auth/login` for real (done via the
      > `fix/login-register-error-handling` branch). Register.jsx still
      > fakes success with the old `setTimeout` and never calls
      > `/api/auth/signup` - that part of this item is still open.
- [ ] 9. Operator and location-host dashboards - replace the Dashboard.jsx
      placeholder with real, role-specific views (host: manage own listings;
      operator: browse/filter listings, rendering results with the existing
      `ListingCards` component).
- [ ] 10. Placement request system - `requests` table, API routes to create a
      request against a listing and to accept/decline it, plus status
      tracking (pending / accepted / declined) surfaced in both dashboards.
- [ ] 11. Operator/host messaging - real back-and-forth chat between an
      operator and a host, separate from request status (accept/decline is
      not the reply). Needs a `messages` table (or similar), send/list API
      routes, and a chat UI, most naturally scoped per request or per
      listing conversation.
- [ ] 12. Weekly listing cap - enforce 2 listing posts per host per week on
      `POST /api/listings`.

## Post-MVP

- [ ] 13. Google login - `handleGoogleLogin` in Login.jsx is currently a
      no-op placeholder; wire real OAuth if this stays in scope.
- [ ] 14. Deployment config - Vercel config for the frontend, Railway config
      for the backend (see project-plan.md Deployment section).
- [ ] 15. Paid listing tier - optional fee to lift or replace the weekly free
      cap, once free-tier usage validates demand.
- [ ] 16. Forgot Password backend route - `ForgotPassword.jsx` currently
      simulates "Reset link sent!" client-side only; there is no
      `/api/auth/forgot-password` (or similar) route yet. Needs a real
      Supabase password-reset call (e.g. `supabase.auth.resetPasswordForEmail`)
      wired through the backend or directly from the client.
- [ ] 17. Create the missing `profiles` table - found via `/check` while
      testing real signups: `supabase.auth.signUp` succeeds, but the
      follow-up insert into `profiles` in
      [authRoutes.js](backend/routes/authRoutes.js) fails with
      `Could not find the table 'public.profiles' in the schema cache` -
      the table doesn't exist in the connected Supabase project. Every real
      signup right now creates an auth user with no role/profile row, which
      will break `roleMiddleware` and any role-based dashboard view. Needs
      a `profiles` table (id, role, full_name) created in Supabase before
      item 9 (dashboards) can rely on roles.
