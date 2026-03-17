export function calculateAdaptiveDifficulty({
  neuralTrend,
  pressureState,
  cognitiveTracks,
}) {
  const safeTrend = neuralTrend || { direction: "neutral", change: 0 };
  const safePressure = pressureState || { state: "neutral" };
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
    safePressure.state === "under-pressure" ||
    safeTrend.direction === "declining"
  ) {
    return {
      state: "recover",
      label: "Recovery Mode",
      description:
        "Ease intensity slightly to stabilize performance and rebuild consistency.",
      targetDifficulty: "easy",
    };
  }

  if (
    safePressure.state === "locked-in" &&
    safeTrend.direction === "improving" &&
    averageTrackScore >= 75
  ) {
    return {
      state: "challenge",
      label: "Challenge Mode",
      description:
        "Performance is strong. Raise complexity to push growth and maintain engagement.",
      targetDifficulty: "hard",
    };
  }

  return {
    state: "steady",
    label: "Steady Mode",
    description:
      "Maintain balanced difficulty to reinforce skill growth without overload.",
    targetDifficulty: "medium",
  };
}
