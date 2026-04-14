import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserAstronaut,
  faClockRotateLeft,
  faBrain,
  faChartLine,
  faBolt,
  faLayerGroup,
  faRoute,
  faWaveSquare,
  faShieldHalved,
  faStar,
  faDiagramProject,
  faTableCells,
  faMicrochip,
  faBorderAll,
  faShapes,
} from '@fortawesome/pro-duotone-svg-icons';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { getPlayerName, setPlayerName } from '../game/playerIdentity';
import { useSessionData } from '../hooks/useSessionData';
import ProfileAnalytics, {
  IdentityCoreStats,
  PerformanceSnapshot,
  AgentSummary,
} from '../components/ProfileAnalytics';
import { buildSessionAnalytics } from '../analytics/sessionAnalytics';
import { summarizeCognitiveIdentity } from '../analytics/cognitiveIdentitySummary';
import { getPuzzleTypeMetadata } from '../utils/puzzleTypeRegistry';

function formatSessionTime(timestamp) {
  if (!timestamp) return '—';
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

const adaptiveStateHistoryLabelMap = {
  recover: 'Recovering',
  steady: 'Steadying',
  challenge: 'Challenging',
};

const adaptiveStateHistoryPillMap = {
  recover:
    'border-amber-300/60 bg-amber-500/20 text-amber-200 shadow-[0_0_26px_rgba(251,191,36,0.55)]',
  steady:
    'border-cyan-300/60 bg-cyan-500/20 text-cyan-200 shadow-[0_0_26px_rgba(34,211,238,0.55)]',
  challenge:
    'border-fuchsia-300/60 bg-fuchsia-500/20 text-fuchsia-200 shadow-[0_0_26px_rgba(217,70,239,0.6)]',
};
const challengeStatePillMap = {
  dominating:
    'border-rose-300/60 bg-rose-500/20 text-rose-200 shadow-[0_0_26px_rgba(244,63,94,0.6)]',
  surging:
    'border-fuchsia-300/60 bg-fuchsia-500/20 text-fuchsia-200 shadow-[0_0_26px_rgba(217,70,239,0.6)]',
  stabilizing:
    'border-cyan-300/60 bg-cyan-500/20 text-cyan-200 shadow-[0_0_26px_rgba(34,211,238,0.6)]',
  rebuilding:
    'border-amber-300/60 bg-amber-500/20 text-amber-200 shadow-[0_0_26px_rgba(251,191,36,0.55)]',
  calibrating:
    'border-slate-400/60 bg-slate-700/30 text-slate-200 shadow-[0_0_26px_rgba(148,163,184,0.4)]',
};

const recentSessionsGridColumns =
  'grid-cols-[minmax(6.5rem,1.2fr)_minmax(4rem,0.7fr)_minmax(3.5rem,0.6fr)_minmax(4rem,0.7fr)_minmax(6.5rem,1.1fr)_minmax(7.5rem,1.25fr)_minmax(7rem,1fr)_minmax(5.5rem,0.9fr)]';

const compactIdentityLabelMap = {
  'adaptive learner': 'Adapting',
  adapting: 'Adapting',
  'recovery mode': 'Recovering',
  recovering: 'Recovering',
  'recovery builder': 'Recovering',
  climber: 'Climbing',
  climbing: 'Climbing',
  striker: 'Dominating',
  striking: 'Dominating',
  'precision builder': 'Refining',
  'momentum driver': 'Accelerating',
  'pattern anchor': 'Stabilizing',
  'speed seeker': 'Quickening',
  'cognitive sprinter': 'Surging',
  'logic weaver': 'Reasoning',
  'strategic builder': 'Planning',
  'consistent performer': 'Balancing',
  independent: 'Self Guiding',
  'independent striker': 'Self Guiding',
  'independent identity': 'Self Guiding',
};
const compactIdentityStyleMap = {
  adapting:
    'border-violet-300/60 bg-violet-500/20 text-violet-200 shadow-[0_0_26px_rgba(167,139,250,0.55)]',
  recovering:
    'border-amber-300/60 bg-amber-500/20 text-amber-200 shadow-[0_0_26px_rgba(251,191,36,0.5)]',
  climbing:
    'border-sky-300/60 bg-sky-500/20 text-sky-200 shadow-[0_0_26px_rgba(56,189,248,0.55)]',
  dominating:
    'border-fuchsia-300/60 bg-fuchsia-500/20 text-fuchsia-200 shadow-[0_0_26px_rgba(217,70,239,0.6)]',
  refining:
    'border-cyan-300/60 bg-cyan-500/20 text-cyan-200 shadow-[0_0_26px_rgba(34,211,238,0.6)]',
  accelerating:
    'border-rose-300/60 bg-rose-500/20 text-rose-200 shadow-[0_0_26px_rgba(244,63,94,0.6)]',
  stabilizing:
    'border-emerald-300/60 bg-emerald-500/20 text-emerald-200 shadow-[0_0_26px_rgba(16,185,129,0.6)]',
  quickening:
    'border-lime-300/60 bg-lime-500/20 text-lime-200 shadow-[0_0_26px_rgba(163,230,53,0.6)]',
  surging:
    'border-orange-300/60 bg-orange-500/20 text-orange-200 shadow-[0_0_26px_rgba(249,115,22,0.6)]',
  reasoning:
    'border-blue-300/60 bg-blue-500/20 text-blue-200 shadow-[0_0_26px_rgba(59,130,246,0.6)]',
  planning:
    'border-indigo-300/60 bg-indigo-500/20 text-indigo-200 shadow-[0_0_26px_rgba(99,102,241,0.6)]',
  balancing:
    'border-teal-300/60 bg-teal-500/20 text-teal-200 shadow-[0_0_26px_rgba(20,184,166,0.6)]',
  'self guiding':
    'border-pink-300/60 bg-pink-500/20 text-pink-200 shadow-[0_0_26px_rgba(236,72,153,0.6)]',
};

function formatSnakeCaseToTitle(value) {
  if (typeof value !== 'string') return '';
  return value
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function getCompactIdentityLabel(identity) {
  const rawLabel =
    typeof identity === 'string'
      ? identity
      : identity?.label ?? identity?.name ?? '';
  const trimmedLabel = rawLabel.trim();
  if (!trimmedLabel) return 'Unknown';
  const normalized = trimmedLabel.toLowerCase();
  return compactIdentityLabelMap[normalized] ?? trimmedLabel;
}

function getCompactIdentityStyle(identityLabel) {
  if (!identityLabel) {
    return 'border-slate-600/60 bg-slate-700/20 text-slate-300 shadow-[0_0_18px_rgba(148,163,184,0.3)]';
  }
  const normalized = identityLabel.trim().toLowerCase();
  return (
    compactIdentityStyleMap[normalized] ||
    'border-slate-600/60 bg-slate-700/20 text-slate-300 shadow-[0_0_18px_rgba(148,163,184,0.3)]'
  );
}

function getChallengeStatePill(challengeState) {
  if (!challengeState) {
    return 'border-slate-400/60 bg-slate-700/30 text-slate-200 shadow-[0_0_26px_rgba(148,163,184,0.4)]';
  }
  const normalized = challengeState.trim().toLowerCase();
  return (
    challengeStatePillMap[normalized] ||
    'border-slate-400/60 bg-slate-700/30 text-slate-200 shadow-[0_0_26px_rgba(148,163,184,0.4)]'
  );
}

function getPuzzleFamilyLabel(puzzleType, mode) {
  if (puzzleType === 'sequence_sprint') return 'Sequence Sprint';
  if (puzzleType === 'rule_shift') return 'Rule Shift';
  if (puzzleType === 'pattern_rush') return 'Pattern Rush';
  if (puzzleType === 'grid_recall') return 'Grid Recall';
  if (puzzleType === 'logic_grid') return 'Logic Grid';
  if (puzzleType === 'signal_path') return 'Signal Path';
  if (puzzleType === 'memory_chain') return 'Memory Chain';
  if (puzzleType === 'odd_one_matrix') return 'Odd One Matrix';
  const puzzleLabel = formatSnakeCaseToTitle(puzzleType);
  if (puzzleLabel) return puzzleLabel;
  if (mode) {
    const modeLabel = formatSnakeCaseToTitle(mode);
    return modeLabel || mode;
  }
  return 'Pattern Rush';
}

const RECENT_SESSION_FAMILY_VISUALS = {
  pattern_rush: {
    icon: faStar,
    iconWrap:
      'flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-500/10 text-cyan-200',
    labelClass: 'text-cyan-200',
    badgeClass: 'text-cyan-300/70',
  },
  sequence_sprint: {
    icon: faDiagramProject,
    iconWrap:
      'flex h-9 w-9 items-center justify-center rounded-full border border-fuchsia-400/40 bg-fuchsia-500/10 text-fuchsia-200',
    labelClass: 'text-fuchsia-200',
    badgeClass: 'text-fuchsia-300/70',
  },
  rule_shift: {
    icon: faLayerGroup,
    iconWrap:
      'flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/40 bg-gradient-to-br from-cyan-500/10 via-violet-500/10 to-amber-500/10 text-fuchsia-200 shadow-[0_0_20px_rgba(217,70,239,0.22)]',
    labelClass: 'text-cyan-100',
    badgeClass: 'text-violet-300/75',
  },
  grid_recall: {
    icon: faTableCells,
    iconWrap:
      'flex h-9 w-9 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/10 text-emerald-200',
    labelClass: 'text-emerald-200',
    badgeClass: 'text-emerald-300/70',
  },
  logic_grid: {
    icon: faBorderAll,
    iconWrap:
      'flex h-9 w-9 items-center justify-center rounded-full border border-violet-400/40 bg-gradient-to-br from-violet-500/15 via-cyan-500/10 to-amber-500/10 text-cyan-200 shadow-[0_0_20px_rgba(168,85,247,0.22)]',
    labelClass: 'text-violet-100',
    badgeClass: 'text-cyan-300/75',
  },
  logic_gate: {
    icon: faMicrochip,
    iconWrap:
      'flex h-9 w-9 items-center justify-center rounded-full border border-amber-400/40 bg-amber-500/10 text-amber-200',
    labelClass: 'text-amber-200',
    badgeClass: 'text-amber-300/70',
  },
  signal_path: {
    icon: faRoute,
    iconWrap:
      'flex h-9 w-9 items-center justify-center rounded-full border border-violet-400/40 bg-violet-500/10 text-violet-200',
    labelClass: 'text-violet-200',
    badgeClass: 'text-violet-300/70',
  },
  memory_chain: {
    icon: faWaveSquare,
    iconWrap:
      'flex h-9 w-9 items-center justify-center rounded-full border border-indigo-400/40 bg-indigo-500/10 text-indigo-200',
    labelClass: 'text-indigo-200',
    badgeClass: 'text-indigo-300/70',
  },
  odd_one_matrix: {
    icon: faShapes,
    iconWrap:
      'flex h-9 w-9 items-center justify-center rounded-full border border-magenta-400/40 bg-magenta-500/10 text-magenta-200',
    labelClass: 'text-magenta-200',
    badgeClass: 'text-magenta-300/70',
  },
  default: {
    icon: faBrain,
    iconWrap:
      'flex h-9 w-9 items-center justify-center rounded-full border border-slate-600/40 bg-slate-900/60 text-slate-200',
    labelClass: 'text-white',
    badgeClass: 'text-slate-400/70',
  },
};

function getRecentSessionFamilyVisual(puzzleType) {
  return (
    RECENT_SESSION_FAMILY_VISUALS[puzzleType] ||
    RECENT_SESSION_FAMILY_VISUALS.default
  );
}

function getFocusLaneFromPuzzleType(puzzleType) {
  switch (puzzleType) {
    case 'sequence_sprint':
      return 'Sequential Reasoning';
    case 'rule_shift':
      return 'Arithmetic Transition Tracking';
    case 'pattern_rush':
      return 'Pattern Recognition';
    case 'grid_recall':
      return 'Spatial Recall';
    case 'logic_grid':
      return 'Matrix Reasoning';
    case 'logic_gate':
      return 'Logic Processing';
    case 'signal_path':
      return 'Constraint Routing';
    case 'memory_chain':
      return 'Trace Memory';
    case 'odd_one_matrix':
      return 'Anomaly Detection';
    default:
      return 'Cognitive Training';
  }
}

function getChallengeState(session) {
  if (!session) return 'Calibrating';
  const accuracy = session.accuracy ?? getSessionAccuracy(session);
  const streak = session.bestStreak ?? session.streak ?? 0;
  const score = session.score ?? 0;

  if (accuracy >= 95 && streak >= 12) return 'Dominating';
  if (accuracy >= 85 && streak >= 8) return 'Surging';
  if (accuracy >= 70) return 'Stabilizing';
  if (score > 0) return 'Rebuilding';
  return 'Calibrating';
}

function buildFamilyAwareRecommendation(session) {
  if (!session) {
    return 'Alternate puzzle families to broaden cognitive adaptation.';
  }
  const accuracy = session.accuracy ?? getSessionAccuracy(session);
  const streak = session.bestStreak ?? session.streak ?? 0;
  const puzzleMetrics = session.puzzleMetrics ?? {};

  if (session.puzzleType === 'sequence_sprint') {
    const sequenceLength = puzzleMetrics.sequenceLength;
    const ruleType = puzzleMetrics.ruleType
      ? formatSnakeCaseToTitle(puzzleMetrics.ruleType)
      : null;
    const ruleLabel = ruleType ? `${ruleType} rule` : 'sequence rules';
    const lengthLabel =
      typeof sequenceLength === 'number'
        ? `length ${sequenceLength}`
        : 'longer sequences';

    if (accuracy >= 85 && streak >= 8) {
      return `Press harder with ${ruleLabel} at ${lengthLabel} to extend your prediction streak.`;
    }
    if (accuracy >= 70) {
      return `Lock in ${ruleLabel} accuracy by repeating ${lengthLabel} runs before switching families.`;
    }
    return `Reset with shorter ${ruleLabel} reps to rebuild confidence before scaling ${lengthLabel}.`;
  }

  if (session.puzzleType === 'rule_shift') {
    const ruleA = puzzleMetrics.ruleA ?? 'Rule A';
    const ruleB = puzzleMetrics.ruleB ?? 'Rule B';
    const shiftIndex = puzzleMetrics.shiftIndex ?? puzzleMetrics.shiftPoint;
    const sequenceLength = puzzleMetrics.sequenceLength;
    const shiftLabel =
      typeof shiftIndex === 'number'
        ? `shift point ${shiftIndex}`
        : 'the transition point';
    const sequenceLabel =
      typeof sequenceLength === 'number'
        ? `${sequenceLength}-step adaptive sequences`
        : 'adaptive sequences';

    if (accuracy >= 85 && streak >= 8) {
      return `Your arithmetic transition tracking is sharp. Keep switching from ${ruleA} to ${ruleB} at ${shiftLabel} and extend ${sequenceLabel}.`;
    }
    if (accuracy >= 70) {
      return `Reinforce the ${ruleA} to ${ruleB} switch inside ${sequenceLabel} so the transition stays clean.`;
    }
    return `Slow the cadence, rehearse the ${ruleA} to ${ruleB} handoff, and stabilize ${shiftLabel} before scaling ${sequenceLabel}.`;
  }

  if (session.puzzleType === 'pattern_rush') {
    if (accuracy >= 90 && streak >= 10) {
      return 'Push to faster pattern ramps and protect your streak under tighter time pressure.';
    }
    if (accuracy >= 75) {
      return 'Stabilize visual reads with consistent cadence, then chase higher streaks.';
    }
    return 'Slow the tempo, lock accuracy, and rebuild pattern confidence before speed runs.';
  }

  if (session.puzzleType === 'grid_recall') {
    if (accuracy >= 90 && streak >= 8) {
      return 'Your spatial mapping is sharp. Focus on complex multi-cell grids to test your limits.';
    }
    if (accuracy >= 75) {
      return 'Stable spatial recall. Maintain focus during the encoding phase for better results.';
    }
    return 'Reduce grid complexity and rebuild spatial confidence before attempting larger matrices.';
  }

  if (session.puzzleType === 'logic_grid') {
    const ruleType = puzzleMetrics.ruleType
      ? formatSnakeCaseToTitle(puzzleMetrics.ruleType)
      : 'matrix rules';
    const gridSize = puzzleMetrics.gridSize;
    const gridLabel =
      typeof gridSize === 'number' && gridSize > 0
        ? `${gridSize}x${gridSize} grids`
        : 'structured grids';

    if (accuracy >= 90 && streak >= 8) {
      return `Matrix inference is locked in. Press into ${ruleType} reads on ${gridLabel} to sharpen hidden-cell deduction under pressure.`;
    }
    if (accuracy >= 75) {
      return `Keep refining ${ruleType} recognition across ${gridLabel} and preserve cleaner deduction as the matrix tightens.`;
    }
    return `Slow the matrix down, rebuild rule reading on ${gridLabel}, and let hidden-cell inference become cleaner before increasing pressure.`;
  }

  if (session.puzzleType === 'signal_path') {
    const ruleType = puzzleMetrics.ruleType
      ? formatSnakeCaseToTitle(puzzleMetrics.ruleType)
      : 'constraint routing';
    const pathLength = puzzleMetrics.pathLength;
    const pathLabel =
      typeof pathLength === 'number' && pathLength > 0
        ? `${pathLength}-node paths`
        : 'longer route chains';

    if (accuracy >= 90 && streak >= 8) {
      return `Route discipline is strong. Push ${ruleType} runs with ${pathLabel} to sharpen planning under tighter constraints.`;
    }
    if (accuracy >= 75) {
      return `Constraint reads are stabilizing. Repeat ${ruleType} routes and keep your path selection clean through ${pathLabel}.`;
    }
    return `Simplify the route map, rebuild signal planning accuracy, and reintroduce ${pathLabel} once selection feels cleaner.`;
  }

  if (session.puzzleType === 'memory_chain') {
    const chainLength = puzzleMetrics.chainLength;
    const lengthLabel =
      typeof chainLength === 'number' && chainLength > 0
        ? `${chainLength}-step chains`
        : 'longer trace sequences';

    if (accuracy >= 90 && streak >= 8) {
      return `Trace memory is sharp. Push ${lengthLabel} and keep your sequential recall clean under increasing density.`;
    }
    if (accuracy >= 75) {
      return `Sequential recall is stabilizing. Repeat ${lengthLabel} runs to lock in your visual retention discipline.`;
    }
    return `Simplify the sequences, rebuild trace confidence, and return to ${lengthLabel} once recall feels more stable.`;
  }

  if (session.puzzleType === 'odd_one_matrix') {
    const ruleType = puzzleMetrics.ruleType
      ? formatSnakeCaseToTitle(puzzleMetrics.ruleType)
      : 'attribute rules';
    const matrixSize = puzzleMetrics.matrixSize;
    const sizeLabel =
      typeof matrixSize === 'number' && matrixSize > 0
        ? `${matrixSize}x${matrixSize} matrices`
        : 'dense matrices';

    if (accuracy >= 90 && streak >= 8) {
      return `Anomaly detection is elite. Push your rule filtering on ${sizeLabel} and keep your pattern isolation sharp.`;
    }
    if (accuracy >= 75) {
      return `Visual filtering is stabilizing. Repeat ${ruleType} runs across ${sizeLabel} to maintain high-precision discrimination.`;
    }
    return `Focus on core attribute isolation, rebuild contrast recognition on simpler grids, and return to ${sizeLabel} once filtering stays cleaner.`;
  }

  return 'Alternate puzzle families to broaden cognitive adaptation.';
}

function buildPrimarySignalLabel(session) {
  if (!session) {
    return 'Pattern signal stabilizing';
  }
  const accuracy = session.accuracy ?? getSessionAccuracy(session);
  const puzzleMetrics = session.puzzleMetrics ?? {};

  if (session.puzzleType === 'sequence_sprint') {
    const ruleType = puzzleMetrics.ruleType
      ? formatSnakeCaseToTitle(puzzleMetrics.ruleType)
      : 'Sequence';
    return accuracy >= 80
      ? `${ruleType} recognition strengthening`
      : `${ruleType} recognition rebuilding`;
  }

  if (session.puzzleType === 'rule_shift') {
    const ruleA = puzzleMetrics.ruleA ?? 'Rule A';
    const ruleB = puzzleMetrics.ruleB ?? 'Rule B';
    return accuracy >= 80
      ? `${ruleA} to ${ruleB} transition tracking strengthening`
      : `${ruleA} to ${ruleB} rule switching recalibrating`;
  }

  if (session.puzzleType === 'pattern_rush') {
    return accuracy >= 80
      ? 'visual pattern recognition sharpening'
      : 'pattern confidence recovering';
  }

  if (session.puzzleType === 'grid_recall') {
    return accuracy >= 80
      ? 'spatial memory encoding strengthening'
      : 'spatial recall stabilizing';
  }

  if (session.puzzleType === 'logic_grid') {
    return accuracy >= 80
      ? 'matrix inference discipline strengthening'
      : 'matrix rule recognition recalibrating';
  }

  if (session.puzzleType === 'signal_path') {
    return accuracy >= 80
      ? 'constraint routing discipline strengthening'
      : 'signal planning recalibrating';
  }

  if (session.puzzleType === 'memory_chain') {
    return accuracy >= 80
      ? 'trace memory recall sharpening'
      : 'sequential retention recalibrating';
  }

  if (session.puzzleType === 'odd_one_matrix') {
    return accuracy >= 80
      ? 'anomaly detection precision sharpening'
      : 'rule filtering discipline recalibrating';
  }

  return (
    session.primarySignal ??
    session.signal ??
    session.shiftSignal ??
    'Pattern signal stabilizing'
  );
}

function buildCurrentCognitiveFocus(session) {
  if (!session) {
    return {
      puzzleFamily: 'Unknown',
      focusLane: 'Cognitive Training',
      identity: 'Unknown',
      challengeState: 'Calibrating',
      primarySignal: 'Pattern signal stabilizing',
      trainingDirection: 'Continue reinforcing your strongest response lane.',
      recommendation:
        'Alternate puzzle families to broaden cognitive adaptation.',
    };
  }

  const puzzleFamily = getPuzzleFamilyLabel(session.puzzleType, session.mode);
  const focusLane = getFocusLaneFromPuzzleType(session.puzzleType);
  const identity = getCompactIdentityLabel(
    session.cognitiveIdentity ?? session.identity,
  );
  const challengeState = getChallengeState(session);
  const primarySignal = buildPrimarySignalLabel(session);
  const trainingDirection =
    session.trainingDirection ??
    session.direction ??
    'Continue reinforcing your strongest response lane.';
  const recommendation =
    session.recommendedNextFocus ??
    session.recommendedFlow ??
    session.coachingInsight ??
    buildFamilyAwareRecommendation(session);

  return {
    puzzleFamily,
    focusLane,
    identity,
    challengeState,
    primarySignal,
    trainingDirection,
    recommendation,
  };
}

function formatCognitiveIdentityLabel(label) {
  if (!label) return label;
  const normalizedLabel = label.trim().toLowerCase();
  if (
    normalizedLabel === 'recovering' ||
    normalizedLabel === 'recovery builder' ||
    normalizedLabel === 'recovery' ||
    normalizedLabel === 'rebuilder' ||
    normalizedLabel === 'rebuilding'
  ) {
    return 'Recovering';
  }
  if (
    normalizedLabel === 'adapting' ||
    normalizedLabel === 'adaptive learner' ||
    normalizedLabel === 'learner'
  ) {
    return 'Adapting';
  }
  if (normalizedLabel === 'independent striker' || normalizedLabel === 'striking' || normalizedLabel === 'dominating')
    return 'Dominating';
  return label;
}

function formatNeuralTrendLabel(direction) {
  switch (direction) {
    case 'improving':
      return 'Improving';
    case 'declining':
      return 'Needs Recovery';
    case 'stable':
      return 'Stable';
    default:
      return 'Neutral';
  }
}

function getSessionAccuracy(session) {
  if (
    typeof session?.puzzlesAttempted === 'number' &&
    session.puzzlesAttempted > 0 &&
    typeof session?.puzzlesCorrect === 'number'
  ) {
    return Math.round(
      (session.puzzlesCorrect / session.puzzlesAttempted) * 100,
    );
  }
  return session?.accuracy ?? 0;
}

function getSessionOutcomeToneClasses(tone) {
  switch (tone) {
    case 'gold':
      return 'text-amber-300';
    case 'positive':
      return 'text-emerald-300';
    case 'supportive':
      return 'text-cyan-300';
    case 'alert':
      return 'text-yellow-300';
    case 'caution':
      return 'text-red-300';
    default:
      return 'text-fuchsia-300';
  }
}

function ProfilePage() {
  const [playerName, setPlayerNameState] = useState(() => getPlayerName());
  const [nameInput, setNameInput] = useState(() => getPlayerName());
  const [nameSaved, setNameSaved] = useState(false);
  const { sessions, resetSessions } = useSessionData();
  const cognitiveIdentitySummary = summarizeCognitiveIdentity(sessions);
  const recentSessions = sessions.slice(-5);
  const recentCognitiveIdentitySummary =
    summarizeCognitiveIdentity(recentSessions);
  const isRecentTrendSameAsAllTime = Boolean(
    (cognitiveIdentitySummary.dominantIdentity?.identityKey &&
      recentCognitiveIdentitySummary.dominantIdentity?.identityKey &&
      cognitiveIdentitySummary.dominantIdentity.identityKey ===
        recentCognitiveIdentitySummary.dominantIdentity.identityKey) ||
      (cognitiveIdentitySummary.dominantIdentity?.label &&
        recentCognitiveIdentitySummary.dominantIdentity?.label &&
        cognitiveIdentitySummary.dominantIdentity.label ===
          recentCognitiveIdentitySummary.dominantIdentity.label),
  );
  const recentTrendLabel = formatCognitiveIdentityLabel(
    recentCognitiveIdentitySummary.dominantIdentity?.label,
  );
  const recentTrendDescription =
    recentCognitiveIdentitySummary.dominantIdentity?.description;
  const recentTrainingDirection = useMemo(() => {
    const latestSession = [...sessions]
      .reverse()
      .find(
        (session) => session?.sessionOutcome || session?.liveAdaptiveDifficulty,
      );

    const explicitDirection = latestSession?.sessionOutcome?.trainingDirection
      ?.trim()
      .toLowerCase();
    if (explicitDirection) {
      if (explicitDirection.includes('push')) return 'Push';
      if (explicitDirection.includes('recover')) return 'Recover';
      if (explicitDirection.includes('hold')) return 'Hold';
    }

    const recommendedDifficulty =
      latestSession?.sessionOutcome?.nextRecommendedDifficulty ||
      latestSession?.liveAdaptiveDifficulty?.targetDifficulty;
    if (recommendedDifficulty === 'hard') return 'Push';
    if (recommendedDifficulty === 'medium') return 'Hold';
    if (recommendedDifficulty === 'easy') return 'Recover';

    const adaptiveState = latestSession?.liveAdaptiveDifficulty?.state;
    if (adaptiveState === 'challenge') return 'Push';
    if (adaptiveState === 'steady') return 'Hold';
    if (adaptiveState === 'recover') return 'Recover';

    return null;
  }, [sessions]);
  const recentTrainingDirectionBadgeClass =
    recentTrainingDirection === 'Push'
      ? 'border border-fuchsia-300/65 bg-fuchsia-500/30 text-white/90 shadow-[0_0_22px_rgba(217,70,239,0.55)] ring-1 ring-fuchsia-300/40'
      : recentTrainingDirection === 'Recover'
        ? 'border border-amber-300/65 bg-amber-500/30 text-white/90 shadow-[0_0_22px_rgba(251,191,36,0.5)] ring-1 ring-amber-300/40'
        : 'border border-cyan-300/65 bg-cyan-500/30 text-white/90 shadow-[0_0_22px_rgba(34,211,238,0.55)] ring-1 ring-cyan-300/40';
  const analytics = buildSessionAnalytics(sessions) ?? {};
  const recentPuzzleTypeMeta = useMemo(() => {
    const recentSession = cognitiveIdentitySummary.recentIdentitySession;
    if (!recentSession?.puzzleType) return null;
    return getPuzzleTypeMetadata(recentSession.puzzleType);
  }, [cognitiveIdentitySummary.recentIdentitySession]);

  const latestSession = [...sessions]
    .filter(Boolean)
    .sort((a, b) => {
      const aTime = a?.timestamp ? new Date(a.timestamp).getTime() : 0;
      const bTime = b?.timestamp ? new Date(b.timestamp).getTime() : 0;
      return bTime - aTime;
    })[0] ?? null;
  const currentCognitiveFocus = buildCurrentCognitiveFocus(latestSession);


  const navigate = useNavigate();
  const handleStartRecommendedSession = () => {
    navigate('/arena', {
      state: {
        recommendedSession: {
          source: 'profile-adaptive-coaching',
          adaptiveState: latestAdaptiveState || 'steady',
          recommendation: adaptiveRecommendation,
        },
      },
    });
  };
  const {
    cognitiveTracks = {
      patternRecognition: 0,
      focusStability: 0,
      processingSpeed: 0,
      consistency: 0,
    },
    neuralTrend = { direction: 'neutral', change: 0 },
    pressureState = { state: 'neutral', label: 'Stable Load', detail: '' },
    adaptiveDifficulty = {
      state: 'steady',
      label: 'Steady Mode',
      description: '',
      targetDifficulty: 'medium',
    },
    coachingInsight = { headline: '', summary: '', focus: '', detail: '' },
  } = analytics;

  const neuralTrendLabel = formatNeuralTrendLabel(neuralTrend.direction);
  const pressureStateDetail =
    pressureState.detail ??
    'Complete more sessions to reveal your pressure profile.';
  const adaptiveDifficultyDetail =
    adaptiveDifficulty.description ??
    'Keep training to generate a stronger adaptive signal.';
  const precisionScore = cognitiveTracks.patternRecognition ?? 0;
  const momentumScore = cognitiveTracks.focusStability ?? 0;
  const throughputScore = cognitiveTracks.processingSpeed ?? 0;
  const consistencyScore = cognitiveTracks.consistency ?? 0;

  const radarData = [
    { skill: 'Precision', value: precisionScore },
    { skill: 'Momentum', value: momentumScore },
    { skill: 'Throughput', value: throughputScore },
    { skill: 'Consistency', value: consistencyScore },
  ];

  const latestAdaptiveState =
    sessions
      .slice()
      .reverse()
      .find((session) => session?.liveAdaptiveDifficulty?.state)
      ?.liveAdaptiveDifficulty?.state || null;

  const adaptiveInsightSubtextMap = {
    challenge:
      'Recent session behavior shows the system increasing difficulty in response to stronger performance.',
    steady:
      'Recent session behavior shows stable control, balanced output, and manageable pressure.',
    recover:
      'Recent session behavior shows signs of strain, so the system is easing intensity to protect consistency.',
    default: 'Adaptive feedback updates as more session behavior is recorded.',
  };

  const adaptiveInsightStyles = {
    challenge: {
      border: 'border-violet-500/30',
      glow: 'shadow-violet-500/10',
      label: 'text-violet-300',
    },
    steady: {
      border: 'border-cyan-500/20',
      glow: 'shadow-cyan-500/10',
      label: 'text-cyan-300',
    },
    recover: {
      border: 'border-amber-500/30',
      glow: 'shadow-amber-500/10',
      label: 'text-amber-300',
    },
    default: {
      border: 'border-cyan-500/20',
      glow: 'shadow-cyan-500/10',
      label: 'text-cyan-300',
    },
  };

  const adaptiveInsightBadges = {
    challenge: {
      text: 'Challenge',
      className: 'bg-violet-500/15 text-violet-200 border border-violet-400/30',
    },
    steady: {
      text: 'Steady',
      className: 'bg-cyan-500/15 text-cyan-200 border border-cyan-400/30',
    },
    recover: {
      text: 'Recovery',
      className: 'bg-amber-500/15 text-amber-200 border border-amber-400/30',
    },
    default: {
      text: 'Adaptive',
      className: 'bg-slate-500/15 text-slate-200 border border-slate-400/20',
    },
  };

  const adaptiveInsightIcons = {
    challenge: faBolt,
    steady: faWaveSquare,
    recover: faShieldHalved,
    default: faWaveSquare,
  };

  const adaptiveInsightBadge =
    adaptiveInsightBadges[latestAdaptiveState] ?? adaptiveInsightBadges.default;

  const adaptiveInsightSubtext =
    adaptiveInsightSubtextMap[latestAdaptiveState] ||
    adaptiveInsightSubtextMap.default;

  const adaptiveInsightIcon =
    adaptiveInsightIcons[latestAdaptiveState] || adaptiveInsightIcons.default;
  const adaptiveInsightTone =
    adaptiveInsightStyles[latestAdaptiveState] ?? adaptiveInsightStyles.default;

  const adaptiveInsightTrend = useMemo(() => {
    if (!sessions || sessions.length === 0)
      return 'No recent adaptive pattern yet.';

    const recentStates = [...sessions]
      .slice(-5)
      .map((session) => session?.liveAdaptiveDifficulty?.state)
      .filter(Boolean);

    if (recentStates.length === 0) {
      return 'No recent adaptive pattern yet.';
    }

    const labelMap = {
      recover: 'Recovery',
      steady: 'Steady',
      challenge: 'Challenge',
    };

    const labeledStates = recentStates.map((state) => labelMap[state] || state);

    const compressed = [];
    for (const state of labeledStates) {
      const last = compressed[compressed.length - 1];

      if (last && last.label === state) {
        last.count += 1;
      } else {
        compressed.push({ label: state, count: 1 });
      }
    }

    return compressed
      .map((item) =>
        item.count > 1 ? `${item.label} × ${item.count}` : item.label,
      )
      .join(' → ');
  }, [sessions]);

  const adaptiveInsight = useMemo(() => {
    if (!sessions || sessions.length === 0) {
      return 'Complete more sessions to unlock adaptive insights.';
    }

    const recentAdaptiveSessions = [...sessions]
      .slice(-5)
      .filter((session) => session?.liveAdaptiveDifficulty?.state);

    if (recentAdaptiveSessions.length === 0) {
      return 'Adaptive insight will appear once more session difficulty patterns are recorded.';
    }

    const states = recentAdaptiveSessions.map(
      (session) => session.liveAdaptiveDifficulty.state,
    );

    const counts = states.reduce(
      (acc, state) => {
        acc[state] = (acc[state] || 0) + 1;
        return acc;
      },
      { recover: 0, steady: 0, challenge: 0 },
    );

    const latestState = states[states.length - 1];
    const previousState = states.length > 1 ? states[states.length - 2] : null;

    if (counts.challenge >= 3) {
      return "You're leaning into higher challenge and holding your ground. Keep pushing.";
    }

    if (counts.recover >= 3) {
      return 'Your system is asking for a reset. Pull back slightly and rebuild your rhythm.';
    }

    if (counts.steady >= 3) {
      return "You're locked into a steady rhythm. This is where real growth compounds.";
    }

    if (previousState === 'recover' && latestState === 'steady') {
      return "You're recovering well and settling back into control.";
    }

    if (previousState === 'steady' && latestState === 'challenge') {
      return "You're stepping up. The system sees you ready for more.";
    }

    if (previousState === 'challenge' && latestState === 'recover') {
      return 'You pushed hard. Now your system is dialing things back to recover.';
    }

    return 'Your pattern is still forming, but your system is actively adapting to your performance.';
  }, [sessions]);

  let adaptiveTensionInsight = null;
  if (latestAdaptiveState && neuralTrend) {
    const trend = (neuralTrend.direction ?? '').toLowerCase();

    if (latestAdaptiveState === 'challenge' && trend.includes('declin')) {
      adaptiveTensionInsight = {
        text: "You're pushing into higher difficulty, but performance is starting to strain. Consider stabilizing before pushing further.",
        className: 'text-rose-300/80',
      };
    } else if (latestAdaptiveState === 'recover' && trend.includes('improv')) {
      adaptiveTensionInsight = {
        text: 'Recovery is working. Your system is regaining stability and control.',
        className: 'text-emerald-300/80',
      };
    } else if (latestAdaptiveState === 'steady' && trend.includes('improv')) {
      adaptiveTensionInsight = {
        text: "You're building strength in a stable zone. This is ideal for long-term growth.",
        className: 'text-cyan-300/80',
      };
    }
  }
  const adaptiveActionLabels = {
    challenge: 'Push Higher Difficulty',
    steady: 'Maintain Your Rhythm',
    recover: 'Run Recovery Session',
    default: 'Start Session',
  };
  const adaptiveActionLabel =
    adaptiveActionLabels[latestAdaptiveState] || adaptiveActionLabels.default;

  let adaptiveRecommendation =
    'Keep training. The system will sharpen its guidance as more performance data comes in.';
  if (!latestAdaptiveState) {
    adaptiveRecommendation =
      'Complete more sessions to unlock personalized coaching recommendations.';
  } else {
    const trend = (neuralTrend?.direction ?? '').toLowerCase();

    if (latestAdaptiveState === 'challenge' && trend.includes('declin')) {
      adaptiveRecommendation =
        'Run a shorter session and prioritize accuracy before pushing intensity higher again.';
    } else if (latestAdaptiveState === 'challenge') {
      adaptiveRecommendation =
        'Keep pushing, but stay sharp. Maintain accuracy as difficulty rises.';
    } else if (latestAdaptiveState === 'steady' && trend.includes('improv')) {
      adaptiveRecommendation =
        "You're in a strong growth zone. Try increasing difficulty and protecting consistency.";
    } else if (latestAdaptiveState === 'steady') {
      adaptiveRecommendation =
        'Stay in rhythm and aim for cleaner streaks before forcing a harder jump.';
    } else if (latestAdaptiveState === 'recover' && trend.includes('improv')) {
      adaptiveRecommendation =
        'Rebuild with controlled reps, then prepare to step back into a steadier training rhythm.';
    } else if (latestAdaptiveState === 'recover') {
      adaptiveRecommendation =
        'Slow down, focus on accuracy, and let your stability recover before chasing speed.';
    }
  }
  const adaptiveRecommendationTone = {
    challenge: 'text-violet-200/90',
    steady: 'text-cyan-200/90',
    recover: 'text-amber-200/90',
    default: 'text-slate-300/90',
  };
  const adaptiveRecommendationClass =
    adaptiveRecommendationTone[latestAdaptiveState] ||
    adaptiveRecommendationTone.default;

  const recentSessionsDisplay = [...recentSessions].reverse();


  const normalizedNameInput = nameInput.trim();
  const canSavePlayerName =
    normalizedNameInput.length > 0 && normalizedNameInput !== playerName;

  const currentRank = sessions.length > 0 ? 'Active' : 'Unranked';

  const handleResetData = () => {
    const confirmed = window.confirm(
      'Clear all TakeNeuroIQ session history and leaderboard data?',
    );

    if (!confirmed) return;

    resetSessions();
  };

  const handleSavePlayerName = () => {
    if (!canSavePlayerName) return;

    const savedName = setPlayerName(nameInput);
    setPlayerNameState(savedName);
    setPlayerName(savedName);
    setNameSaved(true);
  };
  const handlePlayerNameKeyDown = (event) => {
    if (event.key !== 'Enter') return;

    event.preventDefault();

    if (!canSavePlayerName) return;

    handleSavePlayerName();
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setNameSaved(false);
    }, 2000);

    return () => window.clearTimeout(timeout);
  }, [nameSaved]);

  return (
    <section className="animate-fadeIn min-h-screen px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-3xl border border-cyan-400/30 bg-slate-900/70 p-6 shadow-[0_0_50px_rgba(34,211,238,0.15)] backdrop-blur-md">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-fuchsia-300 shadow-[0_0_15px_rgba(217,70,239,0.2)]">
                <FontAwesomeIcon
                  icon={faBolt}
                  className="text-cyan-400 [--fa-secondary-color:theme(colors.fuchsia.500)] [--fa-secondary-opacity:1] animate-pulse"
                />
                Neural Identity
              </p>

              <h1 className="text-glow-blue text-3xl font-extrabold tracking-tight text-cyan-300 md:text-5xl">
                Player Profile
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                Your performance hub for session history, cognitive growth, and
                future adaptive analysis. This page will evolve into a
                personalized command center for competitive brain training.
              </p>
            </div>

            <div className="flex flex-col items-end gap-3">
              <div className="rounded-2xl border border-cyan-400/20 bg-slate-800/70 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                  Current Rank
                </p>
                <p className="mt-2 text-3xl font-bold text-indigo-400">
                  {currentRank}
                </p>
              </div>

              <button
                type="button"
                onClick={handleResetData}
                className="rounded-xl border border-fuchsia-400/30 bg-fuchsia-500/10 px-4 py-2 text-sm font-semibold text-fuchsia-300 transition hover:border-fuchsia-300/50 hover:bg-fuchsia-500/20 hover:text-fuchsia-200"
              >
                Reset Session Data
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <aside className="space-y-6">
            <div className="rounded-3xl border border-cyan-400/20 bg-slate-900/70 p-5 shadow-[0_0_30px_rgba(34,211,238,0.08)] backdrop-blur-md">
              <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                <FontAwesomeIcon
  icon={faUserAstronaut}
  className="text-cyan-400 [--fa-secondary-color:theme(colors.fuchsia.500)] [--fa-secondary-opacity:1] text-cyan-300"
/>
                Identity Core
              </h2>

              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 shadow-inner">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300">
                    Update Neural Identity
                  </p>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(event) => setNameInput(event.target.value)}
                      onKeyDown={handlePlayerNameKeyDown}
                      placeholder="Enter player name"
                      className="w-full rounded-xl border border-cyan-400/20 bg-slate-950/80 px-4 py-2 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/50 focus:ring-1 focus:ring-cyan-300/20"
                    />
                    <button
                      type="button"
                      onClick={handleSavePlayerName}
                      disabled={!canSavePlayerName}
                      className={`rounded-xl px-4 py-2 text-sm font-bold transition-all duration-300 ${
                        canSavePlayerName
                          ? 'border border-cyan-400/30 bg-cyan-500/10 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:border-cyan-300/50 hover:bg-cyan-500/20 hover:text-cyan-200 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                          : 'cursor-not-allowed border border-slate-700 bg-slate-800/40 text-slate-600'
                      }`}
                    >
                      Sync Name
                    </button>
                  </div>

                  {nameSaved && (
                    <p className="mt-2 text-xs font-medium text-emerald-400 animate-pulse">
                      Identity synced successfully.
                    </p>
                  )}
                </div>

                <IdentityCoreStats sessions={sessions} playerName={playerName} />

                <AgentSummary coachingInsight={coachingInsight} />
              </div>
            </div>

            <div className="rounded-3xl border border-fuchsia-400/20 bg-slate-900/70 p-5 shadow-[0_0_30px_rgba(217,70,239,0.08)] backdrop-blur-md">
              <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                <FontAwesomeIcon
                  icon={faBrain}
                  className="text-cyan-400 [--fa-secondary-color:theme(colors.fuchsia.500)] [--fa-secondary-opacity:1] text-fuchsia-300"
                />
                Cognitive Tracks
              </h2>

              <div className="mt-4 space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 shadow-inner">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-cyan-300">
                      Pattern recognition
                    </p>
                    <span className="text-lg font-bold text-white">
                      {cognitiveTracks.patternRecognition}
                    </span>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 shadow-inner">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-fuchsia-300">
                      Focus stability
                    </p>
                    <span className="text-lg font-bold text-white">
                      {cognitiveTracks.focusStability}
                    </span>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 shadow-inner">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-emerald-300">
                      Processing speed
                    </p>
                    <span className="text-lg font-bold text-white">
                      {cognitiveTracks.processingSpeed}
                    </span>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 shadow-inner">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-yellow-300">Consistency</p>
                    <span className="text-lg font-bold text-white">
                      {cognitiveTracks.consistency}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {pressureStateDetail}
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <div className="space-y-6">
            <div className="rounded-2xl border border-cyan-500/20 bg-slate-950/40 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/80">
                Cognitive Analytics
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Track performance, neural growth, and recent training behavior.
              </p>
            </div>

            <div
              key={latestAdaptiveState + adaptiveInsight}
              className={`mb-6 rounded-2xl border bg-slate-900/70 px-5 py-4 shadow-lg ${adaptiveInsightTone.border} ${adaptiveInsightTone.glow} transition-all duration-500 ease-out animate-[fadeIn_0.4s_ease-out]`}
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <div
                  className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] ${adaptiveInsightTone.label}`}
                >
                  <FontAwesomeIcon
                    icon={adaptiveInsightIcon}
                    className="text-sm opacity-90"
                    fixedWidth
                  />
                  <span>Adaptive Insight</span>
                </div>

                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${adaptiveInsightBadge.className}`}
                >
                  {adaptiveInsightBadge.text}
                </span>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-200 md:text-base">
                  {adaptiveInsight}
                </p>
                <p className="text-xs leading-6 text-slate-400 md:text-sm">
                  {adaptiveInsightSubtext}
                </p>
                <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500 md:text-xs">
                  Recent pattern: {adaptiveInsightTrend}
                </p>
                {adaptiveTensionInsight && (
                  <p
                    className={`text-xs md:text-sm ${adaptiveTensionInsight.className}`}
                  >
                    {adaptiveTensionInsight.text}
                  </p>
                )}

                <div className="space-y-1 pt-1">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 md:text-[11px]">
                    Recommended Next Focus
                  </div>
                </div>

                <p
                  className={`text-xs font-medium md:text-sm ${adaptiveRecommendationClass}`}
                >
                  {adaptiveRecommendation}
                </p>
                <button
                  onClick={handleStartRecommendedSession}
                  className="mt-1 inline-flex items-center rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-200 transition hover:border-cyan-400/40 hover:text-white"
                >
                  {adaptiveActionLabel}
                </button>
              </div>
            </div>

            <PerformanceSnapshot sessions={sessions} />

            <ProfileAnalytics
              sessions={sessions}
              cognitiveTracks={cognitiveTracks}
              neuralTrend={neuralTrend}
              pressureState={pressureState}
              adaptiveDifficulty={adaptiveDifficulty}
              coachingInsight={coachingInsight}
            />

            <div className="rounded-3xl border border-cyan-400/20 bg-slate-900/70 p-5 shadow-[0_0_30px_rgba(34,211,238,0.08)] backdrop-blur-md">
              <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                <FontAwesomeIcon
                  icon={faBrain}
                  className="text-cyan-400 [--fa-secondary-color:theme(colors.fuchsia.500)] [--fa-secondary-opacity:1] text-cyan-300"
                />
                Cognitive Skill Signals
              </h2>

              <div className="mt-5 h-80 min-h-[20rem] w-full min-w-0">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  minWidth={0}
                  minHeight={320}
                >
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(148, 163, 184, 0.25)" />
                    <PolarAngleAxis
                      dataKey="skill"
                      tick={{ fill: '#cbd5e1', fontSize: 12 }}
                    />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      tick={{ fill: '#64748b', fontSize: 10 }}
                    />
                    <Radar
                      name="Cognitive Profile"
                      dataKey="value"
                      stroke="#a855f7"
                      fill="#a855f7"
                      fillOpacity={0.35}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-300">Precision</span>
                    <span className="font-semibold text-cyan-400">
                      {precisionScore}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full bg-cyan-400 transition-all duration-500`}
                      style={{ width: `${precisionScore}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-300">Momentum</span>
                    <span className="font-semibold text-fuchsia-400">
                      {momentumScore}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full bg-fuchsia-400 transition-all duration-500`}
                      style={{ width: `${momentumScore}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-300">Throughput</span>
                    <span className="font-semibold text-emerald-400">
                      {throughputScore}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full bg-emerald-400 transition-all duration-500`}
                      style={{ width: `${throughputScore}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-300">Consistency</span>
                    <span className="font-semibold text-amber-400">
                      {consistencyScore}
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full bg-amber-400 transition-all duration-500`}
                      style={{ width: `${consistencyScore}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-cyan-400/20 bg-slate-900/70 p-5 shadow-[0_0_30px_rgba(14,165,233,0.25)] backdrop-blur-md">
              <div className="flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                  <FontAwesomeIcon
  icon={faWaveSquare}
  className="text-cyan-400 [--fa-secondary-color:theme(colors.fuchsia.500)] [--fa-secondary-opacity:1] text-cyan-300"
