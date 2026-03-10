import patternPuzzles from "./patternPuzzles";

export function getRandomPuzzle() {
  const index = Math.floor(Math.random() * patternPuzzles.length);
  return patternPuzzles[index];
}

export function checkAnswer(puzzle, answer) {
  return puzzle.correctAnswer === answer;
}
