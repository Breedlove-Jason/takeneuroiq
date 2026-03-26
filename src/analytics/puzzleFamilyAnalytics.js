// src/utils/puzzleFamilyAnalytics.js

const DEFAULT_PUZZLE_TYPE = "pattern_rush";

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function round(value, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function average(values = [], decimals = 1) {
  if (!values.length) return 0;
  const total = values.reduce((sum, value) => sum + toNumber(value), 0);
  return round(total / values.length, decimals);
}

function sum(values = []) {
  return values.reduce((total, value) => total + toNumber(value), 0);
}

function getMode(values = []) {
  if (!values.length) return null;

  const counts = values.reduce((acc, value) => {
    if (!value) return acc;
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});

  let topValue = null;
  let topCount = 0;

  Object.entries(counts).forEach(([value, count]) => {
    if (count > topCount) {
      topValue = value;
      topCount = count;
    }
  });

  return topValue;
}

function normalizePuzzleType(session = {}) {
  return session.puzzleType || DEFAULT_PUZZLE_TYPE;
}

function normalizePuzzleMetrics(session = {}) {
  return session?.puzzleMetrics && typeof session.puzzleMetrics === "object"
    ? session.puzzleMetrics
    : {};
}

function sortNewestFirst(sessions = []) {
  return [...sessions].sort((a, b) => {
    const aTime = new Date(a?.timestamp || 0).getTime();
    const bTime = new Date(b?.timestamp || 0).getTime();
    return bTime - aTime;
  });
}

function getRecentWindow(sessions = [], size = 3) {
  if (!sessions.length || size <= 0) return [];
  const sorted = sortNewestFirst(sessions);
  return sorted.slice(0, size);
}

function averageFromSessions(sessions = [], field) {
  if (!field) return 0;
  const values = sessions.map((session) => toNumber(session?.[field]));
  return average(values, 1);
}

function buildTrendAssessment(sessions = []) {
  const sorted = sortNewestFirst(sessions);
  const recent = getRecentWindow(sorted, 3);

  if (!recent.length) {
    return {
      trendState: 'Unmapped',
      trendReason: 'No recent family sessions available yet.',
    };
  }

  if (recent.length < 2) {
    return {
      trendState: 'Calibrating',
      trendReason:
        'More sessions are needed before a stable family trend can be read.',
    };
  }

  const previous = sorted.slice(recent.length, recent.length + 3);
  const recentAccuracy = averageFromSessions(recent, 'accuracy');
  const recentScore = averageFromSessions(recent, 'score');
  const previousAccuracy = averageFromSessions(previous, 'accuracy');
  const previousScore = averageFromSessions(previous, 'score');
  const accuracyDelta = recentAccuracy - previousAccuracy;
  const scoreDelta = recentScore - previousScore;

  if (
    recentAccuracy >= 85 &&
    (accuracyDelta >= 3 || scoreDelta >= 120)
  ) {
    return {
      trendState: 'Rising',
      trendReason:
        'Recent runs are showing stronger accuracy and cleaner scoring momentum.',
    };
  }

  if (
    recentAccuracy >= 70 &&
    accuracyDelta > -3 &&
    scoreDelta > -120
  ) {
    return {
      trendState: 'Steadying',
      trendReason: 'This family is holding a stable lane with manageable variance.',
    };
  }

  return {
    trendState: 'Rebuilding',
    trendReason:
      'Recent family sessions suggest recovery work is needed before pushing intensity.',
  };
}

function buildBaseSummary(puzzleType, sessions) {
  const sortedSessions = sortNewestFirst(sessions);

  const scores = sortedSessions.map((session) => toNumber(session.score));
  const accuracies = sortedSessions.map((session) =>
    toNumber(session.accuracy),
  );
  const neuralPowerValues = sortedSessions
    .map((session) => session.neuralPower)
    .filter((value) => Number.isFinite(Number(value)))
    .map((value) => Number(value));

  const bestScore = scores.length ? Math.max(...scores) : 0;
  const bestAccuracy = accuracies.length ? Math.max(...accuracies) : 0;
  const latestSession = sortedSessions[0] || null;
  const latestTimestamp = latestSession?.timestamp || null;
  const trend = buildTrendAssessment(sortedSessions);

  return {
    puzzleType,
    sessionsPlayed: sortedSessions.length,
    averageScore: average(scores, 1),
    averageAccuracy: average(accuracies, 1),
    bestScore,
    bestAccuracy: round(bestAccuracy, 1),
    averageNeuralPower: neuralPowerValues.length
      ? average(neuralPowerValues, 1)
      : 0,
    latestTimestamp,
    latestSession,
    sessions: sortedSessions,
    trendState: trend.trendState,
    trendReason: trend.trendReason,
  };
}

function buildPatternRushSummary(sessions = []) {
  const base = buildBaseSummary("pattern_rush", sessions);

  const bestStreaks = sessions.map((session) => toNumber(session.bestStreak));
  const attempted = sessions.map((session) =>
    toNumber(session.puzzlesAttempted),
  );
  const correct = sessions.map((session) => toNumber(session.puzzlesCorrect));

  return {
    ...base,
    familyLabel: "Pattern Rush",
    bestStreak: bestStreaks.length ? Math.max(...bestStreaks) : 0,
    averageBestStreak: average(bestStreaks, 1),
    totalPuzzlesAttempted: sum(attempted),
    totalPuzzlesCorrect: sum(correct),
  };
}

function buildSequenceSprintSummary(sessions = []) {
  const base = buildBaseSummary("sequence_sprint", sessions);

  const sequenceLengths = [];
  const optionCounts = [];
  const ruleTypes = [];

  sessions.forEach((session) => {
    const metrics = normalizePuzzleMetrics(session);

    if (metrics.sequenceLength != null) {
      sequenceLengths.push(toNumber(metrics.sequenceLength));
    }

    if (metrics.optionCount != null) {
      optionCounts.push(toNumber(metrics.optionCount));
    }

    if (metrics.ruleType) {
      ruleTypes.push(metrics.ruleType);
    }
  });

  return {
    ...base,
    familyLabel: "Sequence Sprint",
    averageSequenceLength: average(sequenceLengths, 1),
    maxSequenceLength: sequenceLengths.length
      ? Math.max(...sequenceLengths)
      : 0,
    averageOptionCount: average(optionCounts, 1),
    mostCommonRuleType: getMode(ruleTypes),
    ruleTypeDiversity: [...new Set(ruleTypes)].length,
  };
}

function buildGenericFamilySummary(puzzleType, sessions = []) {
  const base = buildBaseSummary(puzzleType, sessions);

  return {
    ...base,
    familyLabel: puzzleType
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" "),
  };
}

export function groupSessionsByPuzzleType(sessions = []) {
  return sessions.reduce((groups, session) => {
    const puzzleType = normalizePuzzleType(session);

    if (!groups[puzzleType]) {
      groups[puzzleType] = [];
    }

    groups[puzzleType].push(session);
    return groups;
  }, {});
}

export function buildPuzzleFamilyPerformance(sessions = []) {
  const grouped = groupSessionsByPuzzleType(sessions);

  return Object.entries(grouped).reduce((acc, [puzzleType, familySessions]) => {
    if (puzzleType === "pattern_rush") {
      acc[puzzleType] = buildPatternRushSummary(familySessions);
      return acc;
    }

    if (puzzleType === "sequence_sprint") {
      acc[puzzleType] = buildSequenceSprintSummary(familySessions);
      return acc;
    }

    acc[puzzleType] = buildGenericFamilySummary(puzzleType, familySessions);
    return acc;
  }, {});
}

export function buildPuzzleFamilyCards(sessions = []) {
  const performanceMap = buildPuzzleFamilyPerformance(sessions);

  return Object.values(performanceMap).sort((a, b) => {
    return (b.sessionsPlayed || 0) - (a.sessionsPlayed || 0);
  });
}
