# TakeNeuroIQ launch

Use the Vite preset, npm run build, and dist output. SPA rewrites support direct visits to /play, /arena, /profile, and /leaderboard.

Font Awesome Pro and the custom kit require authorized registry access. Keep registry credentials out of deployment files and use a Vercel build environment variable for the token. The existing repository configuration contains a literal credential; rotate it and replace it with an environment-variable reference before sharing the repository.

The source snapshot currently cannot be built in the assistant workspace because GitHub's connector rejects the large private logo.png and neuro.png assets. Preserve these original assets for the deployment.

Existing three test scripts pass. Browser and production build verification remain outstanding. Product classification: adaptive puzzle platform. Session results describe in-app performance, not a validated IQ measurement. Records currently live in browser localStorage.
