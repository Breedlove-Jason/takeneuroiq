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
  "shapeSequence",
  "colorSequence",
  "rotationPattern",
  "dualLayerPattern",
  "alternatingRulePattern",
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
  const signature = `${puzzle.meta.patternType}:${puzzle.grid.join("|")}:${puzzle.correctAnswer}`;

  if (
    assert(puzzle.type === "pattern-rush", `Puzzle ${index + 1} uses pattern-rush type`) &&
    assert(!signatures.has(signature), `Puzzle ${index + 1} is unique`)
  ) {
    passed += 1;
    signatures.add(signature);
  } else {
    failed += 1;
  }

  if (
    assert(puzzle.options.includes(puzzle.correctAnswer), `Puzzle ${index + 1} includes the correct answer in the options`) &&
    assert(puzzle.options.length >= 4 && puzzle.options.length <= 6, `Puzzle ${index + 1} has 4-6 total options`) &&
    assert(puzzle.grid.includes("missing"), `Puzzle ${index + 1} includes a missing tile`) &&
    assert(puzzle.meta.difficulty === puzzle.difficulty, `Puzzle ${index + 1} keeps difficulty aligned`)
  ) {
    passed += 4;
  } else {
    failed += 1;
  }
}

console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);

if (failed > 0) {
  exitWithCode(1);
}

console.log("🎉 Pattern Rush generator checks passed!");




