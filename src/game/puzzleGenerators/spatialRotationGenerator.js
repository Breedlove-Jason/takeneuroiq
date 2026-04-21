const DIFFICULTY_PROFILES = {
  easy: {
    gridSizeMin: 4,
    gridSizeMax: 4,
    templateMinCells: 3,
    templateMaxCells: 5,
    optionCount: 4,
    rotationChoices: [90, 270],
    distractorModes: ["rotation", "rotation", "perturb"],
  },
  medium: {
    gridSizeMin: 5,
    gridSizeMax: 5,
    templateMinCells: 4,
    templateMaxCells: 6,
    optionCount: 4,
    rotationChoices: [90, 180, 270],
    distractorModes: ["rotation", "rotation", "perturb", "mirror"],
  },
  hard: {
    gridSizeMin: 5,
    gridSizeMax: 5,
    templateMinCells: 6,
    templateMaxCells: 8,
    optionCount: 5,
    rotationChoices: [90, 180, 270],
    distractorModes: ["rotation", "rotation", "perturb", "mirror", "perturb", "rotate-variant"],
  },
};

const SHAPE_TEMPLATES = [
  {
    name: "hook",
    cells: [
      [0, 0],
      [1, 0],
      [2, 0],
      [2, 1],
    ],
  },
  {
    name: "stair",
    cells: [
      [0, 1],
      [1, 1],
      [1, 0],
      [2, 0],
    ],
  },
  {
    name: "zigzag",
    cells: [
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 2],
    ],
  },
  {
    name: "offset-l",
    cells: [
      [0, 0],
      [1, 0],
      [2, 0],
      [2, 1],
      [3, 1],
    ],
  },
  {
    name: "cross-tail",
    cells: [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, 2],
      [2, 2],
    ],
  },
  {
    name: "step-bridge",
    cells: [
      [0, 0],
      [0, 1],
      [1, 1],
      [2, 1],
      [2, 2],
    ],
  },
  {
    name: "fork",
    cells: [
      [0, 1],
      [1, 0],
      [1, 1],
      [2, 1],
      [2, 2],
    ],
  },
  {
    name: "double-hook",
    cells: [
      [0, 0],
      [1, 0],
      [2, 0],
      [2, 1],
      [3, 1],
      [3, 2],
    ],
  },
  {
    name: "ladder-turn",
    cells: [
      [0, 0],
      [1, 0],
      [1, 1],
      [2, 1],
      [2, 2],
      [3, 2],
    ],
  },
  {
    name: "splay",
    cells: [
      [0, 1],
      [1, 1],
      [2, 0],
      [2, 1],
      [2, 2],
      [3, 2],
    ],
  },
  {
    name: "arrow-tail",
    cells: [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, 2],
      [2, 1],
      [3, 1],
    ],
  },
  {
    name: "spiral-bend",
    cells: [
      [0, 0],
      [0, 1],
      [1, 1],
      [2, 1],
      [2, 2],
      [3, 2],
      [3, 3],
    ],
  },
  {
    name: "riser",
    cells: [
      [0, 0],
      [1, 0],
      [2, 0],
      [2, 1],
      [3, 1],
      [3, 2],
      [4, 2],
    ],
  },
  {
    name: "gate",
    cells: [
      [0, 0],
      [0, 1],
      [1, 1],
      [2, 1],
      [2, 2],
      [3, 2],
      [4, 2],
    ],
  },
  {
    name: "s-curve",
    cells: [
      [0, 1],
      [1, 0],
      [1, 1],
      [2, 1],
      [2, 2],
      [3, 2],
      [3, 3],
      [4, 3],
    ],
  },
];

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

function pickRandom(list) {
  if (!Array.isArray(list) || list.length === 0) {
    return null;
  }
  return list[Math.floor(Math.random() * list.length)];
}

function buildId(difficulty) {
  const salt = Math.floor(Math.random() * 1e9).toString(36);
  const stamp = Math.floor(Date.now() % 1e8).toString(36);
  return `spatial-rotation-${difficulty}-${stamp}-${salt}`;
}

function uniqueCells(cells) {
  const seen = new Set();
  const output = [];

  for (const cell of cells) {
    if (!Array.isArray(cell) || cell.length !== 2) {
      continue;
    }

    const [row, col] = cell;
    const key = `${row},${col}`;
    if (!seen.has(key)) {
      seen.add(key);
      output.push([row, col]);
    }
  }

  return output;
}

