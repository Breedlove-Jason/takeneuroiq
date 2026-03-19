export function calculateLiveAdaptiveDifficulty({
  puzzlesAttempted = 0,
  puzzlesCorrect = 0,
  currentStreak = 0,
  averageReactionTime = 0,
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

  if (accuracy >= 0.8 && currentStreak >= 3 && (!hasReactionData || isFast)) {
    return {
      state: "challenge",
      targetDifficulty: "hard",
      confidence: currentStreak >= 4 ? "high" : "medium",
      reason:
        "High accuracy and strong streak indicate readiness for harder patterns.",
    };
  }

  if (accuracy <= 0.55 || (currentStreak === 0 && (isSlow || accuracy < 0.7))) {
    return {
      state: "recover",
      targetDifficulty: "easy",
      confidence: "medium",
      reason:
        "Recent misses suggest reducing intensity to rebuild consistency.",
    };
  }

  return {
    state: "steady",
    targetDifficulty: "medium",
    confidence: "medium",
    reason: "Current performance is stable.",
  };
}
