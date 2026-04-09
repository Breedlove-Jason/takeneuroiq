// src/utils/puzzleFamilyAnalytics.js

const DEFAULT_PUZZLE_TYPE = "pattern_rush";

const PUZZLE_FAMILY_METADATA = {
  pattern_rush: {
    label: "Pattern Rush",
    shortLabel: "Pattern",
    accent: "cyan",
    icon: "spark",
  },
  sequence_sprint: {
    label: "Sequence Sprint",
    shortLabel: "Sequence",
    accent: "violet",
    icon: "waveform",
  },
  rule_shift: {
    label: "Rule Shift",
    shortLabel: "Shift",
    accent: "magenta",
    icon: "layer-group",
  },
  grid_recall: {
    label: "Grid Recall",
    shortLabel: "Recall",
    accent: "emerald",
    icon: "grid",
  },
  logic_gate: {
    label: "Logic Gate",
    shortLabel: "Logic",
    accent: "amber",
    icon: "logic_gate",
  },
  logic_grid: {
    label: "Logic Grid",
    shortLabel: "Grid",
    accent: "cyan",
    icon: "grid",
  },
  signal_path: {
    label: "Signal Path",
    shortLabel: "Signal",
    accent: "lime",
    icon: "signal_path",
  },
};

const PUZZLE_FAMILY_DISPLAY_ORDER = [
  "pattern_rush",
  "sequence_sprint",
  "rule_shift",
  "grid_recall",
  "logic_grid",
  "logic_gate",
  "signal_path",
];

