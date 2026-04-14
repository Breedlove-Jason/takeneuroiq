// src/game/puzzleAudit.js

/**
 * Puzzle Audit Utility for TakeNeuroIQ
 *
 * Developer-facing validation tool that stress-tests puzzle generation
 * across all current puzzle families. Validates structural correctness,
 * functional integrity, and diversity/randomness metrics.
 *
 * Usage:
 *   import { runPuzzleAudit, printPuzzleAuditReport } from './puzzleAudit.js';
 *   const report = runPuzzleAudit();
 *   printPuzzleAuditReport(report);
 */

import { generatePatternRushPuzzle } from './puzzleGenerators/patternRushGenerator.js';
import { getRandomSequenceSprintPuzzle } from './sequenceSprintPuzzles.js';
import { getRandomGridRecallPuzzle } from './gridRecallPuzzles.js';
import { getRandomLogicGatePuzzle } from './logicGatePuzzles.js';
import { getRandomSignalPathPuzzle } from './signalPathPuzzles.js';
import { getRandomLogicGridPuzzle } from './logicGridPuzzles.js';
import { getRandomRuleShiftPuzzle } from './puzzleGenerators/ruleShiftGenerator.js';
import { getRandomOddOneMatrixPuzzle } from './puzzleGenerators/oddOneMatrixGenerator.js';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CANONICAL_FAMILIES = [
  'pattern_rush',
  'sequence_sprint',
  'rule_shift',
  'grid_recall',
  'logic_gate',
  'signal_path',
  'logic_grid',
  'odd_one_matrix',
];

const CANONICAL_DIFFICULTIES = ['easy', 'medium', 'hard'];

const DEFAULT_OPTIONS = {
  families: CANONICAL_FAMILIES,
  difficulties: CANONICAL_DIFFICULTIES,
  iterationsPerDifficulty: 50,
  duplicateWarningThreshold: 0.15,
  sampleSizeForSummary: 5,
};

// ============================================================================
// PUZZLE GENERATORS MAPPING
// ============================================================================

const PUZZLE_GENERATORS = {
  pattern_rush: (difficulty) => generatePatternRushPuzzle(difficulty),
  sequence_sprint: (difficulty) => getRandomSequenceSprintPuzzle(difficulty),
  rule_shift: (difficulty) => getRandomRuleShiftPuzzle(difficulty),
  grid_recall: (difficulty) => getRandomGridRecallPuzzle(difficulty),
  logic_gate: (difficulty) => getRandomLogicGatePuzzle(difficulty),
  signal_path: (difficulty) => getRandomSignalPathPuzzle(difficulty),
  logic_grid: (difficulty) => getRandomLogicGridPuzzle(difficulty),
  odd_one_matrix: (difficulty) => getRandomOddOneMatrixPuzzle(difficulty),
};

// ============================================================================
// UTILITY HELPERS
// ============================================================================

function createSignature(puzzle, family) {
  try {
    switch (family) {
      case 'pattern_rush':
        return [
          puzzle?.meta?.patternType || 'unknown',
          puzzle?.meta?.ruleDescription || '',
          (puzzle?.grid || []).join('|'),
          puzzle?.correctAnswer || puzzle?.answer || '',
        ].join('::');

      case 'sequence_sprint':
        return [
          puzzle?.sequenceType || 'unknown',
          (puzzle?.sequence || []).join(','),
          puzzle?.answer || '',
        ].join('::');

      case 'rule_shift':
        return [
          (puzzle?.sequence || []).join(','),
          puzzle?.shiftIndex ?? 'unknown',
          puzzle?.ruleA || 'unknown',
          puzzle?.ruleB || 'unknown',
          puzzle?.answer || '',
        ].join('::');

      case 'grid_recall':
        return [
          puzzle?.answer || '',
          puzzle?.size || 0,
          puzzle?.activeCount || 0,
        ].join('::');

      case 'logic_gate':
        return [
          puzzle?.gateType || 'unknown',
          puzzle?.variant || 'unknown',
          puzzle?.answer || '',
        ].join('::');

      case 'signal_path':
        return [
          puzzle?.ruleType || 'unknown',
          (puzzle?.nodes || []).map(n => n?.id).join(','),
          puzzle?.answer || '',
        ].join('::');

      case 'logic_grid':
        return [
          puzzle?.ruleType || 'unknown',
          (puzzle?.grid || []).flat().join('|'),
          puzzle?.answer || '',
        ].join('::');

      case 'odd_one_matrix':
        return [
          puzzle?.ruleType || 'unknown',
          String(puzzle?.oddIndex ?? ''),
          String(puzzle?.answer ?? ''),
          (puzzle?.matrix || [])
            .map((c) =>
              [c?.shape, c?.color, c?.size, c?.rotation, c?.count].join(':'),
            )
            .join('|'),
        ].join('::');

      default:
        return 'unknown';
    }
  } catch {
    return 'signature_error';
  }
}

