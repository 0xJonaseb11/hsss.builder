# HSSS Builder PWA (Next.js)

MVP: registration, dashboard, order management, installable PWA.

## Setup

```bash
cd pwa
cp .env.example .env.local
npm install
```

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.

Apply migrations from `supabase/migrations/` in the Supabase SQL editor.

## Run

```bash
npm run dev
```

Open http://localhost:3000

## Deploy

Deploy the `pwa` directory as a separate Vercel project or set root directory to `pwa` in project settings.

Legacy Vite app remains in the repository root `src/`.
