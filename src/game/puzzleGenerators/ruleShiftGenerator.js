const RULE_KIND_WEIGHTS = {
  easy: [
    { kind: "add", weight: 0.55 },
    { kind: "subtract", weight: 0.45 },
  ],
  medium: [
    { kind: "add", weight: 0.32 },
    { kind: "subtract", weight: 0.28 },
    { kind: "multiply", weight: 0.22 },
    { kind: "divide", weight: 0.18 },
  ],
  hard: [
    { kind: "add", weight: 0.22 },
    { kind: "subtract", weight: 0.22 },
    { kind: "multiply", weight: 0.33 },
    { kind: "divide", weight: 0.23 },
  ],
};

const DIFFICULTY_PROFILES = {
  easy: {
    visibleLengthMin: 5,
    visibleLengthMax: 6,
    shiftIndexMin: 1,
    shiftIndexMax: 3,
    startMin: 2,
    startMax: 18,
    addMin: 1,
    addMax: 4,
    subtractMin: 1,
    subtractMax: 4,
    multiplyMin: 2,
    multiplyMax: 2,
    divideMin: 2,
    divideMax: 2,
    minValue: 1,
    maxValue: 96,
    optionCount: 4,
    distractorSpreads: [1, 2, 3, 4],
  },
  medium: {
    visibleLengthMin: 6,
    visibleLengthMax: 7,
    shiftIndexMin: 2,
    shiftIndexMax: 4,
    startMin: 4,
    startMax: 28,
    addMin: 2,
    addMax: 8,
    subtractMin: 2,
    subtractMax: 8,
    multiplyMin: 2,
    multiplyMax: 3,
    divideMin: 2,
    divideMax: 3,
    minValue: 1,
    maxValue: 240,
    optionCount: 4,
    distractorSpreads: [2, 3, 4, 5, 6],
  },
  hard: {
    visibleLengthMin: 7,
    visibleLengthMax: 8,
    shiftIndexMin: 2,
    shiftIndexMax: 5,
    startMin: 6,
    startMax: 42,
    addMin: 4,
    addMax: 12,
    subtractMin: 4,
    subtractMax: 12,
    multiplyMin: 2,
    multiplyMax: 4,
    divideMin: 2,
    divideMax: 4,
    minValue: 1,
    maxValue: 999,
    optionCount: 4,
    distractorSpreads: [3, 4, 5, 6, 7, 8],
  },
};