function getBounds(cells) {
  let minRow = Infinity;
  let minCol = Infinity;
  let maxRow = -Infinity;
  let maxCol = -Infinity;

  for (const [row, col] of cells) {
    minRow = Math.min(minRow, row);
    minCol = Math.min(minCol, col);
    maxRow = Math.max(maxRow, row);
    maxCol = Math.max(maxCol, col);
  }

  return {
    minRow,
    minCol,
    maxRow,
    maxCol,
    width: maxCol - minCol + 1,
    height: maxRow - minRow + 1,
  };
}

function normalizeTemplateCells(cells) {
  const bounds = getBounds(cells);
  return uniqueCells(
    cells.map(([row, col]) => [row - bounds.minRow, col - bounds.minCol]),
  );
}

function pickTemplate(profile) {
  const eligible = SHAPE_TEMPLATES.filter((template) => {
    const cellCount = template.cells.length;
    return cellCount >= profile.templateMinCells && cellCount <= profile.templateMaxCells;
  });

  return pickRandom(eligible.length > 0 ? eligible : SHAPE_TEMPLATES) ?? SHAPE_TEMPLATES[0];
}

function createEmptyMatrix(size) {
  return Array.from({ length: size }, () => Array.from({ length: size }, () => 0));
}

function cloneMatrix(matrix) {
  return matrix.map((row) => [...row]);
}

function cellsToMatrix(cells, size) {
  const matrix = createEmptyMatrix(size);
  for (const [row, col] of cells) {
    if (row >= 0 && row < size && col >= 0 && col < size) {
      matrix[row][col] = 1;
    }
  }
  return matrix;
}

function matrixToCells(matrix) {
  const cells = [];
  for (let row = 0; row < matrix.length; row += 1) {
    for (let col = 0; col < matrix[row].length; col += 1) {
      if (matrix[row][col]) {
        cells.push([row, col]);
      }
    }
  }
  return cells;
}

function serializeMatrix(matrix) {
  return matrix.map((row) => row.join("")).join("|");
}

function rotateMatrixClockwise(matrix) {
  const size = matrix.length;
  const rotated = createEmptyMatrix(size);

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      rotated[col][size - 1 - row] = matrix[row][col];
    }
  }

  return rotated;
}

function rotateMatrix(matrix, degrees) {
  const turns = ((degrees % 360) + 360) % 360 / 90;
  let current = cloneMatrix(matrix);

  for (let count = 0; count < turns; count += 1) {
    current = rotateMatrixClockwise(current);
  }

  return current;
}

function mirrorMatrix(matrix) {
  return matrix.map((row) => [...row].reverse());
}

function shiftMatrix(matrix, rowShift, colShift) {
  const size = matrix.length;
  const shifted = createEmptyMatrix(size);

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (!matrix[row][col]) {
        continue;
      }

      const nextRow = row + rowShift;
      const nextCol = col + colShift;
      if (nextRow >= 0 && nextRow < size && nextCol >= 0 && nextCol < size) {
        shifted[nextRow][nextCol] = 1;
      }
    }
  }

  return shifted;
}

function toggleCell(matrix, row, col) {
  const next = cloneMatrix(matrix);
  if (row >= 0 && row < next.length && col >= 0 && col < next.length) {
    next[row][col] = next[row][col] ? 0 : 1;
  }
  return next;
}

function findPivotCell(matrix) {
  const cells = matrixToCells(matrix);
  if (cells.length === 0) {
    return [0, 0];
  }

  const sorted = [...cells].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  return sorted[Math.floor(sorted.length / 2)];
}

function buildPlacedSource(template, gridSize) {
  const normalized = normalizeTemplateCells(template.cells);
  const bounds = getBounds(normalized);
  const maxRowOffset = Math.max(0, gridSize - bounds.height);
  const maxColOffset = Math.max(0, gridSize - bounds.width);
  const rowOffset = randomInt(0, maxRowOffset);
  const colOffset = randomInt(0, maxColOffset);

  const placedCells = normalized.map(([row, col]) => [row + rowOffset, col + colOffset]);
  const matrix = cellsToMatrix(placedCells, gridSize);

  return {
    templateName: template.name,
    cells: placedCells,
    matrix,
  };
}

function buildPrompt(rotation) {
  return `Which option matches the source shape after a ${rotation}° clockwise rotation?`;
}

function makeOption(matrix, rotation, variantType) {
  return {
    id: `opt-${variantType}-${Math.random().toString(36).slice(2, 8)}`,
    rotation,
    variantType,
    matrix,
    cells: matrixToCells(matrix),
    signature: serializeMatrix(matrix),
  };
}

function addOption(collection, seen, option) {
  if (!option || !option.matrix) {
    return false;
  }

  const signature = option.signature ?? serializeMatrix(option.matrix);
  if (seen.has(signature)) {
    return false;
  }

  seen.add(signature);
  collection.push({
    ...option,
    signature,
  });
  return true;
}

