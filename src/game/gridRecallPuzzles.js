// src/game/gridRecallPuzzles.js
const DIFFICULTY_CONFIG = {
  easy: { size: 3, activeNodes: [2, 3], optionCount: 4, decoyVariance: 1 },
  medium: { size: 3, activeNodes: [3, 4, 5], optionCount: 4, decoyVariance: 2 },
  hard: { size: 4, activeNodes: [5, 6, 7, 8], optionCount: 6, decoyVariance: 2 },
};

function shuffleArray(array) {
  const clone = [...array];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

function getConfig(difficulty) {
  return DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.medium;
}

function buildAnswerString(config) {
  const totalCells = config.size * config.size;
  const cells = Array.from({ length: totalCells }, () => "0");
  
  const activeNodesCount = Array.isArray(config.activeNodes) 
    ? config.activeNodes[Math.floor(Math.random() * config.activeNodes.length)]
    : config.activeNodes;

  const activeNodes = Math.min(totalCells, Math.max(1, activeNodesCount));
  const positions = shuffleArray(Array.from({ length: totalCells }, (_, index) => index));

  for (let i = 0; i < activeNodes; i += 1) {
    cells[positions[i]] = "1";
  }

  return { answer: cells.join(""), activeCount: activeNodes };
}

function mutateGridStringWithFlips(gridString, flips) {
  const cells = gridString.split("");
  const positions = shuffleArray(Array.from({ length: cells.length }, (_, index) => index));
  const flipsToApply = Math.min(Math.max(1, flips), cells.length);

  for (let i = 0; i < flipsToApply; i += 1) {
    const position = positions[i];
    cells[position] = cells[position] === "1" ? "0" : "1";
  }

  return cells.join("");
}

function generateDecoyGridStrings(correctGrid, config) {
  const decoyCount = Math.max(1, config.optionCount - 1);
  const decoys = new Set();
  let attempts = 0;

  while (decoys.size < decoyCount && attempts < decoyCount * 8) {
    const candidate = mutateGridStringWithFlips(correctGrid, config.decoyVariance);
    if (candidate !== correctGrid) {
      decoys.add(candidate);
    }
    attempts += 1;
  }

  while (decoys.size < decoyCount) {
    const candidate = mutateGridStringWithFlips(correctGrid, config.decoyVariance);
    if (candidate !== correctGrid) {
      decoys.add(candidate);
    }
  }

  return shuffleArray([...decoys]);
}

export function formatGridAsMatrix(gridString) {
  if (!gridString) {
    return [];
  }
  const size = Math.sqrt(gridString.length);
  if (!Number.isInteger(size)) {
    return [];
  }

  return Array.from({ length: size }, (_, rowIndex) =>
    gridString
      .slice(rowIndex * size, rowIndex * size + size)
      .split("")
      .map((cell) => cell === "1"),
  );
}

export function createGridRecallPuzzle({ difficulty = "medium" } = {}) {
  const config = getConfig(difficulty);
  const { answer, activeCount } = buildAnswerString(config);
  const decoys = generateDecoyGridStrings(answer, config);
  const options = shuffleArray([answer, ...decoys]);

  return {
    difficulty,
    answer,
    options,
    size: config.size,
    activeCount,
    prompt: "Memorize the active nodes",
    puzzleMetrics: {
      gridSize: config.size,
      activeNodes: activeCount,
      optionCount: config.optionCount,
    },
  };
}

export function getRandomGridRecallPuzzle(difficulty = "medium") {
  return createGridRecallPuzzle({ difficulty });
}

export const sampleGridRecallPuzzles = Array.from({ length: 4 }, () =>
  createGridRecallPuzzle({ difficulty: "medium" }),
);

export default sampleGridRecallPuzzles;

