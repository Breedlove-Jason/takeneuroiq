/**
 * Orchestrator for processing raw session data into actionable cognitive analytics.
 *
 * This module aggregates data from various engines to build a comprehensive
 * profile of the user's performance, including:
 * - Cognitive Tracks: specific skill performance (pattern recognition, focus, etc.)
 * - Neural Trend: long-term improvement or decline
 * - Pressure State: how the user handles sustained cognitive load
 * - Adaptive Difficulty: recommendations for next session's intensity
 * - Coaching Insights: personalized feedback based on the above metrics
 */
import { generateCoachingInsight } from './coachingEngine';
import { buildCognitiveTracks } from './cognitiveTracks';
import {
  buildNeuralPowerTrendData,
  calculateNeuralTrend,
  calculatePressureState,
} from '../utils/sessionTrendUtils';

/**
 * Builds a complete analytics report from a history of player sessions.
 *
 * @param {Array} sessions - The list of raw session objects to analyze.
 * @returns {Object|null} A report object containing tracks, trends, states, and insights,
 *                        or null if no sessions are provided.
 */
export function buildSessionAnalytics(sessions) {
  if (!sessions || sessions.length === 0) {
    return null;
  }

  const trendData = buildNeuralPowerTrendData(sessions);
  const cognitiveTracks = buildCognitiveTracks(sessions);
  const neuralTrend = calculateNeuralTrend(trendData);
  const pressureState = calculatePressureState(trendData);

  const adaptiveDifficulty = deriveAdaptiveDifficultyFromSessions(sessions);

  const coachingInsight = generateCoachingInsight({
    cognitiveTracks,
    neuralTrend,
    pressureState,
    adaptiveDifficulty,
  });

  return {
    cognitiveTracks,
    neuralTrend,
    pressureState,
    adaptiveDifficulty,
    coachingInsight,
  };
}

const ADAPTIVE_STATE_METADATA = {
  recover: {
    state: 'recover',
    label: 'Recovery Mode',
    description: 'Ease intensity slightly to stabilize performance and rebuild consistency.',
    targetDifficulty: 'easy',
  },
  steady: {
    state: 'steady',
    label: 'Steady Mode',
    description: 'Maintain balanced difficulty to reinforce skill growth without overload.',
    targetDifficulty: 'medium',
  },
  challenge: {
    state: 'challenge',
    label: 'Challenge Mode',
    description: 'Performance is strong. Raise complexity to push growth and maintain engagement.',
    targetDifficulty: 'hard',
  },
};

function deriveAdaptiveDifficultyFromSessions(sessions = []) {
  if (!Array.isArray(sessions) || sessions.length === 0) {
    return getAdaptiveStateMetadata(null, 0);
  }

  const recentValidSessions = sessions
    .filter((session) => session?.liveAdaptiveDifficulty?.state)
    .slice(-5);
  const recentSampleSize = recentValidSessions.length;

  if (recentValidSessions.length === 0) {
    return getAdaptiveStateMetadata(null, 0);
  }

  const stateCounts = {};
  const lastOccurrence = {};

  recentValidSessions.forEach((session, index) => {
    const state = session.liveAdaptiveDifficulty.state;
    stateCounts[state] = (stateCounts[state] || 0) + 1;
    lastOccurrence[state] = index;
  });

  let dominantState = null;
  let highestCount = -1;

  for (const [state, count] of Object.entries(stateCounts)) {
    if (
      dominantState === null ||
      count > highestCount ||
      (count === highestCount &&
        (lastOccurrence[state] ?? 0) > (lastOccurrence[dominantState] ?? -1))
    ) {
      dominantState = state;
      highestCount = count;
    }
  }

    return getAdaptiveStateMetadata(dominantState, recentSampleSize);
}

function getAdaptiveStateMetadata(state, recentSampleSize = 0) {
  const metadata = ADAPTIVE_STATE_METADATA[state] ?? ADAPTIVE_STATE_METADATA.steady;
  return {
    state: metadata.state,
    label: metadata.label,
    description: metadata.description,
    targetDifficulty: metadata.targetDifficulty,
    recentSampleSize,
  };
}

