const LOGIC_GATE_POOLS = {
  easy: [
    {
      id: "logic-e1",
      prompt: "XOR gate output when A=1, B=0",
      inputs: { A: 1, B: 0 },
      gate: "XOR",
      options: ["0", "1"],
      answer: "1",
      signature: "xor-1-0",
    },
    {
      id: "logic-e2",
      prompt: "AND gate output when A=1, B=1",
      inputs: { A: 1, B: 1 },
      gate: "AND",
      options: ["0", "1"],
      answer: "1",
      signature: "and-1-1",
    },
    {
      id: "logic-e3",
      prompt: "OR gate output when A=0, B=0",
      inputs: { A: 0, B: 0 },
      gate: "OR",
      options: ["0", "1"],
      answer: "0",
      signature: "or-0-0",
    },
  ],
  medium: [
    {
      id: "logic-m1",
      prompt: "NAND gate output when A=1, B=1",
      inputs: { A: 1, B: 1 },
      gate: "NAND",
      options: ["0", "1"],
      answer: "0",
      signature: "nand-1-1",
    },
    {
      id: "logic-m2",
      prompt: "NOR gate output when A=0, B=1",
      inputs: { A: 0, B: 1 },
      gate: "NOR",
      options: ["0", "1"],
      answer: "0",
      signature: "nor-0-1",
    },
    {
      id: "logic-m3",
      prompt: "XNOR gate output when A=1, B=1",
      inputs: { A: 1, B: 1 },
      gate: "XNOR",
      options: ["0", "1"],
      answer: "1",
      signature: "xnor-1-1",
    },
  ],
  hard: [
    {
      id: "logic-h1",
      prompt: "(A AND B) OR C when A=1, B=0, C=1",
      inputs: { A: 1, B: 0, C: 1 },
      gate: "(A·B)+C",
      options: ["0", "1"],
      answer: "1",
      signature: "and-or-1-0-1",
    },
    {
      id: "logic-h2",
      prompt: "(A XOR B) NAND C when A=1, B=1, C=1",
      inputs: { A: 1, B: 1, C: 1 },
      gate: "(A⊕B) NAND C",
      options: ["0", "1"],
      answer: "0",
      signature: "xor-nand-1-1-1",
    },
    {
      id: "logic-h3",
      prompt: "NOT(A OR B) when A=1, B=0",
      inputs: { A: 1, B: 0 },
      gate: "NOR",
      options: ["0", "1"],
      answer: "0",
      signature: "nor-1-0",
    },
  ],
};

function getPool(difficulty) {
  if (LOGIC_GATE_POOLS[difficulty]) return LOGIC_GATE_POOLS[difficulty];
  return LOGIC_GATE_POOLS.medium;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getRandomLogicGatePuzzle(difficulty = "medium") {
  const pool = getPool(difficulty);
  const base = pickRandom(pool);
  return {
    ...base,
    difficulty,
    options: [...base.options],
    puzzleMetrics: {
      signature: base.signature,
      gate: base.gate,
      inputs: base.inputs,
    },
  };
}

export default getRandomLogicGatePuzzle;
