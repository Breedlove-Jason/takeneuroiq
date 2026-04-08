const LETTER_POOL = ["A", "B", "C", "D", "E", "F", "G", "H"];
const SHAPE_POOL = ["▲", "■", "●", "◆", "⬢", "✦"];
const SYMBOL_POOL = ["◐", "◓", "◑", "◒", "✧", "✦", "✺", "✹"];

const RULE_TYPE_WEIGHTS = {
  easy: [
    { ruleType: "row_consistency", weight: 0.32 },
    { ruleType: "column_consistency", weight: 0.28 },
    { ruleType: "value_progression", weight: 0.18 },
    { ruleType: "symbol_cycle", weight: 0.14 },
    { ruleType: "rotation_shift", weight: 0.08 },
  ],
  medium: [
    { ruleType: "row_consistency", weight: 0.18 },
    { ruleType: "column_consistency", weight: 0.2 },
    { ruleType: "rotation_shift", weight: 0.22 },
    { ruleType: "value_progression", weight: 0.22 },
    { ruleType: "symbol_cycle", weight: 0.18 },
  ],
  hard: [
    { ruleType: "row_consistency", weight: 0.12 },
    { ruleType: "column_consistency", weight: 0.14 },
    { ruleType: "rotation_shift", weight: 0.26 },
    { ruleType: "value_progression", weight: 0.26 },
    { ruleType: "symbol_cycle", weight: 0.22 },
  ],
};

const DIFFICULTY_PROFILES = {
  easy: {
    gridSizes: [2, 3],
    optionBounds: [3, 4],
    progressionStepPool: [1],
    shiftStepPool: [1],
    cycleLengthPool: [3, 4],
    layered: false,
  },
  medium: {
    gridSizes: [3],
    optionBounds: [4, 5],
    progressionStepPool: [1, 2],
    shiftStepPool: [1, 2],
    cycleLengthPool: [4, 5],
    layered: false,
  },
  hard: {
    gridSizes: [3],
    optionBounds: [5, 5],
    progressionStepPool: [2, 3],
    shiftStepPool: [1, 2],
    cycleLengthPool: [5, 6],
    layered: true,
  },
};

const HISTORY_LIMIT = 240;
let logicGridPuzzleCounter = 1;
const generatedLogicGridSignatures = new Set();

function normalizeDifficulty(difficulty) {
  const normalized = typeof difficulty === "string" ? difficulty.trim().toLowerCase() : "";
  return Object.prototype.hasOwnProperty.call(DIFFICULTY_PROFILES, normalized)
    ? normalized
    : "medium";
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(list) {
  if (!Array.isArray(list) || list.length === 0) {
    return null;
  }
  return list[Math.floor(Math.random() * list.length)];
}

function shuffleArray(list) {
  const copy = [...list];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function unique(list) {
  return [...new Set(list.filter(Boolean))];
}

function createMatrix(size, fillFn) {
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => fillFn(row, col)),
  );
}

function serializeCell(value) {
  return String(value ?? "");
}

function serializeGrid(grid) {
  return grid.map((row) => row.map(serializeCell).join(",")).join("|");
}

function buildSignature({ difficulty, ruleType, gridSize, grid, missingIndex, answer }) {
  const missingToken = typeof missingIndex === "object" && missingIndex !== null
    ? `${missingIndex.row}:${missingIndex.col}`
    : String(missingIndex ?? "");

  return [
    difficulty,
    ruleType,
    gridSize,
    serializeGrid(grid),
    missingToken,
    serializeCell(answer),
  ].join("::");
}

function weightedChoice(weightedList) {
  const totalWeight = weightedList.reduce((sum, entry) => sum + (entry.weight || 0), 0);
  if (totalWeight <= 0) {
    return weightedList[0]?.ruleType ?? "row_consistency";
  }

  let pivot = Math.random() * totalWeight;
  for (const entry of weightedList) {
    pivot -= entry.weight || 0;
    if (pivot <= 0) {
      return entry.ruleType;
    }
  }

  return weightedList[weightedList.length - 1]?.ruleType ?? "row_consistency";
}

function getDifficultyProfile(difficulty) {
  return DIFFICULTY_PROFILES[normalizeDifficulty(difficulty)] || DIFFICULTY_PROFILES.medium;
}

