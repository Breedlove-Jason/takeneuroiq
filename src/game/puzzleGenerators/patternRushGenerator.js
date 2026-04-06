const SHAPE_POOL = [
  "circle",
  "square",
  "triangle",
  "diamond",
  "cross",
  "bolt",
];

const COLOR_POOL = [
  "cyan",
  "magenta",
  "violet",
  "emerald",
  "amber",
  "white",
];

const ROTATION_POOL = [0, 90, 180, 270];

const PATTERN_TYPE_WEIGHTS = {
  easy: [
    { patternType: "shape_sequence", weight: 0.36 },
    { patternType: "positional_pattern", weight: 0.24 },
    { patternType: "rotation_pattern", weight: 0.16 },
    { patternType: "dual_layer_pattern", weight: 0.14 },
    { patternType: "alternating_rule", weight: 0.1 },
  ],
  medium: [
    { patternType: "shape_sequence", weight: 0.2 },
    { patternType: "positional_pattern", weight: 0.22 },
    { patternType: "rotation_pattern", weight: 0.2 },
    { patternType: "dual_layer_pattern", weight: 0.2 },
    { patternType: "alternating_rule", weight: 0.18 },
  ],
  hard: [
    { patternType: "shape_sequence", weight: 0.14 },
    { patternType: "positional_pattern", weight: 0.16 },
    { patternType: "rotation_pattern", weight: 0.18 },
    { patternType: "dual_layer_pattern", weight: 0.24 },
    { patternType: "alternating_rule", weight: 0.28 },
  ],
};

const DIFFICULTY_PROFILES = {
  easy: {
    sequenceLengthMin: 5,
    sequenceLengthMax: 6,
    totalChoicesMin: 3,
    totalChoicesMax: 4,
    ruleCount: 1,
    recognitionWindowMs: 1800,
  },
  medium: {
    sequenceLengthMin: 6,
    sequenceLengthMax: 8,
    totalChoicesMin: 4,
    totalChoicesMax: 5,
    ruleCount: 1.5,
    recognitionWindowMs: 1450,
  },
  hard: {
    sequenceLengthMin: 7,
    sequenceLengthMax: 9,
    totalChoicesMin: 5,
    totalChoicesMax: 5,
    ruleCount: 2,
    recognitionWindowMs: 1150,
  },
};

const COLOR_TO_SHAPE = {
  cyan: "circle",
  magenta: "square",
  violet: "triangle",
  emerald: "diamond",
  amber: "cross",
  white: "bolt",
};

const ROTATION_TO_SHAPE = {
  0: "circle",
  90: "square",
  180: "triangle",
  270: "bolt",
};

let patternRushPuzzleCounter = 1;
const generatedSequenceHistory = new Set();

function normalizeDifficulty(difficulty) {
  const normalized = typeof difficulty === "string" ? difficulty.toLowerCase() : "";
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
  const clone = [...list];
  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]];
  }
  return clone;
}

function weightedChoice(weightedList) {
  const totalWeight = weightedList.reduce((sum, entry) => sum + entry.weight, 0);
  if (totalWeight <= 0) {
    return weightedList[0]?.patternType ?? "shape_sequence";
  }

  let pivot = Math.random() * totalWeight;
  for (const entry of weightedList) {
    pivot -= entry.weight;
    if (pivot <= 0) {
      return entry.patternType;
    }
  }

  return weightedList[weightedList.length - 1]?.patternType ?? "shape_sequence";
}

function unique(list) {
  return [...new Set(list)];
}

