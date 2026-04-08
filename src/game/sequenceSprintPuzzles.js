const COLORS = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Indigo', 'Violet'];
const LETTER_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

let puzzleIdCounter = 1;

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray(array) {
  const clone = [...array];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

function createNumericOptions(correct) {
  const base = Number(correct);
  const options = new Set([String(base)]);
  while (options.size < 4) {
    const variance = randomInt(1, 6);
    const candidate = base + (Math.random() < 0.5 ? -variance : variance);
    if (candidate > 0) {
      options.add(String(candidate));
    }
  }
  return shuffleArray([...options]);
}

function createLetterOptions(correctLetter) {
  const index = LETTER_POOL.indexOf(correctLetter);
  const options = new Set([correctLetter]);
  let offset = 1;
  while (options.size < 4) {
    const candidateIndex = (index + offset + LETTER_POOL.length) % LETTER_POOL.length;
    options.add(LETTER_POOL[candidateIndex]);
    offset += 1;
  }
  return shuffleArray([...options]);
}

function createColorOptions(correctColor) {
  const index = COLORS.indexOf(correctColor);
  const options = new Set([correctColor]);
  let offset = 1;
  while (options.size < 4) {
    const candidate = COLORS[(index + offset) % COLORS.length];
    options.add(candidate);
    offset += 1;
  }
  return shuffleArray([...options]);
}

function buildPuzzle({
  difficulty,
  ruleType,
  sequence,
  answer,
  prompt,
  signatureBase,
  options,
}) {
  const baseSignature = `${ruleType}:${signatureBase}`;
  return {
    id: `seq-${puzzleIdCounter++}`,
    difficulty,
    prompt: prompt || 'What comes next in the sequence?',
    sequence,
    options: options || createNumericOptions(answer),
    answer: String(answer),
    rule: ruleType,
    sequenceType: ruleType,
    sequenceLength: sequence.length,
    signature: baseSignature,
    puzzleMetrics: {
      ruleType,
      sequenceLength: sequence.length,
      signature: baseSignature,
    },
  };
}

function buildAscendingSequence(difficulty) {
  const length = difficulty === 'hard' ? 5 : 4;
  const start = randomInt(1, 15); // Increased range from 1-6
  const step = randomInt(1, 8); // Increased range from 1-4
  const sequence = Array.from({ length }, (_, i) => start + i * step);
  const answer = start + length * step;
  return buildPuzzle({
    difficulty,
    ruleType: 'ascending_number',
    sequence,
    answer,
    signatureBase: `${start}-${step}-${length}`,
  });
}

function buildAlternatingStepsSequence(difficulty) {
  const length = difficulty === 'easy' ? 4 : 5; // Varies length
  const start = randomInt(1, 12); // Increased range from 1-5
  const stepA = randomInt(1, 6); // Increased range from 1-3
  const stepB = randomInt(1, 6); // Increased range from 1-3
  const sequence = [start];
  for (let i = 1; i < length; i += 1) {
    const previous = sequence[i - 1];
    const step = i % 2 === 1 ? stepA : stepB;
    sequence.push(previous + step);
  }
  const answer = sequence[sequence.length - 1] + (length % 2 === 1 ? stepA : stepB);
  return buildPuzzle({
    difficulty,
    ruleType: 'alternating_steps',
    sequence,
    answer,
    signatureBase: `${start}-${stepA}-${stepB}`,
  });
}

function buildMirrorPairSequence(difficulty) {
  const central = randomInt(2, 6);
  const step = randomInt(1, 4);
  const sequence = [central - step, central, central + step, central];
  const answer = central - step;
  return buildPuzzle({
    difficulty,
    ruleType: 'mirror_pair',
    sequence,
    answer,
    signatureBase: `${central}-${step}`,
  });
}

function buildStepJumpSequence(difficulty) {
  const length = difficulty === 'hard' ? 5 : 4;
  const start = randomInt(1, 4);
  const jumps = Array.from({ length }, () => randomInt(2, 5));
  const sequence = [start];
  for (let i = 0; i < length - 1; i += 1) {
    sequence.push(sequence[sequence.length - 1] + jumps[i]);
  }
  const answer = sequence[sequence.length - 1] + jumps[length - 1];
  return buildPuzzle({
    difficulty,
    ruleType: 'step_jump',
    sequence,
    answer,
    signatureBase: `${start}-${jumps.join('-')}`,
  });
}

function buildAlphabetShiftSequence(difficulty) {
  const startIndex = randomInt(0, LETTER_POOL.length - 5);
  const step = randomInt(1, 3);
  const length = 4;
  const sequence = Array.from({ length }, (_, i) =>
    LETTER_POOL[(startIndex + i * step) % LETTER_POOL.length],
  );
  const answer = LETTER_POOL[(startIndex + length * step) % LETTER_POOL.length];
  return buildPuzzle({
    difficulty,
    ruleType: 'alphabet_shift',
    sequence,
    answer,
    options: createLetterOptions(answer),
    signatureBase: `${startIndex}-${step}`,
  });
}

function buildColorCycleSequence(difficulty) {
  const start = randomInt(0, COLORS.length - 3);
  const length = 4;
  const sequence = Array.from({ length }, (_, i) =>
    COLORS[(start + i) % COLORS.length],
  );
  const answer = COLORS[(start + length) % COLORS.length];
  return buildPuzzle({
    difficulty,
    ruleType: 'color_cycle',
    sequence,
    answer,
    options: createColorOptions(answer),
    signatureBase: `${start}-${length}`,
  });
}

const GENERATORS = [
  { difficulty: 'easy', builder: () => buildAscendingSequence('easy') },
  { difficulty: 'easy', builder: () => buildAlternatingStepsSequence('easy') },
  { difficulty: 'easy', builder: () => buildColorCycleSequence('easy') },
  { difficulty: 'medium', builder: () => buildStepJumpSequence('medium') },
  { difficulty: 'medium', builder: () => buildMirrorPairSequence('medium') },
  { difficulty: 'medium', builder: () => buildAlphabetShiftSequence('medium') },
  { difficulty: 'hard', builder: () => buildAscendingSequence('hard') },
  { difficulty: 'hard', builder: () => buildStepJumpSequence('hard') },
  { difficulty: 'hard', builder: () => buildMirrorPairSequence('hard') },
];

function getGeneratorPool(difficulty) {
  const pool = GENERATORS.filter((entry) => entry.difficulty === difficulty);
  return pool.length > 0 ? pool : GENERATORS;
}

export function getRandomSequenceSprintPuzzle(
  difficulty = 'easy',
  previousSignature = null,
) {
  const pool = getGeneratorPool(difficulty);
  const shuffled = shuffleArray(pool);
  for (let i = 0; i < shuffled.length; i += 1) {
    const candidate = shuffled[i].builder();
    if (candidate.signature !== previousSignature) {
      return candidate;
    }
  }
  return shuffled[0].builder();
}

export function buildSequenceSprintRun(count = 5, difficulty = 'medium') {
  const run = [];
  let previousSignature = null;
  for (let i = 0; i < count; i += 1) {
    const puzzle = getRandomSequenceSprintPuzzle(difficulty, previousSignature);
    run.push(puzzle);
    previousSignature = puzzle.signature;
  }
  return run;
}

const sequenceSprintPuzzles = buildSequenceSprintRun(9, 'medium');

export default sequenceSprintPuzzles;
