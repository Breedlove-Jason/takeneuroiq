# TakeNeuroIQ

TakeNeuroIQ is a React + Vite cognitive game experience focused on fast, adaptive puzzle play, session tracking, and analytics-driven progression.

## Project Structure

```text
takeneuroiq/
├── AGENTS.md
├── README.md
├── TakeNeuroIQ-Founder- Brief.pdf
├── business-strategy.txt
├── dist/
│   ├── assets/
│   │   ├── index-B1AcRwjc.css
│   │   ├── index-B4ILUv9d.js
│   │   └── logo-B7RVZxgK.png
│   └── index.html
├── eslint.config.js
├── index.html
├── node_modules/
├── package-lock.json
├── package.json
├── postcss.config.js
├── project-hierarchy.txt
├── public/
├── src/
│   ├── App.jsx
│   ├── index.css
│   ├── main.jsx
│   ├── analytics/
│   │   ├── adaptiveDifficulty.js
│   │   ├── coachingEngine.js
│   │   ├── cognitiveIdentity.js
│   │   ├── cognitiveIdentitySummary.js
│   │   ├── cognitiveTracks.js
│   │   ├── liveAdaptiveDifficulty.js
│   │   ├── puzzleFamilyAnalytics.js
│   │   ├── sessionAnalytics.js
│   │   └── sessionOutcomeEvaluator.js
│   ├── assets/
│   │   └── logo.png
│   ├── components/
│   │   ├── FeatureHighlights.jsx
│   │   ├── Hero.jsx
│   │   ├── HowItWorks.jsx
│   │   ├── ProfileAnalytics.jsx
│   │   ├── PuzzleShape.jsx
│   │   └── SequenceSprintPuzzle.jsx
│   ├── game/
│   │   ├── patternPuzzles.js
│   │   ├── playerIdentity.js
│   │   ├── puzzleEngine.js
│   │   ├── puzzleGenerator.js
│   │   ├── sequenceSprintPuzzles.js
│   │   └── sessionTracker.js
│   ├── hooks/
│   │   └── useSessionData.js
│   ├── layout/
│   │   └── Header.jsx
│   ├── pages/
│   │   ├── Arena.jsx
│   │   ├── Home.jsx
│   │   ├── LeaderboardPage.jsx
│   │   ├── Play.jsx
│   │   └── ProfilePage.jsx
│   └── utils/
│       ├── puzzleTypeRegistry.js
│       └── sessionTrendUtils.js
├── tests/
│   ├── sessionTracker.test.js
│   ├── verify_logic.js
│   └── verify_session_data.test.js
├── vite.config.js
└── .idea/
	└── ...
```

## Key Areas

- `src/pages/Arena.jsx` — main game play experience
- `src/game/puzzleEngine.js` — puzzle selection and answer checking
- `src/game/sessionTracker.js` — session persistence and leaderboard calculations
- `src/analytics/` — scoring, identity, and session analysis helpers
- `tests/` — validation scripts for core game and session behavior

## Development

```bash
npm install
npm run dev
```
