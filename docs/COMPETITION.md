# NeuroIQ competition

## Delivered modes

- **Ranked duel:** match two signed-in people, initially within 300 rating points; widen after 60 seconds. Eight identical questions, 30 seconds each, five-minute total window. Elo K=32, starting rating 1000. Only the first three ranked meetings with a given opponent in 24 hours change rating.
- **Friend challenge:** 12-character invite code and shareable `/compete?code=...` link. Same duel rules, persistent results and XP, no rating change.
- **Daily challenge:** ten server-generated questions shared by everyone on the UTC date, one attempt per account, six-minute match limit.
- **Rankings:** opt-in global Elo, weekly XP from Monday 00:00 UTC, and the current daily challenge. Practice scores remain on their separately labeled board.
- **Progress:** saved results, answer explanations, correct-answer statistics, XP levels, rating divisions, six earned milestones, and consecutive completed daily attempts.

Competitive puzzles currently cover number sequences, rule transfer, deduction, spatial coordinates, quantitative reasoning and ordered operations. Twelve existing training puzzle families remain independent. Scores are game performance, not clinical IQ estimates.

## Server authority and privacy

Apply migrations in filename order after the existing account migration. The `neuro_private` schema is inaccessible to `anon` and `authenticated`. RPCs identify the player with `auth.uid()`; no client-supplied player ID, score, rating or timestamp is accepted. A player cannot fetch another player's match. Opponent display names are masked unless public visibility is enabled.

Question keys and explanations remain private until the answer is accepted. Fetching state does not open the next question unless `reveal_next=true`. A correct answer before the 30-second deadline earns 100 plus up to 50 speed points, measured by database time. Wrong/skipped/late answers earn zero. Review time still consumes the total match window.

Match-row locks serialize answers and settlement. Repeated submissions for an accepted question return state without awarding again. Rating-row locks are ordered; settlement can execute only once. Queue matching is serialized, and an account can only have one open competition. New hosted matches are limited to 30 per hour. Expired matches settle on a participant's next state/dashboard request. Empty queues never create fake opponents.

Elo, correctness and XP cannot be changed by client-side score editing. This is not a claim of comprehensive anti-cheat: outside assistance, multiple accounts, collusion and shared daily answers still require moderation and further controls before high-stakes competition. This release has no entry fees or prizes.

## Email integration

Auth is provided by Supabase; Vercel serves the client. The existing SendGrid key is used as the **SMTP password in Supabase**, not as a VITE variable. Settings: host `smtp.sendgrid.net`, port `587`, username literal `apikey`, sender `noreply@neuroiq.jasonbreedlove.dev`, name `NeuroIQ`. Domain authentication must be verified in SendGrid. Keep the key out of source, chat, and browser bundles.

Production origin: `https://neuroiq.jasonbreedlove.dev`. Exact auth redirects: `/login` and `/reset-password`. Vercel requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Production.

## Verification

`npm test` runs existing training/account tests and an isolated PostgreSQL-compatible competition test covering match access, hidden answer keys, invalid/out-of-order answers, duplicate requests, elapsed timers, delayed next-question clocks, friend and ranked settlement, daily limits, opt-in rankings and anonymous permissions. `npm run build` verifies the production client. Run lint on changed source files.

Before inviting players, complete a real registration/confirmation/reset email test, then a two-account browser duel including reconnect and match review. Backend tests do not prove email delivery or the complete two-browser flow.

## Remaining roadmap

Team competitions, brackets/tournaments, friends lists, moderation/reporting tools, broader competitive puzzle families, advanced bot/collusion detection and accessibility alternatives for timed modes are future increments. They are not represented as completed features in this release.
