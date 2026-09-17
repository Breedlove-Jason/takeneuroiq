import { PUZZLE_TYPES } from "../utils/puzzleTypeRegistry.js";
const families = new Set(Object.values(PUZZLE_TYPES));
const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export function makeScorePayload(session, userId) {
  if (!userId || session.ownerId !== userId) return null;
  const attempted = session.puzzlesAttempted;
  const correct = session.puzzlesCorrect;
  const score = session.score;
  if (
    !uuid.test(session.id) ||
    !families.has(session.puzzleType) ||
    !Number.isInteger(attempted) ||
    attempted < 1 ||
    attempted > 1000 ||
    !Number.isInteger(correct) ||
    correct < 0 ||
    correct > attempted ||
    !Number.isInteger(score) ||
    score < 0 ||
    score > 1000000
  )
    return null;
  return {
    id: session.id,
    user_id: userId,
    puzzle_type: session.puzzleType,
    score,
    attempted,
    correct,
    streak: Math.min(correct, Math.max(0, Math.trunc(session.bestStreak || 0))),
  };
}
