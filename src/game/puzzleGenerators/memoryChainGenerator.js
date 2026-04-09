const DIFFICULTY_PROFILES = {
  easy: {
    chainLengthMin: 4,
    chainLengthMax: 5,
    valueMin: 1,
    valueMax: 40,
    gapMin: 2,
    gapMax: 5,
    optionCount: 4,
    distractorSpreads: [2, 3, 4, 5],
  },
  medium: {
    chainLengthMin: 5,
    chainLengthMax: 6,
    valueMin: 1,
    valueMax: 75,
    gapMin: 1,
    gapMax: 6,
    optionCount: 4,
    distractorSpreads: [1, 2, 3, 4, 5, 6],
  },
  hard: {
    chainLengthMin: 6,
    chainLengthMax: 8,
    valueMin: 1,
    valueMax: 120,
    gapMin: 1,
    gapMax: 4,
    optionCount: 4,
    distractorSpreads: [1, 1, 2, 2, 3],
  },
};

let memoryChainPuzzleCounter = 1;

function normalizeDifficulty(difficulty) {
  const normalized = typeof difficulty === "string" ? difficulty.toLowerCase() : "medium";
  return Object.prototype.hasOwnProperty.call(DIFFICULTY_PROFILES, normalized)
    ? normalized
    : "medium";
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(list) {
  const clone = [...list];
  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]];
  }
  return clone;
}

function uniqueIntegers(values) {
  return [...new Set(values.filter((value) => Number.isInteger(value)))];
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function weightedChoice(entries) {
  const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0);
  if (totalWeight <= 0) {
    return entries[0]?.value ?? 0;
  }

  let pivot = Math.random() * totalWeight;
  for (const entry of entries) {
    pivot -= entry.weight;
    if (pivot <= 0) {
      return entry.value;
    }
  }

  return entries[entries.length - 1]?.value ?? 0;
}

function buildId(difficulty) {
  const salt = Math.floor(Math.random() * 1e9).toString(36);
  const counter = memoryChainPuzzleCounter;
  memoryChainPuzzleCounter += 1;
  return `memory-chain-${difficulty}-${Date.now().toString(36)}-${counter}-${salt}`;
}

function getChainLength(profile) {
  return randomInt(profile.chainLengthMin, profile.chainLengthMax);
}

function getHiddenIndex(length, difficulty) {
  if (length <= 2) {
    return 0;
  }

  const interiorIndices = Array.from({ length: length }, (_, index) => index);
  const easyEdges = [0, 1, Math.max(0, length - 2), length - 1].filter((index) => index >= 0 && index < length);
  const centerStart = Math.max(1, Math.floor(length / 2) - 1);
  const centerEnd = Math.min(length - 2, centerStart + 1);

  switch (difficulty) {
    case "easy": {
      const candidates = uniqueIntegers(easyEdges);
      const weighted = candidates.map((value) => ({
        value,
        weight: value === 0 || value === length - 1 ? 0.35 : 0.15,
      }));
      return weightedChoice(weighted);
    }
    case "hard": {
      const candidates = interiorIndices.filter((index) => index > 0 && index < length - 1);
      const weighted = candidates.map((value) => ({
        value,
        weight: value >= centerStart && value <= centerEnd ? 0.35 : 0.08,
      }));
      return weightedChoice(weighted);
    }
    default: {
      const candidates = interiorIndices.filter((index) => index > 0 && index < length - 1);
      const midpoint = Math.floor((length - 1) / 2);
      const weighted = candidates.map((value) => ({
        value,
        weight: value === midpoint ? 0.3 : value === midpoint - 1 || value === midpoint + 1 ? 0.18 : 0.08,
      }));
      return weightedChoice(weighted);
    }
  }
}

function buildChain(profile, difficulty) {
  for (let attempt = 0; attempt < 96; attempt += 1) {
    const length = getChainLength(profile);
    const direction = Math.random() < 0.5 ? 1 : -1;
    const gaps = Array.from({ length: length - 1 }, () => randomInt(profile.gapMin, profile.gapMax));

    if (gaps.every((gap) => gap === gaps[0]) && length > 4) {
      const varyIndex = randomInt(0, gaps.length - 1);
      gaps[varyIndex] = clamp(gaps[varyIndex] + (Math.random() < 0.5 ? -1 : 1), profile.gapMin, profile.gapMax);
    }

    const totalGap = gaps.reduce((sum, gap) => sum + gap, 0);
    const minStart = profile.valueMin + (direction < 0 ? totalGap : 0);
    const maxStart = profile.valueMax - (direction > 0 ? totalGap : 0);

    if (minStart > maxStart) {
      continue;
    }

    const start = randomInt(minStart, maxStart);
    const chain = [start];
    let current = start;
    let valid = true;

    for (const gap of gaps) {
      current += direction * gap;
      if (current < profile.valueMin || current > profile.valueMax) {
        valid = false;
        break;
      }
      chain.push(current);
    }

    if (!valid) {
      continue;
    }

    const hiddenIndex = getHiddenIndex(chain.length, difficulty);
    if (!Number.isInteger(hiddenIndex) || hiddenIndex < 0 || hiddenIndex >= chain.length) {
      continue;
    }

    return { chain, hiddenIndex };
  }

  const fallbackChain = [8, 12, 17, 23, 30];
  return {
    chain: fallbackChain,
    hiddenIndex: 2,
  };
}

