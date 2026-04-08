const NODE_ID_POOL = ["A", "B", "C", "D", "E", "F", "G", "H"];
const PATH_ID_POOL = ["A", "B", "C", "D", "E", "F"];

const DIFFICULTY_CONFIG = {
  easy: {
    nodeCountMin: 3,
    nodeCountMax: 4,
    optionCount: 3,
    pathLengthMin: 3,
    pathLengthMax: 3,
    ruleTypes: ["alternating_values", "all_same", "exactly_one_high"],
    decoyStyle: "open",
  },
  medium: {
    nodeCountMin: 4,
    nodeCountMax: 5,
    optionCount: 4,
    pathLengthMin: 3,
    pathLengthMax: 4,
    ruleTypes: [
      "alternating_values",
      "all_same",
      "exactly_one_high",
      "no_consecutive_duplicates",
    ],
    decoyStyle: "close",
  },
  hard: {
    nodeCountMin: 5,
    nodeCountMax: 6,
    optionCount: 4,
    pathLengthMin: 4,
    pathLengthMax: 5,
    ruleTypes: [
      "alternating_values",
      "all_same",
      "exactly_one_high",
      "no_consecutive_duplicates",
    ],
    decoyStyle: "dense",
  },
};

const RULES = {
  alternating_values: {
    text: "Choose the path with alternating signal values.",
    evaluate: (values) => {
      if (values.length < 2) return false;
      return values.every(
        (value, index) => index === 0 || value !== values[index - 1],
      );
    },
  },
  all_same: {
    text: "Choose the path where all values match.",
    evaluate: (values) => {
      if (values.length === 0) return false;
      return values.every((value) => value === values[0]);
    },
  },
  exactly_one_high: {
    text: "Choose the path with exactly one high signal.",
    evaluate: (values) => values.filter((value) => value === 1).length === 1,
  },
  no_consecutive_duplicates: {
    text: "Choose the path with no repeated adjacent values.",
    evaluate: (values) => {
      if (values.length < 2) return false;
      return values.every(
        (value, index) => index === 0 || value !== values[index - 1],
      );
    },
  },
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffleArray(array) {
  const clone = [...array];
  for (let index = clone.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[swapIndex]] = [clone[swapIndex], clone[index]];
  }
  return clone;
}

function resolveDifficultyConfig(difficulty) {
  return DIFFICULTY_CONFIG[difficulty] || DIFFICULTY_CONFIG.medium;
}

function buildNodes(nodeCount) {
  const shuffledPool = shuffleArray(NODE_ID_POOL);
  const nodeIds = shuffledPool.slice(0, nodeCount).sort();
  let values = nodeIds.map((id) => ({ id, value: Math.random() < 0.5 ? 0 : 1 }));

  // Keep at least one 0 and one 1 to reduce degenerate all-same sets.
  const highCount = values.filter((node) => node.value === 1).length;
  if (highCount === 0) {
    values[0] = { ...values[0], value: 1 };
  } else if (highCount === values.length) {
    values[values.length - 1] = { ...values[values.length - 1], value: 0 };
  }

  return values;
}

function routeKey(route) {
  return route.join("-");
}

function generateAllRoutes(nodeIds, pathLength) {
  const routes = [];

  function dfs(currentRoute, used) {
    if (currentRoute.length === pathLength) {
      routes.push(currentRoute);
      return;
    }

    for (const nodeId of nodeIds) {
      if (used.has(nodeId)) continue;
      const nextUsed = new Set(used);
      nextUsed.add(nodeId);
      dfs([...currentRoute, nodeId], nextUsed);
    }
  }

  dfs([], new Set());
  return routes;
}

function mapNodeValues(nodes) {
  return nodes.reduce((acc, node) => {
    acc[node.id] = node.value;
    return acc;
  }, {});
}

function getRouteValues(route, nodeValueMap) {
  return route.map((nodeId) => nodeValueMap[nodeId]);
}

function routeSimilarityScore(baseRoute, candidateRoute) {
  const candidateSet = new Set(candidateRoute);
  const positionMatches = baseRoute.reduce(
    (sum, nodeId, index) => sum + (candidateRoute[index] === nodeId ? 1 : 0),
    0,
  );
  const overlapMatches = baseRoute.reduce(
    (sum, nodeId) => sum + (candidateSet.has(nodeId) ? 1 : 0),
    0,
  );

  return positionMatches * 2 + overlapMatches;
}

