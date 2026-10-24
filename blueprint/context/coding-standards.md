# Coding Standards

> Reflects the real stack found in this repo: Express 5 + Supabase backend,
> Vite/React 19 frontend. Adjust as the project's actual conventions evolve.

## JavaScript

- Plain JavaScript (no TypeScript configured in either `backend/` or
  `client/`).
- CommonJS (`require`/`module.exports`) on the backend; ES modules
  (`import`/`export`) on the frontend, per Vite's default.
- Prefer `async/await` over raw promise chains (matches existing route
  handlers).

## React (client)

- Functional components only, using hooks for state (matches existing
  pages).
- No `'use client'` directives or server components - this is a plain Vite
  SPA, not Next.js.
- Client-side routing via `react-router-dom` (`BrowserRouter` in `App.jsx`).
- Keep page-level components in `client/src/pages/`, shared/reusable
  components (like `FloatingInput.jsx`, `GradientText.jsx`, `ListingCards.jsx`)
  directly under `client/src/`.

## File Organization

- Backend routes: `backend/routes/[feature]Routes.js`, registered in
  `backend/app.js` under `/api/[feature]`.
- Backend middleware: `backend/middleware/[name]Middleware.js`.
- Backend config/clients: `backend/config/[name].js` (e.g. the Supabase
  client in `db.js`).
- Frontend pages: `client/src/pages/PageName.jsx`.
- Frontend shared components: `client/src/ComponentName.jsx`.

## Naming

- Components: PascalCase (`ListingCards.jsx`).
- Route/middleware files: camelCase with a `Routes`/`Middleware` suffix
  (`authRoutes.js`, `roleMiddleware.js`).
- Functions and variables: camelCase.
- Database columns/fields: snake_case, matching the Supabase schema
  (`machine_type`, `full_name`, `user_id`).

## Styling

- Tailwind CSS v4 utility classes for all styling (both `backend`'s
  dependency-free area and the `client` use the Tailwind Vite plugin).
- No inline styles or a separate CSS-in-JS system.
- No component library installed (no shadcn/ui, no daisyUI) - `ListingCards`
  uses a raw `card`/`bg-base-100` className that isn't backed by anything
  yet; don't assume a component library is available without checking.

## Database & Auth

- Supabase is the database and auth provider - no ORM (no Prisma, no
  Drizzle). All queries go through `@supabase/supabase-js`
  (`backend/config/db.js` exports the client).
- Auth: Supabase Auth (`supabase.auth.signUp` / `signInWithPassword` /
  `getUser`), not a custom JWT implementation, despite the README calling it
  "JWT-based" - the JWT is the Supabase session token.
- Role-based access: role lives on the `profiles` table (not on the Supabase
  auth user object directly) and is enforced via `roleMiddleware`.
- Scope every listing mutation by the authenticated user - the current
  `POST /api/listings` route trusts a client-supplied `user_id` in the request
  body instead of deriving it from the authenticated session; treat this as a
  known gap to close, not a pattern to copy into new routes.

## Error Handling

- Express routes use try/catch, returning `{ message }` JSON on error with an
  appropriate status code (400/401/403/404/500), matching existing routes.
- No shared `{ success, data, error }` action wrapper exists yet (this isn't a
  Next.js Server Actions app) - keep the existing per-route try/catch pattern.

## Testing

No test runner is installed in either `backend/` or `client/` - **testing is
opt-in and not yet set up.** There is no `test` command in `AGENTS.md`, so per
the testing switch, testing is not currently a gate on build steps.

Run `/tests` or `$tests` when you want to add one. For this stack that would
mean:

- **Backend:** a Node-native runner (`node --test`) or a lightweight addition
  like Vitest, since Express 5 has no framework-specific test tooling here
  yet.
- **Frontend:** Vitest + React Testing Library is the natural fit for a
  Vite/React app.

Once added, follow the scope rule from the Blueprint default: test pure logic
with real edge cases (parsers, validators, request/response shaping), not UI
rendering - verify UI with the running app instead.

## Browser Verification

No Playwright or other browser automation is installed. Verify UI and
integration behavior with the Vite dev server, manual screenshots, and API
responses (`curl` or similar) rather than assuming a browser tool is
available. Add Playwright only when explicitly requested or when a spec is
specifically about setting it up.

## Code Quality

- No commented-out code unless specified.
- No unused imports or variables.
- Keep functions under 50 lines when possible.
- Several existing files carry inline `// TO-DO` / reminder comments (e.g.
  `Home.jsx`, `Register.jsx`, `roleMiddleware.js`) - resolve or remove these
  as the related feature is actually built, don't leave new ones behind the
  same way.

## Comments

Write code that explains itself; comment only what the code cannot say.
Over-commenting is a common AI tell, so resist it.

- Comment the **why**, not the **what**. Delete any comment that restates the
  code.
- No banner/header blocks, section dividers, or step-by-step narration of
  obvious code.
- A comment earns its place only when it captures something the code can't: a
  non-obvious decision, a gotcha or workaround, why a value is what it is, or
  a link to a spec or issue.
- Prefer self-documenting names and small functions over explanatory
  comments.
- When in doubt, leave the comment out.

## Writing

- No em dashes (U+2014) in generated content: docs, comments, commit
  messages, READMEs, specs. They read as AI-generated.
- Use a hyphen for `term - description` separators; rephrase prose with
  commas, parentheses, or a colon. Avoid en dashes and the ellipsis character
  too.
