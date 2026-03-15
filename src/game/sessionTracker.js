import { getPlayerName } from "./playerIdentity";
const STORAGE_KEY = "takeneuroiq_sessions";

function loadSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to load TakeNeuroIQ sessions:", error);
    return [];
  }
}

function saveSessions() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error("Failed to save TakeNeuroIQ sessions:", error);
  }
}

function notifySessionUpdate() {
  window.dispatchEvent(new Event("takeneuroiq:sessions-updated"));
}

const sessions = loadSessions();

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
    return "Neural Surge";
  }

  if (score >= 900 && solveRate >= 85 && bestStreak >= 7) {
    return "Elite Run";
  }

  if (score >= 600 && solveRate >= 75 && bestStreak >= 4) {
    return "Focused Run";
  }

  return "Novice Run";
}

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
    return "Expert Mode";
  }

  if (score >= 900 || (solveRate >= 85 && bestStreak >= 7)) {
    return "Pressure Mode";
  }

  if (score >= 600 || (solveRate >= 75 && bestStreak >= 4)) {
    return "Focus Mode";
  }

  return "Adaptive";
}
function calculateNeuralPower(session) {
  const score = session.score ?? 0;
  const streak = session.bestStreak ?? session.streak ?? 0;

  const attempted = session.puzzlesAttempted ?? session.puzzlesSeen ?? 0;

  const correct = session.puzzlesCorrect ?? session.correctAnswers ?? 0;

  const accuracy =
    attempted > 0 ? correct / attempted : (session.accuracy ?? 0) / 100;

  const accuracyScore = accuracy * 500;
  const streakScore = streak * 40;

  return Math.round(score + accuracyScore + streakScore);
}

export function recordSession(session) {
  const normalizedSession = {
    id: crypto.randomUUID(),
    mode: session.mode || "Pattern Rush",
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

export function getSessions() {
  return sessions;
}
export function clearSessions() {
  sessions.length = 0;

  try {
    localStorage.removeItem(STORAGE_KEY);
    notifySessionUpdate();
  } catch (error) {
    console.error("Failed to clear TakeNeuroIQ sessions:", error);
  }
}

export function getLeaderboardData(sourceSessions = sessions) {
  return [...sourceSessions]
    .sort(
      (a, b) =>
        (b.neuralPower ?? calculateNeuralPower(b)) -
        (a.neuralPower ?? calculateNeuralPower(a)),
    )
    .slice(0, 5)
    .map((session, index) => ({
      rank: index + 1,
      name: session.name || `Player ${index + 1}`,
      score: session.score ?? 0,
      accuracy: `${session.accuracy ?? 0}%`,
      streak: session.bestStreak ?? session.streak ?? 0,
      label: session.label ?? "Run",
      difficultyBucket: session.difficultyBucket ?? "Adaptive",
      neuralPower: session.neuralPower ?? calculateNeuralPower(session),
      puzzlesAttempted: session.puzzlesAttempted ?? session.puzzlesSeen ?? 0,
      puzzlesCorrect: session.puzzlesCorrect ?? session.correctAnswers ?? 0,
    }));
}