function normalizeDifficulty(difficulty) {
  const key = typeof difficulty === "string" ? difficulty.toLowerCase() : "medium";
  return Object.prototype.hasOwnProperty.call(DIFFICULTY_PROFILES, key) ? key : "medium";
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(array) {
  const copy = [...array];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function weightedChoice(choices) {
  const totalWeight = choices.reduce((sum, choice) => sum + choice.weight, 0);
  if (totalWeight <= 0) {
    return choices[0]?.kind ?? "add";
  }

  let pivot = Math.random() * totalWeight;
  for (const choice of choices) {
    pivot -= choice.weight;
    if (pivot <= 0) {
      return choice.kind;
    }
  }

  return choices[choices.length - 1]?.kind ?? "add";
}

function buildRule(kind, profile) {
  switch (kind) {
    case "add": {
      const amount = randomInt(profile.addMin, profile.addMax);
      return {
        kind,
        amount,
        label: `add ${amount}`,
        apply: (value) => value + amount,
      };
    }
    case "subtract": {
      const amount = randomInt(profile.subtractMin, profile.subtractMax);
      return {
        kind,
        amount,
        label: `subtract ${amount}`,
        apply: (value) => value - amount,
      };
    }
    case "multiply": {
      const factor = randomInt(profile.multiplyMin, profile.multiplyMax);
      return {
        kind,
        factor,
        label: `multiply by ${factor}`,
        apply: (value) => value * factor,
      };
    }
    case "divide": {
      const factor = randomInt(profile.divideMin, profile.divideMax);
      return {
        kind,
        factor,
        label: `divide by ${factor}`,
        apply: (value) => value / factor,
      };
    }
    default:
      return buildRule("add", profile);
  }
}

function rulesAreDistinct(ruleA, ruleB) {
  if (!ruleA || !ruleB) return false;
  if (ruleA.kind !== ruleB.kind) return true;
  return (ruleA.amount ?? ruleA.factor) !== (ruleB.amount ?? ruleB.factor);
}

function buildRulePair(profile) {
  const kinds = RULE_KIND_WEIGHTS[profile.difficulty] || RULE_KIND_WEIGHTS.medium;

  for (let attempt = 0; attempt < 32; attempt += 1) {
    const kindA = weightedChoice(kinds);
    const kindB = weightedChoice(kinds.filter((entry) => entry.kind !== kindA));
    const ruleA = buildRule(kindA, profile);
    const ruleB = buildRule(kindB || kindA, profile);
    if (rulesAreDistinct(ruleA, ruleB)) {
      return { ruleA, ruleB };
    }
  }

  const ruleA = buildRule("add", profile);
  const ruleB = buildRule("subtract", profile);
  return { ruleA, ruleB };
}

function isValidValue(value, profile) {
  return Number.isInteger(value) && value >= profile.minValue && value <= profile.maxValue;
}

function simulateSequence(startValue, visibleLength, shiftIndex, ruleA, ruleB, profile) {
  const sequence = [startValue];
  let current = startValue;

  for (let step = 1; step <= visibleLength; step += 1) {
    const activeRule = step <= shiftIndex ? ruleA : ruleB;
    const nextValue = activeRule.apply(current);

    if (!isValidValue(nextValue, profile)) {
      return null;
    }

    current = nextValue;
    if (step < visibleLength) {
      sequence.push(current);
    }
  }

  return {
    sequence,
    answer: current,
  };
}

function buildOptionCandidates({ answer, sequence, ruleA, ruleB, profile }) {
  const candidates = new Set();
  const lastVisible = sequence[sequence.length - 1];
  const beforeLast = sequence[sequence.length - 2] ?? lastVisible;
  const middle = sequence[Math.floor(sequence.length / 2)] ?? lastVisible;

  const addCandidate = (value) => {
    if (Number.isInteger(value) && value > 0 && value !== answer) {
      candidates.add(value);
    }
  };

  addCandidate(lastVisible);
  addCandidate(beforeLast);
  addCandidate(middle);
  addCandidate(ruleA.apply(lastVisible));
  addCandidate(ruleB.apply(beforeLast));

  for (const spread of profile.distractorSpreads) {
    addCandidate(answer - spread);
    addCandidate(answer + spread);
  }

  if (ruleA.kind === "add" || ruleA.kind === "subtract") {
    addCandidate(lastVisible + (ruleA.amount ?? 0));
    addCandidate(lastVisible - (ruleA.amount ?? 0));
  }

  if (ruleB.kind === "add" || ruleB.kind === "subtract") {
    addCandidate(answer + (ruleB.amount ?? 0));
    addCandidate(answer - (ruleB.amount ?? 0));
  }

  if (ruleA.kind === "multiply") {
    addCandidate(Math.floor(lastVisible / Math.max(2, ruleA.factor)));
    addCandidate(lastVisible * ruleA.factor);
  }

  if (ruleB.kind === "multiply") {
    addCandidate(Math.floor(answer / Math.max(2, ruleB.factor)));
    addCandidate(answer * ruleB.factor);
  }

  if (ruleA.kind === "divide") {
    addCandidate(lastVisible * ruleA.factor);
    addCandidate(Math.floor(lastVisible / ruleA.factor));
  }

  if (ruleB.kind === "divide") {
    addCandidate(answer * ruleB.factor);
    addCandidate(Math.floor(answer / ruleB.factor));
  }

  return shuffleArray([...candidates]);
}

function buildOptions({ answer, sequence, ruleA, ruleB, profile }) {
  const targetCount = profile.optionCount || 4;
  const candidates = buildOptionCandidates({ answer, sequence, ruleA, ruleB, profile });
  const options = [answer];

  for (const candidate of candidates) {
    if (options.length >= targetCount) {
      break;
    }
    options.push(candidate);
  }

  if (options.length < targetCount) {
    let offset = 1;
    while (options.length < targetCount) {
      const direction = Math.random() < 0.5 ? -1 : 1;
      const candidate = answer + direction * (offset + randomInt(1, 2));
      if (candidate > 0 && candidate !== answer && !options.includes(candidate)) {
        options.push(candidate);
      }
      offset += 1;
    }
  }

  return shuffleArray(options);
}

function buildId(difficulty) {
  const salt = Math.floor(Math.random() * 1e9).toString(36);
  return `rule-shift-${difficulty}-${Date.now().toString(36)}-${salt}`;
}

function describeRule(rule) {
  return rule?.label ?? "";
}

function buildPuzzle(difficulty) {
  const profile = {
    ...DIFFICULTY_PROFILES[difficulty],
    difficulty,
  };

  for (let attempt = 0; attempt < 64; attempt += 1) {
    const visibleLength = randomInt(profile.visibleLengthMin, profile.visibleLengthMax);
    const shiftIndex = randomInt(profile.shiftIndexMin, Math.max(profile.shiftIndexMin, visibleLength - 2));
    const startValue = randomInt(profile.startMin, profile.startMax);
    const { ruleA, ruleB } = buildRulePair(profile);
    const simulated = simulateSequence(startValue, visibleLength, shiftIndex, ruleA, ruleB, profile);

    if (!simulated) {
      continue;
    }

    const { sequence, answer } = simulated;
    const options = buildOptions({ answer, sequence, ruleA, ruleB, profile });
    if (!options.includes(answer)) {
      continue;
    }

    return {
      id: buildId(difficulty),
      puzzleType: "rule_shift",
      difficulty,
      sequence,
      options,
      answer,
      shiftIndex,
      ruleA: describeRule(ruleA),
      ruleB: describeRule(ruleB),
    };
  }

  const fallbackRuleA = { kind: "add", amount: 2, label: "+2", apply: (value) => value + 2 };
  const fallbackRuleB = { kind: "subtract", amount: 1, label: "-1", apply: (value) => value - 1 };
  const fallbackSequence = [4, 6, 8, 7, 6];
  const fallbackAnswer = 5;

  return {
    id: buildId(difficulty),
    puzzleType: "rule_shift",
    difficulty,
    sequence: fallbackSequence,
    options: shuffleArray([fallbackAnswer, 4, 6, 8]),
    answer: fallbackAnswer,
    shiftIndex: 2,
    ruleA: describeRule(fallbackRuleA),
    ruleB: describeRule(fallbackRuleB),
  };
}

export function getRandomRuleShiftPuzzle(difficulty = "medium") {
  const normalizedDifficulty = normalizeDifficulty(difficulty);
  return buildPuzzle(normalizedDifficulty);
}

export default getRandomRuleShiftPuzzle;