function extractAnswer(puzzle) {
  return String(puzzle?.correctAnswer ?? puzzle?.answer ?? '');
}

function extractOptions(puzzle) {
  const opts = puzzle?.options || puzzle?.choices || [];
  return Array.isArray(opts) ? opts : [];
}

// ============================================================================
// FAMILY-SPECIFIC VALIDATORS
// ============================================================================

function validatePatternRush(puzzle) {
  const errors = [];

  if (!puzzle || typeof puzzle !== 'object') {
    errors.push('Puzzle object is missing or invalid');
    return errors;
  }

  if (!puzzle.title || typeof puzzle.title !== 'string' || !puzzle.title.trim()) {
    errors.push('Missing or invalid title');
  }

  if (!Array.isArray(puzzle.grid) || puzzle.grid.length === 0) {
    errors.push('Missing or empty grid array');
  }

  const answer = extractAnswer(puzzle);
  if (!answer) {
    errors.push('Missing correct answer');
  }

  const choices = extractOptions(puzzle);
  if (choices.length < 3) {
    errors.push(`Insufficient choices: expected at least 3, got ${choices.length}`);
  }

  if (answer && !choices.includes(answer)) {
    errors.push('Correct answer not present in choices');
  }

  if (!puzzle.difficulty || !CANONICAL_DIFFICULTIES.includes(puzzle.difficulty)) {
    errors.push(`Invalid difficulty: ${puzzle.difficulty}`);
  }

  if (!puzzle.meta?.patternType) {
    errors.push('Missing pattern type metadata');
  }

  const allowedTypes = [
    'shape_sequence',
    'positional_pattern',
    'rotation_pattern',
    'dual_layer_pattern',
    'alternating_rule',
    'mirror_symmetry',
    'count_progression',
    'attribute_swap',
    'alternating_rotation',
    'size_progression',
    'color_cycle',
    'position_shift',
    'mirror_flip',
    'dual_attribute',
  ];

  if (puzzle.meta?.patternType && !allowedTypes.includes(puzzle.meta.patternType)) {
    errors.push(`Invalid pattern type: ${puzzle.meta.patternType}`);
  }

  return errors;
}

function validateSequenceSprint(puzzle) {
  const errors = [];

  if (!puzzle || typeof puzzle !== 'object') {
    errors.push('Puzzle object is missing or invalid');
    return errors;
  }

  if (!Array.isArray(puzzle.sequence) || puzzle.sequence.length === 0) {
    errors.push('Missing or empty sequence array');
  }

  const answer = extractAnswer(puzzle);
  if (!answer) {
    errors.push('Missing correct answer');
  }

  const options = extractOptions(puzzle);
  if (options.length < 3) {
    errors.push(`Insufficient options: expected at least 3, got ${options.length}`);
  }

  if (answer && !options.includes(answer)) {
    errors.push('Correct answer not present in options');
  }

  if (!puzzle.difficulty || !CANONICAL_DIFFICULTIES.includes(puzzle.difficulty)) {
    errors.push(`Invalid difficulty: ${puzzle.difficulty}`);
  }

  if (!puzzle.sequenceType) {
    errors.push('Missing sequence type');
  }

  return errors;
}

