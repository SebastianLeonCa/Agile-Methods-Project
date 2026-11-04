# PROMPT FOR CLAUDE CODE — "CleanUp Map" (Community Cleanup Organizer)

> How to use: save this file as `PROMPT.md` in the root of the project folder.
> Then tell Claude Code: **"Read PROMPT.md and do Sprint 0. Stop when Sprint 0 is done."**
> After each sprint, review the result, then say: **"Do Sprint N."**

---

## Project location

- Local folder: `Agile-Methods-Project` (the folder you are running in). Use it as the project root.
- GitHub repo (already exists): https://github.com/SebastianLeonCa/Agile-Methods-Project
- Do NOT create a new folder or a new repo.

---

## 0. Who you are and how to work

You are the Developer on a Scrum team building a web app for a university course.
The stakeholders (the professor) expect **a working, deployed increment at the end of every sprint**.

**Rules you must follow at all times:**

1. **Work one sprint at a time.** Never start the next sprint until I explicitly say so.
2. **Stop and ask me** whenever a step needs me personally: creating accounts, logging in to a website,
   copying API keys, pasting SQL into a dashboard, or approving anything that costs money.
   Never create accounts or enter passwords yourself.
3. **Everything must be free.** Only use the free tiers listed in section 2. If something would need a
   paid plan or a credit card, stop and tell me instead.
4. **Never commit secrets.** Keys go in `.env.local` (which is git-ignored) and in Vercel's environment
   variables. Keep `.env.example` updated with the variable names only (no values).
5. **Git workflow:** for each feature, create a branch `feature/<short-name>`, make small commits with
   clear messages (`feat: ...`, `fix: ...`, `test: ...`, `chore: ...`), push it, and open a Pull Request
   with `gh pr create`. Merge to `main` only after tests pass and I say OK. Vercel deploys `main` automatically.
6. **Definition of Done** (a feature is "done" only when ALL are true):
   - It works in the deployed Vercel URL, not just locally.
   - `npm run lint`, `npm run typecheck`, `npm run test` and `npm run build` all pass.
   - It has at least one automated test (unit or end-to-end).
   - It works on a phone-sized screen (375px wide) and on desktop.
   - The GitHub Actions CI is green.
7. **At the end of every sprint**, give me:
   - A short list of what was delivered (user-facing, written as "Users can ...").
   - The live URL and exact steps to demo it in class (click this, then this).
   - Anything not finished, and why.
8. Keep a `CLAUDE.md` file at the repo root with: the stack, how to run the project, folder structure,
   and conventions. Update it when they change.
9. Write simple, readable code. Prefer fewer files and fewer libraries. Explain big decisions in one line.

---

## 1. The product

**Vision:** "A world where every community can see its dirty places, come together, and make them clean,
one cleanup at a time." Slogan: *See it. Map it. Clean it. Together.*

**Core loop:** a user reports a dirty spot on a map → someone organizes a cleanup event there →
volunteers join → after the cleanup, they upload an "after" photo → the spot turns "clean" and everyone
sees the before & after.

**Epics (from our Feature Decomposition):**

| Epic | Features |
|---|---|
| My Account & Impact | Log in / log out, Profile page, My impact dashboard, My Events |
| Litter Map | Report a spot, Interactive map, Spot details |
| Community | Groups, Friends & Chat |
| Cleanup Events | Create an event, Join an event, Manage the event, Event Results (before & after) |
| Notifications & Safety | Notifications, Safety |

---

## 2. Tech stack (all free)

