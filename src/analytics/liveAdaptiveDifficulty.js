export function calculateLiveAdaptiveDifficulty({
  puzzlesAttempted = 0,
  puzzlesCorrect = 0,
  currentStreak = 0,
  averageReactionTime = 0,
  recentAnswerHistory = [],
}) {
  if (puzzlesAttempted < 3) {
    return {
      state: 'steady',
      targetDifficulty: 'medium',
      confidence: 'low',
      reason: 'Not enough live data yet.',
    };
  }

  const accuracy = puzzlesAttempted > 0 ? puzzlesCorrect / puzzlesAttempted : 0;

  const hasReactionData = averageReactionTime > 0;
  const isFast = hasReactionData && averageReactionTime <= 3200;
  const isSlow = hasReactionData && averageReactionTime > 4200;

  const recentAttempts = recentAnswerHistory.length;
  const recentCorrect = recentAnswerHistory.filter(Boolean).length;
  const recentAccuracy =
    recentAttempts > 0 ? recentCorrect / recentAttempts : accuracy;

  const strongRecentForm = recentAttempts >= 3 && recentAccuracy >= 0.8;
  const weakRecentForm = recentAttempts >= 3 && recentAccuracy <= 0.4;

  if (
    strongRecentForm &&
    accuracy >= 0.75 &&
    currentStreak >= 2 &&
    (!hasReactionData || isFast)
  ) {
    return {
      state: 'challenge',
      targetDifficulty: 'hard',
      confidence:
        currentStreak >= 4 || recentAccuracy >= 0.9 ? 'high' : 'medium',
      reason: 'Recent answers show strong accuracy and momentum.',
    };
  }

  if (
    weakRecentForm ||
    accuracy <= 0.55 ||
    (currentStreak === 0 && (isSlow || recentAccuracy < 0.6))
  ) {
    return {
      state: 'recover',
      targetDifficulty: 'easy',
      confidence: 'medium',
      reason:
        'Recent misses suggest reducing intensity to rebuild consistency.',
    };
  }

  return {
    state: 'steady',
    targetDifficulty: 'medium',
    confidence: 'medium',
    reason: 'Recent performance is stable.',
  };
}