function validateRuleShift(puzzle) {
  const errors = [];

  if (!puzzle || typeof puzzle !== 'object') {
    errors.push('Puzzle object is missing or invalid');
    return errors;
  }

  if (puzzle.puzzleType !== 'rule_shift') {
    errors.push(`Invalid puzzle type: ${puzzle.puzzleType}`);
  }

  if (!Array.isArray(puzzle.sequence) || puzzle.sequence.length === 0) {
    errors.push('Missing or empty sequence array');
  }

  const answer = extractAnswer(puzzle);
  if (!answer) {
    errors.push('Missing correct answer');
  }

  const options = extractOptions(puzzle);
  if (options.length === 0) {
    errors.push('Missing options array');
  }

  const normalizedOptions = options.map((option) => String(option));
  if (answer && options.length > 0 && !normalizedOptions.includes(answer)) {
    errors.push('Correct answer not present in options');
  }

  if (!Number.isInteger(puzzle.shiftIndex)) {
    errors.push('Missing or invalid shiftIndex');
  } else if (Array.isArray(puzzle.sequence) && puzzle.sequence.length > 0) {
    const maxShiftIndex = Math.max(0, puzzle.sequence.length - 2);
    if (puzzle.shiftIndex < 0 || puzzle.shiftIndex > maxShiftIndex) {
      errors.push(`Invalid shiftIndex range: ${puzzle.shiftIndex}`);
    }
  }

  if (!puzzle.ruleA) {
    errors.push('Missing ruleA metadata');
  }

  if (!puzzle.ruleB) {
    errors.push('Missing ruleB metadata');
  }

  if (!puzzle.difficulty || !CANONICAL_DIFFICULTIES.includes(puzzle.difficulty)) {
    errors.push(`Invalid difficulty: ${puzzle.difficulty}`);
  }

  return errors;
}

function validateGridRecall(puzzle) {
  const errors = [];

  if (!puzzle || typeof puzzle !== 'object') {
    errors.push('Puzzle object is missing or invalid');
    return errors;
  }

  const answer = extractAnswer(puzzle);
  if (!answer) {
    errors.push('Missing correct answer');
  }

  const options = extractOptions(puzzle);
  if (options.length < 3) {
    errors.push(`Insufficient options: expected at least 3, got ${options.length}`);
  }

  if (answer && !options.includes(answer)) {
    errors.push('Correct answer not present in options');
  }

  if (!puzzle.difficulty || !CANONICAL_DIFFICULTIES.includes(puzzle.difficulty)) {
    errors.push(`Invalid difficulty: ${puzzle.difficulty}`);
  }

  if (!puzzle.size || typeof puzzle.size !== 'number' || puzzle.size < 2) {
    errors.push('Invalid or missing grid size');
  }

  if (puzzle.activeCount === undefined || typeof puzzle.activeCount !== 'number') {
    errors.push('Missing active node count metadata');
  }

  return errors;
}

function validateLogicGate(puzzle) {
  const errors = [];

  if (!puzzle || typeof puzzle !== 'object') {
    errors.push('Puzzle object is missing or invalid');
    return errors;
  }

  if (!puzzle.gateType) {
    errors.push('Missing gate type');
  }

  if (!puzzle.variant) {
    errors.push('Missing variant metadata');
  }

  const answer = extractAnswer(puzzle);
  if (!answer && answer !== 0 && answer !== '0') {
    errors.push('Missing correct answer');
  }

  const options = extractOptions(puzzle);

  // Note: Some variants may not have options (e.g., binary output)
  if (puzzle.variant === 'missing_gate' && options.length === 0) {
    errors.push('Missing gate variant should have gate name options');
  }

  if (options.length > 0 && answer && !options.includes(answer)) {
    errors.push('Correct answer not present in options');
  }

  if (!puzzle.difficulty || !CANONICAL_DIFFICULTIES.includes(puzzle.difficulty)) {
    errors.push(`Invalid difficulty: ${puzzle.difficulty}`);
  }

  return errors;
}

function validateSignalPath(puzzle) {
  const errors = [];

  if (!puzzle || typeof puzzle !== 'object') {
    errors.push('Puzzle object is missing or invalid');
    return errors;
  }

  if (!Array.isArray(puzzle.nodes) || puzzle.nodes.length === 0) {
    errors.push('Missing or empty nodes array');
  }

  if (!Array.isArray(puzzle.paths) || puzzle.paths.length === 0) {
    errors.push('Missing or empty paths array');
  }

  const answer = extractAnswer(puzzle);
  if (!answer) {
    errors.push('Missing correct answer');
  }

  const options = extractOptions(puzzle);
  if (options.length < 3) {
    errors.push(`Insufficient options: expected at least 3, got ${options.length}`);
  }

  if (answer && !options.includes(answer)) {
    errors.push('Correct answer not present in options');
  }

  if (!puzzle.difficulty || !CANONICAL_DIFFICULTIES.includes(puzzle.difficulty)) {
    errors.push(`Invalid difficulty: ${puzzle.difficulty}`);
  }

  if (!puzzle.ruleType) {
    errors.push('Missing rule type metadata');
  }

  return errors;
}