function buildPrompt(hiddenIndex) {
  const position = hiddenIndex + 1;
  return `Which value belongs in position ${position} of the ordered chain?`;
}

function buildOptionCandidates({ answer, chain, hiddenIndex, profile }) {
  const candidates = new Set();
  const previous = chain[hiddenIndex - 1];
  const next = chain[hiddenIndex + 1];
  const beforePrevious = chain[hiddenIndex - 2];
  const afterNext = chain[hiddenIndex + 2];

  const addCandidate = (value) => {
    if (Number.isInteger(value) && value > 0 && value !== answer) {
      candidates.add(value);
    }
  };

  const neighborGapLeft = previous != null ? Math.abs(answer - previous) : null;
  const neighborGapRight = next != null ? Math.abs(next - answer) : null;

  for (const spread of profile.distractorSpreads) {
    addCandidate(answer - spread);
    addCandidate(answer + spread);
  }

  if (previous != null) {
    addCandidate(previous - 1);
    addCandidate(previous + 1);
    addCandidate(previous + 2);
    addCandidate(previous - 2);
  }

  if (next != null) {
    addCandidate(next - 1);
    addCandidate(next + 1);
    addCandidate(next - 2);
    addCandidate(next + 2);
  }

  if (beforePrevious != null) {
    addCandidate(beforePrevious + 1);
    addCandidate(beforePrevious - 1);
  }

  if (afterNext != null) {
    addCandidate(afterNext - 1);
    addCandidate(afterNext + 1);
  }

  if (previous != null && next != null) {
    const midpoint = Math.round((previous + next) / 2);
    addCandidate(midpoint - 1);
    addCandidate(midpoint + 1);

    if (neighborGapLeft != null) {
      addCandidate(previous + neighborGapLeft - 1);
      addCandidate(previous + neighborGapLeft + 1);
    }

    if (neighborGapRight != null) {
      addCandidate(next - neighborGapRight - 1);
      addCandidate(next - neighborGapRight + 1);
    }
  }

  return shuffleArray([...candidates]);
}

function buildOptions({ answer, chain, hiddenIndex, profile }) {
  const targetCount = profile.optionCount ?? 4;
  const options = [answer];
  const candidates = buildOptionCandidates({ answer, chain, hiddenIndex, profile });

  for (const candidate of candidates) {
    if (options.length >= targetCount) {
      break;
    }
    if (!options.includes(candidate)) {
      options.push(candidate);
    }
  }

  let offset = 1;
  while (options.length < targetCount) {
    const spread = profile.distractorSpreads[offset % profile.distractorSpreads.length] ?? offset + 1;
    const direction = Math.random() < 0.5 ? -1 : 1;
    const candidate = answer + direction * (spread + offset - 1);
    if (candidate > 0 && candidate !== answer && !options.includes(candidate)) {
      options.push(candidate);
    }
    offset += 1;
  }

  return shuffleArray(options);
}

function buildPuzzle(difficulty) {
  const profile = DIFFICULTY_PROFILES[difficulty] || DIFFICULTY_PROFILES.medium;

  for (let attempt = 0; attempt < 96; attempt += 1) {
    const { chain, hiddenIndex } = buildChain(profile, difficulty);
    const answer = chain[hiddenIndex];
    const sequence = chain.map((value, index) => (index === hiddenIndex ? null : value));
    const options = buildOptions({ answer, chain, hiddenIndex, profile });

    if (!options.includes(answer)) {
      continue;
    }

    return {
      id: buildId(difficulty),
      puzzleType: "memory_chain",
      difficulty,
      sequence,
      answer,
      options,
      hiddenIndex,
      prompt: buildPrompt(hiddenIndex),
    };
  }

  const fallbackSequence = [8, 12, 17, 23, 30].map((value, index) => (index === 2 ? null : value));

  return {
    id: buildId(difficulty),
    puzzleType: "memory_chain",
    difficulty,
    sequence: fallbackSequence,
    answer: 17,
    options: shuffleArray([17, 16, 18, 21]),
    hiddenIndex: 2,
    prompt: buildPrompt(2),
  };
}

export function getRandomMemoryChainPuzzle(difficulty = "medium") {
  const normalizedDifficulty = normalizeDifficulty(difficulty);
  return buildPuzzle(normalizedDifficulty);
}

export default getRandomMemoryChainPuzzle;


