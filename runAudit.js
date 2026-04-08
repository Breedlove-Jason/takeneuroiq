// Temporary script to run puzzle audit
// Run with: node runAudit.js

import { runPuzzleAudit, printPuzzleAuditReport } from './src/game/puzzleAudit.js';

console.log('Starting TakeNeuroIQ Puzzle Audit...\n');

// Run full audit
const report = runPuzzleAudit();
printPuzzleAuditReport(report);

// Optionally run targeted audits
// const logicGridReport = runPuzzleAudit({
//   families: ['logic_grid'],
//   iterationsPerDifficulty: 100
// });
// printPuzzleAuditReport(logicGridReport);
