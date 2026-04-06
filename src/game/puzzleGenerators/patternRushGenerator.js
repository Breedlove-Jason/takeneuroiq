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
    { patternType: "shapeSequence", weight: 0.36 },
    { patternType: "colorSequence", weight: 0.28 },
    { patternType: "rotationPattern", weight: 0.18 },
    { patternType: "dualLayerPattern", weight: 0.1 },
    { patternType: "alternatingRulePattern", weight: 0.08 },
  ],
  medium: [
    { patternType: "shapeSequence", weight: 0.24 },
    { patternType: "colorSequence", weight: 0.22 },
    { patternType: "rotationPattern", weight: 0.2 },
    { patternType: "dualLayerPattern", weight: 0.18 },
    { patternType: "alternatingRulePattern", weight: 0.16 },
  ],
  hard: [
    { patternType: "shapeSequence", weight: 0.14 },
    { patternType: "colorSequence", weight: 0.16 },
    { patternType: "rotationPattern", weight: 0.18 },
    { patternType: "dualLayerPattern", weight: 0.24 },
    { patternType: "alternatingRulePattern", weight: 0.28 },
  ],
};

const DIFFICULTY_PROFILES = {
  easy: {
    sequenceLengthMin: 5,
    sequenceLengthMax: 6,
    distractorMin: 3,
    distractorMax: 4,
    ruleCount: 1,
    recognitionWindowMs: 1800,
  },
  medium: {
    sequenceLengthMin: 6,
    sequenceLengthMax: 8,
    distractorMin: 4,
    distractorMax: 5,
    ruleCount: 1.5,
    recognitionWindowMs: 1450,
  },
  hard: {
    sequenceLengthMin: 7,
    sequenceLengthMax: 9,
    distractorMin: 5,
    distractorMax: 5,
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
    return weightedList[0]?.patternType ?? "shapeSequence";
  }

  let pivot = Math.random() * totalWeight;
  for (const entry of weightedList) {
    pivot -= entry.weight;
    if (pivot <= 0) {
      return entry.patternType;
    }
  }

  return weightedList[weightedList.length - 1]?.patternType ?? "shapeSequence";
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

  return [token.shape, token.color ?? "", token.rotation ?? "", token.layer ?? ""]
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
    case "shapeSequence":
      return "Shape progression";
    case "colorSequence":
      return "Color progression";
    case "rotationPattern":
      return "Rotation phase";
    case "dualLayerPattern":
      return "Shape + color alignment";
    case "alternatingRulePattern":
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
}) {
  return Array.from({ length }, (_, index) => ({
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
    ? `${getPatternTypeRuleLabel("shapeSequence")}: alternating offsets of +${primaryStep} and +${secondaryStep}.`
    : `${getPatternTypeRuleLabel("shapeSequence")}: steady +${primaryStep} offset.`;

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
  const colorStepPool = difficulty === "hard" ? [1, 2] : [1];
  const primaryStep = pickRandom(colorStepPool) ?? 1;
  const secondaryStep =
    profile.ruleCount > 1
      ? pickRandom(colorStepPool.filter((step) => step !== primaryStep)) ?? primaryStep
      : primaryStep;
  const startIndex = randomInt(0, COLOR_POOL.length - 1);
  const useAlternatingStep =
    profile.ruleCount >= 2 || (profile.ruleCount > 1 && Math.random() < 0.5);

  let cursor = startIndex;
  const sequence = buildTokenSequence({
    length,
    shapeForIndex: (index) => {
      if (index === 0) {
        return COLOR_TO_SHAPE[COLOR_POOL[startIndex]];
      }

      const step = useAlternatingStep && index % 2 === 0 ? secondaryStep : primaryStep;
      cursor = (cursor + step) % COLOR_POOL.length;
      return COLOR_TO_SHAPE[COLOR_POOL[cursor]];
    },
    colorForIndex: (index) => COLOR_POOL[(startIndex + index * primaryStep) % COLOR_POOL.length],
  });

  const correctColor = COLOR_POOL[(startIndex + length * primaryStep) % COLOR_POOL.length];
  const correctAnswer = COLOR_TO_SHAPE[correctColor];
  const ruleDescription = useAlternatingStep
    ? `${getPatternTypeRuleLabel("colorSequence")}: alternating color shifts of +${primaryStep} and +${secondaryStep}.`
    : `${getPatternTypeRuleLabel("colorSequence")}: steady +${primaryStep} shift.`;

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
    ? `${getPatternTypeRuleLabel("rotationPattern")}: alternating turns of ${primaryStep}° and ${secondaryStep}°.`
    : `${getPatternTypeRuleLabel("rotationPattern")}: steady ${primaryStep}° turn.`;

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
  const ruleDescription = `Dual layer alignment using a shape offset of +${shapeStep} combined with a color offset of +${colorStep}.`;

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
    ruleDescription: `Alternating rule stack switching between shape and color derivation each step.`,
    ruleCount: 2,
    recognitionWindowMs: profile.recognitionWindowMs,
  };
}

const PATTERN_BUILDERS = {
  shapeSequence: buildShapeSequencePuzzle,
  colorSequence: buildColorSequencePuzzle,
  rotationPattern: buildRotationPatternPuzzle,
  dualLayerPattern: buildDualLayerPatternPuzzle,
  alternatingRulePattern: buildAlternatingRulePatternPuzzle,
};

export const PATTERN_RUSH_PATTERN_BUILDERS = PATTERN_BUILDERS;

function buildBelievableOptions({
  correctAnswer,
  sequence,
  patternType,
  difficulty,
}) {
  const profile = getDifficultyProfile(difficulty);
  const targetCount = randomInt(profile.distractorMin + 1, profile.distractorMax + 1);
  const answerIndex = SHAPE_POOL.indexOf(correctAnswer);
  const sequenceShapes = unique(sequence.map((token) => token.shape).filter(Boolean));
  const candidateShapes = unique([
    ...sequenceShapes,
    SHAPE_POOL[(answerIndex - 1 + SHAPE_POOL.length) % SHAPE_POOL.length],
    SHAPE_POOL[(answerIndex + 1) % SHAPE_POOL.length],
    SHAPE_POOL[(answerIndex + 2) % SHAPE_POOL.length],
  ]).filter((shape) => shape !== correctAnswer);

  if (patternType === "dualLayerPattern" || patternType === "alternatingRulePattern") {
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
  const builder = PATTERN_BUILDERS[patternType] || PATTERN_BUILDERS.shapeSequence;
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
  const signature = buildSignature({
    patternType,
    difficulty: normalizedDifficulty,
    sequence: base.sequence,
    grid,
    correctAnswer,
  });

  return {
    id: `pattern-rush-${patternRushPuzzleCounter++}`,
    type: "pattern-rush",
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
    signature,
    meta: {
      difficulty: normalizedDifficulty,
      patternType,
      ruleDescription,
      ruleCount: base.ruleCount,
      recognitionWindowMs: base.recognitionWindowMs,
      sequenceLength: base.sequence.length,
      optionCount: options.length,
    },
    puzzleMetrics: {
      patternType,
      difficulty: normalizedDifficulty,
      ruleDescription,
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
    if (!generatedSequenceHistory.has(puzzle.signature)) {
      generatedSequenceHistory.add(puzzle.signature);
      return puzzle;
    }
  }

  const fallbackType = patternTypes[0]?.patternType || "shapeSequence";
  const fallbackPuzzle = buildPatternRushPuzzle({
    difficulty: normalizedDifficulty,
    patternType: fallbackType,
  });
  generatedSequenceHistory.add(fallbackPuzzle.signature);
  return fallbackPuzzle;
}
export default generatePatternRushPuzzle;



