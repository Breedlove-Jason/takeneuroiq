import {
  generatePatternRushPuzzle,
  PATTERN_RUSH_PATTERN_BUILDERS,
} from "../src/game/puzzleGenerators/patternRushGenerator.js";

const exitWithCode = (code) => {
  if (typeof globalThis.process?.exit === "function") {
    globalThis.process.exit(code);
  }
};

function assert(condition, message) {
  if (condition) {
    console.log(`✅ ${message}`);
    return true;
  }

  console.log(`❌ ${message}`);
  return false;
}

console.log("🧪 Testing Pattern Rush generator\n");

let passed = 0;
let failed = 0;

const builders = PATTERN_RUSH_PATTERN_BUILDERS;
const expectedPatternTypes = [
  "shape_sequence",
  "rotation_pattern",
  "alternating_rule",
  "dual_layer_pattern",
  "positional_pattern",
];

expectedPatternTypes.forEach((patternType) => {
  const puzzle = builders[patternType]?.("medium");

  if (
    assert(Boolean(puzzle), `${patternType} builder returns a puzzle`) &&
    assert(Array.isArray(puzzle.sequence), `${patternType} returns a sequence array`) &&
    assert(typeof puzzle.correctAnswer === "string", `${patternType} returns a string answer`) &&
    assert(typeof puzzle.ruleDescription === "string" && puzzle.ruleDescription.length > 0, `${patternType} exposes a rule description`)
  ) {
    passed += 4;
  } else {
    failed += 1;
  }
});

console.log("\n🧪 Testing procedural generation and non-repetition\n");

const signatures = new Set();
for (let index = 0; index < 18; index += 1) {
  const puzzle = generatePatternRushPuzzle(index % 3 === 0 ? "easy" : index % 3 === 1 ? "medium" : "hard");
  const signature = puzzle.meta.sequenceSignature;

  if (
    assert(puzzle.type === "pattern_rush", `Puzzle ${index + 1} uses pattern_rush type`) &&
    assert(!signatures.has(signature), `Puzzle ${index + 1} is unique`)
  ) {
    passed += 1;
    signatures.add(signature);
  } else {
    failed += 1;
  }

  if (
    assert(Array.isArray(puzzle.choices), `Puzzle ${index + 1} exposes choices`) &&
    assert(puzzle.choices.includes(puzzle.correctAnswer), `Puzzle ${index + 1} includes the correct answer in the choices`) &&
    assert(puzzle.choices.length >= 3 && puzzle.choices.length <= 5, `Puzzle ${index + 1} has 3-5 total choices`) &&
    assert(puzzle.grid.includes("missing"), `Puzzle ${index + 1} includes a missing tile`) &&
    assert(puzzle.meta.difficulty === puzzle.difficulty, `Puzzle ${index + 1} keeps difficulty aligned`) &&
    assert(typeof puzzle.meta.ruleDescription === "string", `Puzzle ${index + 1} exposes meta.ruleDescription`)
  ) {
    passed += 6;
  } else {
    failed += 1;
  }
}

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  exitWithCode(1);
}

console.log("🎉 Pattern Rush generator checks passed!");




