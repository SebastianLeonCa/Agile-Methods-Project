# CleanUp Map — project guide

Community cleanup organizer: report dirty spots on a map, organize cleanup events, show before & after.
Slogan: *See it. Map it. Clean it. Together.* Full product spec and sprint plan: `PROMPT.md`.

@AGENTS.md

## Stack (all free tiers)

- **Next.js 16 (App Router) + TypeScript + React 19**, `src/` dir, import alias `@/*` → `src/*`
- **Tailwind CSS v4** (configured in `src/app/globals.css`, no `tailwind.config`)
- **Leaflet + react-leaflet** with OpenStreetMap tiles (load map with `next/dynamic`, `ssr: false`)
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
src/app/                   routes (App Router); page.tsx = home (the map)
src/components/            UI components
src/lib/supabase/          client.ts (browser), server.ts (server), middleware.ts (session refresh)
src/lib/types.ts           TS types matching the DB
tests/unit/                Vitest tests (*.test.ts[x])
tests/e2e/                 Playwright tests (*.spec.ts), run at desktop + 375px mobile viewport
```

Folders are created in the sprint that first needs them.

## Conventions

- Work one sprint at a time (see `PROMPT.md`).
- Branch per feature: `feature/<short-name>`; commits `feat:`, `fix:`, `test:`, `chore:`, `docs:`; open PR with `gh pr create`; merge only after CI is green and the user says OK.
- Secrets only in `.env.local` (git-ignored) and Vercel env vars. Keep `.env.example` with names only.
  `SUPABASE_SERVICE_ROLE_KEY` is server-only, never import it in client code.
- Every table has RLS enabled with explicit policies. Migrations are written here, then the user runs them.
- Mobile first: everything must work at 375px wide and on desktop.
- Simple, readable code; few files, few libraries.
- Definition of Done: works on the Vercel URL; lint, typecheck, test, build pass; has a test; CI green.