const ACTIVE_PUZZLE_FAMILIES = Object.keys(PUZZLE_FAMILY_METADATA);

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
      trendState: "Unmapped",
      trendReason: "No recent family sessions available yet.",
    };
  }

  if (recent.length < 2) {
    return {
      trendState: "Calibrating",
      trendReason:
        "More sessions are needed before a stable family trend can be read.",
    };
  }

  const previous = sorted.slice(recent.length, recent.length + 3);
  const recentAccuracy = averageFromSessions(recent, "accuracy");
  const recentScore = averageFromSessions(recent, "score");
  const previousAccuracy = averageFromSessions(previous, "accuracy");
  const previousScore = averageFromSessions(previous, "score");
  const accuracyDelta = recentAccuracy - previousAccuracy;
  const scoreDelta = recentScore - previousScore;

  if (recentAccuracy >= 85 && (accuracyDelta >= 3 || scoreDelta >= 120)) {
    return {
      trendState: "Rising",
      trendReason:
        "Recent runs are showing stronger accuracy and cleaner scoring momentum.",
    };
  }

  if (recentAccuracy >= 70 && accuracyDelta > -3 && scoreDelta > -120) {
    return {
      trendState: "Steadying",
      trendReason:
        "This family is holding a stable lane with manageable variance.",
    };
  }

  return {
    trendState: "Rebuilding",
    trendReason:
      "Recent family sessions suggest recovery work is needed before pushing intensity.",
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

function buildRuleShiftSummary(sessions = []) {
  const base = buildBaseSummary("rule_shift", sessions);

  const sequenceLengths = [];
  const shiftIndices = [];
  const ruleAs = [];
  const ruleBs = [];
  const trendReasonByState = {
    Rising:
      "Arithmetic transition tracking is sharpening. The rule switch is staying cleaner across recent runs.",
    Steadying:
      "Rule switching is holding steady. Keep reinforcing the handoff between the two sequence rules.",
    Rebuilding:
      "Rehearse the transition point and shorten adaptive sequences before pushing intensity again.",
  };

  sessions.forEach((session) => {
    const metrics = normalizePuzzleMetrics(session);

    if (metrics.sequenceLength != null) {
      sequenceLengths.push(toNumber(metrics.sequenceLength));
    }

    const shiftIndex = metrics.shiftIndex ?? metrics.shiftPoint;
    if (shiftIndex != null) {
      shiftIndices.push(toNumber(shiftIndex));
    }

    if (metrics.ruleA) {
      ruleAs.push(metrics.ruleA);
    }

    if (metrics.ruleB) {
      ruleBs.push(metrics.ruleB);
    }
  });

  return {
    ...base,
    familyLabel: "Rule Shift",
    averageSequenceLength: average(sequenceLengths, 1),
    maxSequenceLength: sequenceLengths.length
      ? Math.max(...sequenceLengths)
      : 0,
    averageShiftIndex: average(shiftIndices, 1),
    mostCommonRuleA: getMode(ruleAs),
    mostCommonRuleB: getMode(ruleBs),
    ruleADiversity: [...new Set(ruleAs)].length,
    ruleBDiversity: [...new Set(ruleBs)].length,
    trendReason:
      trendReasonByState[base.trendState] ||
      "Rule switching is evolving. Keep refining adaptive sequence transitions under pressure.",
  };
}

function buildGridRecallSummary(sessions = []) {
  const base = buildBaseSummary("grid_recall", sessions);

  const bestStreaks = sessions.map((session) => toNumber(session.bestStreak));
  const attempted = sessions.map((session) =>
    toNumber(session.puzzlesAttempted),
  );
  const correct = sessions.map((session) => toNumber(session.puzzlesCorrect));

  return {
    ...base,
    familyLabel: "Grid Recall",
    bestStreak: bestStreaks.length ? Math.max(...bestStreaks) : 0,
    averageBestStreak: average(bestStreaks, 1),
    totalPuzzlesAttempted: sum(attempted),
    totalPuzzlesCorrect: sum(correct),
  };
}

function buildLogicGateSummary(sessions = []) {
  const base = buildBaseSummary("logic_gate", sessions);

  const bestStreaks = sessions.map((session) => toNumber(session.bestStreak));
  const attempted = sessions.map((session) =>
    toNumber(session.puzzlesAttempted),
  );
  const correct = sessions.map((session) => toNumber(session.puzzlesCorrect));
  const trendReasonByState = {
    Rising:
      "Signal precision is sharpening. Binary reasoning is gaining stability across recent runs.",
    Steadying:
      "Circuit stability is holding. Keep reinforcing binary control so the logic flow stays consistent.",
    Rebuilding:
      "Recalibrate the gates and prioritize signal accuracy before pushing further intensity.",
  };

  return {
    ...base,
    familyLabel: "Logic Gate",
    bestStreak: bestStreaks.length ? Math.max(...bestStreaks) : 0,
    averageBestStreak: average(bestStreaks, 1),
    totalPuzzlesAttempted: sum(attempted),
    totalPuzzlesCorrect: sum(correct),
    trendReason:
      trendReasonByState[base.trendState] ||
      "Signal stability is evolving. Keep refining your gate reasoning lane.",
  };
}

function buildLogicGridSummary(sessions = []) {
  const base = buildBaseSummary("logic_grid", sessions);

  const bestStreaks = sessions.map((session) => toNumber(session.bestStreak));
  const attempted = sessions.map((session) =>
    toNumber(session.puzzlesAttempted),
  );
  const correct = sessions.map((session) => toNumber(session.puzzlesCorrect));
  const trendReasonByState = {
    Rising:
      "Matrix reasoning is sharpening. Inferential logic is gaining stability across recent runs.",
    Steadying:
      "Structural stability is holding. Keep reinforcing rule deduction so the reasoning flow stays consistent.",
    Rebuilding:
      "Recalibrate the grid logic and prioritize rule accuracy before pushing further intensity.",
  };

  return {
    ...base,
    familyLabel: "Logic Grid",
    bestStreak: bestStreaks.length ? Math.max(...bestStreaks) : 0,
    averageBestStreak: average(bestStreaks, 1),
    totalPuzzlesAttempted: sum(attempted),
    totalPuzzlesCorrect: sum(correct),
    trendReason:
      trendReasonByState[base.trendState] ||
      "Matrix stability is evolving. Keep refining your inferential reasoning lane.",
  };
}

function buildSignalPathSummary(sessions = []) {
  const base = buildBaseSummary("signal_path", sessions);

  const ruleTypes = [];
  const nodeCounts = [];
  const optionCounts = [];
  const pathLengths = [];
  const trendReasonByState = {
    Rising:
      "Route discipline is sharpening. Constraint reads are cleaner and signal planning is staying efficient across recent runs.",
    Steadying:
      "Routing control is holding. Keep reinforcing clean path selection so signal discipline stays stable under constraints.",
    Rebuilding:
      "Simplify the network and rebuild planning accuracy before pushing denser routing pressure.",
  };

  sessions.forEach((session) => {
    const metrics = normalizePuzzleMetrics(session);

    if (metrics.ruleType) {
      ruleTypes.push(metrics.ruleType);
    }

    if (metrics.nodeCount != null) {
      nodeCounts.push(toNumber(metrics.nodeCount));
    }

    if (metrics.optionCount != null) {
      optionCounts.push(toNumber(metrics.optionCount));
    }

    if (metrics.pathLength != null) {
      pathLengths.push(toNumber(metrics.pathLength));
    }
  });

  return {
    ...base,
    familyLabel: "Signal Path",
    averageNodeCount: average(nodeCounts, 1),
    maxNodeCount: nodeCounts.length ? Math.max(...nodeCounts) : 0,
    averageOptionCount: average(optionCounts, 1),
    averagePathLength: average(pathLengths, 1),
    maxPathLength: pathLengths.length ? Math.max(...pathLengths) : 0,
    mostCommonRuleType: getMode(ruleTypes),
    ruleTypeDiversity: [...new Set(ruleTypes)].length,
    trendReason:
      trendReasonByState[base.trendState] ||
      "Constraint routing is evolving. Keep refining clean path selection and planning under signal pressure.",
  };
}

const FAMILY_SUMMARY_BUILDERS = {
  pattern_rush: buildPatternRushSummary,
  sequence_sprint: buildSequenceSprintSummary,
  rule_shift: buildRuleShiftSummary,
  grid_recall: buildGridRecallSummary,
  logic_gate: buildLogicGateSummary,
  logic_grid: buildLogicGridSummary,
  signal_path: buildSignalPathSummary,
};

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
  const performanceMap = {};

  ACTIVE_PUZZLE_FAMILIES.forEach((puzzleType) => {
    const familySessions = grouped[puzzleType] || [];
    const familyBuilder =
      FAMILY_SUMMARY_BUILDERS[puzzleType] ||
      ((sessions) => buildGenericFamilySummary(puzzleType, sessions));

    performanceMap[puzzleType] = familyBuilder(familySessions);
  });

  return performanceMap;
}

export function buildPuzzleFamilyCards(sessions = []) {
  const performanceMap = buildPuzzleFamilyPerformance(sessions);

  const orderedCards = PUZZLE_FAMILY_DISPLAY_ORDER.map(
    (puzzleType) => performanceMap[puzzleType],
  ).filter(Boolean);

  const remainingCards = Object.keys(performanceMap)
    .filter((puzzleType) => !PUZZLE_FAMILY_DISPLAY_ORDER.includes(puzzleType))
    .map((puzzleType) => performanceMap[puzzleType]);

  return [...orderedCards, ...remainingCards];
}

export { PUZZLE_FAMILY_METADATA, ACTIVE_PUZZLE_FAMILIES };
