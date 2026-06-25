# HSSS Builder

![HSSS builder Dash](./assets/Screenshot%202026-06-26%20at%2000.12.32.png)
Mobile-first PWA for HSSS builders to register, quote shower screens, submit orders, and contact the team.

**Stack:** Next.js 15, React, TypeScript, Tailwind, Supabase, Serwist (PWA)

## Setup

```bash
npm install
cp .env.example .env.local
```

Set in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL` (e.g. `http://localhost:3000`)

Apply SQL migrations from `supabase/migrations/` in the Supabase SQL editor, or run:

```bash
SUPABASE_DB_URL=... npm run db:migrate
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Apply migrations (needs `SUPABASE_DB_URL`) |

## Deploy

Deploy as a **Next.js** app on Vercel (project root `.`). Set the same env vars and add your production URL to Supabase auth redirect URLs (`/auth/callback`).
