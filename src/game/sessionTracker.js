/**
 * Manages player session tracking, persistence, and leaderboard calculations.
 *
 * This module handles:
 * - Loading and saving sessions from localStorage.
 * - Calculating Neural Power (a composite performance score).
 * - Categorizing sessions into difficulty buckets.
 * - Generating leaderboard rankings based on top performance.
 */
import {getPlayerName} from './playerIdentity.js';

const STORAGE_KEY = 'takeneuroiq_sessions';

/**
 * Loads session data from browser local storage.
 * 
 * @returns {Array} List of previously recorded session objects.
 */
function loadSessions() {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(s => s && typeof s === 'object') : [];
  } catch (error) {
    console.error('Failed to load TakeNeuroIQ sessions:', error);
    return [];
  }
}

/**
 * Persists current sessions array to local storage.
 */
function saveSessions() {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('Failed to save TakeNeuroIQ sessions:', error);
  }
}

/**
 * Dispatches a custom event when session data is updated to notify
 * other application components (e.g., analytics).
 */
function notifySessionUpdate() {
  window.dispatchEvent(new Event('takeneuroiq:sessions-updated'));
}

const sessions = loadSessions();

/**
 * Determines a human-readable performance label for a given session.
 * 
 * Labels range from 'Novice Run' to 'Neural Surge' based on score, 
 * accuracy (solve rate), and best streak.
 * 
 * @param {Object} session - The session to label.
 * @returns {string} The display label for the session.
 */
function getSessionLabel(session) {
  const score = session.score ?? 0;
  const bestStreak = session.bestStreak ?? session.streak ?? 0;

  const puzzlesAttempted = session.puzzlesAttempted ?? session.puzzlesSeen ?? 0;
  const puzzlesCorrect = session.puzzlesCorrect ?? session.correctAnswers ?? 0;

  const solveRate =
    puzzlesAttempted > 0
      ? Math.round((puzzlesCorrect / puzzlesAttempted) * 100)
      : (session.accuracy ?? 0);

  if (score >= 1200 && solveRate >= 90 && bestStreak >= 10) {
    return 'Neural Surge';
  }

  if (score >= 900 && solveRate >= 85 && bestStreak >= 7) {
    return 'Elite Run';
  }

  if (score >= 600 && solveRate >= 75 && bestStreak >= 4) {
    return 'Focused Run';
  }

  return 'Novice Run';
}

/**
 * Categorizes the difficulty level achieved during a session based on 
 * performance metrics like score, solve rate, and best streak.
 * 
 * @param {Object} session - The session to bucket.
 * @returns {string} The name of the difficulty bucket (e.g., 'Focus Mode', 'Expert Mode').
 */
function getDifficultyBucket(session) {
  const score = session.score ?? 0;
  const bestStreak = session.bestStreak ?? session.streak ?? 0;

  const puzzlesAttempted = session.puzzlesAttempted ?? session.puzzlesSeen ?? 0;
  const puzzlesCorrect = session.puzzlesCorrect ?? session.correctAnswers ?? 0;

  const solveRate =
    puzzlesAttempted > 0
      ? Math.round((puzzlesCorrect / puzzlesAttempted) * 100)
      : (session.accuracy ?? 0);

  if (score >= 1200 || (solveRate >= 90 && bestStreak >= 10)) {
    return 'Expert Mode';
  }

  if (score >= 900 || (solveRate >= 85 && bestStreak >= 7)) {
    return 'Pressure Mode';
  }

  if (score >= 600 || (solveRate >= 75 && bestStreak >= 4)) {
    return 'Focus Mode';
  }

  return 'Adaptive';
}
/**
 * Calculates a composite score called 'Neural Power' for a given session.
 * 
 * Neural Power is derived from:
 * - Base game score
 * - Accuracy percentage (solve rate)
 * - Best streak length
 * - Reliability factor: adjusts for sample size (requires ~10 puzzles for full confidence)
 * 
 * @param {Object} session - The session metrics to process.
 * @returns {number} The calculated Neural Power (rounded integer).
 */