/>
                  Current Cognitive Focus
                </h2>
                <span className="text-[10px] uppercase tracking-[0.25em] text-slate-500">
                  Live Signal
                </span>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">
                    Puzzle Family
                  </p>
                  <p className="mt-1 text-base font-semibold text-white">
                    {currentCognitiveFocus.puzzleFamily}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">
                    Focus Lane
                  </p>
                  <p className="mt-1 text-base font-semibold text-cyan-200">
                    {currentCognitiveFocus.focusLane}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">
                    Current Identity
                  </p>
                  <p className="mt-1 text-base font-semibold text-fuchsia-200">
                    {currentCognitiveFocus.identity}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">
                    Challenge State
                  </p>
                  <span
                    className={`mt-2 inline-flex items-center justify-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] ${getChallengeStatePill(
                      currentCognitiveFocus.challengeState,
                    )}`}
                  >
                    {currentCognitiveFocus.challengeState}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">
                    Primary Signal
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-200">
                    {currentCognitiveFocus.primarySignal}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">
                    Training Direction
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-200">
                    {currentCognitiveFocus.trainingDirection}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-[10px] uppercase tracking-[0.28em] text-slate-500">
                    Recommended Next Focus
                  </p>
                  <p className="mt-1 text-sm font-medium text-cyan-200">
                    {currentCognitiveFocus.recommendation}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-cyan-400/20 bg-slate-900/70 p-5 shadow-[0_0_30px_rgba(34,211,238,0.08)] backdrop-blur-md">
              <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                <FontAwesomeIcon
  icon={faClockRotateLeft}
  className="text-cyan-400 [--fa-secondary-color:theme(colors.fuchsia.500)] [--fa-secondary-opacity:1] text-cyan-300"
