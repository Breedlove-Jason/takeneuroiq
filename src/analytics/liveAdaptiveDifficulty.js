export function calculateLiveAdaptiveDifficulty({
  puzzlesAttempted = 0,
  puzzlesCorrect = 0,
  currentStreak = 0,
  averageReactionTime = 0,
  recentAnswerHistory = [],
}) {
  if (puzzlesAttempted < 3) {
    return {
      state: "steady",
      targetDifficulty: "medium",
      confidence: "low",
      reason: "Not enough live data yet.",
    };
  }

  const accuracy = puzzlesAttempted > 0 ? puzzlesCorrect / puzzlesAttempted : 0;

  const hasReactionData = averageReactionTime > 0;
  const isFast = hasReactionData && averageReactionTime <= 3200;
  const isSlow = hasReactionData && averageReactionTime > 4200;

  const weightedRecentAccuracy = (() => {
    if (!recentAnswerHistory.length) return accuracy;

    const weightedHistory = recentAnswerHistory.slice(-5);
    const weights = [1, 2, 3, 4, 5].slice(-weightedHistory.length);

    const weightedCorrect = weightedHistory.reduce((sum, answer, index) => {
      return sum + (answer ? weights[index] : 0);
    }, 0);

    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

    return totalWeight > 0 ? weightedCorrect / totalWeight : accuracy;
  })();

  const recentAttempts = recentAnswerHistory.length;
  const strongRecentForm =
    recentAttempts >= 3 && weightedRecentAccuracy >= 0.78;
  const weakRecentForm =
    recentAttempts >= 3 && weightedRecentAccuracy <= 0.42;

  if (
    strongRecentForm &&
    accuracy >= 0.72 &&
    currentStreak >= 2 &&
    (!hasReactionData || isFast)
  ) {
    return {
      state: "challenge",
      targetDifficulty: "hard",
      confidence:
        currentStreak >= 4 || weightedRecentAccuracy >= 0.88
          ? "high"
          : "medium",
      reason: "Recent answers show strong accuracy and growing momentum.",
    };
  }

  if (
    weakRecentForm ||
    accuracy <= 0.55 ||
    (currentStreak === 0 && (isSlow || weightedRecentAccuracy < 0.58))
  ) {
    return {
      state: "recover",
      targetDifficulty: "easy",
      confidence: "medium",
      reason: "Recent misses suggest reducing intensity to rebuild consistency.",
    };
  }

  return {
    state: "steady",
    targetDifficulty: "medium",
    confidence: "medium",
    reason: "Recent performance is stable.",
  };
}