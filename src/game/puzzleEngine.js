/**
 * Puzzle engine for managing puzzle selection and answer verification.
 *
 * This module provides functions for retrieving a random puzzle from the
 * available pool and checking if a user-provided answer is correct.
 */
import { generatePatternRushPuzzle } from "./puzzleGenerators/patternRushGenerator.js";

/**
 * Returns a random Pattern Rush puzzle from the procedural generator.
 *
 * @returns {Object} A puzzle object containing grid, choices, and correctAnswer.
 */
export function getRandomPuzzle(preferredDifficulty = null) {
  return generatePatternRushPuzzle(preferredDifficulty || "medium");
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
