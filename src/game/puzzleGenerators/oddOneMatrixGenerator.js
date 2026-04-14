/**
 * Procedural generator for 'odd_one_matrix' puzzle family.
 * 
 * Rules:
 * - A matrix of cells is generated.
 * - All cells except one (the "odd one") follow a specific attribute pattern.
 * - The player must identify the odd cell index.
 * 
 * Shape attributes for each cell:
 * - shape: circle, square, triangle, diamond, hexagon, star
 * - color: hex string
 * - size: small, medium, large
 * - rotation: degrees (0, 45, 90, 135, 180, 225, 270, 315)
 * - count: number of shapes in the cell (1, 2, 3, 4)
 */

const SHAPES = ['circle', 'square', 'triangle', 'diamond', 'hexagon', 'star'];
const COLORS = [
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316'  // Orange
];
const SIZES = ['small', 'medium', 'large'];
const ROTATIONS = [0, 45, 90, 135, 180, 225, 270, 315];
const COUNTS = [1, 2, 3, 4];

/**
 * Generates a random odd-one-out matrix puzzle.
 * 
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @returns {Object} The puzzle object
 */
export function getRandomOddOneMatrixPuzzle(difficulty = 'medium') {
  const config = getDifficultyConfig(difficulty);
  const { rows, cols } = config;
  const totalCells = rows * cols;
  
  // Pick the attribute that will be the "odd one out" identifier
  const ruleType = selectRuleType(difficulty);
  
  // Generate base attributes for the "common" cells
  const base = getRandomCell();
  
  // Define the common and odd attribute sets
  const { common, odd, label } = defineRule(ruleType, base);
  
  // Fill matrix with common cells
  let matrix = [];
  for (let i = 0; i < totalCells; i++) {
    // For medium/hard, we add some "controlled noise" to non-rule attributes 
    // to make it harder to spot the actual rule.
    matrix.push(generateCell(common, difficulty));
  }
  
  // Select the odd one position
  const oddIndex = Math.floor(Math.random() * totalCells);
  
  // Apply the odd attributes to that cell
  // We use the same noise logic but ensure the ruleType attribute stays "odd"
  matrix[oddIndex] = generateCell(odd, difficulty);
  
  // Safety check: verify oddIndex is actually unique in its ruleType attribute
  validateOddity(matrix, oddIndex, ruleType);

  return {
    id: `oom_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    puzzleType: 'odd_one_matrix',
    difficulty,
    matrix,
    answer: oddIndex,
    options: matrix.map((_, index) => index),
    oddIndex,
    ruleType: label,
    prompt: 'Identify the cell that does not belong with the others.'
  };
}

/**
 * Configures matrix size based on difficulty.
 */
function getDifficultyConfig(difficulty) {
  switch (difficulty) {
    case 'easy':
      return { rows: 2, cols: 2 };
    case 'hard':
      return { rows: 4, cols: 4 };
    case 'medium':
    default:
      return { rows: 3, cols: 3 };
  }
}

/**
 * Selects which attribute will define the oddity.
 */
function selectRuleType(difficulty) {
  const types = ['shape', 'color', 'size', 'rotation', 'count'];
  if (difficulty === 'easy') {
    // easy uses more obvious visual traits
    const easyTypes = ['shape', 'color', 'count'];
    return easyTypes[Math.floor(Math.random() * easyTypes.length)];
  }
  return types[Math.floor(Math.random() * types.length)];
}

/**
 * Creates a fully randomized cell attribute object.
 */
function getRandomCell() {
  return {
    shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: SIZES[Math.floor(Math.random() * SIZES.length)],
    rotation: ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)],
    count: COUNTS[Math.floor(Math.random() * COUNTS.length)]
  };
}

/**
 * Defines the specific rule difference between common cells and the odd cell.
 */
function defineRule(ruleType, base) {
  let common = { ...base };
  let odd = { ...base };
  let label = '';

  switch (ruleType) {
    case 'shape':
      label = 'Shape';
      odd.shape = getDifferentValue(SHAPES, base.shape);
      break;
    case 'color':
      label = 'Color';
      odd.color = getDifferentValue(COLORS, base.color);
      break;
    case 'size':
      label = 'Size';
      odd.size = getDifferentValue(SIZES, base.size);
      break;
    case 'rotation':
      label = 'Rotation';
      odd.rotation = getDifferentValue(ROTATIONS, base.rotation);
      break;
    case 'count':
      label = 'Quantity';
      odd.count = getDifferentValue(COUNTS, base.count);
      break;
  }

  return { common, odd, label };
}

/**
 * Generates a cell, potentially adding noise to non-rule attributes for difficulty.
 */
function generateCell(template, difficulty) {
  const cell = { ...template };
  
  if (difficulty === 'easy') {
    return cell; // No noise in easy
  }

  // In medium/hard, we allow some non-rule attributes to vary slightly 
  // AS LONG AS they don't become the "odd one out" themselves.
  // Actually, for a clean v1, it's better if all common cells share ALL attributes 
  // except the rule attribute. 
  // But wait, "more attribute overlap" for medium means more distractors.
  // Let's refine: 
  // Easy: All identical except 1 trait.
  // Medium: All identical except 1 trait, but the trait is subtle (rotation/size).
  // Hard: 2-3 traits might be shared by some, but only ONE trait has a single violator.
  
  // For v1 simplicity and reliability:
  return cell;
}

/**
 * Utility to get a random value from an array that isn't the current one.
 */
function getDifferentValue(array, current) {
  const filtered = array.filter(v => v !== current);
  return filtered[Math.floor(Math.random() * filtered.length)];
}

/**
 * Ensures the odd cell is definitely unique in the matrix for the given ruleType.
 */
function validateOddity(matrix, oddIndex, ruleType) {
  const oddValue = matrix[oddIndex][ruleType];
  const commonValue = matrix[oddIndex === 0 ? 1 : 0][ruleType];
  
  // If somehow they are the same (shouldn't happen with getDifferentValue), force it.
  if (oddValue === commonValue) {
    if (ruleType === 'rotation') {
      matrix[oddIndex].rotation = (commonValue + 45) % 360;
    } else if (ruleType === 'count') {
      matrix[oddIndex].count = commonValue === 1 ? 2 : 1;
    } else if (ruleType === 'size') {
      matrix[oddIndex].size = commonValue === 'medium' ? 'large' : 'medium';
    } else if (ruleType === 'shape') {
      matrix[oddIndex].shape = commonValue === 'circle' ? 'square' : 'circle';
    } else if (ruleType === 'color') {
      matrix[oddIndex].color = '#ffffff';
    }
  }
}
