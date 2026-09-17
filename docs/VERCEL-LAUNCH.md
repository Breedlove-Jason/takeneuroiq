# TakeNeuroIQ launch

Use the Vite preset, `npm run build`, and `dist` output. SPA rewrites support `/play`, `/arena`, `/profile`, and `/leaderboard`.

Icons use the MIT-licensed `@phosphor-icons/react` package with filled weight, bundled locally. All dependencies come from public npm. No Font Awesome kit, paid packages, registry token, or icon environment variable is needed.

Run `npm ci`, `npm run build`, and `node --test tests/*.test.js` to verify. The original logo and Neuro artwork are preserved.

Product classification: adaptive puzzle platform in The Arcade. Session results describe in-app performance, not a validated IQ measurement. Records live in browser localStorage.

## Accounts and shared practice board

Guest mode needs no environment variables. To activate registration, login, password recovery and the shared leaderboard, complete `docs/ACCOUNTS-SETUP.md`. The UI explicitly shows accounts as opening soon until Supabase is configured.
