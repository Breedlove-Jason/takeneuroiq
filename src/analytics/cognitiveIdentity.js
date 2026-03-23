export function classifyCognitiveIdentity(session = {}) {
  const {
    accuracy = 0,
    neuralPower = 0,
    bestStreak = 0,
    puzzlesAttempted = 0,
    puzzlesCorrect = 0,
    isRecommendedSessionAligned = false,
    didBreakRecommendedAlignment = false,
  } = session;

  const safeAccuracy = Number(accuracy) || 0;
  const safeNeuralPower = Number(neuralPower) || 0;
  const safeBestStreak = Number(bestStreak) || 0;
  const safeAttempted = Number(puzzlesAttempted) || 0;
  const safeCorrect = Number(puzzlesCorrect) || 0;

  const completionRate =
    safeAttempted > 0 ? safeCorrect / safeAttempted : 0;

  const stayedAligned =
    isRecommendedSessionAligned && !didBreakRecommendedAlignment;

  const drifted =
    isRecommendedSessionAligned && didBreakRecommendedAlignment;

  if (stayedAligned && safeAccuracy >= 85 && safeBestStreak >= 4) {
    return {
      identityKey: "precision_runner",
      label: "Precision Runner",
      description:
        "You stayed controlled, accurate, and efficient throughout the session.",
    };
  }

  if (stayedAligned && (safeNeuralPower >= 75 || completionRate >= 0.8)) {
    return {
      identityKey: "stabilizer",
      label: "Stabilizer",
      description:
        "You trained inside the recommended lane and kept your performance steady.",
    };
  }

  if (drifted && safeAccuracy >= 75) {
    return {
      identityKey: "climber",
      label: "Climber",
      description:
        "You pushed upward and still held onto strong performance.",
    };
  }

  if (drifted && safeAccuracy < 70) {
    return {
      identityKey: "overreacher",
      label: "Overreacher",
      description:
        "You pushed beyond the ideal lane and performance became less stable.",
    };
  }

  if (safeAccuracy < 65 || completionRate < 0.6) {
    return {
      identityKey: "recovery_builder",
      label: "Recovery Builder",
      description:
        "This session looked more like recalibration than pure performance growth.",
    };
  }

  return {
    identityKey: "adaptive_learner",
    label: "Adaptive Learner",
    description:
      "Your session signals were mixed, but the system is learning how you respond best.",
  };
}