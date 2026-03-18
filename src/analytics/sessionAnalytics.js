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
import { calculateAdaptiveDifficulty } from "./adaptiveDifficulty";
import { generateCoachingInsight } from "./coachingEngine";
import { buildCognitiveTracks } from "./cognitiveTracks";
import {
  buildNeuralPowerTrendData,
  calculateNeuralTrend,
  calculatePressureState,
} from "../utils/sessionTrendUtils";

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

  const adaptiveDifficulty = calculateAdaptiveDifficulty({
    neuralTrend,
    pressureState,
    cognitiveTracks,
  });

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