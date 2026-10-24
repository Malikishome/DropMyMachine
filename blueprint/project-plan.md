# Project Plan

## 1. Problem - What problem are we solving?

Machine operators (vending, ATMs, coffee kiosks, EV chargers, ice machines,
arcade machines, water refill stations) spend hours cold calling businesses
to find placement locations. Location owners have no easy way to advertise
available space. DropMyMachine flips the dynamic: location owners post what
they want, operators browse verified listings and send placement requests,
location owners get inbound interest instead of cold calls. Revenue is
shared between operator and location owner per listing.

> Per the system design doc (`DropMyMachine System Design v1.0`, Oct 2026):
> founder operates Pop & Drop Vending in Orlando, FL - the product is built
> by someone who has actually done the cold-calling.

## 2. Users - Who is this for?

Two roles, broad across machine types (vending, EV chargers, coffee kiosks),
not restricted to one geography or niche to start:

- **Operators** - businesses that own and place machines, looking for host
  locations. *Example persona (system design doc): Marcus runs 12 vending
  machines around Tampa, spends 3-4 hrs/week cold-calling hotels and gyms.*
- **Location owners** - hotels, gyms, offices, retail spaces with available
  floor space who want passive revenue from a revenue share. *Example
  persona: Diana manages a 200-room hotel lobby in Orlando with a corner
  that could fit a snack machine.*

