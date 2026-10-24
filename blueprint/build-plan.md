# Build Plan

The features that make up this project, high level and in rough build order, one
line each. Completed items are checked off to reflect the app as it exists
today; the rest is the roadmap.

> Reorganized 2026-10-16 around the system design doc (`DropMyMachine System
> Design v1.0, Oct 2026`), which also set the phase headings below (MVP /
> Revenue / Growth, matching its own 12-month roadmap). Items 1-7 are shipped
> and keep their numbers; everything else was renumbered since none of it was
> checked off yet (see build-plan's own numbering rule).

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
      > TODO (confirm): the system design doc's `listings` schema adds
      > columns this API doesn't use yet - `location_type`, `address`
      > (hidden until a request is accepted), `foot_traffic`,
      > `revenue_split`. Needs a migration plus route updates before item 11
      > (address reveal) and item 10 (filter panel) can work.
- [x] 5. Marketing home page - gradient hero, login/register CTAs.
- [x] 6. Auth page shells - Login, Register, Forgot Password pages with
      floating-label inputs and client-side validation.
- [x] 7. Listing card component - `ListingCards.jsx` renders a listing
      (title, description, price, machine_type, location). Built but not yet
      imported or rendered anywhere.
- [x] 8. Create the missing `profiles` table - found via `/check` while
      testing real signups: `supabase.auth.signUp` succeeds, but the
      follow-up insert into `profiles` in
      [authRoutes.js](backend/routes/authRoutes.js) fails with
      `Could not find the table 'public.profiles' in the schema cache` - the
      table doesn't exist in the connected Supabase project. Create it with
      the system design doc's schema: `id, full_name, role, plan` (default
      `'free'`), `trust_level` (default `1`), `city, phone, verified_phone,
      created_at`. Blocks every other MVP item below.
