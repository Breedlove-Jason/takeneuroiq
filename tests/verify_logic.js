import { calculatePressureState } from "../src/utils/sessionTrendUtils.js";

async function test() {
  console.log("🧪 Testing calculatePressureState from src/utils/sessionTrendUtils.js...");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ ${message}`);
      passed++;
    } else {
      console.log(`❌ ${message}`);
      failed++;
    }
  }

  try {
    assert(calculatePressureState([]).state === "neutral", "Returns neutral for empty data");
    assert(calculatePressureState([{ accuracy: 85, bestStreak: 2 }, { accuracy: 85, bestStreak: 2 }, { accuracy: 85, bestStreak: 2 }]).state === "under-pressure", "Returns under-pressure for high accuracy/low streak");
    assert(calculatePressureState([{ accuracy: 85, bestStreak: 10, score: 800 }, { accuracy: 85, bestStreak: 10, score: 800 }, { accuracy: 85, bestStreak: 10, score: 800 }]).state === "locked-in", "Returns locked-in for high accuracy/streak/score");
    assert(calculatePressureState([{ accuracy: 70, bestStreak: 5, score: 500 }, { accuracy: 70, bestStreak: 5, score: 500 }, { accuracy: 70, bestStreak: 5, score: 500 }]).state === "stable", "Returns stable for other cases");

    console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
    if (failed > 0) process.exit(1);
  } catch (e) {
    console.error("Error during test:", e);
    process.exit(1);
  }
}

test();
