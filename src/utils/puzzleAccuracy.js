function clamp(value, min = 0, max = 100) {
  return Math.min(Math.max(value, min), max);
}

function toSafeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function round(value, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Match accuracy is based on the entire puzzle set, not just answered items.
 *
 * Example:
 * - totalPuzzles = 5
 * - correctAnswers = 1
 * - attemptedAnswers = 1
 * Result:
 * - accuracy = 20
 *
 * This prevents "100%" accuracy from appearing when only one item was solved
 * before timeout or abandonment.
 */
export function calculateMatchAccuracy({
  correctAnswers = 0,
  attemptedAnswers = 0,
  totalPuzzles = 0,
  decimals = 1,
} = {}) {
  const safeCorrect = Math.max(0, toSafeNumber(correctAnswers));
  const safeAttempted = Math.max(0, toSafeNumber(attemptedAnswers));
  const safeTotal = Math.max(
    safeAttempted,
    Math.max(0, toSafeNumber(totalPuzzles))
  );

  if (safeTotal <= 0) {
    return 0;
  }

  const rawAccuracy = (safeCorrect / safeTotal) * 100;
  return clamp(round(rawAccuracy, decimals));
}

/**
 * Optional helper for displaying a fuller scoring snapshot in end screens
 * or analytics summaries.
 */
export function buildAccuracySummary({
  correctAnswers = 0,
  attemptedAnswers = 0,
  totalPuzzles = 0,
  decimals = 1,
} = {}) {
  const safeCorrect = Math.max(0, toSafeNumber(correctAnswers));
  const safeAttempted = Math.max(0, toSafeNumber(attemptedAnswers));
  const safeTotal = Math.max(
    safeAttempted,
    Math.max(0, toSafeNumber(totalPuzzles))
  );

  const wrongAnswers = Math.max(0, safeAttempted - safeCorrect);
  const unanswered = Math.max(0, safeTotal - safeAttempted);
  const accuracy = calculateMatchAccuracy({
    correctAnswers: safeCorrect,
    attemptedAnswers: safeAttempted,
    totalPuzzles: safeTotal,
    decimals,
  });

  return {
    accuracy,
    correctAnswers: safeCorrect,
    attemptedAnswers: safeAttempted,
    totalPuzzles: safeTotal,
    wrongAnswers,
    unanswered,
    completedAll: safeAttempted >= safeTotal && safeTotal > 0,
  };
}