function getRulePool(difficulty) {
  return RULE_TYPE_WEIGHTS[normalizeDifficulty(difficulty)] || RULE_TYPE_WEIGHTS.medium;
}

function getTokenPoolForAnswer(answer) {
  if (LETTER_POOL.includes(answer)) return LETTER_POOL;
  if (SHAPE_POOL.includes(answer)) return SHAPE_POOL;
  if (SYMBOL_POOL.includes(answer)) return SYMBOL_POOL;
  return unique([...LETTER_POOL, ...SHAPE_POOL, ...SYMBOL_POOL]);
}

function getNeighborTokens(answer) {
  const pool = getTokenPoolForAnswer(answer);
  const index = pool.indexOf(answer);
  if (index < 0) {
    return pool;
  }

  const neighbors = [
    pool[(index - 1 + pool.length) % pool.length],
    pool[(index + 1) % pool.length],
    pool[(index + 2) % pool.length],
    pool[(index - 2 + pool.length) % pool.length],
  ];

  return unique(neighbors);
}

function buildOptions({ answer, distractorSeeds = [], targetCount }) {
  const candidatePool = unique([
    answer,
    ...distractorSeeds,
    ...getNeighborTokens(answer),
  ]).filter(Boolean);

  const options = [answer];
  for (const candidate of shuffleArray(candidatePool)) {
    if (options.length >= targetCount) {
      break;
    }
    if (!options.includes(candidate)) {
      options.push(candidate);
    }
  }

  const fallbackPool = getTokenPoolForAnswer(answer);
  while (options.length < targetCount) {
    const fallback = pickRandom(fallbackPool);
    if (fallback && !options.includes(fallback)) {
      options.push(fallback);
    }
  }

  return shuffleArray(options);
}

function pickMissingIndex(size, difficulty) {
  if (difficulty === "easy" && size === 2) {
    return { row: 1, col: 1 };
  }

  const edgeBias = difficulty === "easy" ? 0.7 : 0.45;
  if (Math.random() < edgeBias) {
    const edgeCells = [];
    for (let index = 0; index < size; index += 1) {
      edgeCells.push({ row: 0, col: index });
      edgeCells.push({ row: size - 1, col: index });
    }
    for (let row = 1; row < size - 1; row += 1) {
      edgeCells.push({ row, col: 0 });
      edgeCells.push({ row, col: size - 1 });
    }
    return pickRandom(edgeCells) || { row: randomInt(0, size - 1), col: randomInt(0, size - 1) };
  }

  return { row: randomInt(0, size - 1), col: randomInt(0, size - 1) };
}

function buildRowConsistencyPuzzle(difficulty, size) {
  const profile = getDifficultyProfile(difficulty);
  const tokenPool = difficulty === "hard" ? SHAPE_POOL : LETTER_POOL;
  const step = pickRandom(profile.layered ? [1, 2] : [1]) ?? 1;
  const start = randomInt(0, tokenPool.length - 1);
  const rowTokens = Array.from({ length: size }, (_, row) => tokenPool[(start + row * step) % tokenPool.length]);
  const grid = createMatrix(size, (row) => rowTokens[row]);
  const missingIndex = pickMissingIndex(size, difficulty);
  const answer = grid[missingIndex.row][missingIndex.col];
  grid[missingIndex.row][missingIndex.col] = "missing";

  return {
    grid,
    missingIndex: { ...missingIndex, index: missingIndex.row * size + missingIndex.col },
    answer,
    ruleDescription: profile.layered
      ? `Each row repeats a symbol, but the row symbol advances by a hidden step of +${step}.`
      : `Each row repeats one symbol across the line, and the row symbols advance in order.`,
    distractorSeeds: unique(rowTokens),
  };
}

