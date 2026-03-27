// src/game/gridRecallPuzzles.js
const GRID_SIZE = 3;
const GRID_CELL_COUNT = GRID_SIZE * GRID_SIZE;
const DEFAULT_DECOY_COUNT = 3;
const GRID_FLIP_SETTINGS = {
  easy: { minFlip: 1, maxFlip: 2 },
  medium: { minFlip: 2, maxFlip: 3 },
  hard: { minFlip: 2, maxFlip: 4 },
};

let puzzleIdCounter = 1;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(array) {
  const clone = [...array];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

function buildBooleanGridString() {
  const cells = Array.from({ length: GRID_CELL_COUNT }, () => (Math.random() < 0.5 ? '1' : '0'));
  if (cells.every((cell) => cell === cells[0])) {
    const lastIndex = GRID_CELL_COUNT - 1;
    cells[lastIndex] = cells[lastIndex] === '1' ? '0' : '1';
  }
  return cells.join('');
}

function mutateGridString(gridString, flips) {
  const cells = gridString.split('');
  const positions = shuffleArray(Array.from({ length: cells.length }, (_, index) => index));
  const flipsToApply = Math.min(Math.max(flips, 1), cells.length);
  for (let i = 0; i < flipsToApply; i += 1) {
    const position = positions[i];
    cells[position] = cells[position] === '1' ? '0' : '1';
  }
  return cells.join('');
}

function generateDecoyGridStrings(correctGrid, options = {}) {
  const { count = DEFAULT_DECOY_COUNT, minFlip = 1, maxFlip = 3 } = options;
  const normalizedMin = Math.max(1, minFlip);
  const normalizedMax = Math.max(normalizedMin, maxFlip);
  const decoys = new Set();
  let attempts = 0;

  while (decoys.size < count && attempts < count * 8) {
    const flipCount = randomInt(normalizedMin, normalizedMax);
    const candidate = mutateGridString(correctGrid, flipCount);
    if (candidate !== correctGrid) {
      decoys.add(candidate);
    }
    attempts += 1;
  }

  while (decoys.size < count) {
    const fallback = mutateGridString(correctGrid, normalizedMin);
    if (fallback !== correctGrid) {
      decoys.add(fallback);
    } else {
      break;
    }
  }

  return shuffleArray([...decoys]).slice(0, count);
}

export function formatGridAsMatrix(gridString) {
  if (!gridString || gridString.length !== GRID_CELL_COUNT) {
    return [];
  }
  return Array.from({ length: GRID_SIZE }, (_, rowIndex) =>
    gridString
      .slice(rowIndex * GRID_SIZE, rowIndex * GRID_SIZE + GRID_SIZE)
      .split('')
      .map((cell) => cell === '1'),
  );
}

export function createGridRecallPuzzle({
  difficulty = 'medium',
  decoyCount = DEFAULT_DECOY_COUNT,
  prompt,
  id,
  signature,
} = {}) {
  const grid = buildBooleanGridString();
  const flipSettings = GRID_FLIP_SETTINGS[difficulty] || GRID_FLIP_SETTINGS.medium;
  const decoys = generateDecoyGridStrings(grid, {
    count: decoyCount,
    minFlip: flipSettings.minFlip,
    maxFlip: flipSettings.maxFlip,
  });
  const options = shuffleArray([grid, ...decoys]);
  const puzzleId = id || `grid-recall-${puzzleIdCounter++}`;

  return {
    id: puzzleId,
    difficulty,
    prompt: prompt || 'Memorize the grid layout and pick the correct pattern.',
    grid,
    options,
    answer: grid,
    signature: signature || `${difficulty}-${grid}`,
    puzzleMetrics: {
      gridSignature: grid,
      decoyCount: decoys.length,
      difficulty,
    },
  };
}

export function getRandomGridRecallPuzzle(difficulty = 'medium') {
  return createGridRecallPuzzle({ difficulty });
}

export const sampleGridRecallPuzzles = Array.from({ length: 4 }, () =>
  createGridRecallPuzzle({ difficulty: 'medium' }),
);

export default sampleGridRecallPuzzles;