function validateLogicGrid(puzzle) {
  const errors = [];

  if (!puzzle || typeof puzzle !== 'object') {
    errors.push('Puzzle object is missing or invalid');
    return errors;
  }

  if (!Array.isArray(puzzle.grid) || puzzle.grid.length === 0) {
    errors.push('Missing or empty grid array');
  }

  if (puzzle.grid && !Array.isArray(puzzle.grid[0])) {
    errors.push('Grid should be a 2D array');
  }

  if (!puzzle.missingRow && puzzle.missingRow !== 0) {
    errors.push('Missing row index not defined');
  }

  if (!puzzle.missingCol && puzzle.missingCol !== 0) {
    errors.push('Missing column index not defined');
  }

  const answer = extractAnswer(puzzle);
  if (!answer) {
    errors.push('Missing correct answer');
  }

  const options = extractOptions(puzzle);
  if (options.length < 3) {
    errors.push(`Insufficient options: expected at least 3, got ${options.length}`);
  }

  if (answer && !options.includes(answer)) {
    errors.push('Correct answer not present in options');
  }

  if (!puzzle.difficulty || !CANONICAL_DIFFICULTIES.includes(puzzle.difficulty)) {
    errors.push(`Invalid difficulty: ${puzzle.difficulty}`);
  }

  if (!puzzle.ruleType) {
    errors.push('Missing rule type metadata');
  }

  return errors;
}

function validateOddOneMatrix(puzzle) {
  const errors = [];

  if (!puzzle || typeof puzzle !== 'object') {
    errors.push('Puzzle object is missing or invalid');
    return errors;
  }

  if (puzzle.puzzleType !== 'odd_one_matrix') {
    errors.push(`Invalid puzzle type: ${puzzle.puzzleType}`);
  }

  const matrix = puzzle.matrix;
  if (!Array.isArray(matrix) || matrix.length === 0) {
    errors.push('Missing or empty matrix array');
  }

  const n = Array.isArray(matrix) ? matrix.length : 0;
  const validSizes = [4, 9, 16];
  if (n > 0 && !validSizes.includes(n)) {
    errors.push(`Invalid matrix size: expected 4, 9, or 16 cells, got ${n}`);
  }

  const answerRaw = puzzle.answer ?? puzzle.correctAnswer;
  if (answerRaw === undefined || answerRaw === null || answerRaw === '') {
    errors.push('Missing answer');
  } else {
    const answerNum = Number(answerRaw);
    if (!Number.isInteger(answerNum) || answerNum < 0) {
      errors.push('Answer must be a non-negative integer cell index');
    } else if (n > 0 && answerNum >= n) {
      errors.push(`Answer index out of range: ${answerNum}`);
    }
  }

  if (!Number.isInteger(puzzle.oddIndex)) {
    errors.push('Missing or invalid oddIndex');
  } else if (n > 0) {
    if (puzzle.oddIndex < 0 || puzzle.oddIndex >= n) {
      errors.push(`oddIndex out of range: ${puzzle.oddIndex}`);
    }
    if (
      answerRaw !== undefined &&
      answerRaw !== null &&
      answerRaw !== '' &&
      Number(answerRaw) !== puzzle.oddIndex
    ) {
      errors.push('answer and oddIndex must match');
    }
  }

  if (!puzzle.ruleType || typeof puzzle.ruleType !== 'string' || !puzzle.ruleType.trim()) {
    errors.push('Missing or invalid ruleType');
  }

  if (!puzzle.difficulty || !CANONICAL_DIFFICULTIES.includes(puzzle.difficulty)) {
    errors.push(`Invalid difficulty: ${puzzle.difficulty}`);
  }

  const options = puzzle.options;
  if (!Array.isArray(options) || (n > 0 && options.length !== n)) {
    errors.push('options array must exist and match matrix length');
  }

  const requiredCellKeys = ['shape', 'color', 'size', 'rotation', 'count'];
  for (let i = 0; i < n; i += 1) {
    const cell = matrix[i];
    if (!cell || typeof cell !== 'object') {
      errors.push(`Invalid cell at index ${i}`);
      continue;
    }
    for (const key of requiredCellKeys) {
      if (cell[key] === undefined || cell[key] === null) {
        errors.push(`Cell ${i} missing ${key}`);
      }
    }
  }

  return errors;
}

