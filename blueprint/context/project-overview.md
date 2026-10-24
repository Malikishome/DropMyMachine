# DropMyMachine - Project Overview

> A B2B marketplace connecting machine operators (vending, ATMs, coffee
> kiosks, EV chargers, and more) with location owners who have space to
> offer, replacing cold-calling with inbound placement requests.

## Problem

Machine operators spend hours cold-calling businesses to find new
placement locations. Location owners (hotels, gyms, offices, retail) have
no easy way to advertise available floor space for passive revenue-share
income. DropMyMachine flips the dynamic: location owners post what they
want, operators browse verified listings and send placement requests, and
revenue is split per listing.

## Users

- **Operators** - businesses that own and place machines, browsing for
  host locations. Free tier: 5 placement requests/month, 25-mile radius.
  Pro ($49/mo): unlimited requests, nationwide radius, priority placement.
- **Location owners** - hotels, gyms, offices, retail spaces with
  available floor space wanting passive revenue. Free tier: 1 active
  listing. Pro: unlimited listings, analytics, priority placement.

Both roles build trust progressively (L1-L4: email verified -> phone
verified -> Google Business linked -> docs/gov ID uploaded), unlocking
messaging, Pro eligibility, verified badges, and better match ranking as
they climb.

Launch market: Orlando, FL, using the founder's existing Pop & Drop
Vending network, then market-by-market expansion.

## Features

Shipped:

1. **Project scaffolding** - Express backend + Vite/React frontend,
   Tailwind, React Router.
2. **Supabase auth backend** - signup/login routes, profile row created on
   signup.
3. **Auth/role middleware** - JWT validation + role gating (role
   middleware still needs `module.exports` added before anything can
   `require` it).
4. **Listings API** - CRUD with city/machine_type filtering (needs a
   schema migration - see Data model below - before address/revenue-split/
   foot-traffic fields can be used).
5. **Marketing home page** - gradient hero, login/register CTAs.
6. **Auth page shells** - Login, Register, Forgot Password, with
   floating-label inputs and inline (non-dead-end) error states.
7. **Listing card component** - `ListingCards.jsx`, built but not yet
   rendered on any page.

MVP, still to build:

8. **`profiles` table** - doesn't exist in Supabase yet; every signup
   currently creates an auth user with no role/profile row. Blocks
   everything role-based.
9. **Real auth wiring + global auth state** - Register still fakes
   success; no `AuthContext` or `ProtectedRoute` exists yet, so nothing
   guards `/dashboard`.
10. **Filter panel component** - machine type, radius, foot traffic,
    revenue split.
11. **Address blur / reveal-on-accept** - city/neighborhood shown
    publicly, exact address revealed only once a request is accepted.
12. **Role-specific dashboards** - replaces the Dashboard.jsx placeholder;
    host manages listings, operator browses/filters.
13. **Placement request system** - send, list, accept/decline; accepting
    triggers the address reveal and flips the listing to `filled`.
14. **Basic in-app notifications** - bell icon, unread badge, last 20.
15. **Deployment config** - Vercel (frontend) + Railway (backend).
16. **Listing photos** - location owners upload a photo when creating or
    editing a listing, stored via Supabase Storage; adds `listings.photo_url`.
    The listing card's UI already expects a photo (see UI/UX below) - this
    item is the upload/storage plumbing behind it. Visual/UI polish for the
    upload control itself is deferred (see Open questions).

Revenue phase, still to build:

17. **Stripe Pro subscription** - Checkout + webhooks updating
    `profiles.plan`.
18. **Pro tier feature gates** - enforce the Free vs. Pro limits (see
    Monetization).
19. **Operator/host messaging** - scoped to an accepted request, unlocked
    only after accept.
20. **Email digest delivery** - weekly (Free) / daily + instant (Pro).
21. **Best Match ranking** - 40% distance / 40% foot traffic / 20%
    recency, plus override sorts.
22. **Trust & verification ladder** - L1-L4 for both roles (see Users).

Growth phase, still to build:

23. **Analytics dashboard** (Pro) - views, request rate.
24. **Saved filter presets** (Pro).
25. **Mobile-responsive polish** - MVP is desktop-first by design.
26. **Row Level Security hardening** - currently off for dev; must be on
    before launch.
