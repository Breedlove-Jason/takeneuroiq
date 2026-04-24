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
  faRoute,
  faStar,
  faDiagramProject,
  faTableCells,
  faMicrochip,
  faBrain,
  faBorderAll,
  faRotateRight,
  faWaveform,
  faLink,
  faBullseye,
  faBolt,
} from "@fortawesome/pro-duotone-svg-icons";

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
        <div className="rounded-2xl border border-indigo-500/30 bg-[linear-gradient(165deg,rgba(30,27,75,0.45)_0%,rgba(15,23,42,0.95)_46%,rgba(2,6,23,0.98)_100%)] p-4 shadow-[0_0_44px_rgba(79,70,229,0.18)] ring-1 ring-violet-500/20">
          <div className="flex flex-col gap-1 rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-300">
              Puzzle Family Performance
            </p>
            <p className="text-sm text-slate-300">
              Family-level summaries, accuracy, and trend reads.
            </p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {puzzleFamilyCards.map((family, index) => {
              // Row-based color assignment logic:
              // Mobile: 1 column -> row = index
              // Tablet (md): 2 columns -> row = Math.floor(index / 2)
              // Desktop (lg): 3 columns -> row = Math.floor(index / 3)
              // We'll use a fixed row-to-palette mapping based on the 3-column layout as it's the most common "full" view.
              const rowPalettes = [
                "pattern_rush",      // Cyan
                "sequence_sprint",   // Fuchsia
                "rule_shift",        // Amber
                "grid_recall",       // Aqua
                "logic_gate",        // Orange
                "logic_grid",        // Sky
                "signal_path",       // Cyan/Blue
                "spatial_rotation",   // Cyan/Violet/Fuchsia
                "number_weave",      // Emerald/Teal/Cyan
                "memory_chain",      // Lilac
              ];
              const rowIndex = Math.floor(index / 3);
              const rowPalette = rowPalettes[rowIndex % rowPalettes.length];

              const familyConfig = getFamilyCardTone(family.puzzleType, rowPalette);
              const accuracyBadge = Number.isFinite(family.averageAccuracy)
                ? `${Math.round(family.averageAccuracy)}%`
                : "0%";

              const statRows = [
                {
                  label: "Avg Score",
                  value: family.averageScore ?? 0,
                },
                {
                  label: "Best Score",
                  value: family.bestScore ?? 0,
                },
                {
                  label: "Best Accuracy",
                  value: `${family.bestAccuracy ?? 0}%`,
                },
                {
                  label: "Avg Neural Power",
                  value: `${family.averageNeuralPower ?? 0} NP`,
                },
              ];

              return (
                <div
                  key={family.puzzleType ?? family.familyLabel}
                  className={`group flex h-full min-h-90 flex-col gap-3 rounded-2xl border p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 ${familyConfig.cardClass} ${familyConfig.accentRingClass}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className={familyConfig.iconWrapClass}>
                        <FontAwesomeIcon
                          icon={familyConfig.icon}
                          className={`[--fa-secondary-opacity:1] transition-transform duration-300 group-hover:scale-110 ${familyConfig.iconClass || "text-lg"}`}
                        />
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-semibold uppercase tracking-[0.35em] leading-[1.4] ${familyConfig.accentTextClass}`}
                        >
                          {family.familyLabel}
                        </p>
                        <p className={`text-[11px] ${familyConfig.sessionsTextClass}`}>
                          {family.sessionsPlayed ?? 0} sessions played
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] ${familyConfig.trendBadgeClass}`}
                      >
                        {family.trendState || "Calibrating"}
                      </span>
                      <span
                        className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.25em] ${familyConfig.avgBadgeClass}`}
                      >
                        Avg {accuracyBadge}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {statRows.map((stat) => (
                      <div
                        key={`${family.familyLabel}-${stat.label}`}
                        className={`flex flex-col gap-1 rounded-xl border p-3 ${familyConfig.statTileClass}`}
                      >
                        <span className={`text-[9px] font-semibold uppercase tracking-[0.3em] opacity-80 ${familyConfig.statLabelClass}`}>
                          {stat.label}
                        </span>
                        <span
                          className={`text-lg font-semibold ${familyConfig.statValueClass}`}
                        >
                          {stat.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div
                    className={`mt-auto rounded-2xl border px-3 py-2 text-xs uppercase tracking-[0.3em] ${familyConfig.trendPanelClass}`}
                  >
                    <p className={`text-[10px] font-semibold uppercase tracking-[0.35em] opacity-80 ${familyConfig.trendTitleClass}`}>
                      Trend Read
                    </p>
                    <p className={`mt-1 text-sm font-semibold leading-relaxed ${familyConfig.trendTextClass}`}>
                      {family.trendReason || "Trend data is still calibrating."}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-indigo-500/35 bg-[linear-gradient(165deg,rgba(67,56,202,0.12)_0%,rgba(15,23,42,0.72)_100%)] p-4 text-sm text-slate-300 ring-1 ring-violet-500/20">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-300">
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


function getFamilyCardTone(puzzleType, rowPalette = null) {
  const baseIconWrapper = "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border overflow-hidden transition-all duration-300";

  const familyConfigMap = {
    pattern_rush: {
      cardClass: "border-cyan-400/30 bg-[linear-gradient(160deg,rgba(34,211,238,0.12)_0%,rgba(6,13,27,0.92)_48%,rgba(2,6,23,0.96)_100%)] shadow-[0_0_40px_rgba(34,211,238,0.18)]",
      iconWrapClass: `${baseIconWrapper} border-cyan-400/40 bg-cyan-500/10 text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.62)]`,
      iconClass: "text-[0.85rem]",
      icon: faStar,
      accentTextClass: "text-cyan-200",
      sessionsTextClass: "text-cyan-300/80",
      trendBadgeClass: "border-cyan-400/35 bg-cyan-500/10 text-cyan-200",
      avgBadgeClass: "border-cyan-400/35 bg-cyan-500/20 text-cyan-100",
      statTileClass: "border-cyan-500/20 bg-cyan-500/5",
      statLabelClass: "text-cyan-300/80",
      statValueClass: "text-cyan-100",
      trendPanelClass: "border-cyan-500/20 bg-cyan-500/5 ring-1 ring-cyan-500/30",
      trendTitleClass: "text-cyan-300/80",
      trendTextClass: "text-cyan-100",
      accentRingClass: "ring-1 ring-cyan-500/30",
    },
    sequence_sprint: {
      cardClass: "border-fuchsia-400/30 bg-[linear-gradient(160deg,rgba(217,70,239,0.14)_0%,rgba(48,10,40,0.92)_46%,rgba(2,6,23,0.96)_100%)] shadow-[0_0_40px_rgba(217,70,239,0.22)]",
      iconWrapClass: `${baseIconWrapper} border-fuchsia-400/45 bg-fuchsia-500/12 text-fuchsia-200 shadow-[0_0_18px_rgba(217,70,239,0.65)]`,
      iconClass: "text-[0.85rem]",
      icon: faDiagramProject,
      accentTextClass: "text-fuchsia-200",
      sessionsTextClass: "text-fuchsia-300/80",
      trendBadgeClass: "border-fuchsia-400/35 bg-fuchsia-500/10 text-fuchsia-200",
      avgBadgeClass: "border-fuchsia-400/35 bg-fuchsia-500/20 text-fuchsia-100",
      statTileClass: "border-fuchsia-500/20 bg-fuchsia-500/5",
      statLabelClass: "text-fuchsia-300/80",
      statValueClass: "text-fuchsia-100",
      trendPanelClass: "border-fuchsia-500/20 bg-fuchsia-500/5 ring-1 ring-fuchsia-500/30",
      trendTitleClass: "text-fuchsia-300/80",
      trendTextClass: "text-fuchsia-100",
      accentRingClass: "ring-1 ring-fuchsia-500/30",
    },
    rule_shift: {
      cardClass: "border-amber-400/30 bg-[linear-gradient(160deg,rgba(245,158,11,0.14)_0%,rgba(36,22,8,0.92)_46%,rgba(2,6,23,0.96)_100%)] shadow-[0_0_40px_rgba(245,158,11,0.22)]",
      iconWrapClass: `${baseIconWrapper} border-amber-400/45 bg-amber-500/12 text-amber-200 shadow-[0_0_18px_rgba(245,158,11,0.62)]`,
      iconClass: "text-[0.8rem]",
      icon: faRotateRight,
      accentTextClass: "text-amber-200",
      sessionsTextClass: "text-amber-300/80",
      trendBadgeClass: "border-amber-400/35 bg-amber-500/10 text-amber-200",
      avgBadgeClass: "border-amber-400/35 bg-amber-500/20 text-amber-100",
      statTileClass: "border-amber-500/20 bg-amber-500/5",
      statLabelClass: "text-amber-300/80",
      statValueClass: "text-amber-100",
      trendPanelClass: "border-amber-500/20 bg-amber-500/5 ring-1 ring-amber-500/30",
      trendTitleClass: "text-amber-300/80",
      trendTextClass: "text-amber-100",
      accentRingClass: "ring-1 ring-amber-500/30",
    },
    grid_recall: {
      cardClass: "border-[var(--color-aqua-border)]/30 bg-[linear-gradient(160deg,var(--color-aqua-tint)_0%,rgba(34,211,238,0.08)_42%,rgba(6,14,20,0.94)_100%)] shadow-[0_0_40px_rgba(104,217,207,0.2)]",
      iconWrapClass: `${baseIconWrapper} border-[var(--color-aqua-border)]/45 bg-gradient-to-br from-[var(--color-aqua-accent)]/12 via-[var(--color-aqua-icon)]/10 to-[var(--color-aqua-tint)] text-[var(--color-aqua-icon)] shadow-[0_0_18px_rgba(104,217,207,0.58)]`,
      iconClass: "text-base",
      icon: faTableCells,
      accentTextClass: "text-[var(--color-aqua-icon)]",
      sessionsTextClass: "text-[var(--color-aqua-accent)]/80",
      trendBadgeClass: "border-[var(--color-aqua-border)]/35 bg-[var(--color-aqua-accent)]/10 text-[var(--color-aqua-icon)]",
      avgBadgeClass: "border-[var(--color-aqua-border)]/35 bg-[var(--color-aqua-accent)]/20 text-[var(--color-aqua-icon)]",
      statTileClass: "border-[var(--color-aqua-border)]/25 bg-[var(--color-aqua-tint)]",
      statLabelClass: "text-[var(--color-aqua-accent)]/80",
      statValueClass: "text-[var(--color-aqua-icon)]",
      trendPanelClass: "border-[var(--color-aqua-border)]/25 bg-[var(--color-aqua-tint)] ring-1 ring-[var(--color-aqua-border)]/30",
      trendTitleClass: "text-[var(--color-aqua-accent)]/80",
      trendTextClass: "text-[var(--color-aqua-icon)]",
      accentRingClass: "ring-1 ring-[var(--color-aqua-accent)]/30",
    },
    logic_gate: {
      cardClass: "border-orange-500/30 bg-[linear-gradient(160deg,rgba(249,115,22,0.14)_0%,rgba(43,20,6,0.92)_48%,rgba(2,6,23,0.96)_100%)] shadow-[0_0_40px_rgba(249,115,22,0.2)]",
      iconWrapClass: `${baseIconWrapper} border-orange-400/45 bg-orange-500/12 text-orange-200 shadow-[0_0_18px_rgba(249,115,22,0.58)]`,
      iconClass: "text-sm",
      icon: faMicrochip,
      accentTextClass: "text-orange-200",
      sessionsTextClass: "text-orange-300/80",
      trendBadgeClass: "border-orange-400/35 bg-orange-500/10 text-orange-200",
      avgBadgeClass: "border-orange-400/35 bg-orange-500/20 text-orange-100",
      statTileClass: "border-orange-500/20 bg-orange-500/5",
      statLabelClass: "text-orange-300/80",
      statValueClass: "text-orange-100",
      trendPanelClass: "border-orange-500/20 bg-orange-500/5 ring-1 ring-orange-500/30",
      trendTitleClass: "text-orange-300/80",
      trendTextClass: "text-orange-100",
      accentRingClass: "ring-1 ring-orange-500/30",
    },
    logic_grid: {
      cardClass: "border-sky-400/30 bg-[linear-gradient(160deg,rgba(56,189,248,0.14)_0%,#091a2f_44%,rgba(2,6,23,0.96)_100%)] shadow-[0_0_40px_rgba(59,130,246,0.22)]",
      iconWrapClass: `${baseIconWrapper} border-sky-400/45 bg-gradient-to-br from-sky-500/14 to-blue-500/12 text-sky-200 shadow-[0_0_18px_rgba(56,189,248,0.65)]`,
      iconClass: "text-base",
      icon: faBorderAll,
      accentTextClass: "text-sky-200",
      sessionsTextClass: "text-sky-300/80",
      trendBadgeClass: "border-sky-400/35 bg-sky-500/10 text-sky-200",
      avgBadgeClass: "border-sky-400/35 bg-sky-500/20 text-sky-100",
      statTileClass: "border-sky-400/25 bg-sky-500/10",
      statLabelClass: "text-sky-300/80",
      statValueClass: "text-sky-100",
      trendPanelClass: "border-sky-400/25 bg-sky-500/10 ring-1 ring-sky-400/30",
      trendTitleClass: "text-sky-300/80",
      trendTextClass: "text-sky-100",
      accentRingClass: "ring-1 ring-sky-500/30",
    },
    signal_path: {
      cardClass: "border-cyan-600/30 bg-[linear-gradient(160deg,rgba(8,145,178,0.12)_0%,rgba(30,58,138,0.1)_36%,rgba(8,18,22,0.94)_100%)] shadow-[0_0_40px_rgba(37,99,235,0.2)]",
      iconWrapClass: `${baseIconWrapper} border-cyan-500/45 bg-gradient-to-br from-cyan-600/14 via-blue-600/12 to-indigo-600/10 text-cyan-200 shadow-[0_0_20px_rgba(8,145,178,0.45)]`,
      iconClass: "text-base",
      icon: faRoute,
      accentTextClass: "text-cyan-200",
      sessionsTextClass: "text-cyan-300/80",
      trendBadgeClass: "border-cyan-600/35 bg-cyan-600/10 text-cyan-200",
      avgBadgeClass: "border-cyan-600/35 bg-cyan-600/20 text-cyan-100",
      statTileClass: "border-cyan-600/20 bg-cyan-600/5",
      statLabelClass: "text-cyan-300/80",
      statValueClass: "text-cyan-100",
      trendPanelClass: "border-cyan-600/20 bg-cyan-600/5 ring-1 ring-cyan-600/30",
      trendTitleClass: "text-cyan-300/80",
      trendTextClass: "text-cyan-100",
      accentRingClass: "ring-1 ring-blue-500/30",
    },
    spatial_rotation: {
      cardClass: "border-cyan-400/30 bg-[linear-gradient(160deg,rgba(34,211,238,0.14)_0%,rgba(10,18,36,0.92)_44%,rgba(4,10,22,0.96)_100%)] shadow-[0_0_40px_rgba(34,211,238,0.2)]",
      iconWrapClass: `${baseIconWrapper} border-cyan-400/45 bg-gradient-to-br from-cyan-500/14 via-fuchsia-500/10 to-violet-500/10 text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.62)]`,
      iconClass: "text-base",
      icon: faRotateRight,
      accentTextClass: "text-cyan-100",
      sessionsTextClass: "text-fuchsia-300/80",
      trendBadgeClass: "border-cyan-400/35 bg-fuchsia-500/10 text-cyan-100",
      avgBadgeClass: "border-cyan-400/35 bg-fuchsia-500/20 text-cyan-100",
      statTileClass: "border-cyan-500/20 bg-cyan-500/5",
      statLabelClass: "text-cyan-300/80",
      statValueClass: "text-cyan-100",
      trendPanelClass: "border-cyan-500/20 bg-[linear-gradient(160deg,rgba(6,13,27,0.9)_0%,rgba(16,24,48,0.92)_100%)] ring-1 ring-fuchsia-500/30",
      trendTitleClass: "text-cyan-300/80",
      trendTextClass: "text-cyan-100",
      accentRingClass: "ring-1 ring-cyan-400/30",
    },
    memory_chain: {
      cardClass: "border-[var(--color-lilac-border)]/30 bg-[linear-gradient(160deg,var(--color-lilac-tint)_0%,rgba(76,29,149,0.12)_44%,rgba(2,6,23,0.96)_100%)] shadow-[0_0_40px_rgba(168,139,255,0.22)]",
      iconWrapClass: `${baseIconWrapper} border-[var(--color-lilac-border)]/45 bg-gradient-to-br from-[var(--color-lilac-accent)]/14 via-[var(--color-lilac-icon)]/12 to-[var(--color-lilac-tint)] text-[var(--color-lilac-icon)] shadow-[0_0_18px_rgba(168,139,255,0.62)]`,
      iconClass: "text-base",
      icon: faLink,
      accentTextClass: "text-[var(--color-lilac-icon)]",
      sessionsTextClass: "text-[var(--color-lilac-accent)]/80",
      trendBadgeClass: "border-[var(--color-lilac-border)]/35 bg-[var(--color-lilac-accent)]/10 text-[var(--color-lilac-icon)]",
      avgBadgeClass: "border-[var(--color-lilac-border)]/35 bg-[var(--color-lilac-accent)]/20 text-[var(--color-lilac-icon)]",
      statTileClass: "border-[var(--color-lilac-border)]/25 bg-[var(--color-lilac-tint)]",
      statLabelClass: "text-[var(--color-lilac-accent)]/80",
      statValueClass: "text-[var(--color-lilac-icon)]",
      trendPanelClass: "border-[var(--color-lilac-border)]/25 bg-[var(--color-lilac-tint)] ring-1 ring-[var(--color-lilac-border)]/30",
      trendTitleClass: "text-[var(--color-lilac-accent)]/80",
      trendTextClass: "text-[var(--color-lilac-icon)]",
      accentRingClass: "ring-1 ring-[var(--color-lilac-accent)]/30",
    },
    symbol_recall: {
      cardClass: "border-[var(--color-rose-border)]/30 bg-[linear-gradient(160deg,var(--color-rose-tint)_0%,rgba(192,38,211,0.1)_40%,rgba(10,6,22,0.96)_100%)] shadow-[0_0_40px_rgba(255,143,192,0.22)]",
      iconWrapClass: `${baseIconWrapper} border-[var(--color-rose-border)]/45 bg-gradient-to-br from-[var(--color-rose-accent)]/14 via-[var(--color-rose-icon)]/12 to-[var(--color-rose-tint)] text-[var(--color-rose-icon)] shadow-[0_0_18px_rgba(255,143,192,0.58)]`,
      iconClass: "text-sm",
      icon: faBolt,
      accentTextClass: "text-[var(--color-rose-icon)]",
      sessionsTextClass: "text-[var(--color-rose-accent)]/80",
      trendBadgeClass: "border-[var(--color-rose-border)]/35 bg-[var(--color-rose-accent)]/10 text-[var(--color-rose-icon)]",
      avgBadgeClass: "border-[var(--color-rose-border)]/35 bg-[var(--color-rose-accent)]/20 text-[var(--color-rose-icon)]",
      statTileClass: "border-[var(--color-rose-border)]/25 bg-[var(--color-rose-tint)]",
      statLabelClass: "text-[var(--color-rose-accent)]/80",
      statValueClass: "text-[var(--color-rose-icon)]",
      trendPanelClass: "border-[var(--color-rose-border)]/25 bg-[var(--color-rose-tint)] ring-1 ring-[var(--color-rose-border)]/30",
      trendTitleClass: "text-[var(--color-rose-accent)]/80",
      trendTextClass: "text-[var(--color-rose-icon)]",
      accentRingClass: "ring-1 ring-[var(--color-rose-accent)]/30",
    },
    odd_one_matrix: {
      cardClass: "border-rose-400/30 bg-[linear-gradient(160deg,rgba(244,63,94,0.12)_0%,rgba(120,20,72,0.1)_42%,rgba(2,6,23,0.96)_100%)] shadow-[0_0_40px_rgba(217,70,239,0.18)]",
      iconWrapClass: `${baseIconWrapper} border-rose-400/45 bg-gradient-to-br from-rose-500/12 via-fuchsia-500/10 to-pink-500/8 text-rose-200 shadow-[0_0_18px_rgba(244,63,94,0.55)]`,
      iconClass: "text-base",
      icon: faBullseye,
      accentTextClass: "text-rose-200",
      sessionsTextClass: "text-rose-300/80",
      trendBadgeClass: "border-rose-400/35 bg-rose-500/10 text-rose-200",
      avgBadgeClass: "border-rose-400/35 bg-rose-500/20 text-rose-100",
      statTileClass: "border-rose-500/20 bg-rose-500/5",
      statLabelClass: "text-rose-300/80",
      statValueClass: "text-rose-100",
      trendPanelClass: "border-rose-500/20 bg-rose-500/5 ring-1 ring-rose-500/30",
      trendTitleClass: "text-rose-300/80",
      trendTextClass: "text-rose-100",
      accentRingClass: "ring-1 ring-rose-500/30",
    },
    number_weave: {
      cardClass: "border-emerald-400/30 bg-[linear-gradient(160deg,rgba(16,185,129,0.12)_0%,rgba(6,27,24,0.92)_48%,rgba(2,6,23,0.96)_100%)] shadow-[0_0_40px_rgba(16,185,129,0.18)]",
      iconWrapClass: `${baseIconWrapper} border-emerald-400/40 bg-emerald-500/10 text-emerald-200 shadow-[0_0_18px_rgba(16,185,129,0.62)]`,
      iconClass: "text-[0.85rem]",
      icon: faWaveform,
      accentTextClass: "text-emerald-200",
      sessionsTextClass: "text-emerald-300/80",
      trendBadgeClass: "border-emerald-400/35 bg-emerald-500/10 text-emerald-200",
      avgBadgeClass: "border-emerald-400/35 bg-emerald-500/20 text-emerald-100",
      statTileClass: "border-emerald-500/20 bg-emerald-500/5",
      statLabelClass: "text-emerald-300/80",
      statValueClass: "text-emerald-100",
      trendPanelClass: "border-emerald-500/20 bg-emerald-500/5 ring-1 ring-emerald-500/30",
      trendTitleClass: "text-emerald-300/80",
      trendTextClass: "text-emerald-100",
      accentRingClass: "ring-1 ring-emerald-500/30",
    },
    default: {
      cardClass: "border-slate-700/80 bg-[linear-gradient(160deg,rgba(30,41,59,0.2)_0%,rgba(2,6,23,0.92)_58%,rgba(2,6,23,0.96)_100%)] shadow-[0_0_30px_rgba(15,23,42,0.35)]",
      iconWrapClass: `${baseIconWrapper} border-slate-600/40 bg-slate-900/60 text-slate-200`,
      iconClass: "text-base",
      icon: faBrain,
      accentTextClass: "text-slate-200",
      sessionsTextClass: "text-slate-400",
      trendBadgeClass: "border-slate-700/70 bg-slate-900/70 text-slate-200",
      avgBadgeClass: "border-slate-700/70 bg-slate-800/80 text-slate-100",
      statTileClass: "border-slate-800/70 bg-slate-900/60",
      statLabelClass: "text-slate-400",
      statValueClass: "text-slate-100",
      trendPanelClass: "border-slate-800/70 bg-slate-950/40 ring-1 ring-slate-600/30",
      trendTitleClass: "text-slate-400",
      trendTextClass: "text-slate-200",
      accentRingClass: "ring-1 ring-slate-600/30",
    },
  };

  const config = familyConfigMap[puzzleType] || familyConfigMap.default;

  if (rowPalette && familyConfigMap[rowPalette]) {
    const palette = familyConfigMap[rowPalette];
    return {
      ...palette,
      // Keep the family-specific icon
      icon: config.icon,
      iconClass: config.iconClass,
    };
  }

  return config;
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
        <FontAwesomeIcon
          icon={faChartLine}
          className="text-cyan-400 [--fa-secondary-color:var(--color-fuchsia-500)] [--fa-secondary-opacity:1]"
        />
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
