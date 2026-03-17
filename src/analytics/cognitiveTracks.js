export function buildCognitiveTracks(sessions = []) {
  return calculateCognitiveTracks(sessions);
}

export function calculateCognitiveTracks(sessions = []) {
  if (!Array.isArray(sessions) || sessions.length === 0) {
    return {
      patternRecognition: 0,
      focusStability: 0,
      processingSpeed: 0,
      consistency: 0,
    };
  }

  const validSessions = sessions.filter(
    (session) => session && typeof session === "object"
  );

  if (validSessions.length === 0) {
    return {
      patternRecognition: 0,
      focusStability: 0,
      processingSpeed: 0,
      consistency: 0,
    };
  }

  const average = (values) => {
    if (!values.length) return 0;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  };

  const clamp = (value, min = 0, max = 100) =>
    Math.max(min, Math.min(max, Math.round(value)));

  const accuracies = validSessions.map((session) => session.accuracy || 0);
  const streaks = validSessions.map((session) => session.bestStreak || 0);
  const scores = validSessions.map((session) => session.score || 0);
  const attempted = validSessions.map((session) => session.puzzlesAttempted || 0);
  const correct = validSessions.map((session) => session.puzzlesCorrect || 0);

  const solveRates = validSessions.map((session) => {
    const attempts = session.puzzlesAttempted || 0;
    const solved = session.puzzlesCorrect || 0;

    if (attempts <= 0) return 0;
    return (solved / attempts) * 100;
  });

  const patternRecognition = clamp(
    average([
      average(accuracies),
      average(solveRates),
    ])
  );

  const focusStability = clamp(
    average([
      average(streaks) * 10,
      average(accuracies),
    ])
  );

  const processingSpeed = clamp(
    average([
      average(scores) / 12,
      average(correct) * 8,
      average(attempted) * 4,
    ])
  );

  const scoreMean = average(scores);
  const scoreVariance =
    scores.length > 1
      ? average(scores.map((score) => Math.pow(score - scoreMean, 2)))
      : 0;

  const normalizedVariancePenalty = Math.min(scoreVariance / 2000, 40);

  const consistency = clamp(
    average(accuracies) - normalizedVariancePenalty + average(streaks) * 2
  );

  return {
    patternRecognition,
    focusStability,
    processingSpeed,
    consistency,
  };
}