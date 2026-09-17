export const TRAINING_CHALLENGES = [
  ['pattern_rush', '#22d3ee'], ['rule_shift', '#fb923c'],
  ['sequence_sprint', '#c084fc'], ['grid_recall', '#a3e635'],
  ['logic_grid', '#fb7185'], ['signal_path', '#60a5fa'],
  ['spatial_rotation', '#facc15'], ['memory_chain', '#e879f9'],
  ['symbol_recall', '#34d399'], ['logic_gate', '#ff7e67'],
  ['odd_one_matrix', '#a5b4fc'], ['number_weave', '#f0abfc'],
].map(([type, color]) => ({ type, color }));

// Use local calendar dates, so midnight and daylight-saving changes do not
// move a player's sessions onto the wrong day.
function dayKey(date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function buildTrainingSummary(sessions, now = new Date()) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6 + index);
    return {
      key: dayKey(date),
      label: date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }),
      shortLabel: date.toLocaleDateString(undefined, { weekday: 'short' }),
      count: 0,
    };
  });
  const challenges = TRAINING_CHALLENGES.map((challenge) => ({ ...challenge, runs: 0, best: 0 }));
  for (const session of sessions) {
    const date = new Date(session.timestamp);
    if (session.timestamp && Number.isFinite(date.getTime()) && date <= now) {
      const day = days.find((item) => item.key === dayKey(date));
      if (day) day.count += 1;
    }
    const challenge = challenges.find((item) => item.type === (session.puzzleType ?? 'pattern_rush'));
    if (challenge) {
      challenge.runs += 1;
      const score = Number(session.score);
      if (Number.isFinite(score)) challenge.best = Math.max(challenge.best, score);
    }
  }
  return {
    days, challenges,
    todayRuns: days[6].count,
    weekRuns: days.reduce((total, day) => total + day.count, 0),
    activeDays: days.filter((day) => day.count > 0).length,
    maxDailyRuns: Math.max(1, ...days.map((day) => day.count)),
    explored: challenges.filter((challenge) => challenge.runs > 0).length,
  };
}
