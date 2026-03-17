import { calculateAdaptiveDifficulty } from "./adaptiveDifficulty";
import { generateCoachingInsight } from "./coachingEngine";
import { buildCognitiveTracks } from "./cognitiveTracks";
import { calculateNeuralTrend } from "../utils/sessionTrendUtils";
import { calculatePressureState } from "../utils/sessionTrendUtils";

export function buildSessionAnalytics(sessions) {
  if (!sessions || sessions.length === 0) {
    return null;
  }

  const cognitiveTracks = buildCognitiveTracks(sessions);
  const neuralTrend = calculateNeuralTrend(sessions);
  const pressureState = calculatePressureState(sessions);

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