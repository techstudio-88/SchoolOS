# School Suite

Static School Suite web app with a separate school-account provisioning page.

- `/` — main School Suite app
- `/admin.html` — school account generator protected by a private admin key

The generator creates 25 accounts per school: 10 Class Teachers, 10 Subject Teachers, and one each for Owner, Manager, Principal, Vice Principal, and Fees Counter. Passwords are returned once and are not stored in readable form.

## Supabase setup
1. The school provisioning schema is in `supabase/migrations/20261022_school_provisioning.sql`.
2. The Edge Function is in `supabase/functions/generate-school-accounts/index.ts`. It uses the server-side `SUPABASE_SERVICE_ROLE_KEY`; never expose that key in browser code.
3. Google sign-in requires Google to be enabled in Supabase Auth with valid OAuth credentials and allowed redirect URLs.
4. Add the deployed Vercel domain to Supabase Auth's allowed redirect URLs.
