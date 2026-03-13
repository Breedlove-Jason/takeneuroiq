const STORAGE_KEY = 'takeneuroiq_sessions';

function loadSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to load TakeNeuroIQ sessions:', error);
    return [];
  }
}

function saveSessions() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch (error) {
    console.error('Failed to save TakeNeuroIQ sessions:', error);
  }
}

const sessions = loadSessions();

function getSessionLabel(session) {
  const score = session.score ?? 0;
  const accuracy = session.accuracy ?? 0;
  const bestStreak = session.bestStreak ?? session.streak ?? 0;

  if (score >= 1000 && accuracy >= 90 && bestStreak >= 10) {
    return 'Elite Run';
  }

  if (score >= 700 && accuracy >= 80 && bestStreak >= 6) {
    return 'Strong Run';
  }

  if (score >= 400 && accuracy >= 70) {
    return 'Stable Run';
  }

  return 'Training Run';
}

export function recordSession(session) {
  const normalizedSession = {
    id: crypto.randomUUID(),
    mode: session.mode || 'Pattern Rush',
    timestamp: session.timestamp || new Date().toISOString(),
    name: session.name || 'Arena Runner',
    score: session.score ?? 0,
    accuracy: session.accuracy ?? 0,
    streak: session.streak ?? 0,
    bestStreak: session.bestStreak ?? session.streak ?? 0,
    ...session,
  };

  normalizedSession.label = getSessionLabel(normalizedSession);

  sessions.push(normalizedSession);
  saveSessions();
}

export function getSessions() {
  return sessions;
}
export function clearSessions() {
  sessions.length = 0;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear TakeNeuroIQ sessions:', error);
  }
}
export function getLeaderboardSessions() {
  return [...sessions]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((session, index) => ({
      rank: index + 1,
      name: session.name || `Player ${index + 1}`,
      score: session.score ?? 0,
      accuracy: `${session.accuracy ?? 0}%`,
      streak: session.bestStreak ?? session.streak ?? 0,
    }));
}
