/**
 * Utility functions for transforming raw session data into trend-ready metrics.
 * 
 * Includes functions for data normalization, trend calculation, and pressure state detection.
 */

/**
 * Transforms a raw session list into an array of objects for visualization and analysis.
 * 
 * - Filters for valid objects
 * - Sorts sessions by timestamp (oldest to newest)
 * - Normalizes metrics (Neural Power, Score, Accuracy, Best Streak)
 * - Adds a display label (e.g., 'S1', 'S2') and a formatted date
 * 
 * @param {Array} sessions - The list of player sessions to normalize.
 * @returns {Array} A list of trend-ready data points for charts and analytics.
 */
export function buildNeuralPowerTrendData(sessions = []) {
  if (!Array.isArray(sessions) || sessions.length === 0) {
    return [];
  }

  return [...sessions]
    .filter((session) => session && typeof session === "object")
    .sort((a, b) => {
      const aTime = new Date(a.timestamp || 0).getTime();
      const bTime = new Date(b.timestamp || 0).getTime();
      return aTime - bTime;
    })
    .map((session, index) => {
      const neuralPower =
        typeof session.neuralPower === "number" ? session.neuralPower : 0;

      const score = typeof session.score === "number" ? session.score : 0;
      const accuracy =
        typeof session.accuracy === "number" ? session.accuracy : 0;
      const bestStreak =
        typeof session.bestStreak === "number" ? session.bestStreak : 0;

      const date = session.timestamp
        ? new Date(session.timestamp).toLocaleDateString()
        : `Session ${index + 1}`;

      return {
        session: index + 1,
        label: `S${index + 1}`,
        date,
        neuralPower: Math.round(neuralPower),
        score: Math.round(score),
        accuracy: Number(accuracy.toFixed(1)),
        bestStreak,
      };
    });
}

/**
 * Calculates the overall performance trend between the first and last session in a data set.
 * 
 * @param {Array} trendData - The list of normalized trend data points.
 * @returns {Object} An object containing the trend direction (improving, declining, stable) 
 *                   and the total change in Neural Power.
 */
export function calculateNeuralTrend(trendData = []) {
  if (!Array.isArray(trendData) || trendData.length < 2) {
    return { direction: "neutral", change: 0 };
  }

  const first = trendData[0].neuralPower ?? 0;
  const last = trendData[trendData.length - 1].neuralPower ?? 0;
  const change = Math.round(last - first);

  let direction;
  if (change > 5) {
    direction = "improving";
  } else if (change < -5) {
    direction = "declining";
  } else {
    direction = "stable";
  }

  return { direction, change };
}

/**
 * Detects 'Cognitive Pressure' by analyzing the last few sessions for stability issues.
 * 
 * Uses moving averages of accuracy, streaks, and scores to determine if a user 
 * is 'Locked In' (strong, stable performance) or 'Under Pressure' (accuracy 
 * is high but streaks are failing).
 * 
 * @param {Array} trendData - The list of normalized trend data points.
 * @returns {Object} A pressure state object with state, label, and detail message.
 */
export function calculatePressureState(trendData = []) {
  if (!Array.isArray(trendData) || trendData.length < 3) {
    return {
      state: "neutral",
      label: "Not Enough Data",
      detail: "Complete a few more sessions to detect pressure patterns.",
    };
  }

  const recent = trendData.slice(-5);

  const avgAccuracy =
    recent.reduce((sum, session) => sum + (session.accuracy || 0), 0) /
    recent.length;

  const avgStreak =
    recent.reduce((sum, session) => sum + (session.bestStreak || 0), 0) /
    recent.length;

  const avgScore =
    recent.reduce((sum, session) => sum + (session.score || 0), 0) /
    recent.length;

  if (avgAccuracy >= 80 && avgStreak <= 5) {
    return {
      state: "under-pressure",
      label: "Under Pressure",
      detail:
        "Accuracy is holding up, but streak control is slipping under sustained play.",
    };
  }

  if (avgAccuracy >= 80 && avgStreak >= 8 && avgScore >= 700) {
    return {
      state: "locked-in",
      label: "Locked In",
      detail:
        "Recent sessions show strong accuracy, stable streaks, and confident output.",
    };
  }

  return {
    state: "stable",
    label: "Stable Load",
    detail:
      "Recent sessions show a balanced performance pattern without major pressure signals.",
  };
}