// ============================================================================
// VALIDATOR MAPPING
// ============================================================================

const FAMILY_VALIDATORS = {
  pattern_rush: validatePatternRush,
  sequence_sprint: validateSequenceSprint,
  rule_shift: validateRuleShift,
  grid_recall: validateGridRecall,
  logic_gate: validateLogicGate,
  signal_path: validateSignalPath,
  logic_grid: validateLogicGrid,
  odd_one_matrix: validateOddOneMatrix,
};

// ============================================================================
// CORE AUDIT LOGIC
// ============================================================================

function auditFamily(family, difficulties, iterations, debugContext = {}) {
  const generator = PUZZLE_GENERATORS[family];
  const validator = FAMILY_VALIDATORS[family];
  const { debug = null, pushCapped, makeSnapshot } = debugContext;

  if (!generator) {
    return {
      family,
      skipped: true,
      reason: 'No generator found',
    };
  }

  if (!validator) {
    return {
      family,
      skipped: true,
      reason: 'No validator found',
    };
  }

  const results = {
    family,
    totalGenerated: 0,
    invalidCount: 0,
    errors: [],
    warnings: [],
    byDifficulty: {},
    signatures: new Set(),
    answers: [],
    puzzleIds: [],
    ruleTypes: [],
    sequenceTypes: [],
    shiftIndices: [],
    oddIndices: [],
    optionLayouts: [],
  };

  const signatureCountsByDifficulty = {};
  const signatureCounts = {};
  const answerCounts = {};
  const idCounts = {};

  if (debug) {
    debug.familyWarnings[family] = Array.isArray(debug.familyWarnings[family]) ? debug.familyWarnings[family] : [];
    debug.familyErrors[family] = Array.isArray(debug.familyErrors[family]) ? debug.familyErrors[family] : [];
  }

  for (const difficulty of difficulties) {
    const difficultyResults = {
      difficulty,
      generated: 0,
      invalid: 0,
      errors: [],
      signatures: new Set(),
      answers: [],
    };

    signatureCountsByDifficulty[difficulty] = {};
    const difficultySignatureCounts = signatureCountsByDifficulty[difficulty];

    for (let i = 0; i < iterations; i += 1) {
      try {
        const puzzle = generator(difficulty);
        difficultyResults.generated += 1;
        results.totalGenerated += 1;
        const answer = extractAnswer(puzzle);

        // Validate structure
        const validationErrors = validator(puzzle);

        if (validationErrors.length > 0) {
          difficultyResults.invalid += 1;
          results.invalidCount += 1;
          difficultyResults.errors.push({
            iteration: i + 1,
            errors: validationErrors,
            puzzle: puzzle || null,
          });

          if (debug) {
            pushCapped(debug.invalidPuzzleSamples, makeSnapshot({ ...(puzzle || {}), family, difficulty, answer }, validationErrors));
            debug.familyErrors[family].push(`Invalid puzzle (${difficulty}, iteration ${i + 1}): ${validationErrors.join('; ')}`);
          }
        }

        // Collect diversity metrics
        const signature = createSignature(puzzle, family);
        difficultyResults.signatures.add(signature);
        results.signatures.add(signature);

        difficultySignatureCounts[signature] = (difficultySignatureCounts[signature] || 0) + 1;
        signatureCounts[signature] = (signatureCounts[signature] || 0) + 1;

        if (debug && signatureCounts[signature] > 1) {
          pushCapped(debug.duplicateSignatureSamples, makeSnapshot({ ...(puzzle || {}), family, difficulty, answer, signature }));
          debug.familyWarnings[family].push(`Duplicate signature detected (${difficulty}): ${signature}`);
        }

        if (answer) {
          difficultyResults.answers.push(answer);
          results.answers.push(answer);

          answerCounts[answer] = (answerCounts[answer] || 0) + 1;
          if (debug && answerCounts[answer] > 1) {
            pushCapped(debug.repeatedAnswerSamples, makeSnapshot({ ...(puzzle || {}), family, difficulty, answer, signature }));
            debug.familyWarnings[family].push(`Repeated answer detected (${difficulty}): ${answer}`);
          }
        }

        if (puzzle?.id) {
          results.puzzleIds.push(puzzle.id);

          idCounts[puzzle.id] = (idCounts[puzzle.id] || 0) + 1;
          if (debug && idCounts[puzzle.id] > 1) {
            pushCapped(debug.repeatedIdSamples, makeSnapshot({ ...(puzzle || {}), family, difficulty, answer, signature }));
            debug.familyWarnings[family].push(`Repeated ID detected (${difficulty}): ${puzzle.id}`);
          }
        }

        if (puzzle?.ruleType) {
          results.ruleTypes.push(puzzle.ruleType);
        }

        if (family === 'rule_shift') {
          if (puzzle?.ruleA) {
            results.ruleTypes.push(puzzle.ruleA);
          }

          if (puzzle?.ruleB) {
            results.ruleTypes.push(puzzle.ruleB);
          }

          if (Number.isInteger(puzzle?.shiftIndex)) {
            results.shiftIndices.push(puzzle.shiftIndex);
          }
        }

        if (family === 'odd_one_matrix' && Number.isInteger(puzzle?.oddIndex)) {
          results.oddIndices.push(puzzle.oddIndex);
        }

        if (puzzle?.sequenceType) {
          results.sequenceTypes.push(puzzle.sequenceType);
        }

        const options = extractOptions(puzzle);
        if (options.length > 0) {
          results.optionLayouts.push(options.join(','));
        }

      } catch (error) {
        difficultyResults.invalid += 1;
        results.invalidCount += 1;
        difficultyResults.errors.push({
          iteration: i + 1,
          errors: [`Generation threw error: ${error.message}`],
          puzzle: null,
        });

        if (debug) {
          debug.familyErrors[family].push(`Generation error (${difficulty}, iteration ${i + 1}): ${error.message}`);
        }
      }
    }

    results.byDifficulty[difficulty] = difficultyResults;
  }

  results.signatureCountsByDifficulty = signatureCountsByDifficulty;

  return results;
}

