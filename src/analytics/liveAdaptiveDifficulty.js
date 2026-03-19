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

  const isFast = averageReactionTime > 0 && averageReactionTime <= 3200;
  const isSlow = averageReactionTime > 4200;

  if (accuracy >= 0.85 && currentStreak >= 3 && isFast) {
    return {
      state: "challenge",
      targetDifficulty: "hard",
      confidence: "high",
      reason: "High accuracy, strong streak, and fast reactions.",
    };
  }

  if (accuracy <= 0.5 || (currentStreak === 0 && isSlow)) {
    return {
      state: "recover",
      targetDifficulty: "easy",
      confidence: "medium",
      reason: "Low accuracy or slow recovery pattern detected.",
    };
  }

  return {
    state: "steady",
    targetDifficulty: "medium",
    confidence: "medium",
    reason: "Current performance is stable.",
  };
}