function buildDistractorMatrix(correctMatrix, sourceMatrix, targetRotation, mode) {
  const size = correctMatrix.length;

  switch (mode) {
    case "rotation": {
      const rotationPool = [0, 90, 180, 270].filter((rotation) => rotation !== targetRotation);
      const rotation = pickRandom(rotationPool) ?? 0;
      return rotateMatrix(sourceMatrix, rotation);
    }
    case "mirror": {
      return mirrorMatrix(correctMatrix);
    }
    case "perturb": {
      const cells = matrixToCells(correctMatrix);
      const emptyCells = [];
      for (let row = 0; row < size; row += 1) {
        for (let col = 0; col < size; col += 1) {
          if (!correctMatrix[row][col]) {
            emptyCells.push([row, col]);
          }
        }
      }

      const next = cloneMatrix(correctMatrix);
      const [removeRow, removeCol] = pickRandom(cells) ?? [0, 0];
      next[removeRow][removeCol] = 0;
      const [addRow, addCol] = pickRandom(emptyCells) ?? [removeRow, removeCol];
      next[addRow][addCol] = 1;
      return next;
    }
    case "rotate-variant": {
      const extraRotation = pickRandom([90, 180, 270]) ?? 90;
      const rotated = rotateMatrix(sourceMatrix, extraRotation);
      const [pivotRow, pivotCol] = findPivotCell(rotated);
      return toggleCell(rotated, pivotRow, pivotCol === 0 ? 1 : pivotCol - 1);
    }
    default:
      return shiftMatrix(correctMatrix, 0, 1);
  }
}

function buildOptions({ sourceMatrix, targetRotation, profile }) {
  const correctMatrix = rotateMatrix(sourceMatrix, targetRotation);
  const seen = new Set();
  const options = [];

  addOption(options, seen, makeOption(correctMatrix, targetRotation, "correct"));

  const distractorModes = shuffleArray(profile.distractorModes);
  const safeFallbackModes = ["rotation", "perturb", "mirror", "rotate-variant"];

  for (const mode of [...distractorModes, ...safeFallbackModes]) {
    if (options.length >= profile.optionCount) {
      break;
    }

    const matrix = buildDistractorMatrix(correctMatrix, sourceMatrix, targetRotation, mode);
    addOption(options, seen, makeOption(matrix, targetRotation, mode));
  }

  let attempts = 0;
  while (options.length < profile.optionCount && attempts < 24) {
    attempts += 1;
    const mode = pickRandom(safeFallbackModes) ?? "perturb";
    const matrix = buildDistractorMatrix(correctMatrix, sourceMatrix, targetRotation, mode);
    addOption(options, seen, makeOption(matrix, targetRotation, mode));
  }

  return shuffleArray(options).map((option, index) => ({
    ...option,
    id: `opt-${index + 1}`,
    label: String.fromCharCode(65 + index),
  }));
}

function buildPuzzle(difficulty) {
  const normalizedDifficulty = normalizeDifficulty(difficulty);
  const profile = DIFFICULTY_PROFILES[normalizedDifficulty] ?? DIFFICULTY_PROFILES.medium;
  const gridSize = randomInt(profile.gridSizeMin, profile.gridSizeMax);
  const template = pickTemplate(profile);
  const sourceShape = buildPlacedSource(template, gridSize);
  const rotationChoices = profile.rotationChoices.length > 0 ? profile.rotationChoices : [90, 180, 270];
  const targetRotation = pickRandom(rotationChoices) ?? 90;

  const options = buildOptions({
    sourceMatrix: sourceShape.matrix,
    targetRotation,
    profile,
  });

  const correctOption = options.find((option) => option.variantType === "correct");
  const answer = correctOption?.id ?? options[0]?.id ?? "opt-1";

  return {
    id: buildId(normalizedDifficulty),
    puzzleType: "spatial_rotation",
    difficulty: normalizedDifficulty,
    prompt: buildPrompt(targetRotation),
    sourceShape: {
      type: "grid",
      shapeName: template.name,
      gridSize,
      cells: sourceShape.cells,
      matrix: sourceShape.matrix,
    },
    targetRotation,
    options,
    answer,
    meta: {
      family: "spatial_rotation",
      shapeName: template.name,
      gridSize,
      optionCount: options.length,
      correctRotation: targetRotation,
      correctOptionId: answer,
      sourceSignature: serializeMatrix(sourceShape.matrix),
      rotatedSignature: serializeMatrix(rotateMatrix(sourceShape.matrix, targetRotation)),
    },
  };
}

export function getRandomSpatialRotationPuzzle(difficulty = "medium") {
  return buildPuzzle(normalizeDifficulty(difficulty));
}

export default getRandomSpatialRotationPuzzle;



