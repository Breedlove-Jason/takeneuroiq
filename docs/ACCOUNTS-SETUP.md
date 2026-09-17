# Activate NeuroIQ accounts

The app works in guest mode without a backend. Login, registration, password recovery,
private account preferences and the community board require a Supabase project.

1. Create a Supabase project and apply `supabase/migrations/202609180001_accounts_and_scores.sql` in its SQL editor (once).
2. Enable email/password authentication and email confirmation. Configure production SMTP for real registration/reset emails; the default development mail service is limited.
3. Set the Auth Site URL to the production NeuroIQ origin. Allow exact redirects to `/login` and `/reset-password` on that origin. Add localhost equivalents only for development. Use the same browser for PKCE email confirmation/reset links.
4. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Vercel Production (and a separate test project for Preview), then rebuild. Use the public publishable/anon key, never a service-role secret.
5. Smoke-test registration with confirmation, login, refresh, logout, forgotten/updated password, profile edits, an opt-in board entry and opt-out removal.

## Privacy and trust model

Supabase manages passwords and sessions. RLS restricts profiles and score records to their owner.
New profiles default to private. A narrowly scoped SQL function returns only consenting players'
display names and best practice scores. Emails are never returned by the leaderboard.
Timestamps come from the database. Duplicate run UUIDs are ignored when retrying a failed upload.
The board is explicitly for casual practice: browser-calculated scores can be modified by a
player. Do not use it for prizes or verified competitive ranking without server-authoritative games.

Detailed analytics remain device-local and scoped by account ID; guest history is separate.
Only new signed-in completed runs are submitted. A failed upload retains the local result and
shows a retry action while the page remains open. No guest history is silently uploaded.
Changing account mid-run prevents that run from being assigned to another account.

## Release checks

Run `npm ci`, `npm run build`, and `node --test tests/*.test.js`.
The test suite runs the migration in disposable PGlite PostgreSQL to verify RLS and leaderboard privacy.
Test callback deep links after deployment. Unconfigured builds explicitly show accounts/community
as unavailable rather than simulating account creation in localStorage.