function calculateNeuralPower(session) {
  if (!session) return 0;
  
  const score = Number(session.score ?? 0) || 0;
  const streak = Number(session.bestStreak ?? session.streak ?? 0) || 0;

  const attempted = Number(session.puzzlesAttempted ?? session.puzzlesSeen ?? 0) || 0;
  const correct = Number(session.puzzlesCorrect ?? session.correctAnswers ?? 0) || 0;

  const accuracy =
    attempted > 0 ? (correct / attempted) : (Number(session.accuracy ?? 0) || 0) / 100;

  const accuracyScore = accuracy * 500;

  // Reliability factor so tiny sample sizes don't inflate scores
  const reliability = Math.min(attempted / 10, 1);
  // full confidence after ~10 puzzles

  const adjustedAccuracyScore = accuracyScore * reliability;
  const streakScore = streak * 40;
  
  const power = Math.round(score + adjustedAccuracyScore + streakScore);
  return Number.isFinite(power) ? power : 0;
}

/**
 * Normalizes and records a new session into the persistent data store.
 * 
 * This adds unique IDs, timestamps, and calculates derived metrics like 
 * Neural Power before saving and notifying the rest of the app.
 * 
 * @param {Object} session - The raw session data from the game run.
 */
export function recordSession(session) {
  const normalizedSession = {
    id: crypto.randomUUID(),
    mode: session.mode || 'Pattern Rush',
    timestamp: session.timestamp || new Date().toISOString(),
    name: session.name || getPlayerName(),
    score: session.score ?? 0,
    accuracy: session.accuracy ?? 0,
    streak: session.streak ?? 0,
    bestStreak: session.bestStreak ?? session.streak ?? 0,
    puzzlesAttempted: session.puzzlesAttempted ?? 0,
    difficultyBucket: session.difficultyBucket || getDifficultyBucket(session),
    neuralPower: calculateNeuralPower(session),
    ...session,
    puzzlesCorrect: session.puzzlesCorrect ?? 0,
    label: session.label || getSessionLabel(session),
  };

  sessions.push(normalizedSession);
  notifySessionUpdate();
  saveSessions();
}

/**
 * Retrieves the current list of recorded sessions.
 * 
 * @returns {Array} All recorded session objects.
 */
export function getSessions() {
  return sessions;
}
/**
 * Clears all recorded sessions from memory and local storage.
 */
export function clearSessions() {
  sessions.length = 0;

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    notifySessionUpdate();
  } catch (error) {
    console.error('Failed to clear TakeNeuroIQ sessions:', error);
  }
}

function getPower(s) {
  const p = Number(s?.neuralPower);
  if (Number.isFinite(p)) return p;
  return calculateNeuralPower(s);
}

/**
 * Processes a list of sessions to generate leaderboard data.
 * 
 * Groups sessions by player name and selects the best run (highest Neural Power) 
 * for each. Returns the top 5 players sorted by performance.
 * 
 * @param {Array} sourceSessions - Optional list of sessions; defaults to tracked ones.
 * @returns {Array} Top 5 sessions with rank, name, and normalized metrics.
 */
export function getLeaderboardSessions(sourceSessions = sessions) {
  const bestRunsByPlayer = Object.values(
    sourceSessions.reduce((acc, session) => {
      if (!session) return acc;
      const playerName = session.name || 'Arena Runner';
      const existing = acc[playerName];

      const sessionPower =
        session.neuralPower ?? calculateNeuralPower(session);

      const existingPower = existing
        ? existing.neuralPower ?? calculateNeuralPower(existing)
        : -1;

      if (!existing || sessionPower > existingPower) {
        acc[playerName] = session;
      }

      return acc;
    }, {}),
  );

  return bestRunsByPlayer
    .sort((a, b) => getPower(b) - getPower(a))
    .slice(0, 5)
    .map((session, index) => ({
      ...session,
      rank: index + 1,
      name: session.name || `Player ${index + 1}`,
      score: session.score ?? 0,
      accuracy: session.accuracy ?? 0,
      streak: session.bestStreak ?? session.streak ?? 0,
      label: session.label ?? 'Run',
      difficultyBucket: session.difficultyBucket ?? 'Adaptive',
      neuralPower: getPower(session),
      puzzlesAttempted: session.puzzlesAttempted ?? session.puzzlesSeen ?? 0,
      puzzlesCorrect: session.puzzlesCorrect ?? session.correctAnswers ?? 0,
    }));
}
