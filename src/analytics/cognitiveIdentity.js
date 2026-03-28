export function classifyCognitiveIdentity(session = {}) {
  const {
    accuracy = 0,
    neuralPower = 0,
    bestStreak = 0,
    puzzlesAttempted = 0,
    puzzlesCorrect = 0,
  } = session;

  const safeAccuracy = Number(accuracy) || 0;
  const safeNeuralPower = Number(neuralPower) || 0;
  const safeBestStreak = Number(bestStreak) || 0;
  const safeAttempted = Number(puzzlesAttempted) || 0;
  const safeCorrect = Number(puzzlesCorrect) || 0;

  const completionRate =
    safeAttempted > 0 ? safeCorrect / safeAttempted : 0;

  const stayedAligned =
    !!session.isRecommendedSessionAligned && !session.didBreakRecommendedAlignment;

  const drifted =
    !!session.isRecommendedSessionAligned && !!session.didBreakRecommendedAlignment;

  // We only want to classify as "Stable" or "Precision" if they actually followed a recommendation.
  // Otherwise, default to Learner or Climber based on raw performance.

  if (stayedAligned && safeAccuracy >= 85 && safeBestStreak >= 4 && safeAttempted >= 8) {
    return {
      identityKey: "precision_runner",
      label: "Refining",
      description:
        "You stayed controlled, accurate, and efficient throughout the session.",
      primarySignal: "Stable precision inside target range.",
      shiftSignal: "This run reinforced a stable high-control pattern.",
    };
  }

  if (stayedAligned && (safeNeuralPower >= 75 || completionRate >= 0.8) && safeAttempted >= 6) {
    return {
      identityKey: "stabilizer",
      label: "Stabilizing",
      description:
        "You trained inside the recommended lane and kept your performance steady.",
      primarySignal: "Controlled performance stayed inside the training lane.",
      shiftSignal: "This run reinforced consistency inside the recommended lane.",
    };
  }

  if (drifted && safeAccuracy >= 75) {
    return {
      identityKey: "climber",
      label: "Climbing",
      description:
        "You pushed upward and still held onto strong performance.",
      primarySignal: "Strong upward challenge tolerance detected.",
      shiftSignal: "This run suggests upward adaptation toward harder challenge.",
    };
  }

  if (drifted && safeAccuracy < 70) {
    return {
      identityKey: "overreacher",
      label: "Overreaching",
      description:
        "You pushed beyond the ideal lane and performance became less stable.",
      primarySignal: "Challenge exceeded stable performance range.",
      shiftSignal: "This run suggests instability under rising challenge pressure.",
    };
  }

  if (!session.isRecommendedSessionAligned && safeAccuracy >= 80 && safeAttempted >= 8) {
    return {
      identityKey: "independent_striker",
      label: "Striking",
      description: "You found your own rhythm and maintained high precision without explicit guidance.",
      primarySignal:
        "Strong self-directed performance emerged outside guidance.",
      shiftSignal: "This run suggests strong self-directed deviation from guidance.",
    };
  }

  if (safeAccuracy < 65 || completionRate < 0.6) {
    return {
      identityKey: "recovering",
      label: "Recovering",
      description:
        "This session looked more like recalibration than pure performance growth.",
      primarySignal: "Recovery pattern detected across this session.",
      shiftSignal: "This run suggests a temporary shift toward recalibration.",
    };
  }

  return {
    identityKey: "adapting",
    label: "Adapting",
    description:
      "Your session signals were mixed, but the system is learning how you respond best.",
    primarySignal: "Mixed signals suggest an emerging training pattern.",
    shiftSignal: "This run adds mixed data to an evolving pattern.",
  };
}