| Need | Choice | Free tier notes |
|---|---|---|
| Framework | **Next.js (latest stable, App Router) + TypeScript** | — |
| Styling | **Tailwind CSS v4** with design tokens in `globals.css` (see "Design system" below) | — |
| Icons | **lucide-react** | — |
| Fonts | **Inter** (body) + **Plus Jakarta Sans** (headings) via `next/font` | — |
| Map | **Leaflet + react-leaflet** with **OpenStreetMap** tiles, softened with a CSS filter (`.map-tiles`) | No API key needed. Show the required "© OpenStreetMap contributors" attribution. (CARTO Positron was tried in Sprint 2 but now returns "API KEY REQUIRED" tiles without a CARTO account.) |
| Address lookup | **Nominatim** (OpenStreetMap) reverse geocoding | Max 1 request/second, must send a descriptive User-Agent / Referer. Call it only when the user drops a pin, never in a loop. |
| Database | **Supabase Postgres** | Free project: 500 MB DB. Pauses after ~1 week with no activity (I can un-pause it from the dashboard). |
| Auth | **Supabase Auth** (email + password, with email verification) | Free. |
| Photo storage | **Supabase Storage** | 1 GB free. Compress images in the browser before upload (max ~1280px wide, JPEG/WebP ~0.8 quality). |
| Realtime (chat, notifications) | **Supabase Realtime** | Free. |
| Hosting | **Vercel (Hobby plan)** connected to the GitHub repo | Auto-deploys `main`; preview URL for every PR. |
| Scheduled jobs (event reminders) | **Vercel Cron** | Hobby plan allows cron jobs that run once per day. |
| Code + CI | **GitHub** + **GitHub Actions** | Free for this use. |
| Unit tests | **Vitest + React Testing Library** | — |
| End-to-end tests | **Playwright** (Chromium only, to keep CI fast) | — |