function pickDecoys(invalidRoutes, correctRoute, count, style) {
  if (invalidRoutes.length < count) {
    return [];
  }

  if (style === "open") {
    return shuffleArray(invalidRoutes).slice(0, count);
  }

  const ranked = [...invalidRoutes].sort(
    (a, b) =>
      routeSimilarityScore(correctRoute, b) - routeSimilarityScore(correctRoute, a),
  );

  if (style === "dense") {
    return ranked.slice(0, count);
  }

  // "close": prefer the upper half, still keep variety.
  const upperHalf = ranked.slice(0, Math.max(count * 2, Math.ceil(ranked.length / 2)));
  return shuffleArray(upperHalf).slice(0, count);
}

function buildPuzzleId(difficulty) {
  return `signal-path-${difficulty}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
}

function buildPuzzleByConfig(difficulty, config) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const nodeCount = randomInt(config.nodeCountMin, config.nodeCountMax);
    const maxPathLength = Math.min(config.pathLengthMax, nodeCount);
    const pathLength = randomInt(config.pathLengthMin, maxPathLength);
    const ruleType = pickRandom(config.ruleTypes);
    const rule = RULES[ruleType];

    if (!rule) {
      continue;
    }

    const nodes = buildNodes(nodeCount);
    const nodeIds = nodes.map((node) => node.id);
    const nodeValueMap = mapNodeValues(nodes);
    const allRoutes = generateAllRoutes(nodeIds, pathLength);

    const validRoutes = [];
    const invalidRoutes = [];

    for (const route of allRoutes) {
      const routeValues = getRouteValues(route, nodeValueMap);
      if (rule.evaluate(routeValues)) {
        validRoutes.push(route);
      } else {
        invalidRoutes.push(route);
      }
    }

    if (validRoutes.length === 0 || invalidRoutes.length < config.optionCount - 1) {
      continue;
    }

    const correctRoute = pickRandom(validRoutes);
    const decoys = pickDecoys(
      invalidRoutes,
      correctRoute,
      config.optionCount - 1,
      config.decoyStyle,
    );

    if (decoys.length < config.optionCount - 1) {
      continue;
    }

    const candidateRoutes = shuffleArray([correctRoute, ...decoys]);
    const pathIds = PATH_ID_POOL.slice(0, candidateRoutes.length);
    const paths = candidateRoutes.map((route, index) => ({
      id: pathIds[index],
      label: `Path ${pathIds[index]}`,
      route,
    }));

    const correctRouteKey = routeKey(correctRoute);
    const correctPath = paths.find((path) => routeKey(path.route) === correctRouteKey);

    if (!correctPath) {
      continue;
    }

    return {
      id: buildPuzzleId(difficulty),
      type: "signal_path",
      difficulty,
      prompt: "Route the signal through the correct network path.",
      rule: rule.text,
      ruleType,
      nodes,
      paths,
      answer: correctPath.id,
      options: paths.map((path) => path.id),
      puzzleMetrics: {
        ruleType,
        nodeCount: nodes.length,
        optionCount: paths.length,
        pathLength,
        correctPathId: correctPath.id,
      },
    };
  }

  // Safe fallback keeps generator resilient if random retries fail.
  return {
    id: buildPuzzleId("easy"),
    type: "signal_path",
    difficulty: "easy",
    prompt: "Route the signal through the correct network path.",
    rule: RULES.exactly_one_high.text,
    ruleType: "exactly_one_high",
    nodes: [
      { id: "A", value: 1 },
      { id: "B", value: 0 },
      { id: "C", value: 0 },
      { id: "D", value: 1 },
    ],
    paths: [
      { id: "A", label: "Path A", route: ["A", "B", "C"] },
      { id: "B", label: "Path B", route: ["B", "C", "D"] },
      { id: "C", label: "Path C", route: ["A", "C", "D"] },
    ],
    answer: "A",
    options: ["A", "B", "C"],
    puzzleMetrics: {
      ruleType: "exactly_one_high",
      nodeCount: 4,
      optionCount: 3,
      pathLength: 3,
      correctPathId: "A",
    },
  };
}

export function getRandomSignalPathPuzzle(difficulty = "medium") {
  const config = resolveDifficultyConfig(difficulty);
  const normalizedDifficulty = DIFFICULTY_CONFIG[difficulty] ? difficulty : "medium";
  return buildPuzzleByConfig(normalizedDifficulty, config);
}

export default getRandomSignalPathPuzzle;