/>
                Recent Sessions
              </h2>

              <div className="mt-4 rounded-2xl border border-slate-700/60">
                {recentSessionsDisplay.length > 0 ? (
                  <>
                    <div className="space-y-3 p-3 md:hidden">
                      {recentSessionsDisplay.map((session, index) => {
                        const puzzleMeta = getPuzzleTypeMetadata(
                          session.puzzleType,
                        );
                        const familyVisual = getRecentSessionFamilyVisual(
                          session.puzzleType,
                        );
                        const adaptiveStateKey =
                          session.liveAdaptiveDifficulty?.state ?? 'steady';
                        const adaptiveStateLabel =
                          adaptiveStateHistoryLabelMap[adaptiveStateKey] ??
                          'Steadying';
                        const adaptiveStatePill =
                          adaptiveStateHistoryPillMap[adaptiveStateKey] ??
                          'border-cyan-300/60 bg-cyan-500/20 text-cyan-200 shadow-[0_0_26px_rgba(34,211,238,0.55)]';

                        return (
                          <div
                            key={`${session.score ?? 0}-${index}`}
                            className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <span className={familyVisual.iconWrap}>
                                  <FontAwesomeIcon
                                    icon={familyVisual.icon}
                                    className="text-white"
                                  />
                                </span>
                                <div>
                                  <p
                                    className={`font-semibold ${familyVisual.labelClass}`}
                                  >
                                    {puzzleMeta.label}
                                  </p>
                                  <p
                                    className={`mt-1 text-xs uppercase tracking-[0.18em] ${familyVisual.badgeClass}`}
                                  >
                                    {puzzleMeta.shortLabel || 'Pattern'}
                                  </p>
                                </div>
                              </div>
                              <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                                {formatSessionTime(session.timestamp)}
                              </span>
                              <span
                                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${adaptiveStatePill}`}
                              >
                                {adaptiveStateLabel}
                              </span>
                            </div>

                            <div className="mt-4 grid grid-cols-3 gap-3">
                              <div className="rounded-xl bg-slate-950/40 p-3 text-center">
                                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                                  Score
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-100 tabular-nums">
                                  {session.score ?? 0}
                                </p>
                              </div>
                              <div className="rounded-xl bg-slate-950/40 p-3 text-center">
                                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                                  ACC
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-100 tabular-nums">
                                  {getSessionAccuracy(session)}%
                                </p>
                              </div>
                              <div className="rounded-xl bg-slate-950/40 p-3 text-center">
                                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                                  Streak
                                </p>
                                <p className="mt-1 text-sm font-semibold text-slate-100 tabular-nums">
                                  {session.bestStreak ?? session.streak ?? 0}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 rounded-xl bg-slate-950/40 p-3">
                              <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                                Run Data
                              </p>
                              <p
                                className={`mt-1 truncate font-semibold ${getSessionOutcomeToneClasses(
                                  session.sessionOutcome?.tone,
                                )}`}
                              >
                                {session.label}
                              </p>
                              <p className="mt-1 text-sm font-bold text-yellow-300">
                                NP: {session.neuralPower ?? 0}
                              </p>
                            </div>
                            <div className="mt-3">
                              {session.cognitiveIdentity?.label ? (
                                <span className="rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
                                  {formatCognitiveIdentityLabel(
                                    session.cognitiveIdentity.label,
                                  )}
                                </span>
                              ) : (
                                <span className="text-xs text-slate-500">
                                  Unclassified
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="hidden overflow-x-auto rounded-2xl border border-slate-800/60 bg-slate-900/60 md:block">
                      <div
                        className={`grid min-w-[56rem] ${recentSessionsGridColumns} items-center gap-x-4 border-b border-slate-700/50 bg-slate-800/40 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500`}
                      >
                        <span className="text-left">Puzzle Family</span>
                        <span className="text-center">Score</span>
                        <span className="text-center">ACC</span>
                        <span className="text-center">Streak</span>
                        <span className="text-left">Run Data</span>
                        <span className="text-left">Identity</span>
                        <span className="text-left">State</span>
                        <span className="text-left">When</span>
                      </div>

                      {recentSessionsDisplay.map((session, index) => {
                        const adaptiveStateKey =
                          session.liveAdaptiveDifficulty?.state ?? 'steady';
                        const adaptiveStateLabel =
                          adaptiveStateHistoryLabelMap[adaptiveStateKey] ??
                          'Steadying';
                        const adaptiveStatePill =
                          adaptiveStateHistoryPillMap[adaptiveStateKey] ??
                          'border-cyan-300/60 bg-cyan-500/20 text-cyan-200 shadow-[0_0_26px_rgba(34,211,238,0.55)]';
                        const puzzleMeta = getPuzzleTypeMetadata(session.puzzleType);
                        const puzzleFamilyLabel = getPuzzleFamilyLabel(
                          session.puzzleType,
                          session.mode,
                        );
                        const familyVisual = getRecentSessionFamilyVisual(
                          session.puzzleType,
                        );
                        const identitySource =
                          session.cognitiveIdentity ?? session.identity;
                        const compactIdentity = getCompactIdentityLabel(
                          identitySource,
                        );
                        const compactIdentityStyle =
                          getCompactIdentityStyle(compactIdentity);

                        return (
                          <div
                            key={`${session.score ?? 0}-${index}`}
                            className={`grid min-w-[56rem] ${recentSessionsGridColumns} group items-center gap-x-4 border-t border-slate-800/50 px-4 py-4 text-sm text-slate-200 transition duration-200 hover:bg-cyan-400/[0.03]`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={familyVisual.iconWrap}>
                                <FontAwesomeIcon
                                  icon={familyVisual.icon}
                                  className="text-white"
                                />
                              </span>
                              <div className="min-w-0">
                                <span
                                  className={`block truncate font-bold transition-colors group-hover:text-cyan-400 ${familyVisual.labelClass}`}
                                >
                                  {puzzleFamilyLabel}
                                </span>
                                <span
                                  className={`block text-[10px] uppercase tracking-[0.2em] ${familyVisual.badgeClass}`}
                                >
                                  {puzzleMeta.shortLabel || 'Pattern'}
                                </span>
                              </div>
                            </div>
                            <span className="text-center font-mono text-cyan-100/80 tabular-nums">
                              {session.score ?? 0}
                            </span>
                            <span className="text-center font-mono text-emerald-400/80 tabular-nums">
                              {getSessionAccuracy(session)}%
                            </span>
                            <span className="text-center font-mono text-fuchsia-400/80 tabular-nums">
                              {session.bestStreak ?? session.streak ?? 0}
                            </span>
                            <div className="flex min-w-0 flex-col">
                              <span
                                className={`truncate text-xs font-semibold ${getSessionOutcomeToneClasses(
                                  session.sessionOutcome?.tone,
                                )}`}
                              >
                                {session.label}
                              </span>
                              <span className="text-[10px] font-bold text-yellow-300/70">
                                NP: {session.neuralPower ?? 0}
                              </span>
                            </div>
                            <div className="flex min-w-0 items-center">
                              {compactIdentity ? (
                                <span
                                  className={`flex min-w-0 max-w-[120px] items-center justify-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] ${compactIdentityStyle}`}
                                >
                                  <span className="truncate">{compactIdentity}</span>
                                </span>
                              ) : (
                                <span className="text-[10px] font-semibold text-slate-600">
                                  UNC
                                </span>
                              )}
                            </div>
                            <span
                              className={`flex min-w-0 max-w-[108px] items-center justify-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] ${adaptiveStatePill}`}
                            >
                              <span className="truncate">
                                {adaptiveStateLabel}
                              </span>
                            </span>
                            <span className="text-[11px] font-medium text-slate-500 group-hover:text-slate-400">
                              {formatSessionTime(session.timestamp)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="px-4 py-10 text-center text-sm text-slate-400">
                    No recorded sessions yet. Complete a run to build your
                    profile history.
                  </div>
                )}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-3xl border border-emerald-300/80 bg-slate-900/75 p-5 backdrop-blur-md shadow-[0_0_42px_rgba(16,185,129,0.32)] ring-1 ring-emerald-300/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_48px_rgba(16,185,129,0.45)]">
                <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                  <FontAwesomeIcon
  icon={faChartLine}
  className="text-cyan-400 [--fa-secondary-color:theme(colors.fuchsia.500)] [--fa-secondary-opacity:1] text-emerald-100 drop-shadow-[0_0_18px_rgba(16,185,129,0.9)]"
/>
                  Progression
                </h2>
                <div className="mt-3 space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-emerald-200/95">
                    Neural Trend
                  </p>
                  <p className="text-xl font-extrabold tracking-tight text-emerald-100 drop-shadow-[0_0_16px_rgba(16,185,129,0.85)]">
                    {neuralTrendLabel}
                  </p>
                  <p className="text-sm leading-6 text-emerald-100/90">
                    Strength and rhythm remain calibrated for consistent
                    progression.
                  </p>
                </div>
              </div>

                <div className="rounded-3xl border border-cyan-300/80 bg-slate-900/75 p-5 backdrop-blur-md shadow-[0_0_42px_rgba(14,165,233,0.32)] ring-1 ring-cyan-300/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_48px_rgba(14,165,233,0.45)]">
                <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                  <FontAwesomeIcon
  icon={faLayerGroup}
  className="text-cyan-400 [--fa-secondary-color:theme(colors.fuchsia.500)] [--fa-secondary-opacity:1] text-cyan-100 drop-shadow-[0_0_18px_rgba(14,165,233,0.9)]"
/>
                  Adaptive Layer
                </h2>
                <div className="mt-3 space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-cyan-200/95">
                    Mode Signal
                  </p>
                  <p className="text-xl font-extrabold tracking-tight text-cyan-100 drop-shadow-[0_0_16px_rgba(14,165,233,0.9)]">
                    {adaptiveDifficulty.label || "Steady Mode"}
                  </p>
                  {typeof adaptiveDifficulty?.recentSampleSize === 'number' && (
                    <p className="text-xs uppercase tracking-[0.18em] text-cyan-100/85">
                      {adaptiveDifficulty.recentSampleSize > 0
                        ? `Based on last ${adaptiveDifficulty.recentSampleSize} adaptive session${
                            adaptiveDifficulty.recentSampleSize === 1 ? '' : 's'
                          }`
                        : 'No adaptive session history yet'}
                    </p>
                  )}
                  <p className="text-sm leading-6 text-cyan-100/90">
                    {adaptiveDifficultyDetail}
                  </p>
                </div>
              </div>

                <div className="rounded-3xl border border-fuchsia-300/80 bg-slate-900/75 p-5 backdrop-blur-md shadow-[0_0_42px_rgba(236,72,153,0.35)] ring-1 ring-fuchsia-300/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_48px_rgba(236,72,153,0.45)]">
                <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                  <FontAwesomeIcon
  icon={faBolt}
  className="text-cyan-400 [--fa-secondary-color:theme(colors.fuchsia.500)] [--fa-secondary-opacity:1] text-fuchsia-100 drop-shadow-[0_0_18px_rgba(236,72,153,0.95)]"
/>
                  Momentum
                </h2>
                <div className="mt-3 space-y-2">
                  <p className="text-[11px] uppercase tracking-[0.3em] text-fuchsia-200/95">
                    Pressure State
                  </p>
                  <p className="text-xl font-extrabold tracking-tight text-fuchsia-100 drop-shadow-[0_0_16px_rgba(236,72,153,0.9)]">
                    {pressureState.label || "Stable Load"}
                  </p>
                  <p className="text-sm leading-6 text-fuchsia-100/90">
                    {pressureState.detail ?? 'Keep balancing accuracy while chasing momentum.'}
                  </p>
                </div>
              </div>
              </div>

              <div className="rounded-3xl border border-violet-300/80 bg-slate-900/78 p-5 backdrop-blur-md shadow-[0_0_50px_rgba(129,140,248,0.32)] ring-1 ring-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_56px_rgba(129,140,248,0.45)]">
                <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                  <FontAwesomeIcon
  icon={faBrain}
  className="text-cyan-400 [--fa-secondary-color:theme(colors.fuchsia.500)] [--fa-secondary-opacity:1] text-violet-100 drop-shadow-[0_0_18px_rgba(129,140,248,0.95)]"
/>
                  Cognitive Identity
                </h2>

                <div className="mt-3 space-y-4">
                  <div className="space-y-1">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-violet-200/95">
                      All-Time Identity
                    </p>
                    <p className="mt-1 text-sm font-semibold text-violet-100 tracking-tight">
                      {formatCognitiveIdentityLabel(
                        cognitiveIdentitySummary.dominantIdentity?.label,
                      ) || 'Not enough data yet'}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-violet-100/90">
                      {cognitiveIdentitySummary.dominantIdentity?.description ||
                        'Complete more sessions to establish your dominant training identity.'}
                    </p>

                    {cognitiveIdentitySummary.dominantIdentity && (
                      <p className="mt-3 text-xs uppercase tracking-[0.24em] text-violet-200/95">
                        {cognitiveIdentitySummary.dominantIdentity.count}{' '}
                        classified session
                        {cognitiveIdentitySummary.dominantIdentity.count === 1
                          ? ''
                          : 's'}
                      </p>
                    )}
                  </div>

                  <div className="border-t border-white/15 pt-5 space-y-1">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-200/95">
                      Recent Trend
                    </p>
                    <p className="mt-1 text-sm font-semibold text-cyan-100 tracking-tight">
                      {recentTrendLabel || 'No recent trend yet'}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-cyan-100/90">
                      {!recentTrendLabel
                        ? 'Complete a few more sessions to detect a recent training trend.'
                        : isRecentTrendSameAsAllTime
                          ? 'Recent sessions are reinforcing your established all-time identity.'
                          : recentTrendDescription ||
                            'Complete a few more sessions to detect a recent training trend.'}
                    </p>

                    <p className="mt-3 text-xs uppercase tracking-[0.24em] text-cyan-200/95">
                      {recentCognitiveIdentitySummary.totalClassifiedSessions >
                      0
                        ? `Based on last ${recentCognitiveIdentitySummary.totalClassifiedSessions} classified session${
                            recentCognitiveIdentitySummary.totalClassifiedSessions ===
                            1
                              ? ''
                              : 's'
                          }`
                        : 'No recent classified identity data yet'}
                    </p>
                  </div>

                  <div className="border-t border-white/15 pt-5 space-y-1">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-200/95">
                      Identity Shift
                    </p>
                    <p className="mt-1 text-sm font-semibold text-cyan-100 tracking-tight">
                      {cognitiveIdentitySummary.identityShift?.label ||
                        'Not enough data'}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-cyan-100/90">
                      {cognitiveIdentitySummary.identityShift?.description ||
                        'Complete more classified sessions to detect an identity shift.'}
                    </p>
                  </div>

                  {cognitiveIdentitySummary.recentIdentitySession
                    ?.cognitiveIdentity?.primarySignal && (
                    <div className="border-t border-white/15 pt-5 space-y-1">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-200/90">
                        Recent Primary Signal
                      </p>
                      <p className="mt-2 text-sm leading-6 text-cyan-100 font-semibold tracking-tight">
                        {
                          cognitiveIdentitySummary.recentIdentitySession
                            .cognitiveIdentity.primarySignal
                        }
                      </p>
                    </div>
                  )}

                  {recentTrainingDirection && (
                    <div className="border-t border-white/15 pt-5 space-y-1">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-slate-200/90">
                        Recent Training Direction
                      </p>

                      <div className="mt-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${recentTrainingDirectionBadgeClass}`}
                        >
                          {recentTrainingDirection}
                        </span>
                      </div>
                    </div>
                  )}
                  {recentPuzzleTypeMeta && (
                    <div className="border-t border-white/15 pt-5 space-y-1">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-200/90">
                        Recent Puzzle Type
                      </p>
                      <p className="mt-2 text-sm font-semibold text-cyan-100 tracking-tight">
                        {recentPuzzleTypeMeta.label}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProfilePage;
