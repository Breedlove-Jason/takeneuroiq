/**
 * Number Weave Generator
 * 
 * Logic: Generates a sequence by interweaving two distinct numerical "lanes" or rules.
 * The player must identify the missing number in the sequence by understanding the patterns.
 */

/**
 * Generates a random integer between min and max (inclusive)
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Pick a random element from an array
 */
function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Shuffle an array in place
 */
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Rule definitions for lanes
 */
const RULES = {
  ADD: (start, step, index) => start + step * index,
  MULTIPLY: (start, factor, index) => start * Math.pow(factor, index),
  ALTERNATING_ADD: (start, step1, step2, index) => {
    let val = start;
    for (let i = 0; i < index; i++) {
      val += (i % 2 === 0) ? step1 : step2;
    }
    return val;
  },
  FIBONACCI_LIKE: (a, b, index) => {
    if (index === 0) return a;
    if (index === 1) return b;
    let prev2 = a, prev1 = b, curr = 0;
    for (let i = 2; i <= index; i++) {
      curr = prev1 + prev2;
      prev2 = prev1;
      prev1 = curr;
    }
    return curr;
  }
};

/**
 * Generates a lane of numbers based on a rule
 */
function generateLane(count, difficulty) {
  const type = difficulty === 'easy' ? 'ADD' : pickRandom(['ADD', 'MULTIPLY', 'ALTERNATING_ADD']);
  
  let start, step, factor, step1, step2;

  switch (type) {
    case 'ADD':
      start = getRandomInt(1, difficulty === 'hard' ? 50 : 20);
      step = getRandomInt(2, difficulty === 'easy' ? 5 : 12);
      return Array.from({ length: count }, (_, i) => RULES.ADD(start, step, i));

    case 'MULTIPLY':
      start = getRandomInt(1, 5);
      factor = pickRandom([2, 3]);
      // Limit count for multiply to avoid huge numbers
      return Array.from({ length: count }, (_, i) => RULES.MULTIPLY(start, factor, i));

    case 'ALTERNATING_ADD':
      start = getRandomInt(1, 20);
      step1 = getRandomInt(1, 10);
      step2 = getRandomInt(1, 10);
      return Array.from({ length: count }, (_, i) => RULES.ALTERNATING_ADD(start, step1, step2, i));

    default:
      return Array.from({ length: count }, (_, i) => i + 1);
  }
}

/**
 * Creates a Number Weave puzzle
 * 
 * @param {string} difficulty - 'easy', 'medium', or 'hard'
 * @returns {object} puzzle object
 */
export function getRandomNumberWeavePuzzle(difficulty = 'medium') {
  const id = `nw-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  
  // Determine sequence length and lane complexity
  let laneLength;
  if (difficulty === 'easy') laneLength = 4; // 8 total items
  else if (difficulty === 'medium') laneLength = 5; // 10 total items
  else laneLength = 6; // 12 total items

  // Generate two lanes
  const laneA = generateLane(laneLength, difficulty);
  const laneB = generateLane(laneLength, difficulty);

  // Weave them together: [A0, B0, A1, B1, ...]
  const fullSequence = [];
  for (let i = 0; i < laneLength; i++) {
    fullSequence.push(laneA[i]);
    fullSequence.push(laneB[i]);
  }

  // Pick a position to hide (usually towards the end, but not the very first few)
  // Avoid hiding index 0, 1, 2 to give some pattern context
  const hideIndex = getRandomInt(Math.floor(fullSequence.length / 2), fullSequence.length - 1);
  const answer = fullSequence[hideIndex];
  
  // Create the visible sequence with a null or '?' at the hideIndex
  const sequence = [...fullSequence];
  sequence[hideIndex] = null;

  // Generate options
  const options = [];
  const optionCount = 4;
  const correctOptionId = `opt-${Math.floor(Math.random() * 10000)}`;
  
  options.push({ id: correctOptionId, value: answer });

  // Generate distractors
  const distractors = new Set();
  while (distractors.size < optionCount - 1) {
    let distractor;
    const offset = pickRandom([-1, 1, -2, 2, -5, 5, -10, 10]);
    
    // Distractor strategy 1: Near the answer
    if (Math.random() > 0.4) {
      distractor = answer + offset;
    } 
    // Distractor strategy 2: What the other lane's next number might be
    else {
      const otherLaneValue = fullSequence[hideIndex % 2 === 0 ? hideIndex + 1 : hideIndex - 1];
      distractor = (otherLaneValue || answer) + offset;
    }

    if (distractor !== answer && distractor > 0 && !distractors.has(distractor)) {
      distractors.add(distractor);
    }
  }

  distractors.forEach(val => {
    options.push({ id: `opt-${Math.floor(Math.random() * 10000)}`, value: val });
  });

  shuffle(options);

  // Metadata for audit and debug
  const meta = {
    hideIndex,
    laneA,
    laneB,
    patternType: hideIndex % 2 === 0 ? 'Lane A' : 'Lane B',
    weaveType: 'alternating'
  };

  const prompt = difficulty === 'easy' 
    ? "Identify the missing number in the alternating sequence."
    : "Two numerical patterns are woven together. Find the missing value.";

  return {
    id,
    puzzleType: 'number_weave',
    difficulty,
    prompt,
    sequence,
    answer: correctOptionId,
    options,
    meta
  };
}