> TODO (confirm) - naming change: the system design doc calls this role
> **"location owner"** (`role: 'location_owner'` in its schema), where this
> plan previously said "location host." Nothing in code stores this value
> yet (Register.jsx doesn't send a role at all - see build-plan item 9), so
> there's no existing data to migrate, but pick one term and use it
> consistently before item 8 (profiles table) and item 9 (auth wiring) are
> built. This plan now uses "location owner" to match the design doc.

Launch market: Orlando, FL first, using the founder's existing Pop & Drop
Vending network for initial user acquisition, then expand market by market
(per the system design doc's launch strategy). This supersedes the earlier
"no geographic market chosen" placeholder.

## 3. Features - What does the MVP need?

Full feature breakdown (Free vs. Pro) lives in the system design doc; the
build-plan is the source of truth for build order and status. Summary:

Shipped already (see build-plan.md items 1-7):

- Two user roles - operator and location owner, with role stored on the
  Supabase `profiles` table.
- Authentication via Supabase Auth (`/api/auth/login`, `/api/auth/signup`)
  with a role middleware for protecting role-specific routes.
- Listings CRUD API (`/api/listings`) - create, list with city/machine_type
  filters, get by id, update, delete.
- Marketing home page, login page, register page, forgot-password page (UI
  shells).
- Listing card component (`ListingCards.jsx`) - built, but not yet rendered
  on any page.

Still to build, MVP (build-plan items 8-15):

- The missing `profiles` table, real frontend auth wiring + global auth
  state (`AuthContext`, `ProtectedRoute`), a filter panel component,
  address blur/reveal-on-accept, role-specific dashboards, the placement
  request system, basic in-app notifications, and deployment config.

Still to build, Revenue phase (items 16-21): Stripe Free/Pro subscription
and feature gates, operator/host messaging (scoped to an accepted request),
email digests, Best Match ranking (40% distance / 40% foot traffic / 20%
recency), and the progressive trust & verification ladder (L1-L4).

Still to build, Growth phase (items 22-26): analytics dashboard, saved
filter presets, mobile-responsive polish, Row Level Security hardening,
and realtime messaging.

Still to build, not in the system design doc (items 27-30): Google login,
a real Forgot Password backend route, time-of-day auto dark/light mode, and
a password visibility toggle with copy/paste blocked.

## 4. Data - What are we storing?

Schema below is from the system design doc; it's the authoritative target,
not yet all built (`profiles`, `requests`, `messages`, `notifications`
don't exist in Supabase yet - see build-plan.md).

- **profiles** - `id` (uuid, references `auth.users`), `full_name`, `role`
  (`'operator'` | `'location_owner'`), `plan` (default `'free'`, or
  `'pro'`), `trust_level` (int, default `1`, range 1-4), `city`, `phone`,
  `verified_phone` (bool, default `false`), `created_at`.
- **listings** - `id` (uuid), `user_id` (references `profiles`),
  `machine_type` (`'vending'` | `'atm'` | `'arcade'` | `'ice'` | ...),
  `location_type` (`'hotel'` | `'gym'` | `'office'` | `'retail'`), `city`,
  `state`, `address` (hidden from the public API until a request is
  accepted), `description`, `foot_traffic` (`'low'` | `'medium'` |
  `'high'`), `revenue_split` (int, % to location owner), `photo_url` (text,
  nullable - Supabase Storage object URL, see build-plan item 31),
  `status` (default `'active'`, or `'filled'`), `created_at`.
- **requests** - `id` (uuid), `listing_id` (references `listings`),
  `operator_id` (references `profiles`), `message`, `status` (default
  `'pending'`, or `'accepted'` | `'declined'`), `created_at`.
- **messages** - `id` (uuid), `request_id` (references `requests` -
  **resolved:** scoped to an accepted request, not a listing or a
  standalone thread), `sender_id` (references `profiles`), `body`,
  `created_at`.
- **notifications** - `id` (uuid), `user_id` (references `profiles`),
  `type` (`'new_match'` | `'request_accepted'` | `'new_message'`), `title`,
  `body`, `link`, `read` (bool, default `false`), `created_at`.

Row Level Security (RLS) must be enabled on all of these before launch - the
design doc notes it's off for development, which is correct for now but is
a security-hardening gate before production (build-plan item 25).

## 5. Tech - What stack are we using?

- **Frontend:** React 19, Vite, React Router, Tailwind CSS v4, Framer
  Motion. Desktop-first (per the system design doc; mobile-responsive
  polish is explicitly a later Growth-phase item, not MVP scope).
- **Backend:** Node.js, Express 5, CommonJS (`require`), REST API on port
  3000.
- **Database & Auth:** Supabase (Postgres + Supabase Auth), accessed via
  `@supabase/supabase-js`. JWT issued by Supabase Auth, sent as
  `Authorization: Bearer <token>`, verified server-side via
  `supabase.auth.getUser()`. RLS planned for production, currently off for
  dev (see Data section). **Supabase Storage** holds listing photos
  (build-plan item 31) - not yet set up.
- **Payments:** Stripe (Checkout + Webhooks) for the Pro subscription - not
  yet integrated (see Monetize below and build-plan item 16). No card data
  touches this backend; Stripe handles it directly.
- **Testing:** none configured yet (opt-in via `/tests`).
- **Deployment:** Vercel (frontend), Railway (backend) - per README, not yet
  configured in-repo (no `vercel.json` / Railway config present).
- **Dev tools:** VS Code, Thunder Client, Nodemon, Git + GitHub (per the
  system design doc).

> TODO (confirm): the system design doc specifies React Router **v6**, but
> `client/package.json` has `react-router-dom` **v7.14.2** installed and in
> use. Not resolved here since it's a real version choice, not a doc typo
> either way - confirm which is intended before it causes an API mismatch
> (v6 and v7 differ on some router APIs).

## 6. Monetize - How will this make money?

**Superseded by the system design doc.** The earlier plan (free listings,
capped at 2/week per host, no fee) is replaced by a two-tier subscription
model:

| | Free ($0, forever) | Pro ($49/mo or $399/yr) |
|---|---|---|
| Browse listings | blurred address | full detail on request accept |
| Create listings (location owner) | 1 active | Unlimited |
| Send placement requests (operator) | 5/month | Unlimited |
| Radius filter | up to 25 mi | nationwide |
| Foot traffic / revenue split filters | - | included |
| Priority placement in results | - | Pro listings shown first |
| Analytics (views, request rate) | - | included |
| Email digest | weekly | daily + instant alerts |
| Messaging center | on match | on match + message templates |

Billed via **Stripe Checkout**; **Stripe webhooks** update `profiles.plan`
to `'free'` or `'pro'`. No card data touches this backend. See build-plan
items 16-17.

> TODO (confirm): this is the design doc's plan as written - revisit if
> pricing, the free-tier limits, or the annual discount ($399/yr, a ~32%
> discount vs. 12 months at $49) need adjusting before Stripe is wired up.

## 7. UI/UX - How should this look and feel?

Dark theme throughout (home, auth pages, dashboard), unified palette -
`bg-gray-900` page, `bg-gray-800` cards, white primary text, gray-400
secondary text, blue-500 accent (see `GradientText.jsx`,
`FloatingInput.jsx`). No locked-in design system beyond Tailwind utility
classes.

**Planned: automatic light/dark switching by time of day.** The app should
pick dark or light based on the user's local clock (e.g. dark in the
evening/night, light during the day) rather than always rendering the dark
palette. Needs a light-mode palette defined alongside the existing dark one
(currently only dark exists), plus the time-of-day rule and a way to persist
or override the user's choice.

> TODO (confirm): exact day/night cutoff times, whether the user can
> manually override the automatic choice, and whether a light-mode palette
> should be drafted via `/prototype` before building it.

**Planned: password visibility toggle.** A show/hide button on password
fields (Login, Register, any future password field) that toggles the
input's `type` between `password` and `text`. Copy and paste must be
blocked on these fields (`onCopy`/`onPaste`/`onCut` prevented) regardless of
whether the password is currently shown or hidden.

> TODO (confirm): whether paste-blocking should also cover the Confirm
> Password field on Register, since users often paste there to verify a
> match - blocking it may hurt more than it protects; worth revisiting at
> spec time.

**From the system design doc:**

- **Listing card** - always visible: machine type(s), neighborhood/city (no
  street address), foot-traffic tier, revenue split %, photo, date posted.
  Revealed only after a request is accepted: exact street address, contact
  name and phone, floor/room details, and the unlocked messaging center.
  Address blur shown as e.g. "Downtown Orlando, FL" - Zillow-style, so a
  user sees enough to gauge interest before address details are shared.
- **Filter panel** - machine type (checkboxes: Vending, ATM, Arcade, Ice
  Machine, Coffee Kiosk, EV Charger, Water Refill), radius (10/25/50/100 mi,
  Statewide, Nationwide), minimum revenue split (10%/15%/20%/25%+ buttons).
- **Sort/ranking** - default "Best Match" (40% distance / 40% foot traffic /
  20% recency, computed server-side); override options: Newest First,
  Highest Revenue Split, Closest, Most Traffic.
- Desktop-first (see Tech section) - mobile-responsive polish is a later
  Growth-phase item, not part of the MVP look.

> TODO (confirm): no reference mockups in `blueprint/reference/` yet - add
> some if a specific look needs to be matched going forward.

## 8. Deployment - Where and how will this ship?

- **Frontend:** Vercel (per README and system design doc); no `vercel.json`
  in the repo yet.
- **Backend:** Railway (per README and system design doc); no Railway
  config in the repo yet.
- **Database/Auth:** Supabase project (external, already in use per
  `backend/config/db.js` reading `SUPABASE_URL` / `SUPABASE_ANON_KEY`).
  **Row Level Security must be turned on before launch** - currently off
  for development (build-plan item 25).
- **Payments:** Stripe Checkout + webhooks (build-plan item 16) - needs a
  publicly reachable webhook endpoint once deployed, plus Stripe API keys
  as env vars.
- **Env vars:** `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `PORT` (backend);
  `VITE_API_URL` (frontend, added via the login/register fix); Stripe keys
  not yet added.
- **Health check / workers / cron:** none.

> TODO (confirm): run `/release` when a deployment is actually being prepared;
> this section will fill in as real config is added.
