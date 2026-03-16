import {
  buildNeuralPowerTrendData,
  calculateNeuralTrend,
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

function ProfileAnalytics() {
  const { sessions } = useSessionData();
  const neuralPowerTrendData = buildNeuralPowerTrendData(sessions);
  const recentTrendData = neuralPowerTrendData.slice(-5);
  const neuralTrend = calculateNeuralTrend(recentTrendData);
  const trendSessionCount = recentTrendData.length;

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
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <div className="flex items-start justify-between gap-4">
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
              {trendDisplay.subtext} Based on your last {trendSessionCount}{" "}
              {trendSessionCount === 1 ? "session" : "sessions"}.
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
              Change
            </p>
            <p className={`mt-2 text-2xl font-bold ${trendDisplay.className}`}>
              {neuralTrend.change > 0 ? "+" : ""}
              {neuralTrend.change} NP
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">
            Neural Power History
          </h3>
          <p className="text-sm text-slate-400">
            Track how your recent performance is trending across sessions.
          </p>
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
