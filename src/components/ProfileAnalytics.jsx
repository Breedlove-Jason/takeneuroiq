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

function ProfileAnalytics() {
  const {sessions} = useSessionData();
  const neuralPowerTrendData = buildNeuralPowerTrendData(sessions);
  
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
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">Neural Power History</h3>
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
  );
}

export default ProfileAnalytics;
