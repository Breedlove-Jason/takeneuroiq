const sequenceSprintPuzzles = [
  {
    id: 1,
    difficulty: 'easy',
    prompt: 'What comes next in the sequence?',
    sequence: [2, 4, 6, 8],
    options: ['10', '12', '9', '6'],
    answer: '10',
    rule: 'Add 2 each step',
  },
  {
    id: 2,
    difficulty: 'easy',
    prompt: 'What comes next in the sequence?',
    sequence: [1, 3, 5, 7],
    options: ['8', '9', '10', '6'],
    answer: '9',
    rule: 'Add 2 each step',
  },
  {
    id: 3,
    difficulty: 'easy',
    prompt: 'What comes next in the sequence?',
    sequence: [5, 10, 15, 20],
    options: ['25', '30', '35', '15'],
    answer: '25',
    rule: 'Add 5 each step',
  },

  {
    id: 4,
    difficulty: 'medium',
    prompt: 'What comes next in the sequence?',
    sequence: [3, 6, 12, 24],
    options: ['36', '48', '30', '18'],
    answer: '48',
    rule: 'Multiply by 2 each step',
  },
  {
    id: 5,
    difficulty: 'medium',
    prompt: 'What comes next in the sequence?',
    sequence: [2, 5, 8, 11],
    options: ['14', '13', '15', '12'],
    answer: '14',
    rule: 'Add 3 each step',
  },
  {
    id: 6,
    difficulty: 'medium',
    prompt: 'What comes next in the sequence?',
    sequence: [1, 4, 9, 16],
    options: ['20', '25', '24', '36'],
    answer: '25',
    rule: 'Square numbers',
  },

  {
    id: 7,
    difficulty: 'hard',
    prompt: 'What comes next in the sequence?',
    sequence: [2, 6, 12, 20],
    options: ['28', '30', '26', '24'],
    answer: '30',
    rule: 'Add consecutive even numbers',
  },
  {
    id: 8,
    difficulty: 'hard',
    prompt: 'What comes next in the sequence?',
    sequence: [1, 2, 4, 7],
    options: ['10', '11', '12', '9'],
    answer: '11',
    rule: 'Add increasing increments (+1, +2, +3, +4)',
  },
  {
    id: 9,
    difficulty: 'hard',
    prompt: 'What comes next in the sequence?',
    sequence: [2, 3, 5, 8],
    options: ['11', '12', '13', '10'],
    answer: '13',
    rule: 'Fibonacci-style progression',
  },
];

export function getRandomSequenceSprintPuzzle(difficulty = 'easy') {
  const filtered = sequenceSprintPuzzles.filter(
    (puzzle) => puzzle.difficulty === difficulty,
  );

  if (filtered.length === 0) {
    return sequenceSprintPuzzles[0];
  }

  return filtered[Math.floor(Math.random() * filtered.length)];
}

export default sequenceSprintPuzzles;
