/**
 * Puzzle engine for managing puzzle selection and answer verification.
 *
 * This module provides functions for retrieving a random puzzle from the
 * available pool and checking if a user-provided answer is correct.
 */
import patternPuzzles from './patternPuzzles';

/**
 * Returns a random puzzle from the pool of pattern puzzles.
 *
 * @returns {Object} A puzzle object containing grid, choices, and correctAnswer.
 */
export function getRandomPuzzle(preferredDifficulty = null) {
  const normalizedDifficulty = preferredDifficulty?.toLowerCase?.() || null;

  const filteredPuzzles = normalizedDifficulty
    ? patternPuzzles.filter(
        (puzzle) =>
          (puzzle.difficulty || puzzle.difficultyBucket || "medium") ===
          normalizedDifficulty,
      )
    : patternPuzzles;

  const puzzlePool =
    filteredPuzzles.length > 0 ? filteredPuzzles : patternPuzzles;

  return puzzlePool[Math.floor(Math.random() * puzzlePool.length)];
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
