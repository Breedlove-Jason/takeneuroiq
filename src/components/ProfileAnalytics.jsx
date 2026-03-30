import { buildNeuralPowerTrendData } from "../utils/sessionTrendUtils";
import { buildPuzzleFamilyCards } from "../analytics/puzzleFamilyAnalytics";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { generateCoachingInsight } from "../analytics/coachingEngine";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartLine,
  faSparkles,
  faChartNetwork,
  faTableCells,
  faMicrochip,
  faBrain,
} from "@fortawesome/free-solid-svg-icons";

/**
 * ProfileAnalytics Component
 *
 * Displays a comprehensive dashboard of a player's performance and cognitive health.
 *
 * Features:
 * - Neural Power Trend Chart: Visualizes improvement over time using Recharts.
 * - Cognitive Tracks: Radar-like or bar displays of specific skill categories.
 * - Pressure State: Feedback on how the user handles sustained load.
 * - Coaching Insights: Dynamically generated text based on performance data.
 * - Adaptive Difficulty: Recommendation for the next session's challenge level.
 *
 * @param {Object} props - Component properties.
 * @param {Object} [props.cognitiveTracks] - Override for cognitive track data.
 * @param {Object} [props.neuralTrend] - Override for neural trend data.
 * @param {Object} [props.pressureState] - Override for pressure state.
 * @param {Object} [props.adaptiveDifficulty] - Override for adaptive difficulty.
 * @param {Object} [props.coachingInsight] - Override for coaching insight text.
 */