function analyzeDiversity(results, duplicateThreshold) {
  const warnings = [];

  // Check signature diversity
  const uniqueSignatures = results.signatures.size;
  const totalGenerated = results.totalGenerated;
  const uniquenessRatio = totalGenerated > 0 ? uniqueSignatures / totalGenerated : 0;

  if (uniquenessRatio < (1 - duplicateThreshold)) {
    warnings.push(
      `Low signature diversity: ${uniqueSignatures} unique out of ${totalGenerated} (${(uniquenessRatio * 100).toFixed(1)}%)`
    );
  }

  // Check answer repetition
  const answerCounts = {};
  results.answers.forEach(answer => {
    answerCounts[answer] = (answerCounts[answer] || 0) + 1;
  });

  const maxAnswerRepetition = Math.max(...Object.values(answerCounts), 0);
  const answerRepetitionRatio = totalGenerated > 0 ? maxAnswerRepetition / totalGenerated : 0;

  if (answerRepetitionRatio > duplicateThreshold) {
    const topAnswer = Object.entries(answerCounts).find(([, count]) => count === maxAnswerRepetition)?.[0];
    warnings.push(
      `High answer repetition: "${topAnswer}" appears ${maxAnswerRepetition} times (${(answerRepetitionRatio * 100).toFixed(1)}%)`
    );
  }

  // Check rule type diversity (if applicable)
  if (results.ruleTypes.length > 0) {
    const uniqueRuleTypes = new Set(results.ruleTypes).size;
    if (uniqueRuleTypes < 2) {
      warnings.push(`Low rule type diversity: only ${uniqueRuleTypes} unique rule type(s)`);
    }
  }

  // Check sequence type diversity (if applicable)
  if (results.sequenceTypes.length > 0) {
    const uniqueSequenceTypes = new Set(results.sequenceTypes).size;
    if (uniqueSequenceTypes < 2) {
      warnings.push(`Low sequence type diversity: only ${uniqueSequenceTypes} unique sequence type(s)`);
    }
  }

  return warnings;
}

