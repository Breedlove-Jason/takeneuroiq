import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTrainingSummary } from '../src/game/trainingSummary.js';
const now = new Date(2026, 8, 17, 12);

test('new players see an honest empty week and twelve unexplored arenas', () => {
  const result = buildTrainingSummary([], now);
  assert.equal(result.weekRuns, 0);
  assert.equal(result.explored, 0);
  assert.equal(result.challenges.length, 12);
  assert.equal(result.maxDailyRuns, 1);
});

test('activity uses the local seven-day window while passport retains older records', () => {
  const result = buildTrainingSummary([
    { timestamp: new Date(2026, 8, 17, 0, 1).toISOString(), puzzleType: 'grid_recall', score: 15 },
    { timestamp: new Date(2026, 8, 16, 23, 59).toISOString(), puzzleType: 'grid_recall', score: 25 },
    { timestamp: new Date(2026, 8, 11, 0).toISOString(), puzzleType: 'rule_shift', score: 40 },
    { timestamp: new Date(2026, 8, 10, 23, 59).toISOString(), puzzleType: 'logic_gate', score: 90 },
    { timestamp: 'invalid', puzzleType: 'grid_recall', score: 'bad' },
  ], now);
  assert.equal(result.todayRuns, 1);
  assert.equal(result.weekRuns, 3);
  assert.equal(result.activeDays, 3);
  assert.equal(result.explored, 3);
  assert.equal(result.challenges.find((c) => c.type === 'grid_recall').best, 25);
  assert.equal(result.challenges.find((c) => c.type === 'logic_gate').best, 90);
});

test('separate histories and resets never carry over progress', () => {
  const sessions = [{ timestamp: now.toISOString(), puzzleType: 'pattern_rush', score: 10 }];
  assert.equal(buildTrainingSummary(sessions, now).explored, 1);
  assert.equal(buildTrainingSummary([], now).explored, 0);
  assert.equal(buildTrainingSummary(sessions, now).challenges[0].runs, 1);
});
