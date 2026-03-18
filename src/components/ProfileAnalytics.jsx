import { buildNeuralPowerTrendData } from "../utils/sessionTrendUtils";
import { useSessionData } from "../hooks/useSessionData";
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
import { faChartLine } from "@fortawesome/free-solid-svg-icons";


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
  cognitiveTracks: propCognitiveTracks,
  neuralTrend: propNeuralTrend,
  pressureState: sharedPressureState,
  adaptiveDifficulty: propAdaptiveDifficulty,
  coachingInsight: propCoachingInsight,
}) {
  const { sessions } = useSessionData();

  // Build the full history once, then derive the recent window used by the summary cards.
  const neuralPowerTrendData = buildNeuralPowerTrendData(sessions);
  const recentTrendData = neuralPowerTrendData.slice(-5);
  const neuralTrend = propNeuralTrend ?? {
    direction: 'neutral',
    change: 0,
  };
  const trendSessionCount = recentTrendData.length;
  const pressureState = sharedPressureState ?? {
    state: 'neutral',
    label: 'Not Enough Data',
    detail: 'Complete a few more sessions to detect pressure patterns.',
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
    processingSpeed: 0,
    consistency: 0,
  };

  // Normalize the track names expected by the coaching engine.
  const precisionScore = cognitiveTracks.patternRecognition;
  const throughputScore = cognitiveTracks.processingSpeed;
  const consistencyScore = cognitiveTracks.consistency;

  const adaptiveDifficulty = propAdaptiveDifficulty ?? {
    state: 'steady',
    label: 'Steady Mode',
    description:
      'Maintain balanced difficulty to reinforce skill growth without overload.',
    targetDifficulty: 'medium',
  };

  const localCoachingInsight = generateCoachingInsight({
    cognitiveTracks: {
      patternRecognition: precisionScore,
      focusStability: consistencyScore,
      processingSpeed: throughputScore,
      consistency: consistencyScore,
    },
    neuralTrend,
    pressureState,
    adaptiveDifficulty,
  });

  const coachingInsight = propCoachingInsight ?? localCoachingInsight;

  const trendToneMap = {
    improving: {
      label: 'Improving',
      symbol: '▲',
      className: 'text-emerald-300',
      subtext: 'Your recent Neural Power is trending upward.',
    },
    stable: {
      label: 'Stable',
      symbol: '■',
      className: 'text-yellow-300',
      subtext: 'Your recent Neural Power is holding steady.',
    },
    declining: {
      label: 'Declining',
      symbol: '▼',
      className: 'text-rose-300',
      subtext: 'Your recent Neural Power has dipped across recent sessions.',
    },
    neutral: {
      label: 'Not Enough Data',
      symbol: '•',
      className: 'text-slate-300',
      subtext: 'Complete more sessions to detect a reliable trend.',
    },
  };

  const trendDisplay =
    trendToneMap[neuralTrend.direction] || trendToneMap.neutral;

  const pressureToneMap = {
    'under-pressure': {
      className: 'text-amber-300',
      borderClass: 'border-amber-500/20',
      accentClass: 'text-amber-300/80',
    },
    'locked-in': {
      className: 'text-emerald-300',
      borderClass: 'border-emerald-500/20',
      accentClass: 'text-emerald-300/80',
    },
    stable: {
      className: 'text-cyan-300',
      borderClass: 'border-cyan-500/20',
      accentClass: 'text-cyan-300/80',
    },
    neutral: {
      className: 'text-slate-300',
      borderClass: 'border-slate-700',
      accentClass: 'text-slate-400',
    },
  };

  const pressureDisplay =
    pressureToneMap[pressureState.state] || pressureToneMap.neutral;

  const adaptiveToneMap = {
    recover: {
      className: 'text-amber-300',
      borderClass: 'border-amber-500/20',
      accentClass: 'text-amber-300/80',
      badgeClass: 'text-amber-300',
    },
    steady: {
      className: 'text-cyan-300',
      borderClass: 'border-cyan-500/20',
      accentClass: 'text-cyan-300/80',
      badgeClass: 'text-cyan-300',
    },
    challenge: {
      className: 'text-emerald-300',
      borderClass: 'border-emerald-500/20',
      accentClass: 'text-emerald-300/80',
      badgeClass: 'text-emerald-300',
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
          {' '}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300/80">
              Neural Trend
            </p>
            <h3
              className={`mt-2 text-xl font-semibold ${trendDisplay.className}`}
            >
              {trendDisplay.symbol} {trendDisplay.label}
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              {coachingInsight.summary}
            </p>{' '}
            <p className="mt-2 text-xs leading-5 text-slate-500">
              {coachingInsight.focus}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Based on your last {trendSessionCount}{' '}
              {trendSessionCount === 1 ? 'session' : 'sessions'}.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-5">
              {trendStats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex min-h-22 flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/40 p-3"
                >
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                    {stat.label}
                  </p>
                  <p className={`mt-3 text-lg font-semibold ${stat.colorClass}`}>
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="sm:text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Change
            </p>
            <p
              className={`mt-2 whitespace-nowrap text-2xl font-bold ${trendDisplay.className}`}
            >
              {neuralTrend.change > 0 ? '+' : ''}
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
            <p className="mt-2 text-sm text-slate-400">
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
            <p className="mt-2 text-sm text-slate-400">
              {adaptiveDifficulty.description}
            </p>
          </div>

          <div className="sm:text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
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
            <p className="text-sm text-slate-400">
              Track how your recent performance is trending across sessions.
            </p>
          </div>

          <div
            className={`rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${trendDisplay.className}`}
          >
            {trendDisplay.symbol} {trendDisplay.label}
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={neuralPowerTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip
                formatter={(value) => [`${value} NP`, 'Neural Power']}
                labelFormatter={(label, payload) => {
                  const point = payload?.[0]?.payload;
                  return point?.date || label;
                }}
                contentStyle={{
                  backgroundColor: '#020617',
                  border: '1px solid #0f172a',
                  borderRadius: '10px',
                  color: '#e2e8f0',
                }}
                labelStyle={{
                  color: '#67e8f9',
                  fontWeight: 600,
                }}
                itemStyle={{
                  color: '#e2e8f0',
                }}
                cursor={{
                  stroke: '#22d3ee',
                  strokeWidth: 1,
                  strokeDasharray: '4 4',
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
  if (!sessions || sessions.length === 0) {
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

  const bestScore = Math.max(...sessions.map((s) => s.score ?? 0));
  const bestStreak = Math.max(
    ...sessions.map((s) => s.bestStreak ?? s.streak ?? 0),
  );
  const bestNeuralPower = Math.max(...sessions.map((s) => s.neuralPower ?? 0));
  const totalSessions = sessions.length;

  const totalPuzzlesSolved = sessions.reduce(
    (sum, s) => sum + (s.puzzlesCorrect ?? s.correctAnswers ?? 0),
    0,
  );
  const totalPuzzlesAttempted = sessions.reduce(
    (sum, s) => sum + (s.puzzlesAttempted ?? s.puzzlesSeen ?? 0),
    0,
  );

  const solveRate =
    totalPuzzlesAttempted > 0
      ? Math.round((totalPuzzlesSolved / totalPuzzlesAttempted) * 100)
      : 0;

  const averageScore = Math.round(
    sessions.reduce((sum, s) => sum + (s.score ?? 0), 0) / totalSessions,
  );

  const averageAccuracy = Math.round(
    sessions.reduce((sum, s) => sum + getSessionAccuracy(s), 0) / totalSessions,
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

/**
 * Renders the Identity Core stats grid.
 */
export function IdentityCoreStats() {
  const { sessions } = useSessionData();
  const metrics = calculatePerformanceMetrics(sessions);

  const stats = [
    { label: "Best Score", value: metrics.bestScore, color: "text-cyan-400" },
    {
      label: "Best Streak",
      value: metrics.bestStreak,
      color: "text-green-400",
    },
    {
      label: "Best Neural Power",
      value: metrics.bestNeuralPower,
      color: "text-yellow-400",
    },
    {
      label: "Avg Score",
      value: metrics.averageScore,
      color: "text-cyan-400",
    },
    {
      label: "Avg Accuracy",
      value: `${metrics.averageAccuracy}%`,
      color: "text-blue-400",
    },
    {
      label: "Puzzles Solved",
      value: metrics.totalPuzzlesSolved,
      color: "text-green-400",
    },
    {
      label: "Total Attempts",
      value: metrics.totalPuzzlesAttempted,
      color: "text-cyan-300",
    },
    {
      label: "Solve Rate",
      value: `${metrics.solveRate}%`,
      color: "text-fuchsia-300",
    },
    {
      label: "Sessions Played",
      value: metrics.totalSessions,
      color: "text-cyan-200",
      fullWidth: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`rounded-2xl border border-slate-800 bg-slate-800/60 p-4 ${
            stat.fullWidth ? "col-span-2" : ""
          }`}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            {stat.label}
          </p>
          <p className={`mt-2 text-2xl font-bold ${stat.color}`}>
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
export function PerformanceSnapshot() {
  const { sessions } = useSessionData();
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
      label: "Best Score",
      value: metrics.bestScore,
      percent: bestScorePercent,
      color: "text-cyan-400",
      barColor: "bg-cyan-400",
    },
    {
      label: "Average Score",
      value: metrics.averageScore,
      percent: averageScorePercent,
      color: "text-green-300",
      barColor: "bg-green-300",
    },
    {
      label: "Average Accuracy",
      value: `${metrics.averageAccuracy}%`,
      percent: averageAccuracyPercent,
      color: "text-violet-300",
      barColor: "bg-violet-400",
    },
    {
      label: "Best Streak",
      value: metrics.bestStreak,
      percent: bestStreakPercent,
      color: "text-fuchsia-300",
      barColor: "bg-fuchsia-400",
    },
    {
      label: "Best Power",
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
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
        Agent Summary
      </p>
      <p className="mt-2 text-sm leading-6 text-slate-300">{summary}</p>
    </div>
  );
}

export default ProfileAnalytics;
