# TakeNeuroIQ launch

Use the Vite preset, `npm run build`, and `dist` output. SPA rewrites support direct visits to `/play`, `/arena`, `/profile`, and `/leaderboard`.

Font Awesome Pro and the custom kit require authorized registry access. Set `FONTAWESOME_PACKAGE_TOKEN` in the build environment; `.npmrc` reads this variable. Rotate the previously committed token, which remains in Git history. Never commit its replacement.

The original logo and Neuro artwork were restored from the owner's repository ZIP. The production Vite build and all three existing test scripts pass. Browser verification is tracked separately from these checks.

A compiled static deployment does not need the registry token at runtime. Git-based deployments do need it during dependency installation.

Product classification: adaptive puzzle platform in The Arcade. Session results describe in-app performance, not a validated IQ measurement. Records currently live in browser localStorage.
