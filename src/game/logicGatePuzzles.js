const GATE_OPERATIONS = {
  AND: (inputs) => (inputs.A && inputs.B ? 1 : 0),
  OR: (inputs) => (inputs.A || inputs.B ? 1 : 0),
  XOR: (inputs) => ((inputs.A ^ inputs.B) ? 1 : 0),
  NAND: (inputs) => (inputs.A && inputs.B ? 0 : 1),
  XNOR: (inputs) => ((inputs.A ^ inputs.B) ? 0 : 1),
  NOR: (inputs) => (inputs.A || inputs.B ? 0 : 1),
  NOT: (inputs) => (inputs.A ? 0 : 1),
};

const MAX_GATE_OPTIONS = 3;

const GATE_VARIANT_WEIGHT = {
  easy: [
    { variant: "output", weight: 0.85 },
    { variant: "missing_gate", weight: 0.15 },
  ],
  medium: [
    { variant: "output", weight: 0.6 },
    { variant: "missing_gate", weight: 0.2 },
    { variant: "missing_input", weight: 0.2 },
  ],
  hard: [
    { variant: "output", weight: 0.4 },
    { variant: "missing_gate", weight: 0.3 },
    { variant: "missing_input", weight: 0.3 },
  ],
};

const GATE_POOLS = {
  easy: ["AND", "OR", "XOR"],
  medium: ["AND", "OR", "XOR", "NAND", "XNOR"],
  hard: ["AND", "OR", "XOR", "NAND", "XNOR", "NOT"],
};

const ALL_GATE_NAMES = Object.keys(GATE_OPERATIONS);

const HARD_COMPOUND_LOGICS = [
  {
    idSuffix: "chain-or",
    expression: "(A AND B) OR C",
    inputs: ["A", "B", "C"],
    evaluate: (inputValues) =>
      (inputValues.A && inputValues.B) || inputValues.C ? 1 : 0,
  },
  {
    idSuffix: "chain-xor",
    expression: "(A XOR B) NAND C",
    inputs: ["A", "B", "C"],
    evaluate: (inputValues) =>
      inputValues.C
        ? ((inputValues.A ^ inputValues.B) ? 0 : 1)
        : ((inputValues.A ^ inputValues.B) ? 1 : 0),
  },
  {
    idSuffix: "chain-nor",
    expression: "NOT(A OR B)",
    inputs: ["A", "B"],
    evaluate: (inputValues) => (inputValues.A || inputValues.B ? 0 : 1),
  },
  {
    idSuffix: "chain-and-nand",
    expression: "(A OR B) AND (NOT C)",
    inputs: ["A", "B", "C"],
    evaluate: (inputValues) => (inputValues.A || inputValues.B) && !inputValues.C ? 1 : 0,
  },
  {
    idSuffix: "chain-triple-xor",
    expression: "A XOR B XOR C",
    inputs: ["A", "B", "C"],
    evaluate: (inputValues) => (inputValues.A ^ inputValues.B ^ inputValues.C) ? 1 : 0,
  },
  {
    idSuffix: "chain-major",
    expression: "Majority(A, B, C)",
    inputs: ["A", "B", "C"],
    evaluate: (inputValues) => (inputValues.A + inputValues.B + inputValues.C >= 2 ? 1 : 0),
  },
];

const GATE_LABELS = {
  AND: "AND",
  OR: "OR",
  XOR: "XOR",
  NAND: "NAND",
  XNOR: "XNOR",
  NOR: "NOR",
  NOT: "NOT",
};

function randomBit() {
  return Math.random() < 0.5 ? 0 : 1;
}