function titleCase(value) {
  return String(value)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function serializeToken(token) {
  if (!token || typeof token !== "object") {
    return String(token ?? "");
  }

  const positionValue = token.position
    ? `${token.position.row},${token.position.col}`
    : token.positionLabel ?? "";

  return [
    token.shape,
    token.color ?? "",
    token.rotation ?? "",
    token.layer ?? "",
    positionValue,
  ]
    .map((part) => String(part))
    .join("|");
}

function buildSignature({ patternType, difficulty, sequence, grid, correctAnswer }) {
  return [
    patternType,
    difficulty,
    sequence.map(serializeToken).join("~"),
    grid.join("|"),
    correctAnswer,
  ].join("::");
}

function getChoiceCountBounds(difficulty) {
  const profile = getDifficultyProfile(difficulty);
  return [profile.totalChoicesMin || 3, profile.totalChoicesMax || 5];
}

function getDifficultyProfile(difficulty) {
  return DIFFICULTY_PROFILES[normalizeDifficulty(difficulty)] || DIFFICULTY_PROFILES.medium;
}

function getPatternTypePool(difficulty) {
  return PATTERN_TYPE_WEIGHTS[normalizeDifficulty(difficulty)] || PATTERN_TYPE_WEIGHTS.medium;
}

function getPatternTypeLabel(patternType) {
  return titleCase(patternType);
}

function getPatternTypeRuleLabel(patternType) {
  switch (patternType) {
    case "shape_sequence":
      return "Shape progression";
    case "positional_pattern":
      return "Positional progression";
    case "rotation_pattern":
      return "Rotation phase";
    case "dual_layer_pattern":
      return "Shape + color alignment";
    case "alternating_rule":
      return "Alternating rule stack";
    default:
      return "Pattern alignment";
  }
}

function getShapeStepPool(difficulty) {
  if (difficulty === "hard") {
    return [1, 2];
  }
  if (difficulty === "easy") {
    return [1];
  }
  return [1, 2];
}

function getRotationStepPool(difficulty) {
  if (difficulty === "hard") {
    return [90, 180];
  }
  if (difficulty === "easy") {
    return [90];
  }
  return [90, 180];
}

function buildTokenSequence({
  length,
  shapeForIndex,
  colorForIndex,
  rotationForIndex,
  layerForIndex,
  positionForIndex,
}) {
  return Array.from({ length }, (_, index) => ({
    position: positionForIndex ? positionForIndex(index) : undefined,
    shape: shapeForIndex(index),
    color: colorForIndex ? colorForIndex(index) : undefined,
    rotation: rotationForIndex ? rotationForIndex(index) : undefined,
    layer: layerForIndex ? layerForIndex(index) : undefined,
  }));
}

function buildShapeSequencePuzzle(difficulty) {
  const profile = getDifficultyProfile(difficulty);
  const length = randomInt(profile.sequenceLengthMin, profile.sequenceLengthMax);
  const stepPool = getShapeStepPool(difficulty);
  const primaryStep = pickRandom(stepPool) ?? 1;
  const secondaryStep =
    profile.ruleCount > 1 ? pickRandom(stepPool.filter((step) => step !== primaryStep)) ?? primaryStep : primaryStep;
  const startIndex = randomInt(0, SHAPE_POOL.length - 1);
  const useAlternatingStep =
    profile.ruleCount >= 2 || (profile.ruleCount > 1 && Math.random() < 0.5);

  let cursor = startIndex;
  const sequence = buildTokenSequence({
    length,
    shapeForIndex: (index) => {
      if (index === 0) {
        return SHAPE_POOL[startIndex];
      }

      const step = useAlternatingStep && index % 2 === 1 ? secondaryStep : primaryStep;
      cursor = (cursor + step) % SHAPE_POOL.length;
      return SHAPE_POOL[cursor];
    },
  });

  const correctAnswer = sequence[length - 1].shape;
  const ruleDescription = useAlternatingStep
    ? `${getPatternTypeRuleLabel("shape_sequence")}: alternating offsets of +${primaryStep} and +${secondaryStep}.`
    : `${getPatternTypeRuleLabel("shape_sequence")}: steady +${primaryStep} offset.`;

  return {
    sequence,
    correctAnswer,
    ruleDescription,
    ruleCount: useAlternatingStep ? 2 : 1,
    recognitionWindowMs: profile.recognitionWindowMs,
  };
}

function buildColorSequencePuzzle(difficulty) {
  const profile = getDifficultyProfile(difficulty);
  const length = randomInt(profile.sequenceLengthMin, profile.sequenceLengthMax);
  const startRow = randomInt(0, 2);
  const startCol = randomInt(0, 2);
  const moveOptions =
    difficulty === "easy"
      ? [
          { row: 0, col: 1 },
          { row: 1, col: 0 },
        ]
      : [
          { row: 0, col: 1 },
          { row: 1, col: 0 },
          { row: 0, col: -1 },
        ];
  const secondaryMoveOptions =
    difficulty === "hard"
      ? [
          { row: -1, col: 0 },
          { row: 1, col: 1 },
        ]
      : [
          { row: 0, col: 1 },
          { row: 1, col: 0 },
        ];
  const primaryMove = pickRandom(moveOptions) ?? { row: 0, col: 1 };
  const secondaryMove =
    profile.ruleCount > 1
      ? pickRandom(
          secondaryMoveOptions.filter(
            (move) => move.row !== primaryMove.row || move.col !== primaryMove.col,
          ),
        ) ?? primaryMove
      : primaryMove;
  const useAlternatingStep =
    profile.ruleCount >= 2 || (profile.ruleCount > 1 && Math.random() < 0.5);

  let cursorRow = startRow;
  let cursorCol = startCol;
  const sequence = buildTokenSequence({
    length,
    shapeForIndex: (index) => {
      const colorIndex = (cursorRow * 3 + cursorCol + index) % COLOR_POOL.length;
      return COLOR_TO_SHAPE[COLOR_POOL[colorIndex]];
    },
    colorForIndex: (index) =>
      COLOR_POOL[(startRow + startCol + index * (useAlternatingStep ? 2 : 1)) % COLOR_POOL.length],
    positionForIndex: (index) => {
      if (index === 0) {
        return { row: startRow, col: startCol };
      }

      const move = useAlternatingStep && index % 2 === 1 ? secondaryMove : primaryMove;
      cursorRow = (cursorRow + move.row + 3) % 3;
      cursorCol = (cursorCol + move.col + 3) % 3;
      return { row: cursorRow, col: cursorCol };
    },
  });

  const correctAnswer = sequence[length - 1].shape;
  const ruleDescription = useAlternatingStep
    ? `${getPatternTypeRuleLabel("positional_pattern")}: alternating movement across the grid from r${startRow + 1}c${startCol + 1}.`
    : `${getPatternTypeRuleLabel("positional_pattern")}: steady movement from r${startRow + 1}c${startCol + 1}.`;

  return {
    sequence,
    correctAnswer,
    ruleDescription,
    ruleCount: useAlternatingStep ? 2 : 1,
    recognitionWindowMs: profile.recognitionWindowMs,
  };
}

function buildRotationPatternPuzzle(difficulty) {
  const profile = getDifficultyProfile(difficulty);
  const length = randomInt(profile.sequenceLengthMin, profile.sequenceLengthMax);
  const stepPool = getRotationStepPool(difficulty);
  const primaryStep = pickRandom(stepPool) ?? 90;
  const secondaryStep =
    profile.ruleCount > 1 ? pickRandom(stepPool.filter((step) => step !== primaryStep)) ?? primaryStep : primaryStep;
  const startIndex = randomInt(0, ROTATION_POOL.length - 1);
  const useAlternatingStep =
    profile.ruleCount >= 2 || (profile.ruleCount > 1 && Math.random() < 0.5);

  let cursor = startIndex;
  const sequence = buildTokenSequence({
    length,
    shapeForIndex: (index) => {
      if (index === 0) {
        return ROTATION_TO_SHAPE[ROTATION_POOL[startIndex]];
      }

      const step = useAlternatingStep && index % 2 === 1 ? secondaryStep : primaryStep;
      cursor = (cursor + step / 90) % ROTATION_POOL.length;
      return ROTATION_TO_SHAPE[ROTATION_POOL[cursor]];
    },
    rotationForIndex: (index) => ROTATION_POOL[(startIndex + index * (primaryStep / 90)) % ROTATION_POOL.length],
  });

  const correctRotation = ROTATION_POOL[(startIndex + length * (primaryStep / 90)) % ROTATION_POOL.length];
  const correctAnswer = ROTATION_TO_SHAPE[correctRotation];
  const ruleDescription = useAlternatingStep
    ? `${getPatternTypeRuleLabel("rotation_pattern")}: alternating turns of ${primaryStep}° and ${secondaryStep}°.`
    : `${getPatternTypeRuleLabel("rotation_pattern")}: steady ${primaryStep}° turn.`;

  return {
    sequence,
    correctAnswer,
    ruleDescription,
    ruleCount: useAlternatingStep ? 2 : 1,
    recognitionWindowMs: profile.recognitionWindowMs,
  };
}

function buildDualLayerPatternPuzzle(difficulty) {
  const profile = getDifficultyProfile(difficulty);
  const length = randomInt(profile.sequenceLengthMin, profile.sequenceLengthMax);
  const shapeStep = pickRandom(getShapeStepPool(difficulty)) ?? 1;
  const colorStep = pickRandom(difficulty === "hard" ? [1, 2] : [1]) ?? 1;
  const shapeStart = randomInt(0, SHAPE_POOL.length - 1);
  const colorStart = randomInt(0, COLOR_POOL.length - 1);

  const sequence = buildTokenSequence({
    length,
    shapeForIndex: (index) => SHAPE_POOL[(shapeStart + index * shapeStep) % SHAPE_POOL.length],
    colorForIndex: (index) => COLOR_POOL[(colorStart + index * colorStep) % COLOR_POOL.length],
  });

  const finalShapeIndex =
    (shapeStart + length * shapeStep + (colorStart + length * colorStep)) % SHAPE_POOL.length;
  const correctAnswer = SHAPE_POOL[finalShapeIndex];
  const ruleDescription = `${getPatternTypeRuleLabel("dual_layer_pattern")}: shape offset +${shapeStep} with color offset +${colorStep}.`;

  return {
    sequence,
    correctAnswer,
    ruleDescription,
    ruleCount: 2,
    recognitionWindowMs: profile.recognitionWindowMs,
  };
}

function buildAlternatingRulePatternPuzzle(difficulty) {
  const profile = getDifficultyProfile(difficulty);
  const length = randomInt(profile.sequenceLengthMin, profile.sequenceLengthMax);
  const shapeStep = pickRandom(getShapeStepPool(difficulty)) ?? 1;
  const colorStep = pickRandom(difficulty === "hard" ? [1, 2] : [1]) ?? 1;
  const shapeStart = randomInt(0, SHAPE_POOL.length - 1);
  const colorStart = randomInt(0, COLOR_POOL.length - 1);

  const sequence = buildTokenSequence({
    length,
    shapeForIndex: (index) => {
      if (index % 2 === 0) {
        return SHAPE_POOL[(shapeStart + index * shapeStep) % SHAPE_POOL.length];
      }
      return COLOR_TO_SHAPE[COLOR_POOL[(colorStart + index * colorStep) % COLOR_POOL.length]];
    },
    colorForIndex: (index) => COLOR_POOL[(colorStart + index * colorStep) % COLOR_POOL.length],
    rotationForIndex: (index) => (index % 2 === 0 ? ROTATION_POOL[(shapeStart + index) % ROTATION_POOL.length] : ROTATION_POOL[(colorStart + index) % ROTATION_POOL.length]),
  });

  const nextIndex = length;
  const nextShape =
    nextIndex % 2 === 0
      ? SHAPE_POOL[(shapeStart + nextIndex * shapeStep) % SHAPE_POOL.length]
      : COLOR_TO_SHAPE[COLOR_POOL[(colorStart + nextIndex * colorStep) % COLOR_POOL.length]];

  return {
    sequence,
    correctAnswer: nextShape,
    ruleDescription: `${getPatternTypeRuleLabel("alternating_rule")}: switching between shape and color derivation each step.`,
    ruleCount: 2,
    recognitionWindowMs: profile.recognitionWindowMs,
  };
}

const PATTERN_BUILDERS = {
  shape_sequence: buildShapeSequencePuzzle,
  positional_pattern: buildColorSequencePuzzle,
  rotation_pattern: buildRotationPatternPuzzle,
  dual_layer_pattern: buildDualLayerPatternPuzzle,
  alternating_rule: buildAlternatingRulePatternPuzzle,
};

export const PATTERN_RUSH_PATTERN_BUILDERS = PATTERN_BUILDERS;

function buildBelievableOptions({
  correctAnswer,
  sequence,
  patternType,
  difficulty,
}) {
  const [minChoices, maxChoices] = getChoiceCountBounds(difficulty);
  const targetCount = randomInt(minChoices, maxChoices);
  const answerIndex = SHAPE_POOL.indexOf(correctAnswer);
  const sequenceShapes = unique(sequence.map((token) => token.shape).filter(Boolean));
  const candidateShapes = unique([
    ...sequenceShapes,
    SHAPE_POOL[(answerIndex - 1 + SHAPE_POOL.length) % SHAPE_POOL.length],
    SHAPE_POOL[(answerIndex + 1) % SHAPE_POOL.length],
    SHAPE_POOL[(answerIndex + 2) % SHAPE_POOL.length],
  ]).filter((shape) => shape !== correctAnswer);

  if (patternType === "dual_layer_pattern" || patternType === "alternating_rule") {
    candidateShapes.push(
      SHAPE_POOL[(answerIndex + 3) % SHAPE_POOL.length],
      SHAPE_POOL[(answerIndex + 4) % SHAPE_POOL.length],
    );
  }

  const options = [correctAnswer];
  const shuffledCandidates = shuffleArray(candidateShapes);

  for (const candidate of shuffledCandidates) {
    if (options.length >= targetCount) {
      break;
    }
    if (candidate !== correctAnswer && !options.includes(candidate)) {
      options.push(candidate);
    }
  }

  while (options.length < targetCount) {
    const fallbackCandidate = pickRandom(SHAPE_POOL);
    if (fallbackCandidate && !options.includes(fallbackCandidate)) {
      options.push(fallbackCandidate);
    }
  }

  return shuffleArray(options);
}

function buildGridFromSequence(sequence, missingIndex, correctAnswer) {
  return sequence.map((token, index) => (index === missingIndex ? "missing" : token.shape ?? correctAnswer));
}

function buildPatternRushPuzzle({ difficulty, patternType }) {
  const normalizedDifficulty = normalizeDifficulty(difficulty);
  const builder = PATTERN_BUILDERS[patternType] || PATTERN_BUILDERS.shape_sequence;
  const base = builder(normalizedDifficulty);
  const visibleLength = base.sequence.length;
  const missingIndex = randomInt(
    normalizedDifficulty === "easy" ? Math.max(1, Math.floor(visibleLength / 2)) : 1,
    visibleLength - 1,
  );
  const correctAnswer = base.sequence[missingIndex]?.shape || base.correctAnswer;
  const options = buildBelievableOptions({
    correctAnswer,
    sequence: base.sequence,
    patternType,
    difficulty: normalizedDifficulty,
  });
  const grid = buildGridFromSequence(base.sequence, missingIndex, correctAnswer);
  const ruleDescription = base.ruleDescription;
  const title = `Pattern Rush · ${getPatternTypeLabel(patternType)}`;
  const prompt = "Resolve the missing tile and keep the momentum alive.";
  const sequenceSignature = buildSignature({
    patternType,
    difficulty: normalizedDifficulty,
    sequence: base.sequence,
    grid,
    correctAnswer,
  });

  return {
    id: `pattern-rush-${patternRushPuzzleCounter++}`,
    type: "pattern_rush",
    title,
    prompt,
    difficulty: normalizedDifficulty,
    difficultyBucket: normalizedDifficulty,
    patternType,
    sequence: base.sequence,
    grid,
    options,
    choices: options,
    correctAnswer,
    answer: correctAnswer,
    sequenceSignature,
    signature: sequenceSignature,
    meta: {
      difficulty: normalizedDifficulty,
      patternType,
      ruleDescription,
      sequenceSignature,
      ruleCount: base.ruleCount,
      recognitionWindowMs: base.recognitionWindowMs,
      sequenceLength: base.sequence.length,
      optionCount: options.length,
    },
    puzzleMetrics: {
      patternType,
      difficulty: normalizedDifficulty,
      ruleDescription,
      sequenceSignature,
      ruleCount: base.ruleCount,
      recognitionWindowMs: base.recognitionWindowMs,
      sequenceLength: base.sequence.length,
      optionCount: options.length,
      missingIndex,
    },
  };
}

export function generatePatternRushPuzzle(difficulty = "medium") {
  const normalizedDifficulty = normalizeDifficulty(difficulty);
  const patternTypes = getPatternTypePool(normalizedDifficulty).filter(
    (entry) => PATTERN_RUSH_PATTERN_BUILDERS[entry.patternType],
  );

  for (let attempt = 0; attempt < 50; attempt += 1) {
    const patternType = weightedChoice(patternTypes);
    const puzzle = buildPatternRushPuzzle({ difficulty: normalizedDifficulty, patternType });
    if (!generatedSequenceHistory.has(puzzle.sequenceSignature)) {
      generatedSequenceHistory.add(puzzle.sequenceSignature);
      return puzzle;
    }
  }

  const fallbackType = patternTypes[0]?.patternType || "shape_sequence";
  const fallbackPuzzle = buildPatternRushPuzzle({
    difficulty: normalizedDifficulty,
    patternType: fallbackType,
  });
  generatedSequenceHistory.add(fallbackPuzzle.sequenceSignature);
  return fallbackPuzzle;
}
export default generatePatternRushPuzzle;



