const SYMBOL_POOL = ["●", "▲", "■", "◆", "★", "✦", "✚", "☼", "☾"];

const CLUSTER_BY_SYMBOL = {
  "●": "filled_round",
  "▲": "filled_point",
  "■": "filled_square",
  "◆": "filled_diamond",
  "★": "star",
  "✦": "star",
  "✚": "cross",
  "☼": "celestial",
  "☾": "celestial",
};

const DIFFICULTY_PROFILES = {
  easy: {
    setSizeMin: 3,
    setSizeMax: 4,
    optionCount: 4,
    distractorMode: "distinct",
  },
  medium: {
    setSizeMin: 5,
    setSizeMax: 6,
    optionCount: 4,
    distractorMode: "mixed",
  },
  hard: {
    setSizeMin: 7,
    setSizeMax: 9,
    optionCount: 4,
    distractorMode: "similar",
  },
};

let symbolRecallPuzzleCounter = 1;

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

function buildId(difficulty) {
  const salt = Math.floor(Math.random() * 1e9).toString(36);
  const counter = symbolRecallPuzzleCounter;
  symbolRecallPuzzleCounter += 1;
  return `symbol-recall-${difficulty}-${Date.now().toString(36)}-${counter}-${salt}`;
}

function getCluster(symbol) {
  return CLUSTER_BY_SYMBOL[symbol] ?? "other";
}

function clusterDistance(clusterA, clusterB) {
  if (clusterA === clusterB) {
    return 0;
  }

  const filledShape = (cluster) =>
    cluster === "filled_round" ||
    cluster === "filled_point" ||
    cluster === "filled_square" ||
    cluster === "filled_diamond";

  if (filledShape(clusterA) && filledShape(clusterB)) {
    return 1;
  }

  if (clusterA === "celestial" || clusterB === "celestial") {
    return 3;
  }

  if ((clusterA === "star" && clusterB === "cross") || (clusterB === "star" && clusterA === "cross")) {
    return 2;
  }

  if (filledShape(clusterA) && (clusterB === "star" || clusterB === "cross")) {
    return 2;
  }

  if (filledShape(clusterB) && (clusterA === "star" || clusterA === "cross")) {
    return 2;
  }

  return 3;
}

function pickDistinctSymbols(count) {
  if (count > SYMBOL_POOL.length) {
    return shuffleArray([...SYMBOL_POOL]);
  }
  return shuffleArray([...SYMBOL_POOL]).slice(0, count);
}

function pickTargetIndex(length, difficulty) {
  if (length <= 1) {
    return 0;
  }

  if (length === 2) {
    return Math.random() < 0.5 ? 0 : 1;
  }

  const interiorBias =
    difficulty === "hard" ? 0.55 : difficulty === "medium" ? 0.35 : 0.2;
  const hasInteriorSpan = length > 3;

  if (hasInteriorSpan && Math.random() < interiorBias) {
    return randomInt(1, length - 2);
  }

  if (difficulty === "easy") {
    return Math.random() < 0.5 ? 0 : length - 1;
  }

  return randomInt(0, length - 1);
}

function orderedDistractorCandidates(answer, displayedSet, mode) {
  const answerCluster = getCluster(answer);
  const notAnswer = SYMBOL_POOL.filter((symbol) => symbol !== answer);
  const notDisplayed = notAnswer.filter((symbol) => !displayedSet.has(symbol));
  const otherDisplayed = [...displayedSet].filter((symbol) => symbol !== answer);

  const scoredPool = notAnswer.map((symbol) => {
    const sameCluster = getCluster(symbol) === answerCluster;
    const inDisplay = displayedSet.has(symbol);
    const dist = clusterDistance(getCluster(symbol), answerCluster);

    let score = 0;

    if (mode === "distinct") {
      score += sameCluster ? -2 : 0;
      score += inDisplay ? 0.5 : 0;
      score += dist * 1.4;
      score += Math.random() * 0.35;
    } else if (mode === "similar") {
      score += sameCluster ? 2.5 : 0;
      score += dist <= 1 ? 1.2 : 0;
      score += inDisplay && symbol !== answer ? 0.8 : 0;
      score -= dist * 0.25;
      score += Math.random() * 0.45;
    } else {
      score += sameCluster ? 1 : 0;
      score += inDisplay ? 1.1 : 0;
      score += (3 - dist) * 0.35;
      score += Math.random() * 0.4;
    }

    return { symbol, score };
  });

  scoredPool.sort((a, b) => b.score - a.score);

  const ordered = scoredPool.map((entry) => entry.symbol);

  const prioritized = [];
  const pushUnique = (symbol) => {
    if (symbol && symbol !== answer && !prioritized.includes(symbol)) {
      prioritized.push(symbol);
    }
  };

  if (mode === "distinct") {
    for (const symbol of notDisplayed) {
      pushUnique(symbol);
    }
    for (const symbol of ordered) {
      pushUnique(symbol);
    }
  } else if (mode === "similar") {
    for (const symbol of otherDisplayed) {
      pushUnique(symbol);
    }
    for (const symbol of ordered) {
      pushUnique(symbol);
    }
    for (const symbol of notDisplayed) {
      pushUnique(symbol);
    }
  } else {
    const shuffledOthers = shuffleArray(otherDisplayed);
    for (const symbol of shuffledOthers) {
      pushUnique(symbol);
    }
    for (const symbol of ordered) {
      pushUnique(symbol);
    }
  }

  for (const symbol of SYMBOL_POOL) {
    pushUnique(symbol);
  }

  return prioritized;
}

function buildOptions({ answer, displayedSymbols, optionCount, distractorMode }) {
  const displayedSet = new Set(displayedSymbols);
  const candidates = orderedDistractorCandidates(answer, displayedSet, distractorMode);
  const options = [answer];

  for (const candidate of candidates) {
    if (options.length >= optionCount) {
      break;
    }
    if (!options.includes(candidate)) {
      options.push(candidate);
    }
  }

  let fallbackIndex = 0;
  while (options.length < optionCount && fallbackIndex < SYMBOL_POOL.length) {
    const symbol = SYMBOL_POOL[fallbackIndex];
    fallbackIndex += 1;
    if (symbol !== answer && !options.includes(symbol)) {
      options.push(symbol);
    }
  }

  return shuffleArray(options);
}

function buildPrompt() {
  return "Which symbol was the designated recall target?";
}

function buildPuzzle(difficulty) {
  const profile = DIFFICULTY_PROFILES[difficulty] || DIFFICULTY_PROFILES.medium;
  const setSize = randomInt(profile.setSizeMin, profile.setSizeMax);
  const poolDraw = pickDistinctSymbols(setSize);
  const targetIndex = pickTargetIndex(poolDraw.length, difficulty);
  const targetSymbol = poolDraw[targetIndex];
  const answer = targetSymbol;
  const symbols = shuffleArray(poolDraw);
  const options = buildOptions({
    answer,
    displayedSymbols: poolDraw,
    optionCount: profile.optionCount,
    distractorMode: profile.distractorMode,
  });

  if (!options.includes(answer)) {
    options[randomInt(0, options.length - 1)] = answer;
  }

  return {
    id: buildId(difficulty),
    puzzleType: "symbol_recall",
    difficulty,
    symbols,
    targetSymbol,
    answer,
    options,
    prompt: buildPrompt(),
  };
}

export function getRandomSymbolRecallPuzzle(difficulty = "medium") {
  const normalizedDifficulty = normalizeDifficulty(difficulty);
  return buildPuzzle(normalizedDifficulty);
}

export default getRandomSymbolRecallPuzzle;