function pickRandom(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedChoice(choices) {
  if (!Array.isArray(choices) || !choices.length) return null;
  const totalWeight = choices.reduce((sum, choice) => sum + (choice.weight || 0), 0);
  if (totalWeight <= 0) return choices[0].variant;
  let pivot = Math.random() * totalWeight;
  for (const choice of choices) {
    pivot -= choice.weight || 0;
    if (pivot <= 0) {
      return choice.variant;
    }
  }
  return choices[choices.length - 1].variant;
}

function shuffleArray(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function formatInputs(inputs) {
  return Object.entries(inputs)
    .map(([key, value]) => `${key}=${value}`)
    .join(", ");
}

function buildSimpleExpression(gate) {
  if (gate === "NOT") {
    return "NOT A";
  }
  return `A ${gate} B`;
}

function computeGateOutput(gate, inputs) {
  if (gate && GATE_OPERATIONS[gate]) {
    return String(GATE_OPERATIONS[gate](inputs));
  }
  return "0";
}

function buildGateOptions(correct, pool) {
  const cleanPool = [...new Set(pool.concat(ALL_GATE_NAMES))];
  const filtered = cleanPool.filter((candidate) => candidate !== correct);
  const options = [correct];
  while (options.length < MAX_GATE_OPTIONS && filtered.length) {
    const next = pickRandom(filtered);
    options.push(next);
    const index = filtered.indexOf(next);
    if (index >= 0) filtered.splice(index, 1);
  }
  return shuffleArray(options);
}

function buildMissingInputPuzzle(gate, inputs, missingKey) {
  const candidateValue = randomBit();
  const alternate = candidateValue === 1 ? 0 : 1;
  const targetInputs = { ...inputs, [missingKey]: candidateValue };
  const alternateInputs = { ...inputs, [missingKey]: alternate };
  const targetOutput = computeGateOutput(gate, targetInputs);
  const alternateOutput = computeGateOutput(gate, alternateInputs);
  if (targetOutput === alternateOutput) {
    return null;
  }
  const promptInputs = Object.entries(inputs)
    .map(([key, value]) => (key === missingKey ? `${key}=?` : `${key}=${value}`))
    .join(", ");
  return {
    prompt: `Find ${missingKey} for ${gate} when ${promptInputs} and output=${targetOutput}.`,
    answer: String(candidateValue),
    inputs: { ...inputs, [missingKey]: "?" },
    options: ["0", "1"],
  };
}

function buildPuzzleId({ difficulty, variant }) {
  return `logic-${difficulty}-${variant}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
}

function buildBasePuzzle({ difficulty, variant, gate, prompt, inputs, expression, answer, options }) {
  return {
    id: buildPuzzleId({ difficulty, variant }),
    type: "logic_gate",
    difficulty,
    variant,
    gateType: gate,
    prompt,
    inputs,
    gate,
    expression,
    answer: String(answer),
    options: options.map(String),
    puzzleMetrics: {
      gate,
      variant,
      inputCount: Object.keys(inputs).length,
      expression,
      optionCount: options.length,
    },
  };
}

function buildOutputVariant(difficulty, gate, inputs, expression) {
  const answer = computeGateOutput(gate, inputs);
  const prompt = `Evaluate ${expression} when ${formatInputs(inputs)}.`;
  return buildBasePuzzle({
    difficulty,
    variant: "output",
    gate: GATE_LABELS[gate] ?? gate,
    prompt,
    inputs,
    expression,
    answer,
    options: ["0", "1"],
  });
}

function buildMissingGateVariant(difficulty, gate, inputs, expression) {
  const outputValue = computeGateOutput(gate, inputs);
  const prompt = `Which gate produces ${outputValue} when ${formatInputs(inputs)}?`;
  const options = buildGateOptions(GATE_LABELS[gate] ?? gate, GATE_POOLS[difficulty] || ALL_GATE_NAMES);
  return buildBasePuzzle({
    difficulty,
    variant: "missing_gate",
    gate: "???",
    prompt,
    inputs,
    expression,
    answer: GATE_LABELS[gate] ?? gate,
    options,
  });
}

function buildMissingInputVariant(difficulty, gate, inputs, expression) {
  const missingKeys = Object.keys(inputs);
  const missingKey = pickRandom(missingKeys);
  if (!missingKey) return null;
  const puzzle = buildMissingInputPuzzle(gate, inputs, missingKey);
  if (!puzzle) return null;
  return buildBasePuzzle({
    difficulty,
    variant: "missing_input",
    gate: GATE_LABELS[gate] ?? gate,
    prompt: puzzle.prompt,
    inputs: puzzle.inputs,
    expression,
    answer: puzzle.answer,
    options: puzzle.options,
  });
}

function buildInputs(keys) {
  return keys.reduce((acc, key) => {
    acc[key] = randomBit();
    return acc;
  }, {});
}

function buildHardCompoundPuzzle(difficulty) {
  const compound = pickRandom(HARD_COMPOUND_LOGICS);
  if (!compound) return null;
  const inputs = buildInputs(compound.inputs);
  const answer = compound.evaluate(inputs);
  const prompt = `${compound.expression} when ${formatInputs(inputs)}.`;
  return buildBasePuzzle({
    difficulty,
    variant: "output",
    gate: compound.expression,
    prompt,
    inputs,
    expression: compound.expression,
    answer: String(answer),
    options: ["0", "1"],
  });
}

export function getRandomLogicGatePuzzle(difficulty = "medium") {
  const pool = GATE_POOLS[difficulty] || GATE_POOLS.medium;
  const variantWeights = GATE_VARIANT_WEIGHT[difficulty] || GATE_VARIANT_WEIGHT.medium;
  const variant = weightedChoice(variantWeights);
  const gate = pickRandom(pool);
  if (!gate || !variant) {
    return getRandomLogicGatePuzzle("medium");
  }

  // Increased compound puzzle frequency for hard difficulty to boost diversity
  if (difficulty === "hard" && variant === "output" && Math.random() < 0.6) {
    return buildHardCompoundPuzzle(difficulty) ?? getRandomLogicGatePuzzle(difficulty);
  }

  const inputKeys = gate === "NOT" ? ["A"] : ["A", "B"];
  
  // Attempt to balance outputs for simple gates by trying multiple input combinations
  let inputs = buildInputs(inputKeys);
  let output = computeGateOutput(gate, inputs);
  
  // 50% chance to flip inputs if we got a '0' (since '0' was over-represented)
  if (output === "0" && Math.random() < 0.5) {
    inputs = buildInputs(inputKeys);
  }

  const expression = buildSimpleExpression(gate);

  if (variant === "missing_gate") {
    return buildMissingGateVariant(difficulty, gate, inputs, expression);
  }
  if (variant === "missing_input") {
    const puzzle = buildMissingInputVariant(difficulty, gate, inputs, expression);
    return puzzle ?? buildOutputVariant(difficulty, gate, inputs, expression);
  }

  return buildOutputVariant(difficulty, gate, inputs, expression);
}

export default getRandomLogicGatePuzzle;
