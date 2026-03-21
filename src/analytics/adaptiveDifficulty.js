/**
 * Engine for determining the optimal difficulty level for the next session.
 *
 * It uses performance trends, current pressure state, and specific cognitive
 * tracks to recommend a 'Recovery', 'Steady', or 'Challenge' mode.
 */

/**
 * Calculates the recommended adaptive difficulty based on recent performance.
 *
 * Logic:
 * - If performance is declining or under pressure: Recommendation = Recovery Mode (Easy)
 * - If performance is improving, strong tracks, and 'locked-in': Recommendation = Challenge Mode (Hard)
 * - Otherwise: Recommendation = Steady Mode (Medium)
 *
 * @param {Object} params - Input metrics for the calculation.
 * @param {Object} params.neuralTrend - Current power trend (improving/declining).
 * @param {Object} params.pressureState - Current mental load state (locked-in/under-pressure).
 * @param {Object} params.cognitiveTracks - Specific skill metrics.
 * @returns {Object} A recommendation object with state, label, description, and targetDifficulty.
 */
export function calculateAdaptiveDifficulty({
  neuralTrend,
  pressureState,
  cognitiveTracks,
}) {
  const safeTrend = neuralTrend || { direction: 'neutral', change: 0 };
  const safePressure = pressureState || { state: 'neutral' };
  const safeTracks = cognitiveTracks || {
    patternRecognition: 0,
    focusStability: 0,
    processingSpeed: 0,
    consistency: 0,
  };

  const averageTrackScore =
    (safeTracks.patternRecognition +
      safeTracks.focusStability +
      safeTracks.processingSpeed +
      safeTracks.consistency) /
    4;

  if (
    safePressure.state === 'under-pressure' ||
    safeTrend.direction === 'declining'
  ) {
    return {
      state: 'recover',
      label: 'Recovery Mode',
      description:
        'Ease intensity slightly to stabilize performance and rebuild consistency.',
      targetDifficulty: 'easy',
    };
  }

  if (
    safePressure.state === 'locked-in' &&
    safeTrend.direction === 'improving' &&
    averageTrackScore >= 75
  ) {
    return {
      state: 'challenge',
      label: 'Challenge Mode',
      description:
        'Performance is strong. Raise complexity to push growth and maintain engagement.',
      targetDifficulty: 'hard',
    };
  }

  return {
    state: 'steady',
    label: 'Steady Mode',
    description:
      'Maintain balanced difficulty to reinforce skill growth without overload.',
    targetDifficulty: 'medium',
  };
}
