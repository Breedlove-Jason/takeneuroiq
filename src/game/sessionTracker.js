const sessions = [];

export function recordSession(session) {
  sessions.push(session);
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
