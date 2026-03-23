export function evaluateSessionOutcome(session = {}) {
  const {
    accuracy = 0,
    neuralPower = 0,
    puzzlesAttempted = 0,
    puzzlesCorrect = 0,
    bestStreak = 0,
    isRecommendedSessionAligned = false,
    didBreakRecommendedAlignment = false,
    recommendedSessionAlignmentLabel = '',
  } = session;

  const safeAccuracy = Number(accuracy) || 0;
  const safeNeuralPower = Number(neuralPower) || 0;
  const safeAttempted = Number(puzzlesAttempted) || 0;
  const safeCorrect = Number(puzzlesCorrect) || 0;
  const safeBestStreak = Number(bestStreak) || 0;

  const completionQuality = safeAttempted > 0 ? safeCorrect / safeAttempted : 0;

  const performedStrongly =
    safeAccuracy >= 82 ||
    safeNeuralPower >= 75 ||
    (completionQuality >= 0.8 && safeBestStreak >= 4);

  const performedPoorly =
    safeAccuracy < 60 && completionQuality < 0.6 && safeBestStreak <= 2;

  const stayedAligned =
    isRecommendedSessionAligned && !didBreakRecommendedAlignment;

  const partiallyAligned =
    isRecommendedSessionAligned && didBreakRecommendedAlignment;

  function getNextDifficulty({
    performedStrongly,
    performedPoorly,
    stayedAligned,
    partiallyAligned,
  }) {
    if (stayedAligned && performedStrongly) return 'hard';

    if (stayedAligned && performedPoorly) return 'easy';

    if (partiallyAligned && performedStrongly) return 'hard';

    if (partiallyAligned && performedPoorly) return 'medium';

    if (performedStrongly) return 'hard';

    if (performedPoorly) return 'easy';

    return 'medium';
  }

  const nextRecommendedDifficulty = getNextDifficulty({
    performedStrongly,
    performedPoorly,
    stayedAligned,
    partiallyAligned,
  });

  if (stayedAligned && performedStrongly) {
    return {
      outcomeType: 'aligned_growth',
      tone: 'positive',
      title: 'Strong aligned growth',
      summary:
        'You stayed in the recommended lane and handled the challenge well. Ideal progression path confirmed.',
      alignmentLabel: recommendedSessionAlignmentLabel || 'Aligned',
      nextRecommendedDifficulty,
    };
  }

  if (stayedAligned && performedPoorly) {
    return {
      outcomeType: 'aligned_recovery',
      tone: 'supportive',
      title: 'Aligned stability work',
      summary:
        'You stayed inside the recommended lane during a performance dip. This supports your long-term stability.',
      alignmentLabel: recommendedSessionAlignmentLabel || 'Aligned',
      nextRecommendedDifficulty,
    };
  }

  if (partiallyAligned && performedStrongly) {
    return {
      outcomeType: 'pushed_beyond_lane',
      tone: 'alert',
      title: 'Beyond recommendation',
      summary:
        'You moved past the recommendation and still performed well. System will adjust your challenge range.',
      alignmentLabel: recommendedSessionAlignmentLabel || 'Partially aligned',
      nextRecommendedDifficulty,
    };
  }

  if (partiallyAligned && performedPoorly) {
    return {
      outcomeType: 'drifted_under_pressure',
      tone: 'caution',
      title: 'Misaligned drift',
      summary:
        'You drifted from the recommended lane and performance dropped. Focus on lane discipline.',
      alignmentLabel: recommendedSessionAlignmentLabel || 'Partially aligned',
      nextRecommendedDifficulty,
    };
  }

  if (!isRecommendedSessionAligned && performedStrongly) {
    return {
      outcomeType: 'independent_win',
      tone: 'neutral',
      title: 'Strong independent session',
      summary:
        'A strong result outside the recommended lane. We will factor this into your next recommendation.',
      alignmentLabel: recommendedSessionAlignmentLabel || 'Not aligned',
      nextRecommendedDifficulty,
    };
  }

  if (!isRecommendedSessionAligned && performedPoorly) {
    return {
      outcomeType: 'misaligned_strain',
      tone: 'caution',
      title: 'Misaligned effort',
      summary:
        'This session was outside the recommended lane and created unnecessary strain. Try aligning for better results.',
      alignmentLabel: recommendedSessionAlignmentLabel || 'Not aligned',
      nextRecommendedDifficulty,
    };
  }

  return {
    outcomeType: 'mixed_session',
    tone: 'neutral',
    title: 'Mixed results',
    summary:
      'Partial progress with mixed signals. System will continue refining your training pattern.',
    alignmentLabel: recommendedSessionAlignmentLabel || 'Mixed',
    nextRecommendedDifficulty,
  };
}