function buildColumnConsistencyPuzzle(difficulty, size) {
  const profile = getDifficultyProfile(difficulty);
  const tokenPool = difficulty === "hard" ? SYMBOL_POOL : LETTER_POOL;
  const step = pickRandom(profile.layered ? [1, 2] : [1]) ?? 1;
  const start = randomInt(0, tokenPool.length - 1);
  const columnTokens = Array.from({ length: size }, (_, col) => tokenPool[(start + col * step) % tokenPool.length]);
  const grid = createMatrix(size, (_, col) => columnTokens[col]);
  const missingIndex = pickMissingIndex(size, difficulty);
  const answer = grid[missingIndex.row][missingIndex.col];
  grid[missingIndex.row][missingIndex.col] = "missing";

  return {
    grid,
    missingIndex: { ...missingIndex, index: missingIndex.row * size + missingIndex.col },
    answer,
    ruleDescription: profile.layered
      ? `Each column carries a repeated symbol, with columns advancing by a hidden step of +${step}.`
      : `Each column repeats one symbol top to bottom, and the columns advance in order.`,
    distractorSeeds: unique(columnTokens),
  };
}

function buildRotationShiftPuzzle(difficulty, size) {
  const profile = getDifficultyProfile(difficulty);
  const tokenPool = difficulty === "hard" ? SHAPE_POOL : SYMBOL_POOL;
  const baseRow = shuffleArray(tokenPool).slice(0, size);
  const shiftStep = pickRandom(profile.shiftStepPool) ?? 1;
  const alternatingShift = profile.layered && Math.random() < 0.5;
  const grid = createMatrix(size, (row, col) => {
    const rowShift = alternatingShift ? ((row * (row + 1)) / 2) % size : (row * shiftStep) % size;
    return baseRow[(col - rowShift + size) % size];
  });
  const missingIndex = pickMissingIndex(size, difficulty);
  const answer = grid[missingIndex.row][missingIndex.col];
  grid[missingIndex.row][missingIndex.col] = "missing";

  return {
    grid,
    missingIndex: { ...missingIndex, index: missingIndex.row * size + missingIndex.col },
    answer,
    ruleDescription: alternatingShift
      ? `Each row rotates the base pattern, but the shift grows as the grid descends.`
      : `Each row rotates the base pattern by ${shiftStep} step${shiftStep === 1 ? "" : "s"}.`,
    distractorSeeds: unique(baseRow),
  };
}

function buildValueProgressionPuzzle(difficulty, size) {
  const profile = getDifficultyProfile(difficulty);
  const tokenPool = LETTER_POOL;
  const step = pickRandom(profile.progressionStepPool) ?? 1;
  const start = randomInt(0, tokenPool.length - 1);
  const grid = createMatrix(size, (row, col) => {
    const linearIndex = row * size + col;
    return tokenPool[(start + linearIndex * step) % tokenPool.length];
  });
  const missingIndex = pickMissingIndex(size, difficulty);
  const answer = grid[missingIndex.row][missingIndex.col];
  grid[missingIndex.row][missingIndex.col] = "missing";

  return {
    grid,
    missingIndex: { ...missingIndex, index: missingIndex.row * size + missingIndex.col },
    answer,
    ruleDescription: profile.layered
      ? `Values advance by a hidden arithmetic step of +${step}, making the sequence less direct.`
      : `Values advance in a predictable order by a step of +${step}.`,
    distractorSeeds: unique([answer, tokenPool[(start + step) % tokenPool.length], tokenPool[(start + step * 2) % tokenPool.length]]),
  };
}

function buildSymbolCyclePuzzle(difficulty, size) {
  const profile = getDifficultyProfile(difficulty);
  const cycleLength = Math.min(
    SYMBOL_POOL.length,
    pickRandom(profile.cycleLengthPool) ?? 4,
  );
  const cyclePool = shuffleArray(SYMBOL_POOL).slice(0, cycleLength);
  const step = profile.layered ? 2 : 1;
  const offset = randomInt(0, cyclePool.length - 1);
  const grid = createMatrix(size, (row, col) => {
    const linearIndex = row * size + col;
    return cyclePool[(offset + linearIndex * step) % cyclePool.length];
  });
  const missingIndex = pickMissingIndex(size, difficulty);
  const answer = grid[missingIndex.row][missingIndex.col];
  grid[missingIndex.row][missingIndex.col] = "missing";

  return {
    grid,
    missingIndex: { ...missingIndex, index: missingIndex.row * size + missingIndex.col },
    answer,
    ruleDescription: profile.layered
      ? `Symbols cycle through a repeating set, but the sequence skips every other symbol.`
      : `Symbols cycle through a repeating set in order.`,
    distractorSeeds: unique(cyclePool),
  };
}