function ProfileAnalytics({
  sessions = [],
  cognitiveTracks: propCognitiveTracks,
  neuralTrend: propNeuralTrend,
  pressureState: propPressureState,
  adaptiveDifficulty: propAdaptiveDifficulty,
  coachingInsight: propCoachingInsight,
}) {
  const neuralPowerTrendData = buildNeuralPowerTrendData(sessions);
  const recentTrendData = neuralPowerTrendData.slice(-5);
  const neuralTrend = propNeuralTrend ?? {
    direction: "neutral",
    change: 0,
  };
  const trendSessionCount = recentTrendData.length;
  const pressureState = propPressureState ?? {
    state: "neutral",
    label: "Not Enough Data",
    detail: "Complete a few more sessions to detect pressure patterns.",
  };

  const trendStartPower =
    trendSessionCount > 0 ? recentTrendData[0].neuralPower : 0;

  const trendLatestPower =
    trendSessionCount > 0
      ? recentTrendData[trendSessionCount - 1].neuralPower
      : 0;

  // Compare the recent average against the player's full-history baseline.
  const recentAverageNeuralPower =
    trendSessionCount > 0
      ? Math.round(
          recentTrendData.reduce(
            (sum, session) => sum + session.neuralPower,
            0,
          ) / trendSessionCount,
        )
      : 0;

  const lifetimeSessionCount = neuralPowerTrendData.length;

  const lifetimeAverageNeuralPower =
    lifetimeSessionCount > 0
      ? Math.round(
          neuralPowerTrendData.reduce(
            (sum, session) => sum + session.neuralPower,
            0,
          ) / lifetimeSessionCount,
        )
      : 0;

  const recentVsLifetimeDelta =
    recentAverageNeuralPower - lifetimeAverageNeuralPower;

  const cognitiveTracks = propCognitiveTracks ?? {
    patternRecognition: 0,
    focusStability: 0,
    processingSpeed: 0,
    consistency: 0,
  };

  // Normalize the track names expected by the coaching engine.
  const precisionScore = cognitiveTracks.patternRecognition ?? 0;
  const focusStabilityScore = cognitiveTracks.focusStability ?? 0;
  const throughputScore = cognitiveTracks.processingSpeed ?? 0;
  const consistencyScore = cognitiveTracks.consistency ?? 0;

  const adaptiveDifficulty = propAdaptiveDifficulty ?? {
    state: "steady",
    label: "Steady Mode",
    description:
      "Maintain balanced difficulty to reinforce skill growth without overload.",
    targetDifficulty: "medium",
  };

  const localCoachingInsight = generateCoachingInsight({
    cognitiveTracks: {
      patternRecognition: precisionScore,
      focusStability: focusStabilityScore,
      processingSpeed: throughputScore,
      consistency: consistencyScore,
    },
    neuralTrend,
    pressureState,
    adaptiveDifficulty,
  });

  const coachingInsight = propCoachingInsight ?? localCoachingInsight;

  const puzzleFamilyCards = buildPuzzleFamilyCards(sessions);

  const trendToneMap = {
    improving: {
      label: "Improving",
      symbol: "▲",
      className: "text-emerald-300",
      subtext: "Your recent Neural Power is trending upward.",
    },
    stable: {
      label: "Stable",
      symbol: "■",
      className: "text-yellow-300",
      subtext: "Your recent Neural Power is holding steady.",
    },
    declining: {
      label: "Declining",
      symbol: "▼",
      className: "text-rose-300",
      subtext: "Your recent Neural Power has dipped across recent sessions.",
    },
    neutral: {
      label: "Not Enough Data",
      symbol: "•",
      className: "text-slate-300",
      subtext: "Complete more sessions to detect a reliable trend.",
    },
  };

  const trendDisplay =
    trendToneMap[neuralTrend.direction] || trendToneMap.neutral;

  const pressureToneMap = {
    "under-pressure": {
      className: "text-amber-300",
      borderClass: "border-amber-500/20",
      accentClass: "text-amber-300/80",
    },
    "locked-in": {
      className: "text-emerald-300",
      borderClass: "border-emerald-500/20",
      accentClass: "text-emerald-300/80",
    },
    stable: {
      className: "text-cyan-300",
      borderClass: "border-cyan-500/20",
      accentClass: "text-cyan-300/80",
    },
    neutral: {
      className: "text-slate-300",
      borderClass: "border-slate-700",
      accentClass: "text-slate-400",
    },
  };

  const pressureDisplay =
    pressureToneMap[pressureState.state] || pressureToneMap.neutral;

  const adaptiveToneMap = {
    recover: {
      className: "text-amber-300",
      borderClass: "border-amber-500/20",
      accentClass: "text-amber-300/80",
      badgeClass: "text-amber-300",
    },
    steady: {
      className: "text-cyan-300",
      borderClass: "border-cyan-500/20",
      accentClass: "text-cyan-300/80",
      badgeClass: "text-cyan-300",
    },
    challenge: {
      className: "text-emerald-300",
      borderClass: "border-emerald-500/20",
      accentClass: "text-emerald-300/80",
      badgeClass: "text-emerald-300",
    },
  };

  const adaptiveDisplay =
    adaptiveToneMap[adaptiveDifficulty.state] || adaptiveToneMap.steady;

  // Centralize the stat card content so shared colors stay in sync with the UI.
  const trendStats = [
    {
      label: "Sessions",
      value: trendSessionCount,
      colorClass: "text-cyan-200",
    },
    {
      label: "Start NP",
      value: trendStartPower,
      colorClass: "text-yellow-400",
    },
    {
      label: "Latest NP",
      value: trendLatestPower,
      colorClass: "text-yellow-400",
    },
    {
      label: "Delta",
      value: `${neuralTrend.change > 0 ? "+" : ""}${neuralTrend.change}`,
      colorClass: trendDisplay.className,
    },
    {
      label: "Vs Lifetime",
      value: `${recentVsLifetimeDelta > 0 ? "+" : ""}${recentVsLifetimeDelta}`,
      colorClass:
        recentVsLifetimeDelta >= 0 ? "text-emerald-300" : "text-rose-300",
    },
  ];

  if (neuralPowerTrendData.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-6 text-center">
        <div>
          <p className="mb-2 text-slate-400">No session history yet.</p>
          <p className="text-xs text-slate-500">
            Complete your first arena run to see your performance trend.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        className={`rounded-2xl border bg-slate-900/70 p-4 ${pressureDisplay.borderClass}`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          {" "}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
              Neural Trend
            </p>
            <h3
              className={`mt-2 text-xl font-semibold ${trendDisplay.className}`}
            >
              {trendDisplay.symbol} {trendDisplay.label}
            </h3>
            <p className="mt-2 text-sm text-slate-300">
              {coachingInsight.summary}
            </p>{" "}
            <p className="mt-2 text-xs leading-5 text-slate-400">
              {coachingInsight.focus}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Based on your last {trendSessionCount}{" "}
              {trendSessionCount === 1 ? "session" : "sessions"}.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-5">
              {trendStats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex min-h-22 flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/40 p-3"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 group-hover:text-cyan-300">
                    {stat.label}
                  </p>
                  <p
                    className={`mt-3 text-lg font-semibold ${stat.colorClass}`}
                  >
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="sm:text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Change
            </p>
            <p
              className={`mt-2 whitespace-nowrap text-2xl font-bold ${trendDisplay.className}`}
            >
              {neuralTrend.change > 0 ? "+" : ""}
              {neuralTrend.change} NP
            </p>
          </div>
        </div>
      </div>

      <div
        className={`rounded-2xl border bg-slate-900/70 p-4 ${pressureDisplay.borderClass}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p
              className={`text-xs font-semibold uppercase tracking-[0.25em] ${pressureDisplay.accentClass}`}
            >
              Cognitive Pressure
            </p>
            <h3
              className={`mt-2 text-xl font-semibold ${pressureDisplay.className}`}
            >
              {pressureState.label}
            </h3>
            <p className="mt-2 text-sm text-slate-300">
              {pressureState.detail}
            </p>
          </div>
        </div>
      </div>

      <div
        className={`rounded-2xl border bg-slate-900/70 p-4 ${adaptiveDisplay.borderClass}`}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p
              className={`text-xs font-semibold uppercase tracking-[0.25em] ${adaptiveDisplay.accentClass}`}
            >
              Adaptive Difficulty
            </p>
            <h3
              className={`mt-2 text-xl font-semibold ${adaptiveDisplay.className}`}
            >
              {adaptiveDifficulty.label}
            </h3>
            <p className="mt-2 text-sm text-slate-300">
              {adaptiveDifficulty.description}
            </p>
          </div>

          <div className="sm:text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Target
            </p>
            <p
              className={`mt-2 whitespace-nowrap text-lg font-bold uppercase ${adaptiveDisplay.badgeClass}`}
            >
              {adaptiveDifficulty.targetDifficulty}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">
              Neural Power History
            </h3>
            <p className="text-sm text-slate-300">
              Track how your recent performance is trending across sessions.
            </p>
          </div>

          <div
            className={`rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${trendDisplay.className}`}
          >
            {trendDisplay.symbol} {trendDisplay.label}
          </div>
        </div>
        <div className="h-72 min-h-72 w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            minHeight={288}
          >
            <LineChart data={neuralPowerTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip
                formatter={(value) => [`${value} NP`, "Neural Power"]}
                labelFormatter={(label, payload) => {
                  const point = payload?.[0]?.payload;
                  return point?.date || label;
                }}
                contentStyle={{
                  backgroundColor: "#020617",
                  border: "1px solid #0f172a",
                  borderRadius: "10px",
                  color: "#e2e8f0",
                }}
                labelStyle={{
                  color: "#67e8f9",
                  fontWeight: 600,
                }}
                itemStyle={{
                  color: "#e2e8f0",
                }}
                cursor={{
                  stroke: "#22d3ee",
                  strokeWidth: 1,
                  strokeDasharray: "4 4",
                }}
              />
              <Line
                type="monotone"
                dataKey="neuralPower"
                stroke="#22d3ee"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {puzzleFamilyCards.length > 0 ? (
        <div className="rounded-2xl border border-cyan-500/20 bg-[linear-gradient(165deg,rgba(15,23,42,0.95)_0%,rgba(2,6,23,0.96)_100%)] p-4 shadow-[0_0_44px_rgba(8,47,73,0.32)]">
          <div className="flex flex-col gap-1 rounded-xl border border-cyan-500/15 bg-cyan-500/5 px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
              Puzzle Family Performance
            </p>
            <p className="text-sm text-slate-300">
              Family-level summaries, accuracy, and trend reads.
            </p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {puzzleFamilyCards.map((family) => {
              const badgeClasses = getTrendBadgeClasses(family.trendState);
              const familyVisual = getPuzzleFamilyVisual(family.puzzleType);
              const familyTone = getFamilyCardTone(family.puzzleType);
              const accuracyBadge = Number.isFinite(family.averageAccuracy)
                ? `${Math.round(family.averageAccuracy)}%`
                : "0%";
              const valueToneMap =
                family.puzzleType === "sequence_sprint"
                  ? {
                      averageScore: "text-violet-200",
                      bestScore: "text-cyan-200",
                      bestAccuracy: "text-emerald-300",
                      averageNeuralPower: "text-fuchsia-200",
                    }
                  : family.puzzleType === "logic_gate"
                    ? {
                        averageScore: "text-amber-200",
                        bestScore: "text-cyan-200",
                        bestAccuracy: "text-emerald-300",
                        averageNeuralPower: "text-fuchsia-200",
                      }
                    : family.puzzleType === "pattern_rush"
                    ? {
                        averageScore: "text-cyan-200",
                        bestScore: "text-violet-200",
                        bestAccuracy: "text-emerald-300",
                        averageNeuralPower: "text-fuchsia-200",
                      }
                    : family.puzzleType === "grid_recall"
                      ? {
                          averageScore: "text-emerald-200",
                          bestScore: "text-cyan-200",
                          bestAccuracy: "text-emerald-300",
                          averageNeuralPower: "text-fuchsia-200",
                        }
                      : {
                          averageScore: "text-cyan-200",
                          bestScore: "text-violet-200",
                          bestAccuracy: "text-emerald-300",
                          averageNeuralPower: "text-fuchsia-200",
                        };
              const statRows = [
                {
                  label: "Avg Score",
                  value: family.averageScore ?? 0,
                  valueClass: valueToneMap.averageScore,
                },
                {
                  label: "Best Score",
                  value: family.bestScore ?? 0,
                  valueClass: valueToneMap.bestScore,
                },
                {
                  label: "Best Accuracy",
                  value: `${family.bestAccuracy ?? 0}%`,
                  valueClass: valueToneMap.bestAccuracy,
                },
                {
                  label: "Avg Neural Power",
                  value: `${family.averageNeuralPower ?? 0} NP`,
                  valueClass: valueToneMap.averageNeuralPower,
                },
              ];

              return (
                <div
                  key={family.puzzleType ?? family.familyLabel}
                  className={`flex h-full min-h-90 flex-col gap-3 rounded-2xl border p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 ${familyTone.card} ${badgeClasses.glow} ${familyVisual.accentRing}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className={familyVisual.iconWrap}>
                        <FontAwesomeIcon
                          icon={familyVisual.icon}
                          className="text-lg"
                        />
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-semibold uppercase tracking-[0.35em] leading-[1.4] ${familyVisual.accentText}`}
                        >
                          {family.familyLabel}
                        </p>
                        <p className={`text-[11px] ${familyTone.sessions}`}>
                          {family.sessionsPlayed ?? 0} sessions played
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] ${badgeClasses.badge}`}
                      >
                        {family.trendState || "Calibrating"}
                      </span>
                      <span
                        className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] ${familyTone.avgBadge}`}
                      >
                        Avg {accuracyBadge}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {statRows.map((stat) => (
                      <div
                        key={`${family.familyLabel}-${stat.label}`}
                        className={`flex flex-col gap-1 rounded-xl border p-3 ${familyTone.statCard}`}
                      >
                        <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                          {stat.label}
                        </span>
                        <span
                          className={`text-lg font-semibold ${stat.valueClass}`}
                        >
                          {stat.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div
                    className={`mt-auto rounded-2xl border px-3 py-2 text-xs uppercase tracking-[0.3em] text-slate-300 ${familyTone.trendCard} ${familyVisual.accentRing}`}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">
                      Trend Read
                    </p>
                    <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-200">
                      {family.trendReason || "Trend data is still calibrating."}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-cyan-500/30 bg-cyan-500/5 p-4 text-sm text-slate-300">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">
            Puzzle Family Performance
          </p>
          <p className="mt-2 text-sm text-slate-300">
            Complete any challenge to unlock neural family summaries.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * Helper to calculate session accuracy.
 */
function getSessionAccuracy(session) {
  if (
    typeof session.puzzlesAttempted === "number" &&
    session.puzzlesAttempted > 0 &&
    typeof session.puzzlesCorrect === "number"
  ) {
    return Math.round(
      (session.puzzlesCorrect / session.puzzlesAttempted) * 100,
    );
  }
  return session.accuracy ?? 0;
}

/**
 * Calculates a set of performance metrics from session history.
 */
function calculatePerformanceMetrics(sessions) {
  const safeSessions = Array.isArray(sessions) ? sessions : [];

  if (safeSessions.length === 0) {
    return {
      bestScore: 0,
      bestStreak: 0,
      bestNeuralPower: 0,
      averageScore: 0,
      averageAccuracy: 0,
      totalPuzzlesSolved: 0,
      totalPuzzlesAttempted: 0,
      solveRate: 0,
      totalSessions: 0,
    };
  }

  const bestScore = Math.max(...safeSessions.map((s) => s.score ?? 0));
  const bestStreak = Math.max(
    ...safeSessions.map((s) => s.bestStreak ?? s.streak ?? 0),
  );
  const bestNeuralPower = Math.max(
    ...safeSessions.map((s) => s.neuralPower ?? 0),
  );
  const totalSessions = safeSessions.length;

  const totalPuzzlesSolved = safeSessions.reduce(
    (sum, s) => sum + (s.puzzlesCorrect ?? s.correctAnswers ?? 0),
    0,
  );
  const totalPuzzlesAttempted = safeSessions.reduce(
    (sum, s) => sum + (s.puzzlesAttempted ?? s.puzzlesSeen ?? 0),
    0,
  );

  const solveRate =
    totalPuzzlesAttempted > 0
      ? Math.round((totalPuzzlesSolved / totalPuzzlesAttempted) * 100)
      : 0;

  const averageScore = Math.round(
    safeSessions.reduce((sum, s) => sum + (s.score ?? 0), 0) / totalSessions,
  );

  const averageAccuracy = Math.round(
    safeSessions.reduce((sum, s) => sum + getSessionAccuracy(s), 0) /
      totalSessions,
  );

  return {
    bestScore,
    bestStreak,
    bestNeuralPower,
    averageScore,
    averageAccuracy,
    totalPuzzlesSolved,
    totalPuzzlesAttempted,
    solveRate,
    totalSessions,
  };
}

function getTrendBadgeClasses(trendState) {
  const trendBadgeToneMap = {
    Rising: {
      badge:
        "border-emerald-400/60 bg-emerald-500/10 text-emerald-200 shadow-[0_0_25px_rgba(16,185,129,0.35)]",
      glow: "shadow-[0_0_30px_rgba(16,185,129,0.2)]",
    },
    Steadying: {
      badge:
        "border-cyan-400/60 bg-cyan-500/10 text-cyan-200 shadow-[0_0_25px_rgba(6,182,212,0.35)]",
      glow: "shadow-[0_0_30px_rgba(6,182,212,0.2)]",
    },
    Rebuilding: {
      badge:
        "border-amber-400/60 bg-amber-500/10 text-amber-200 shadow-[0_0_25px_rgba(251,191,36,0.35)]",
      glow: "shadow-[0_0_30px_rgba(251,191,36,0.2)]",
    },
    Calibrating: {
      badge:
        "border-fuchsia-400/60 bg-fuchsia-500/10 text-fuchsia-200 shadow-[0_0_25px_rgba(236,72,153,0.35)]",
      glow: "shadow-[0_0_30px_rgba(236,72,153,0.2)]",
    },
    fallback: {
      badge:
        "border-slate-500/60 bg-slate-900/70 text-slate-200 shadow-[0_0_15px_rgba(15,23,42,0.6)]",
      glow: "shadow-[0_0_20px_rgba(15,23,42,0.3)]",
    },
  };

  return trendBadgeToneMap[trendState] || trendBadgeToneMap.fallback;
}

function getFamilyCardTone(puzzleType) {
  const familyToneMap = {
    pattern_rush: {
      card: "border-cyan-400/30 bg-[linear-gradient(160deg,rgba(34,211,238,0.12)_0%,rgba(6,13,27,0.92)_48%,rgba(2,6,23,0.96)_100%)] shadow-[0_0_40px_rgba(34,211,238,0.18)]",
      label: "text-cyan-200",
      sessions: "text-cyan-300/80",
      avgBadge: "border-cyan-400/35 bg-cyan-500/10 text-cyan-200",
      statCard: "border-cyan-500/20 bg-cyan-500/5",
      trendCard: "border-cyan-500/20 bg-cyan-500/5",
    },
    sequence_sprint: {
      card: "border-violet-400/30 bg-[linear-gradient(160deg,rgba(168,85,247,0.12)_0%,rgba(12,9,27,0.92)_48%,rgba(2,6,23,0.96)_100%)] shadow-[0_0_40px_rgba(168,85,247,0.18)]",
      label: "text-violet-200",
      sessions: "text-violet-300/80",
      avgBadge: "border-violet-400/35 bg-violet-500/10 text-violet-200",
      statCard: "border-violet-500/20 bg-violet-500/5",
      trendCard: "border-violet-500/20 bg-violet-500/5",
    },
    grid_recall: {
      card: "border-emerald-400/30 bg-[linear-gradient(160deg,rgba(16,185,129,0.12)_0%,rgba(6,13,27,0.92)_48%,rgba(2,6,23,0.96)_100%)] shadow-[0_0_40px_rgba(16,185,129,0.18)]",
      label: "text-emerald-200",
      sessions: "text-emerald-300/80",
      avgBadge: "border-emerald-400/35 bg-emerald-500/10 text-emerald-200",
      statCard: "border-emerald-500/20 bg-emerald-500/5",
      trendCard: "border-emerald-500/20 bg-emerald-500/5",
    },
    logic_gate: {
      card: "border-amber-400/30 bg-[linear-gradient(160deg,rgba(251,191,36,0.12)_0%,rgba(13,8,4,0.92)_48%,rgba(2,6,23,0.96)_100%)] shadow-[0_0_40px_rgba(251,191,36,0.18)]",
      label: "text-amber-200",
      sessions: "text-amber-300/80",
      avgBadge: "border-amber-400/35 bg-amber-500/10 text-amber-200",
      statCard: "border-amber-500/20 bg-amber-500/5",
      trendCard: "border-amber-500/20 bg-amber-500/5",
    },
    default: {
      card: "border-slate-700/80 bg-[linear-gradient(160deg,rgba(30,41,59,0.2)_0%,rgba(2,6,23,0.92)_58%,rgba(2,6,23,0.96)_100%)] shadow-[0_0_30px_rgba(15,23,42,0.35)]",
      label: "text-slate-200",
      sessions: "text-slate-400",
      avgBadge: "border-slate-700/70 bg-slate-900/70 text-slate-200",
      statCard: "border-slate-800/70 bg-slate-900/60",
      trendCard: "border-slate-800/70 bg-slate-950/40",
    },
  };

  return familyToneMap[puzzleType] || familyToneMap.default;
}

function getPuzzleFamilyVisual(puzzleType) {
  const visualMap = {
    pattern_rush: {
      icon: faSparkles,
      iconWrap:
        "flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/40 bg-cyan-500/10 text-cyan-200",
      accentText: "text-cyan-200",
      accentRing: "ring-1 ring-cyan-500/30",
    },
    sequence_sprint: {
      icon: faChartNetwork,
      iconWrap:
        "flex h-10 w-10 items-center justify-center rounded-full border border-fuchsia-400/40 bg-fuchsia-500/10 text-fuchsia-200",
      accentText: "text-fuchsia-200",
      accentRing: "ring-1 ring-fuchsia-500/30",
    },
    grid_recall: {
      icon: faTableCells,
      iconWrap:
        "flex h-10 w-10 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/10 text-emerald-200",
      accentText: "text-emerald-200",
      accentRing: "ring-1 ring-emerald-500/30",
    },
    logic_gate: {
      icon: faMicrochip,
      iconWrap:
        "flex h-10 w-10 items-center justify-center rounded-full border border-amber-400/40 bg-amber-500/10 text-amber-200",
      accentText: "text-amber-200",
      accentRing: "ring-1 ring-amber-500/30",
    },
    fallback: {
      icon: faBrain,
      iconWrap:
        "flex h-10 w-10 items-center justify-center rounded-full border border-slate-600/40 bg-slate-900/60 text-slate-200",
      accentText: "text-slate-200",
      accentRing: "ring-1 ring-slate-600/30",
    },
  };

  return visualMap[puzzleType] || visualMap.fallback;
}

/**
 * Renders the Identity Core stats grid.
 */
export function IdentityCoreStats({ sessions = [], playerName = "Unknown" }) {
  const metrics = calculatePerformanceMetrics(sessions);

  const stats = [
    {
      label: "PLAYER",
      value: playerName,
      color: "text-cyan-300",
      fullWidth: true,
    },
    { label: "BEST SCORE", value: metrics.bestScore, color: "text-cyan-400" },
    {
      label: "BEST STREAK",
      value: metrics.bestStreak,
      color: "text-emerald-400",
    },
    {
      label: "BEST POWER",
      value: metrics.bestNeuralPower,
      color: "text-yellow-400",
    },
    {
      label: "AVG SCORE",
      value: metrics.averageScore,
      color: "text-cyan-400",
    },
    {
      label: "ACCURACY",
      value: `${metrics.averageAccuracy}%`,
      color: "text-blue-400",
    },
    {
      label: "SOLVED",
      value: metrics.totalPuzzlesSolved,
      color: "text-emerald-400",
    },
    {
      label: "ATTEMPTS",
      value: metrics.totalPuzzlesAttempted,
      color: "text-cyan-300",
    },
    {
      label: "SOLVE RATE",
      value: `${metrics.solveRate}%`,
      color: "text-fuchsia-300",
    },
    {
      label: "SESSIONS PLAYED",
      value: metrics.totalSessions,
      color: "text-cyan-200",
      fullWidth: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${
            stat.fullWidth
              ? "col-span-2 border-white/10 bg-white/5 shadow-inner"
              : "border-slate-800/80 bg-slate-950/40 hover:border-cyan-500/50 hover:bg-slate-900/80 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)]"
          }`}
        >
          <div className="absolute inset-0 bg-linear-to-br from-cyan-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <p className="relative z-10 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 group-hover:text-cyan-300/80">
            {stat.label}
          </p>
          <p
            className={`relative z-10 mt-3 font-mono text-2xl font-black tracking-tighter transition-transform duration-300 group-hover:scale-105 ${stat.color}`}
          >
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}

/**
 * Renders the Performance Snapshot section.
 */
export function PerformanceSnapshot({ sessions = [] }) {
  const metrics = calculatePerformanceMetrics(sessions);

  const scoreBarMax = Math.max(metrics.bestScore, 1500);
  const bestScorePercent = Math.min(
    (metrics.bestScore / scoreBarMax) * 100,
    100,
  );
  const averageScorePercent = Math.min(
    (metrics.averageScore / scoreBarMax) * 100,
    100,
  );
  const averageAccuracyPercent = Math.min(metrics.averageAccuracy, 100);
  const bestStreakPercent = Math.min((metrics.bestStreak / 20) * 100, 100);

  const snapshots = [
    {
      label: "BEST SCORE",
      value: metrics.bestScore,
      percent: bestScorePercent,
      color: "text-cyan-400",
      barColor: "bg-cyan-400",
    },
    {
      label: "AVG SCORE",
      value: metrics.averageScore,
      percent: averageScorePercent,
      color: "text-green-300",
      barColor: "bg-green-300",
    },
    {
      label: "ACCURACY",
      value: `${metrics.averageAccuracy}%`,
      percent: averageAccuracyPercent,
      color: "text-violet-300",
      barColor: "bg-violet-400",
    },
    {
      label: "BEST STREAK",
      value: metrics.bestStreak,
      percent: bestStreakPercent,
      color: "text-fuchsia-300",
      barColor: "bg-fuchsia-400",
    },
    {
      label: "BEST POWER",
      value: metrics.bestNeuralPower,
      percent: Math.min((metrics.bestNeuralPower / 100) * 100, 100),
      color: "text-yellow-300",
      barColor: "bg-yellow-400",
    },
  ];

  return (
    <div className="rounded-3xl border border-fuchsia-400/20 bg-slate-900/70 p-5 shadow-[0_0_30px_rgba(217,70,239,0.08)] backdrop-blur-md">
      <h2 className="flex items-center gap-2 text-xl font-bold text-white">
        <FontAwesomeIcon icon={faChartLine} className="text-fuchsia-300" />
        Performance Snapshot
      </h2>

      <div className="mt-5 space-y-4">
        {snapshots.map((snapshot) => (
          <div key={snapshot.label} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">{snapshot.label}</span>
              <span className={`text-sm font-semibold ${snapshot.color}`}>
                {snapshot.value}
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-800/80">
              <div
                className={`h-2 rounded-full ${snapshot.barColor}`}
                style={{ width: `${snapshot.percent}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Renders the Agent Summary section.
 */
export function AgentSummary({ coachingInsight }) {
  const summary = coachingInsight
    ? `${coachingInsight.summary} ${coachingInsight.detail}`.trim()
    : "Complete your first session to unlock AI coaching insights.";

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-800/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
        Agent Summary
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-200">{summary}</p>
    </div>
  );
}

export default ProfileAnalytics;
