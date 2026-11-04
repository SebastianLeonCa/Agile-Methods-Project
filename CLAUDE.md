# CleanUp Map — project guide

Community cleanup organizer: report dirty spots on a map, organize cleanup events, show before & after.
Slogan: *See it. Map it. Clean it. Together.* Full product spec and sprint plan: `PROMPT.md`.

@AGENTS.md

## Stack (all free tiers)

- **Next.js 16 (App Router) + TypeScript + React 19**, `src/` dir, import alias `@/*` → `src/*`
- **Tailwind CSS v4** (configured in `src/app/globals.css`, no `tailwind.config`), **lucide-react** icons,
  **Inter** + **Plus Jakarta Sans** (headings) via `next/font`
- **Leaflet + react-leaflet** with OpenStreetMap tiles softened by the `.map-tiles` CSS filter
  (CARTO now needs an API key, so it is not used)
- **Supabase** (Postgres, Auth, Storage, Realtime) via `@supabase/supabase-js` + `@supabase/ssr`
- **Vercel** Hobby hosting (auto-deploys `main`), **GitHub Actions** CI
- **Vitest + React Testing Library** (unit), **Playwright** Chromium only (e2e)

## Run it

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

| Script | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm run start` | Production build / serve it |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generates Next route types, then `tsc --noEmit` |
| `npm run test` | Vitest unit tests (`tests/unit`) |
| `npm run test:e2e` | Playwright e2e (`tests/e2e`) against the production build; run `npm run build` first. First time: `npx playwright install chromium` |

## Folder structure

```
.github/workflows/ci.yml   CI: lint → typecheck → test → build → e2e
supabase/migrations/       numbered SQL files (0001_spots.sql, ...), applied by hand in Supabase SQL Editor
supabase/seed.sql          sample data
src/app/                   routes (App Router): page.tsx = landing, map/ = the map, auth/, login/, signup/, profile/
src/components/            UI components; ui.tsx = shared buttons, fields, cards, badges
src/lib/map.ts             tile settings, pin HTML (`pinHtml`), Web Mercator `project()`
src/proxy.ts               Next 16's renamed middleware: refreshes the Supabase session, guards protected pages
src/lib/supabase/          client.ts (browser), server.ts (server), middleware.ts (session refresh, used by proxy.ts)
src/lib/auth.ts            getCurrentProfile() for server components
src/lib/validation.ts      form validation (shared by server actions and unit tests)
src/lib/image.ts           browser-side image compression before upload
src/lib/types.ts           TS types matching the DB
tests/unit/                Vitest tests (*.test.ts[x])
tests/e2e/                 Playwright tests (*.spec.ts), run at desktop + 375px mobile viewport
docs/screenshots/          screenshots per sprint (desktop + 375px)
```

Folders are created in the sprint that first needs them.

## Conventions

- Work one sprint at a time (see `PROMPT.md`).
- Branch per feature: `feature/<short-name>`; commits `feat:`, `fix:`, `test:`, `chore:`, `docs:`; open PR with `gh pr create`; merge only after CI is green and the user says OK.
- Secrets only in `.env.local` (git-ignored) and Vercel env vars. Keep `.env.example` with names only.
  `SUPABASE_SERVICE_ROLE_KEY` is server-only, never import it in client code.
- Every table has RLS enabled with explicit policies. Migrations are written here, then the user runs them.
- Cache Components is on (`next.config.ts`): server components that read Supabase/cookies must sit inside
  `<Suspense>` (see `src/app/map/page.tsx`). Use `@/lib/supabase/server` on the server, `@/lib/supabase/client` in the browser.
- Next keeps up to 3 visited pages alive (hidden, via React `<Activity>`) and restores their state:
  - Leaflet maps must render only while shown: wrap with `useShownOnly()` (otherwise "Map container is being reused").
  - Reset transient UI (dialogs, dropdowns, toasts) in a `useLayoutEffect` cleanup (see `SpotExplorer`, `AvatarMenu`).
- Map: `LitterMap` is loaded via `next/dynamic` with `ssr: false` from a client component (`SpotExplorer`).
  Pins are `L.divIcon` with `pinHtml(pinVariant(spot))`; style only the inner `.pin`, never `transform` on
  `.spot-pin` (Leaflet positions it with transform).
- Design system: colors are tokens in `globals.css` `@theme` (`brand`, `ink`, `muted`, `line`, `surface`, `low`,
  `medium`, `high`, `clean`). Use them (`bg-brand`, `text-ink`…) instead of raw hex. `rounded-2xl` cards, soft shadows,
  lucide icons (no emoji in UI), transitions 150–250ms (disabled by `prefers-reduced-motion`). Light theme only.
- Actions that need an account: for visitors, open `AuthPromptModal` ("Log in to …") with `next` set to the current page.
  After login / email confirmation the default destination is `/map` (`HOME_AFTER_LOGIN`).
- Auth: Supabase email + password. Forms use Server Actions + `useActionState` (`src/app/auth/actions.ts`).
  Email confirmation lands on `/auth/confirm` (handles the default `?code=` link and `?token_hash=`).
  Protected paths are listed in `isProtectedPath()` (`src/lib/utils.ts`); pages also re-check the user.
- Storage: bucket `spot-photos`, path `<user_id>/<uuid>.jpg`; compress with `compressImage()` before upload.
- Free Supabase email sends only a few emails/hour: create test users in the dashboard with "Auto Confirm".
  The logged-in e2e test needs `E2E_TEST_EMAIL` / `E2E_TEST_PASSWORD` (`.env.local` locally, GitHub secrets in CI).
- Mobile first: everything must work at 375px wide and on desktop.
- Simple, readable code; few files, few libraries.
- Definition of Done: works on the Vercel URL; lint, typecheck, test, build pass; has a test; CI green.
