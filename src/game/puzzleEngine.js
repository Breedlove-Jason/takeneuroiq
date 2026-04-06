/**
 * Puzzle engine for managing puzzle selection and answer verification.
 *
 * This module provides functions for retrieving a random puzzle from the
 * available pool and checking if a user-provided answer is correct.
 */
import patternPuzzles from "./patternPuzzles.js";
import { generatePatternRushPuzzle } from "./puzzleGenerators/patternRushGenerator.js";

const DEFAULT_DIFFICULTY = "medium";

function normalizeDifficulty(difficulty) {
  const normalized = typeof difficulty === "string" ? difficulty.trim().toLowerCase() : "";
  if (["easy", "medium", "hard"].includes(normalized)) {
    return normalized;
  }
  return DEFAULT_DIFFICULTY;
}

function cloneArray(value) {
  return Array.isArray(value) ? [...value] : [];
}

function buildSequenceSignature(puzzle) {
  const title = puzzle?.title || "Pattern Rush";
  const gridSignature = cloneArray(puzzle?.grid).join("|");
  const correctAnswer = String(puzzle?.correctAnswer ?? puzzle?.answer ?? "");
  const patternType = puzzle?.meta?.patternType ?? puzzle?.patternType ?? "static_fallback";
  return [patternType, title, gridSignature, correctAnswer].join("::");
}

function isValidPatternRushPuzzle(puzzle) {
  if (!puzzle || typeof puzzle !== "object") {
    return false;
  }

  const title = typeof puzzle.title === "string" && puzzle.title.trim();
  const grid = Array.isArray(puzzle.grid) && puzzle.grid.length > 0;
  const choices = Array.isArray(puzzle.choices) && puzzle.choices.length >= 3 && puzzle.choices.length <= 5;
  const correctAnswer = String(puzzle.correctAnswer ?? puzzle.answer ?? "");
  const hasAnswerInChoices = choices && puzzle.choices.includes(correctAnswer);

  return Boolean(title && grid && choices && hasAnswerInChoices);
}

function normalizePatternRushPuzzle(puzzle, preferredDifficulty = DEFAULT_DIFFICULTY) {
  const normalizedDifficulty = normalizeDifficulty(
    puzzle?.difficulty ?? puzzle?.difficultyBucket ?? preferredDifficulty,
  );
  const choices = cloneArray(puzzle?.choices?.length ? puzzle.choices : puzzle?.options);
  const correctAnswer = String(puzzle?.correctAnswer ?? puzzle?.answer ?? choices[0] ?? "");
  const sequenceSignature =
    puzzle?.meta?.sequenceSignature || puzzle?.sequenceSignature || puzzle?.signature || buildSequenceSignature(puzzle);
  const ruleDescription =
    puzzle?.meta?.ruleDescription || puzzle?.ruleDescription || "Pattern Rush sequence";
  const patternType = puzzle?.meta?.patternType || puzzle?.patternType || "static_fallback";

  return {
    ...puzzle,
    type: "pattern_rush",
    difficulty: normalizedDifficulty,
    difficultyBucket: normalizedDifficulty,
    title: typeof puzzle?.title === "string" ? puzzle.title : "Pattern Rush",
    prompt:
      typeof puzzle?.prompt === "string"
        ? puzzle.prompt
        : "Resolve the missing tile and keep the momentum alive.",
    grid: cloneArray(puzzle?.grid),
    choices,
    options: choices,
    correctAnswer,
    answer: correctAnswer,
    sequenceSignature,
    signature: sequenceSignature,
    meta: {
      ...(puzzle?.meta || {}),
      difficulty: normalizedDifficulty,
      patternType,
      ruleDescription,
      sequenceSignature,
    },
    puzzleMetrics: {
      ...(puzzle?.puzzleMetrics || {}),
      difficulty: normalizedDifficulty,
      patternType,
      ruleDescription,
      sequenceSignature,
    },
  };
}

function getStaticPatternRushFallback(preferredDifficulty = DEFAULT_DIFFICULTY) {
  const normalizedDifficulty = normalizeDifficulty(preferredDifficulty);
  const fallbackPool = patternPuzzles.filter(
    (puzzle) => normalizeDifficulty(puzzle?.difficulty || puzzle?.difficultyBucket) === normalizedDifficulty,
  );
  const puzzlePool = fallbackPool.length > 0 ? fallbackPool : patternPuzzles;
  const staticPuzzle = puzzlePool[Math.floor(Math.random() * puzzlePool.length)] || patternPuzzles[0];
  return normalizePatternRushPuzzle(staticPuzzle, normalizedDifficulty);
}

/**
 * Returns a random Pattern Rush puzzle, procedurally when possible with a static fallback.
 *
 * @returns {Object} A puzzle object containing grid, choices, and correctAnswer.
 */
export function getRandomPuzzle(preferredDifficulty = null) {
  const normalizedDifficulty = normalizeDifficulty(preferredDifficulty);

  try {
    const generatedPuzzle = generatePatternRushPuzzle(normalizedDifficulty);
    if (isValidPatternRushPuzzle(generatedPuzzle)) {
      return normalizePatternRushPuzzle(generatedPuzzle, normalizedDifficulty);
    }
  } catch {
    // Fall through to the legacy static pool.
  }

  return getStaticPatternRushFallback(normalizedDifficulty);
}

/**
 * Verifies if the provided answer matches the puzzle's correct answer.
 *
 * @param {Object} puzzle - The puzzle object to check against.
 * @param {string} answer - The user's provided answer.
 * @returns {boolean} True if the answer is correct, false otherwise.
 */
export function checkAnswer(puzzle, answer) {
  return puzzle.correctAnswer === answer;
}
