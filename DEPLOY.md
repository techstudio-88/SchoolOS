# SchoolOS — Supabase + Vercel setup

## 1. Supabase (database)
1. Create a project at supabase.com. Save the database password.
2. Open **SQL Editor → New query**, paste the whole of `supabase/schema.sql`, click **Run**.
   (This creates every table and turns on Row-Level Security so the public API keys cannot read your data.)
3. Open **Project Settings → Database → Connection string → Transaction pooler** (port **6543**).
   Copy it and put your password in. This is your `DATABASE_URL`.

> The app talks to Supabase as plain Postgres through Drizzle ORM, so you do NOT need
> `@supabase/supabase-js` or the anon key for this version.

## 2. Vercel (hosting)
1. Push this project to GitHub and **Import** it in Vercel (framework: Next.js, nothing to change).
2. Add **Environment Variables** (Production + Preview):
   | Name | Value |
   |------|-------|
   | `DATABASE_URL` | the Supabase transaction-pooler string from step 1.3 |
   | `SUPER_ADMIN_KEY` | a long random secret — this unlocks your hidden console |
3. Deploy. Verify `https://YOUR-APP.vercel.app/api/health` returns `{"ok":true}`.

## 3. Your hidden admin console
- URL: `/sa-console` (not linked anywhere, not in robots.txt, `noindex`).
- Unlock with `SUPER_ADMIN_KEY`. School owners can never open it — without your key it only shows a lock screen.
- To make the path even harder to guess, rename the folder `src/app/sa-console` to something private.
- Powers: add / pause / delete schools, change plans, broadcast notices to every school, open any school as owner (support mode), audit log.

## 4. Local development
```
cp .env.example .env     # fill in values
npx drizzle-kit push     # create tables in your local/Supabase database
npm run dev
```

## 5. Before real customers
Login is currently **skippable demo mode** (cookie based, no passwords verified).
Before onboarding real schools, add real authentication (Supabase Auth or Auth.js) and sign the session cookie.
