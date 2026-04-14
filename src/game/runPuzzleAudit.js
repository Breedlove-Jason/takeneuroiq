/**
 * TakeNeuroIQ Puzzle Audit Runner
 *
 * This script runs the puzzle audit system to validate the integrity,
 * diversity, and structural correctness of all puzzle families.
 *
 * Usage:
 *   node src/game/runPuzzleAudit.js
 */

import { runPuzzleAudit, printPuzzleAuditReport } from './puzzleAudit.js';
import process from 'node:process';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Default Audit: All families, 50 iterations each difficulty (300 puzzles per family)
  families: [
    'pattern_rush',
    'sequence_sprint',
    'rule_shift',
    'grid_recall',
    'logic_gate',
    'signal_path',
    'logic_grid',
    'odd_one_matrix',
  ],
  difficulties: ['easy', 'medium', 'hard'],
  iterationsPerDifficulty: 50,
  duplicateWarningThreshold: 0.15,
};

/**
 * QUICK TOGGLE EXAMPLES:
 *
 * 1. Audit only Logic Grid:
 * families: ['logic_grid'], iterationsPerDifficulty: 100
 *
 * 2. Audit only Pattern Rush:
 * families: ['pattern_rush'], iterationsPerDifficulty: 100
 *
 * 3. Heavier all-family run:
 * families: ['pattern_rush', 'sequence_sprint', 'rule_shift', 'grid_recall', 'logic_gate', 'signal_path', 'logic_grid', 'odd_one_matrix'],
 * iterationsPerDifficulty: 200
 *
 * 4. Audit only Odd One Matrix:
 * families: ['odd_one_matrix'], iterationsPerDifficulty: 100
 */

// ============================================================================
// EXECUTION
// ============================================================================

console.log('--------------------------------------------------');
console.log('🚀 Starting TakeNeuroIQ Puzzle Audit Runner...');
console.log(`📊 Target: ${CONFIG.families.join(', ')}`);
console.log(`🔄 Iterations: ${CONFIG.iterationsPerDifficulty} per difficulty (${CONFIG.difficulties.join(', ')})`);
console.log('--------------------------------------------------\n');

try {
  // Run the audit
  const report = runPuzzleAudit(CONFIG);

  // Print the detailed report to console
  printPuzzleAuditReport(report);

  // Return/Export the report if needed for other scripts
  // export default report;
} catch (error) {
  console.error('❌ Audit Runner Failed:');
  console.error(error);
  process.exit(1);
}