27. **Supabase Realtime messaging** - upgrade from poll to realtime.

Not in the system design doc, still to build:

28. **Google login** - currently a no-op placeholder.
29. **Forgot Password backend route** - currently fully client-side
    simulated.
30. **Time-of-day auto dark/light mode** - only a dark palette exists
    today.
31. **Password visibility toggle** - show/hide with copy/paste blocked.

> Numbering note: the feature list above is in build order, not literal
> build-plan.md numbers. Build-plan item 31 ("Listing photos") is listed
> as feature 16 here, right after item 15, because that's where it falls
> in build order (MVP, tied to the dashboard/listing-card work) - it was
> appended to build-plan.md with a high number only because it was added
> after the rest of the MVP section was already numbered. Build-plan.md
> remains the authoritative per-item number; this list's purpose is order
> and purpose, not a number mapping.

## Data model

> `profiles`, `requests`, `messages`, and `notifications` don't exist in
> Supabase yet - this is the target shape (build-plan items 8, 13, 18, 14).
> `listings` exists but is missing several of the columns below (item 4's
> TODO and item 31's `photo_url`).

### Profile

- `id` (uuid) - references `auth.users`, primary key
- `full_name` (text)
- `role` (text) - `'operator'` | `'location_owner'`
- `plan` (text, default `'free'`) - `'free'` | `'pro'`
- `trust_level` (int, default `1`) - 1-4, see Users
- `city` (text)
- `phone` (text)
- `verified_phone` (boolean, default `false`)
- `created_at` (timestamptz)

### Listing

- `id` (uuid)
- `user_id` (uuid) - references Profile, the location owner who posted it
- `machine_type` (text) - `'vending'` | `'atm'` | `'arcade'` | `'ice'` | ...
- `location_type` (text) - `'hotel'` | `'gym'` | `'office'` | `'retail'`
- `city` (text), `state` (text)
- `address` (text) - **hidden from the public API until a request on this
  listing is accepted** (see Address blur/reveal, feature 11)
- `description` (text)
- `foot_traffic` (text) - `'low'` | `'medium'` | `'high'`
- `revenue_split` (int) - % to the location owner
- `photo_url` (text, nullable) - Supabase Storage object URL for the
  listing's photo, uploaded by the location owner (build-plan item 31 /
  feature 16 above). Shown on the listing card alongside the other
  always-visible fields (see UI/UX).
- `status` (text, default `'active'`) - `'active'` | `'filled'`
- `created_at` (timestamptz)

### Request

- `id` (uuid)
- `listing_id` (uuid) - references Listing
- `operator_id` (uuid) - references Profile
- `message` (text) - optional note from the operator
- `status` (text, default `'pending'`) - `'pending'` | `'accepted'` |
  `'declined'`
- `created_at` (timestamptz)

> Accepting a Request reveals the parent Listing's `address` to that
> `operator_id` and unlocks a Message thread scoped to this Request.

### Message

- `id` (uuid)
- `request_id` (uuid) - references Request (**conversations are scoped to
  an accepted request**, not a listing or a standalone thread)
- `sender_id` (uuid) - references Profile
- `body` (text)
- `created_at` (timestamptz)

### Notification

- `id` (uuid)
- `user_id` (uuid) - references Profile
- `type` (text) - `'new_match'` | `'request_accepted'` | `'new_message'`
- `title` (text), `body` (text), `link` (text)
- `read` (boolean, default `false`)
- `created_at` (timestamptz)

> Row Level Security must be enabled on every table above before launch
> (currently off for development).

## Tech stack

- **React 19 + Vite** - frontend SPA, desktop-first for the MVP.
- **React Router** - client-side routing. > TODO: design doc specifies v6,
  installed version is v7.14.2 - unresolved, confirm before it causes an
  API mismatch.
- **Tailwind CSS v4** - all styling, no component library installed.
- **Framer Motion** - used in the client (`motion`/`framer-motion` deps).
- **Node.js + Express 5** - REST API, CommonJS, port 3000.
- **Supabase (Postgres + Auth)** - database and auth; JWT issued by
  Supabase Auth, sent as `Authorization: Bearer <token>`, verified
  server-side via `supabase.auth.getUser()`.
