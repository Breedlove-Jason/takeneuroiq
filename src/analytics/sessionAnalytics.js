import { calculateAdaptiveDifficulty } from "./adaptiveDifficulty";
import { generateCoachingInsight } from "./coachingEngine";
import { buildCognitiveTracks } from "./cognitiveTracks";
import {
  buildNeuralPowerTrendData,
  calculateNeuralTrend,
  calculatePressureState,
} from "../utils/sessionTrendUtils";

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