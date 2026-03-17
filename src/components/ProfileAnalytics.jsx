import {
  buildNeuralPowerTrendData,
  calculateNeuralTrend,
  calculatePressureState,
} from "../utils/sessionTrendUtils";

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
import { calculateCognitiveTracks } from "../analytics/cognitiveTracks";
import { calculateAdaptiveDifficulty } from "../analytics/adaptiveDifficulty";

function ProfileAnalytics() {
  const { sessions } = useSessionData();
  const neuralPowerTrendData = buildNeuralPowerTrendData(sessions);
  const recentTrendData = neuralPowerTrendData.slice(-5);
  const neuralTrend = calculateNeuralTrend(recentTrendData);
  const trendSessionCount = recentTrendData.length;
  const pressureState = calculatePressureState(recentTrendData);

  const trendStartPower =
    trendSessionCount > 0 ? recentTrendData[0].neuralPower : 0;

  const trendLatestPower =
    trendSessionCount > 0
      ? recentTrendData[trendSessionCount - 1].neuralPower
      : 0;

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

  const cognitiveTracks = calculateCognitiveTracks(sessions);
  const precisionScore = cognitiveTracks.patternRecognition;
  const throughputScore = cognitiveTracks.processingSpeed;
  const consistencyScore = cognitiveTracks.consistency;

  const adaptiveDifficulty = calculateAdaptiveDifficulty({
    neuralTrend,
    pressureState,
    cognitiveTracks,
  });
  const getTrendSummary = () => {
    if (trendSessionCount < 2) {
      return "Complete a few more sessions to generate a reliable neural performance summary.";
    }

    if (neuralTrend.direction === "improving") {
      if (recentVsLifetimeDelta > 0) {
        return "Recent neural performance is improving and running above your long-term baseline.";
      }

      return "Recent neural performance is improving, with signs of stronger session execution.";
    }

    if (neuralTrend.direction === "declining") {
      if (recentVsLifetimeDelta < 0) {
        return "Recent neural performance has dipped and is currently tracking below your long-term baseline.";
      }

      return "Recent neural performance has softened slightly, though your broader baseline remains intact.";
    }

    return "Recent neural performance is stable, showing a steady training rhythm across sessions.";
  };

  const trendSummary = getTrendSummary();

  const coachingInsight = generateCoachingInsight({
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
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300/80">
              Neural Trend
            </p>
            <h3
              className={`mt-2 text-xl font-semibold ${trendDisplay.className}`}
            >
              {trendDisplay.symbol} {trendDisplay.label}
            </h3>
            <p className="mt-2 text-sm text-slate-400">
              {coachingInsight.summary || trendSummary}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Based on your last {trendSessionCount}{" "}
              {trendSessionCount === 1 ? "session" : "sessions"}.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-5">
              <div className="flex min-h-[88px] flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  Sessions
                </p>
                <p className="mt-3 text-lg font-semibold text-white">
                  {trendSessionCount}
                </p>
              </div>

              <div className="flex min-h-[88px] flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  Start NP
                </p>
                <p className="mt-3 text-lg font-semibold text-white">
                  {trendStartPower}
                </p>
              </div>

              <div className="flex min-h-[88px] flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  Latest NP
                </p>
                <p className="mt-3 text-lg font-semibold text-white">
                  {trendLatestPower}
                </p>
              </div>

              <div className="flex min-h-[88px] flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  Delta
                </p>
                <p
                  className={`mt-3 text-lg font-semibold ${trendDisplay.className}`}
                >
                  {neuralTrend.change > 0 ? "+" : ""}
                  {neuralTrend.change}
                </p>
              </div>

              <div className="flex min-h-[88px] flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/40 p-3">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                  Vs Lifetime
                </p>
                <p
                  className={`mt-3 text-lg font-semibold ${
                    recentVsLifetimeDelta >= 0
                      ? "text-emerald-300"
                      : "text-rose-300"
                  }`}
                >
                  {recentVsLifetimeDelta > 0 ? "+" : ""}
                  {recentVsLifetimeDelta}
                </p>
              </div>
            </div>
          </div>
          <div className="sm:text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
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
    </div>
  );
}

export default ProfileAnalytics;