- **Supabase Storage** - holds listing photos (build-plan item 31); not
  yet set up.
- **Stripe (Checkout + Webhooks)** - Pro subscription billing, not yet
  integrated. No card data touches this backend.
- **Testing** - none configured yet (opt-in via `/tests`).

## Monetization

Two-tier subscription, billed via Stripe Checkout; webhooks update
`profiles.plan`.

| | Free ($0, forever) | Pro ($49/mo or $399/yr) |
|---|---|---|
| Browse listings | blurred address | full detail on request accept |
| Create listings (location owner) | 1 active | Unlimited |
| Send placement requests (operator) | 5/month | Unlimited |
| Radius filter | up to 25 mi | nationwide |
| Foot traffic / revenue split filters | - | included |
| Priority placement in results | - | Pro listings shown first |
| Analytics | - | included |
| Email digest | weekly | daily + instant alerts |
| Messaging center | on match | on match + message templates |

> TODO: pricing and free-tier limits are the design doc's numbers as
> written - revisit before Stripe is wired up (build-plan item 16).

## UI/UX

Dark theme throughout (home, auth, dashboard) - `bg-gray-900` page,
`bg-gray-800` cards, white primary text, gray-400 secondary text, blue-500
accent. Desktop-first; mobile-responsive polish is a later Growth-phase
item, not MVP scope.

- `/` - marketing home, gradient hero, Login/Register CTAs.
- `/login`, `/register`, `/forgot-password` - auth forms, floating-label
  inputs, inline (non-dead-end) error states.
- `/dashboard` - role-specific: location owner manages listings, operator
  browses/filters (not yet built).

Listing card (always visible: machine type, neighborhood/city, foot-traffic
tier, revenue split %, photo, date posted; revealed after accept: exact
address, contact info, messaging). Address blur shown Zillow-style, e.g.
"Downtown Orlando, FL." Filter panel: machine type checkboxes, radius steps,
minimum revenue-split buttons. Default sort "Best Match" (40% distance /
40% foot traffic / 20% recency), with override sorts available.

A static mockup of this browse view exists at
`prototypes/operator-dashboard.html` (theme locked in `prototypes/theme.css`),
showing the filter panel and listing cards with photo placeholders. The
mockup's photo treatment is a stand-in; real photo upload/display UI is
still open (see Open questions) even though the underlying storage plumbing
is now tracked as feature 16 above.

Planned, not yet built: automatic light/dark switching by time of day
(only a dark palette exists today); a password visibility toggle with
copy/paste blocked on password fields.

## Deployment

- **Frontend:** Vercel. No `vercel.json` in the repo yet.
- **Backend:** Railway. No Railway config in the repo yet.
- **Database/Auth:** Supabase (external project). RLS must be turned on
  before launch - currently off for dev.
- **Storage:** Supabase Storage for listing photos (build-plan item 31) -
  not yet created.
- **Payments:** Stripe Checkout + webhooks - needs a publicly reachable
  webhook endpoint once deployed.
- **Env vars:** `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `PORT` (backend);
  `VITE_API_URL` (frontend); Stripe keys not yet added.
- **Health check / workers / cron:** none.

> TODO: run `/release` when a deployment is actually being prepared.

## Open questions

- **Role naming:** the system design doc uses `location_owner`; earlier
  planning said "location host." No data exists under either name yet, so
  this overview and project-plan.md now use `location_owner` - confirm
  before building the `profiles` table (item 8) and role-based routes.
- **React Router version:** design doc says v6, the repo has v7.14.2
  installed and in use. Not resolved - pick one before it causes an API
  mismatch.
- **Stripe pricing:** $49/mo, $399/yr, and the Free-tier limits are the
  design doc's numbers as written, not independently validated.
- **Dark/light time-of-day switching:** exact day/night cutoff times and
  whether the user can manually override are undecided; no light-mode
  palette exists yet.
- **Password field paste-blocking:** whether Confirm Password on Register
  should also block paste is unresolved - blocking it may hurt more than
  it protects, since users often paste there to verify a match.
- **Listing photo UI:** build-plan item 31 locks the data/storage side
  (`photo_url` column, Supabase Storage) but the actual upload control and
  how the photo renders on the listing card are explicitly deferred -
  revisit with `/prototype` before or during that feature's spec.