**Supabase client:** use the official `@supabase/supabase-js` and `@supabase/ssr` packages
(server client for Server Components / Route Handlers / Server Actions, browser client for Client Components,
and `src/proxy.ts`, Next 16's renamed middleware, to refresh the session).

**Leaflet + Next.js gotcha:** Leaflet needs `window`, so load the map component with
`next/dynamic(..., { ssr: false })`. Use `L.divIcon` with colored HTML for markers
(this avoids the broken default marker image problem and gives us the "urgency level icons").
Next 16 keeps visited pages alive (hidden) and shows them again; a Leaflet map must only render while its page is
shown (`useShownOnly()` in `src/components/useShownOnly.ts`), otherwise returning to the page crashes it.

**Design system (added in Sprint 2):** clean, modern, friendly "eco" look. Lots of white space, `rounded-2xl`,
soft shadows. Colors are Tailwind theme tokens: `brand` #16a34a, `ink` #0f172a, `surface` #f8fafc; urgency
`low` #22c55e, `medium` #f59e0b, `high` #ef4444, `clean` #3b82f6. Shared buttons/fields/cards live in
`src/components/ui.tsx`. Transitions 150–250ms, disabled under `prefers-reduced-motion`. Light theme only.

---

## 3. Environment variables

`.env.example` (commit this):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CRON_SECRET=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is the **publishable / anon** key from Supabase → Project Settings → API Keys.
- `SUPABASE_SERVICE_ROLE_KEY` (the **secret** key) is only used on the server (cron job). Never import it in client code.
- Add the same variables in Vercel → Project → Settings → Environment Variables.

---

## 4. Folder structure

```
Agile-Methods-Project/
├─ CLAUDE.md
├─ PROMPT.md
├─ .env.example
├─ .github/workflows/ci.yml
├─ supabase/
│  ├─ migrations/          # numbered SQL files: 0001_spots.sql, 0002_profiles.sql, ...
│  └─ seed.sql             # sample data
├─ src/
│  ├─ app/                 # Next.js routes (App Router)
│  │  ├─ page.tsx          # Public landing page
│  │  ├─ map/              # The interactive litter map (public)
│  │  ├─ auth/             # Server actions + /auth/confirm (email link)
│  │  ├─ login/  signup/  profile/  events/  groups/  dashboard/
│  │  └─ api/cron/reminders/route.ts
│  ├─ components/          # UI components (Map, SpotDetails, EventCard, ...)
│  ├─ lib/
│  │  ├─ supabase/         # client.ts, server.ts, middleware.ts (session refresh)
│  │  ├─ map.ts            # tile settings, pin HTML, map math
│  │  ├─ types.ts          # TypeScript types matching the DB
│  │  └─ utils.ts
│  └─ proxy.ts             # Next 16's renamed middleware
└─ tests/
   ├─ unit/
   └─ e2e/
```

---

## 5. Database (Supabase Postgres)

**How migrations are applied (keep it simple):** you write each change as a numbered SQL file in
`supabase/migrations/`. Then **stop and ask me** to paste it into Supabase → SQL Editor → Run.
Wait for me to confirm before continuing. Every table must have **Row Level Security (RLS) enabled**
with explicit policies.

Create the tables **only in the sprint that needs them**, not all at once. Full target schema:

```sql
-- Enums
create type spot_type    as enum ('park', 'beach', 'street', 'river', 'other');
create type urgency      as enum ('low', 'medium', 'high');
create type spot_status  as enum ('dirty', 'planned', 'clean');
create type event_status as enum ('scheduled', 'cancelled', 'completed');

-- Profiles (1 row per auth user, created by a trigger on auth.users insert)
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique not null,
  avatar_url  text,
  home_area   text,
  home_lat    double precision,
  home_lng    double precision,
  created_at  timestamptz not null default now()
);

-- Litter spots
create table spots (
  id               uuid primary key default gen_random_uuid(),
  created_by       uuid references profiles(id) on delete set null,
  title            text not null,
  description      text,
  type             spot_type not null default 'other',
  urgency          urgency not null default 'medium',
  status           spot_status not null default 'dirty',
  lat              double precision not null check (lat between -90 and 90),
  lng              double precision not null check (lng between -180 and 180),
  address          text,
  before_photo_url text,
  after_photo_url  text,
  dangerous_waste  boolean not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- "Confirm spot is still dirty"
create table spot_confirmations (
  spot_id    uuid references spots(id) on delete cascade,
  user_id    uuid references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (spot_id, user_id)
);

-- Cleanup events
create table events (
  id              uuid primary key default gen_random_uuid(),
  spot_id         uuid not null references spots(id) on delete cascade,
  organizer_id    uuid not null references profiles(id) on delete cascade,
  group_id        uuid,                         -- FK added when groups table exists
  title           text not null,
  description     text,
  starts_at       timestamptz not null,
  meeting_point   text not null,
  max_volunteers  int check (max_volunteers > 0),
  supplies        text[] not null default '{}',
  donation_url    text,                         -- external link only, we never process payments
  status          event_status not null default 'scheduled',
  bags_collected  int check (bags_collected >= 0),
  created_at      timestamptz not null default now()
);

create table event_attendees (
  event_id   uuid references events(id) on delete cascade,
  user_id    uuid references profiles(id) on delete cascade,
  joined_at  timestamptz not null default now(),
  primary key (event_id, user_id)
);

-- Community
create table groups (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  owner_id    uuid not null references profiles(id) on delete cascade,
  created_at  timestamptz not null default now()
);
create table group_members (
  group_id  uuid references groups(id) on delete cascade,
  user_id   uuid references profiles(id) on delete cascade,
  role      text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);
create table friendships (
  user_id    uuid references profiles(id) on delete cascade,
  friend_id  uuid references profiles(id) on delete cascade,
  status     text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id),
  check (user_id <> friend_id)
);
create table event_comments (            -- used for both "Comment on events" and "Event chat"
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references events(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

-- Notifications & safety
create table notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  kind       text not null,             -- 'new_spot_near_me' | 'event_reminder' | 'spot_cleaned'
  payload    jsonb not null default '{}',
  read_at    timestamptz,
  created_at timestamptz not null default now()
);
create table content_reports (           -- moderation: report fake/offensive content
  id          uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles(id) on delete cascade,
  target_type text not null check (target_type in ('spot', 'event', 'comment')),
  target_id   uuid not null,
  reason      text not null,
  created_at  timestamptz not null default now()
);
```

**RLS policy pattern:**
- Spots, events, attendees, groups, comments: **anyone can read** (`select` for `anon` and `authenticated`).
- **Insert** only when logged in, and `created_by` / `organizer_id` / `user_id` must equal `auth.uid()`.
- **Update / delete** only by the owner (creator, organizer, group owner).
- Notifications: a user can read/update only their own rows.

**Storage:** bucket `spot-photos` (public read). Upload path `<user_id>/<uuid>.jpg`.
Policy: authenticated users can upload only inside their own `<user_id>/` folder.

**Seed data (`supabase/seed.sql`):** 8–10 sample spots around Carnegie Mellon University, Pittsburgh, PA with a mix of types, urgency levels and statuses, a short description, an address, and a
placeholder photo URL (e.g. `https://picsum.photos/seed/<n>/800/600`).

---

## 6. CI (GitHub Actions)

`.github/workflows/ci.yml` runs on every push and pull request:
`npm ci` → `npm run lint` → `npm run typecheck` → `npm run test` → `npm run build` →
Playwright e2e (install Chromium only). Store Supabase public env vars as GitHub repository secrets
(ask me to add them in GitHub → Settings → Secrets and variables → Actions).

`package.json` scripts must include: `dev`, `build`, `start`, `lint`, `typecheck` (`tsc --noEmit`),
`test` (Vitest), `test:e2e` (Playwright).

---

## 7. Sprints

Each sprint ends with something working on the live URL.

### Sprint 0 — Setup (walking skeleton)
1. Check that `node -v` (≥ 20), `git`, and `gh auth status` work. If not, tell me what to install.
   Run `git remote -v` and make sure `origin` points to
   `https://github.com/SebastianLeonCa/Agile-Methods-Project`. If the folder is not a git repo yet, run
   `git init`, `git remote add origin https://github.com/SebastianLeonCa/Agile-Methods-Project.git`, and
   `git pull origin main` (if the repo already has commits). Show me what you find before changing anything.
2. Create the Next.js app in the current folder:
   `npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm`
   If it refuses because the folder is not empty (README.md, PROMPT.md...), create it in a temporary
   subfolder `_next-tmp`, move its files to the root (keep the existing README.md and PROMPT.md;
   merge `.gitignore`), then delete `_next-tmp`.
3. Install: `@supabase/supabase-js @supabase/ssr leaflet react-leaflet` and dev deps
   `@types/leaflet vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @playwright/test`.
4. Add scripts, Vitest config, Playwright config, `.env.example`, `CLAUDE.md`, and the CI workflow.
5. Replace the default home page with a simple header "CleanUp Map" + slogan. Add one passing unit test.
6. Commit and push to the existing repo (`git push -u origin main`). Do not create a new repo.
7. **Stop and ask me to:**
   - Create a free Supabase project (supabase.com → New project), then give you the Project URL and anon key
     (I will put them in `.env.local` myself, or paste them to you to write there).
   - Sign in to vercel.com with GitHub → "Add New Project" → import `Agile-Methods-Project` → add the env vars → Deploy.
8. Verify the deployed URL loads. **Done when:** live URL shows the header and CI is green.

### Sprint 1 — Litter Map (read-only) ✅ done
Sprint Backlog items (user-facing):
- **Users can see a map of the city** (OpenStreetMap, zoom/pan, attribution, full-width on mobile).
- **Users can see litter spots as pins** loaded from the `spots` table (seeded sample data).
  Pin icon shows urgency: 🟢 low, 🟡 medium, 🔴 high; clean spots show ✅.
- **Users can click a pin to see spot details** in a side panel (desktop) / bottom sheet (mobile):
  photo, title, description, type, urgency, status, street address, date reported.

Steps:
1. Migration `0001_spots.sql`: enums + `spots` table + RLS "anyone can read". Ask me to run it.
2. `supabase/seed.sql` with sample spots. Ask me to run it.
3. `lib/supabase` clients, `lib/types.ts` `Spot` type.
4. `components/LitterMap.tsx` (client, dynamic import, no SSR), `components/SpotDetails.tsx`.
5. Home page fetches spots on the server and passes them to the map.
6. Tests: unit test for the urgency→icon function and for `SpotDetails` rendering;
   Playwright e2e: page loads → pins are visible → click a pin → details panel shows the spot title → close it.
7. Branch, PR, merge, check live URL. Give me the demo steps.

### Sprint 2 — My Account
- **Users can register** with email + password and **verify their email** (Supabase confirmation email;
  set Site URL and redirect URLs in Supabase → Authentication → URL Configuration — ask me to do it, with
  both `http://localhost:3000` and the Vercel URL).
- **Users can log in / log out.** Header shows Log in / Sign up, or avatar + Log out.
- **Users have a profile page** (`/profile`): username, profile photo (upload to Storage), home location
  (pick on a small map or type an area).
- Migration: `profiles` table + trigger that creates a profile on signup + RLS. Storage bucket `spot-photos` + policies.
- Middleware protects `/profile`, `/dashboard`, and any create/edit pages.
- Tests: e2e sign-up form validation, login redirect for protected pages.

**Sprint 2 additions (added by the Product Owner during the sprint) ✅ done:**
- **Landing page at `/`** (public): hero with name, slogan, description, "Explore the map" + "Sign up" and a map
  preview; "How it works" (3 steps); feature cards (Litter Map, Cleanup Events, Before & After, Community, Safety);
  live impact numbers from Supabase (spots reported, spots cleaned); vision statement; "Join your community" call
  to action; footer with map credits.
- **The map moves to `/map`** and stays public. Floating top bar (search/filter placeholders + "Report a spot"),
  floating legend, restyled zoom controls, colored round pins (check icon for clean spots), details card that slides
  in from the right (desktop) or a bottom sheet with a drag handle (mobile); the map pans so the selected pin is not
  hidden behind the panel.
- **Actions need login.** Visitors who try one (e.g. "Report a spot") get a friendly "Log in to report a spot"
  dialog with Log in / Sign up, and come back to where they were (`?next=`).
- **After log in or email confirmation, users land on `/map`.**
- **Header:** logo + "Map" for everyone; Log in / Sign up for visitors; avatar menu (Profile, Log out) for users.
- **Visual redesign of the whole site** with the design system described in section 2.
- **Bug fix:** "This page couldn't load" after logging in or returning to the map (Leaflet map reused after Next
  kept the page alive); covered by an e2e regression test.

### Sprint 3 — Report a spot
- **Users can drop a pin on the map** ("Report a spot" button → click map → draggable marker).
- **The street address fills in automatically** (Nominatim reverse geocoding, debounced, editable).
- **Users can upload a "before" photo** (compressed in browser), choose **type** and **urgency**, add a title + description.
- **Users can confirm a spot is still dirty** (one confirmation per user, shows count).
- **Users can filter the map** by type, urgency and status.
- Only logged-in users can report; anonymous users get a "Log in to report" prompt.
- Tests: form validation unit tests; e2e report flow with a test user (credentials from `.env.local`,
  e.g. `E2E_TEST_EMAIL` / `E2E_TEST_PASSWORD`, which I create manually in Supabase).

### Sprint 4 — Cleanup Events
- **Users can create an event** from a spot's details panel: title, date/time, meeting point,
  max volunteers, supplies list (bags, gloves...), optional donation link. Spot status becomes "planned".
- **Users can join an event** with an "I'm going" button (blocked when full) and **see who's attending**.
- **Organizers can edit or cancel** their event.
- **Users can see events near them** (`/events`, sorted by distance from their home location) and
  **their upcoming events** (My Events).
- Tests: unit test for the "is event full" and distance-sorting logic; e2e create + join.

### Sprint 5 — Before & After + My Impact
- **Organizers can post event results:** upload "after" photo, log bags collected, mark spot as clean
  (spot status → "clean", pin turns ✅, event → "completed").
- **Users can compare before & after** with a drag slider on the spot details.
- **Users can share** the result (Web Share API, fallback: copy link).
- **Users have an impact dashboard** (`/dashboard`): # spots reported, # cleanup events attended,
  # spots cleaned, total bags; **earn badges** (First report, First cleanup, 5 cleanups, 10 cleanups)
  computed from those counts (no extra table needed).

### Sprint 6 — Community
- **Users can create, join, leave, edit and delete groups**; see group members; create group cleanup events.
- **Users can add friends** (send / accept request).
- **Users can comment on events** and use a **live event chat** (Supabase Realtime on `event_comments`).
- Tests: RLS-sensitive actions tested via e2e (non-owner cannot edit a group).

### Sprint 7 — Notifications & Safety
- **In-app notifications** (bell icon with unread count, Supabase Realtime):
  "New spot near me" (within 5 km of home location), "Your reported spot got cleaned!".
- **Event reminder 1 day before:** Vercel Cron (once a day) calls `/api/cron/reminders`, protected by
  `CRON_SECRET`, which uses the service-role key on the server to insert reminder notifications.
- **Safety tips** shown before joining each event (static content).
- **Flag dangerous waste** (needles, chemicals) on a spot: shows a ⚠️ warning on the pin and details.
- **Report fake/offensive content** (writes to `content_reports`).

---

## 8. Start now

Read this whole file, then do **Sprint 0 only**. Before writing code, give me a short plan of the
Sprint 0 steps and list exactly what I will need to do by hand. Then begin.
