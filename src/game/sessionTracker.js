const sessions = [];

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

  sessions.push(normalizedSession);
}

export function getSessions() {
  return sessions;
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