// ============================================================================
// MAIN AUDIT RUNNER
// ============================================================================

/**
 * Run a comprehensive puzzle audit across multiple families and difficulties.
 *
 * @param {Object} options - Audit configuration options
 * @param {string[]} options.families - Array of puzzle family keys
 * @param {string[]} options.difficulties - Array of difficulty levels
 * @param {number} options.iterationsPerDifficulty - Number of puzzles to generate per difficulty
 * @param {number} options.duplicateWarningThreshold - Threshold for duplicate warnings (0-1)
 * @param {number} options.sampleSizeForSummary - Number of sample errors/warnings to include
 * @returns {Object} Comprehensive audit report
 */
export function runPuzzleAudit(options = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };

  const debug = {
    invalidPuzzleSamples: [],
    duplicateSignatureSamples: [],
    repeatedAnswerSamples: [],
    repeatedIdSamples: [],
    familyWarnings: {},
    familyErrors: {},
    signatureLeaders: {},
  };

  const pushCapped = (arr, item, max = 5) => { if (arr.length < max) arr.push(item); };
  const makeSnapshot = (p, errors = []) => ({
    family: p.family || 'unknown',
    difficulty: p.difficulty || 'unknown',
    id: p.id,
    answer: p.answer,
    signature: p.signature,
    errors,
  });

  const report = {
    timestamp: new Date().toISOString(),
    config,
    overall: {
      pass: true,
      totalPuzzlesGenerated: 0,
      totalInvalidPuzzles: 0,
      familiesAudited: 0,
      familiesSkipped: 0,
    },
    families: {},
    sampleErrors: [],
    sampleWarnings: [],
    debug,
  };

  // Audit each family
  for (const family of config.families) {
    debug.familyWarnings[family] = Array.isArray(debug.familyWarnings[family]) ? debug.familyWarnings[family] : [];
    debug.familyErrors[family] = Array.isArray(debug.familyErrors[family]) ? debug.familyErrors[family] : [];

    const familyResults = auditFamily(
      family,
      config.difficulties,
      config.iterationsPerDifficulty,
      { debug, pushCapped, makeSnapshot }
    );

    if (familyResults.skipped) {
      report.overall.familiesSkipped += 1;
      debug.familyErrors[family].push(familyResults.reason);
      report.families[family] = familyResults;
      continue;
    }

    report.overall.familiesAudited += 1;
    report.overall.totalPuzzlesGenerated += familyResults.totalGenerated;
    report.overall.totalInvalidPuzzles += familyResults.invalidCount;

    // Analyze diversity
    const diversityWarnings = analyzeDiversity(familyResults, config.duplicateWarningThreshold);
    familyResults.warnings = diversityWarnings;

    if (debug.familyWarnings[family]) {
      debug.familyWarnings[family].push(...diversityWarnings);
    }

    if (familyResults.invalidCount > 0) {
      debug.familyErrors[family].push(`Invalid puzzle count: ${familyResults.invalidCount}`);
    }

    // Mark as failing if invalid puzzles found
    if (familyResults.invalidCount > 0) {
      report.overall.pass = false;
    }

    // Collect sample errors
    for (const difficulty in familyResults.byDifficulty) {
      const diffErrors = familyResults.byDifficulty[difficulty].errors;
      for (const errorEntry of diffErrors.slice(0, config.sampleSizeForSummary)) {
        report.sampleErrors.push({
          family,
          difficulty,
          ...errorEntry,
        });
      }
    }

    // Collect sample warnings
    for (const warning of diversityWarnings.slice(0, config.sampleSizeForSummary)) {
      report.sampleWarnings.push({
        family,
        warning,
      });
    }

    report.families[family] = familyResults;
  }

  for (const [family, results] of Object.entries(report.families)) {
    if (results.skipped) {
      continue;
    }

    debug.signatureLeaders[family] = {};
    for (const [difficulty, counts] of Object.entries(results.signatureCountsByDifficulty || {})) {
      debug.signatureLeaders[family][difficulty] = Object.entries(counts)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 3)
        .map(([signature, count]) => ({ signature, count }));
    }
  }

  return report;
}

// ============================================================================
// REPORT FORMATTER
// ============================================================================

/**
 * Format and print a puzzle audit report to the console.
 *
 * @param {Object} report - Report object returned from runPuzzleAudit
 */
