export function rankLocalSessions(sessions, family, since = 0) {
  const best = new Map();
  for (const session of sessions) {
    const time = new Date(session.timestamp).getTime();
    if (
      (session.puzzleType || "pattern_rush") !== family ||
      !Number.isFinite(time) ||
      time < since
    )
      continue;
    const row = {
      id: session.id,
      display_name: session.name || "Arena Runner",
      score: Number(session.score) || 0,
      accuracy: session.puzzlesAttempted
        ? Math.round((100 * session.puzzlesCorrect) / session.puzzlesAttempted)
        : Number.parseInt(session.accuracy, 10) || 0,
      streak: Number(session.bestStreak || session.streak) || 0,
      played_at: session.timestamp,
    };
    const old = best.get(row.display_name);
    if (
      !old ||
      row.score > old.score ||
      (row.score === old.score && row.accuracy > old.accuracy)
    )
      best.set(row.display_name, row);
  }
  return [...best.values()]
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.accuracy - a.accuracy ||
        new Date(a.played_at) - new Date(b.played_at),
    )
    .slice(0, 100);
}