const RULE_BUILDERS = {
  row_consistency: buildRowConsistencyPuzzle,
  column_consistency: buildColumnConsistencyPuzzle,
  rotation_shift: buildRotationShiftPuzzle,
  value_progression: buildValueProgressionPuzzle,
  symbol_cycle: buildSymbolCyclePuzzle,
};

function buildLogicGridPuzzle({ difficulty, ruleType, size }) {
  const builder = RULE_BUILDERS[ruleType] || RULE_BUILDERS.row_consistency;
  const built = builder(difficulty, size);
  const profile = getDifficultyProfile(difficulty);
  const targetCount = randomInt(profile.optionBounds[0], profile.optionBounds[1]);
  const options = buildOptions({
    answer: built.answer,
    distractorSeeds: built.distractorSeeds,
    targetCount,
  });
  const sequenceSignature = buildSignature({
    difficulty,
    ruleType,
    gridSize: size,
    grid: built.grid,
    missingIndex: built.missingIndex,
    answer: built.answer,
  });

  return {
    id: `logic-grid-${logicGridPuzzleCounter++}`,
    type: "logic_grid",
    difficulty,
    title: `Logic Grid · ${ruleType.replace(/_/g, " ")}`,
    prompt: "Infer the missing cell using the active grid logic.",
    grid: built.grid,
    missingIndex: built.missingIndex,
    options,
    answer: built.answer,
    meta: {
      ruleType,
      gridSize: size,
      ruleDescription: built.ruleDescription,
      sequenceSignature,
    },
  };
}

function getGridSizeForDifficulty(difficulty) {
  const profile = getDifficultyProfile(difficulty);
  return pickRandom(profile.gridSizes) || 3;
}

function isValidLogicGridPuzzle(puzzle) {
  if (!puzzle || typeof puzzle !== "object") {
    return false;
  }

  const gridIsArray = Array.isArray(puzzle.grid) && puzzle.grid.length > 0;
  const size = puzzle?.meta?.gridSize;
  const rowCountMatches = gridIsArray && Number.isInteger(size) && puzzle.grid.length === size;
  const options = Array.isArray(puzzle.options) ? puzzle.options : [];
  const answer = serializeCell(puzzle.answer);
  const containsAnswer = options.includes(answer);

  return Boolean(
    typeof puzzle.id === "string" &&
      puzzle.type === "logic_grid" &&
      typeof puzzle.title === "string" &&
      typeof puzzle.prompt === "string" &&
      rowCountMatches &&
      options.length >= 3 &&
      options.length <= 5 &&
      containsAnswer &&
      puzzle.meta &&
      typeof puzzle.meta.ruleType === "string" &&
      typeof puzzle.meta.ruleDescription === "string" &&
      typeof puzzle.meta.sequenceSignature === "string",
  );
}

export function getRandomLogicGridPuzzle(difficulty = "medium") {
  const normalizedDifficulty = normalizeDifficulty(difficulty);
  const profile = getDifficultyProfile(normalizedDifficulty);
  const rulePool = getRulePool(normalizedDifficulty);

  for (let attempt = 0; attempt < 80; attempt += 1) {
    const ruleType = weightedChoice(rulePool);
    const size = getGridSizeForDifficulty(normalizedDifficulty);
    const puzzle = buildLogicGridPuzzle({ difficulty: normalizedDifficulty, ruleType, size });

    if (!generatedLogicGridSignatures.has(puzzle.meta.sequenceSignature) && isValidLogicGridPuzzle(puzzle)) {
      generatedLogicGridSignatures.add(puzzle.meta.sequenceSignature);
      if (generatedLogicGridSignatures.size > HISTORY_LIMIT) {
        const oldestSignature = generatedLogicGridSignatures.values().next().value;
        if (oldestSignature) {
          generatedLogicGridSignatures.delete(oldestSignature);
        }
      }
      return puzzle;
    }
  }

  const fallbackRuleType = rulePool[0]?.ruleType || "row_consistency";
  const fallbackPuzzle = buildLogicGridPuzzle({
    difficulty: normalizedDifficulty,
    ruleType: fallbackRuleType,
    size: profile.gridSizes[0] || 3,
  });
  generatedLogicGridSignatures.add(fallbackPuzzle.meta.sequenceSignature);
  return fallbackPuzzle;
}

export default getRandomLogicGridPuzzle;