- [ ] 9. Wire frontend auth to the real backend, plus global auth state -
      replace the simulated `setTimeout` success in Register.jsx with a real
      call to `/api/auth/signup` (Login.jsx is already wired, done via the
      `fix/login-register-error-handling` branch). Add `AuthContext.jsx`
      (stores the session, exposes `user` + `logout`) and
      `ProtectedRoute.jsx` (redirects to `/login` when there's no token) per
      the design doc's planned `client/src/context/` and
      `client/src/components/` layout - neither exists yet, and nothing
      currently guards `/dashboard`.
- [ ] 10. Filter panel component - the design doc calls for a
      `FilterPanel.jsx` (machine type checkboxes, radius steps, foot-traffic
      tier, min revenue-split %) that doesn't exist yet. Needed alongside
      `ListingCard` (item 7) before item 12 (dashboards) can show a real
      browse view.
- [ ] 11. Address blur / reveal-on-accept - listings show only city/
      neighborhood ("Downtown Orlando, FL", Zillow-style) until a request is
      accepted, at which point the exact address is revealed to that
      operator. Depends on the `listings.address` column from item 4's TODO
      and the request accept flow in item 13.
- [ ] 12. Operator and location-host dashboards - replace the Dashboard.jsx
      placeholder with real, role-specific views: host manages their own
      listings; operator browses/filters using `ListingCard` (item 7) +
      `FilterPanel` (item 10), with addresses blurred per item 11.
- [ ] 13. Placement request system - `requests` table (`listing_id,
      operator_id, message, status` default `'pending'`), `POST
      /api/requests` to send one, `GET /api/requests` for "my requests" (sent
      or received), `PUT /api/requests/:id` for the location owner to accept
      or decline. Accepting reveals the listing's exact address (item 11) to
      that operator and flips the listing to `filled` once taken.
- [ ] 14. Basic in-app notifications - `notifications` table (`user_id,
      type, title, body, link, read, created_at`; `type` one of
      `new_match` / `request_accepted` / `new_message`), `GET
      /api/notifications` (unread first), `PUT /api/notifications/:id/read`,
      bell icon in the nav with an unread-count badge and a dropdown of the
      last 20.
- [ ] 15. Deployment config - Vercel config for the frontend, Railway config
      for the backend (see project-plan.md Deployment section).
- [ ] 31. Listing photos - location owners upload a photo when creating or
      editing a listing (ties into dashboard item 12); stored via Supabase
      Storage, with a new `listings.photo_url` column. The listing card's UI
      already expects a photo (`project-plan.md` UI/UX section, item 7), this
      item is the actual upload + storage plumbing behind it. UI/visual work
      (how it looks on the card, upload control styling) is deferred -
      revisit via `/prototype` later; this item tracks the data/storage side.
- [ ] 32. Signup email/role conflict check - `POST /api/auth/signup`
      currently lets the same email sign up again under a different role
      without any check (found while hardening item 8's signup path - see
      `backend/routes/authRoutes.js`). Needs a product decision first: block
      re-signup under a second role with a clear error, or allow one email
      to hold both roles - then enforce whichever is chosen.
- [ ] 33. Rate limiting on auth routes - `/api/auth/login` and
      `/api/auth/signup` have no rate limiting, so both are open to
      brute-force/credential-stuffing and signup abuse. Add a limiter (e.g.
      `express-rate-limit`) scoped to these two routes.

## Revenue

- [ ] 16. Stripe Pro subscription - Free ($0, forever) vs. Pro ($49/mo or
      $399/yr) via Stripe Checkout; webhooks update `profiles.plan` to
      `'free'` or `'pro'`. No card data ever touches this backend.
- [ ] 17. Pro tier feature gates - enforce the Free-vs-Pro limits from the
      design doc's feature table: Free gets 1 active listing (hosts), 5
      placement requests/month (operators), a 25-mile radius filter, and a
      weekly email digest; Pro gets unlimited listings/requests, nationwide
      radius, foot-traffic and revenue-split filters, priority placement in
      results, an analytics dashboard, and a daily + instant-alert digest.
      Supersedes the earlier "weekly listing cap" and "paid listing tier"
      ideas (both were a flat free-vs-paid split before this doc's full
      tiered model existed).
- [ ] 18. Operator/host messaging - real back-and-forth chat between an
      operator and a host. `messages` table (`request_id, sender_id, body,
      created_at`) - scoped to an **accepted request**, not a listing or a
      standalone thread (this resolves the open question from
      project-plan.md's Data section). `GET /api/messages/:requestId`,
      `POST /api/messages`; unlocked only once that request is accepted.
- [ ] 19. Email digest delivery - weekly (Free) / daily + instant (Pro)
      digest emails via an email provider (e.g. SendGrid, not yet chosen or
      configured); per-event-type and per-channel (email/in-app) toggles for
      the user.
- [ ] 20. Best Match ranking - server-side default sort for the browse feed:
      40% distance, 40% foot traffic, 20% recency, weighted formula. Plus
      override sort options: Newest First, Highest Revenue Split, Closest,
      Most Traffic.
- [ ] 21. Progressive trust & verification ladder - L1-L4 for both roles
      (operator: email -> phone -> Google Business linked -> business docs
      uploaded; location owner: email -> phone -> Google Business linked ->
      gov ID/business registration). Higher tiers unlock messaging, Pro
      eligibility, verified badges, and higher match ranking.

## Growth

- [ ] 22. Analytics dashboard (Pro) - listing views and request rate.
- [ ] 23. Saved filter presets (Pro).
- [ ] 24. Mobile-responsive polish - the design doc states desktop-first for
      the MVP; mobile polish is explicitly a Phase 3/Growth item, not MVP
      scope.
- [ ] 25. Enable Row Level Security (RLS) on all Supabase tables - the
      design doc notes RLS is currently **off for development** and must be
      turned back on before launch; it's what stops one user from reading
      another user's rows directly. Security-critical, don't skip at launch
      time even though it's sequenced late here.
- [ ] 26. Supabase Realtime messaging - upgrade the messaging center (item
      18) from request/poll to realtime delivery.

> Not a build item: the design doc's "first 100 users in Orlando, using Pop
> & Drop Vending's existing network" is a go-to-market milestone, not
> engineering work - tracked here as context only.

## Other (not covered by the system design doc)

- [ ] 27. Google login - `handleGoogleLogin` in Login.jsx is currently a
      no-op placeholder; wire real OAuth if this stays in scope.
- [ ] 28. Forgot Password backend route - `ForgotPassword.jsx` currently
      simulates "Reset link sent!" client-side only; there is no
      `/api/auth/forgot-password` (or similar) route yet. Needs a real
      Supabase password-reset call (e.g. `supabase.auth.resetPasswordForEmail`)
      wired through the backend or directly from the client.
- [ ] 29. Time-of-day auto dark/light mode - switch the app's theme
      automatically based on the user's local time instead of always
      rendering dark. Needs a light-mode palette defined (only dark exists
      today) and the time-of-day switching rule; see project-plan.md UI/UX
      for open questions (exact cutoff times, manual override).
- [ ] 30. Password visibility toggle - show/hide button on password fields
      (Login, Register) that toggles input `type` between `password` and
      `text`; block copy/paste on those fields regardless of visibility
      state. See project-plan.md UI/UX for the open question on whether
      Confirm Password should also block paste.