export function printPuzzleAuditReport(report) {
  console.log('\n' + '='.repeat(80));
  console.log('PUZZLE AUDIT REPORT');
  console.log('='.repeat(80));
  console.log(`Timestamp: ${report.timestamp}`);
  console.log(`Status: ${report.overall.pass ? '✓ PASS' : '✗ FAIL'}`);
  console.log('');

  console.log('OVERALL SUMMARY');
  console.log('-'.repeat(80));
  console.log(`Total Puzzles Generated: ${report.overall.totalPuzzlesGenerated}`);
  console.log(`Total Invalid Puzzles: ${report.overall.totalInvalidPuzzles}`);
  console.log(`Families Audited: ${report.overall.familiesAudited}`);
  console.log(`Families Skipped: ${report.overall.familiesSkipped}`);
  console.log('');

  console.log('FAMILY BREAKDOWN');
  console.log('-'.repeat(80));

  for (const [family, results] of Object.entries(report.families)) {
    if (results.skipped) {
      console.log(`\n[${family.toUpperCase()}] - SKIPPED`);
      console.log(`  Reason: ${results.reason}`);
      continue;
    }

    const statusIcon = results.invalidCount === 0 ? '✓' : '✗';
    const diversityStatus = results.warnings.length === 0 ? '✓' : '⚠';

    console.log(`\n[${family.toUpperCase()}] ${statusIcon}`);
    console.log(`  Generated: ${results.totalGenerated}`);
    console.log(`  Invalid: ${results.invalidCount}`);
    console.log(`  Unique Signatures: ${results.signatures.size}`);
    console.log(`  Diversity: ${diversityStatus} ${results.warnings.length} warning(s)`);

    // Per-difficulty breakdown
    for (const [difficulty, diffResults] of Object.entries(results.byDifficulty)) {
      const diffStatusIcon = diffResults.invalid === 0 ? '✓' : '✗';
      console.log(`    [${difficulty}] ${diffStatusIcon} Generated: ${diffResults.generated}, Invalid: ${diffResults.invalid}, Unique: ${diffResults.signatures.size}`);
    }

    // Show warnings
    if (results.warnings.length > 0) {
      console.log(`  Warnings:`);
      results.warnings.forEach(warning => {
        console.log(`    ⚠ ${warning}`);
      });
    }
  }

  // Sample errors
  if (report.sampleErrors.length > 0) {
    console.log('\n' + '-'.repeat(80));
    console.log('SAMPLE ERRORS');
    console.log('-'.repeat(80));

    for (const errorEntry of report.sampleErrors) {
      console.log(`\n[${errorEntry.family}/${errorEntry.difficulty}] Iteration ${errorEntry.iteration}:`);
      errorEntry.errors.forEach(err => {
        console.log(`  ✗ ${err}`);
      });
    }
  }

  // Sample warnings
  if (report.sampleWarnings.length > 0) {
    console.log('\n' + '-'.repeat(80));
    console.log('SAMPLE WARNINGS');
    console.log('-'.repeat(80));

    for (const warningEntry of report.sampleWarnings) {
      console.log(`\n[${warningEntry.family}]:`);
      console.log(`  ⚠ ${warningEntry.warning}`);
    }
  }

  console.log(`\n=== 🐞 DEBUG SUMMARY ===`);
  console.log(`Invalid Puzzles Caught: ${report.debug.invalidPuzzleSamples.length}`);
  console.log(`Duplicate Signatures Caught: ${report.debug.duplicateSignatureSamples.length}`);
  if (report.debug.invalidPuzzleSamples.length > 0) {
    console.log(`\nSample Invalid Puzzle:\n`, JSON.stringify(report.debug.invalidPuzzleSamples[0], null, 2));
  }
  if (Object.keys(report.debug.signatureLeaders).length > 0) {
    console.log(`\nTop Repeated Signatures:`, JSON.stringify(report.debug.signatureLeaders, null, 2));
  }

  console.log('\n' + '='.repeat(80));
  console.log(`AUDIT ${report.overall.pass ? 'PASSED' : 'FAILED'}`);
  console.log('='.repeat(80) + '\n');
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  runPuzzleAudit,
  printPuzzleAuditReport,
  CANONICAL_FAMILIES,
  CANONICAL_DIFFICULTIES,
};
