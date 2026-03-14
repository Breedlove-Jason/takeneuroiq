// Test file for sessionTracker.js - verifies session labeling logic

// Helper function to get session label based on performance
function getSessionLabel(session) {
  const score = session.score ?? 0;
  const accuracy = session.accuracy ?? 0;
  const bestStreak = session.bestStreak ?? session.streak ?? 0;

  if (score >= 1000 && accuracy >= 90 && bestStreak >= 10) {
    return 'Elite Run';
  }

  if (score >= 700 && accuracy >= 80 && bestStreak >= 6) {
    return 'Strong Run';
  }

  if (score >= 400 && accuracy >= 70) {
    return 'Stable Run';
  }

  return 'Training Run';
}

// Test cases
console.log('🧪 Testing Session Labeling Logic\n');

const testCases = [
  {
    name: 'Elite Run',
    session: { score: 1200, accuracy: 95, bestStreak: 15 },
    expected: 'Elite Run',
  },
  {
    name: 'Strong Run',
    session: { score: 850, accuracy: 85, bestStreak: 8 },
    expected: 'Strong Run',
  },
  {
    name: 'Stable Run',
    session: { score: 500, accuracy: 75, bestStreak: 3 },
    expected: 'Stable Run',
  },
  {
    name: 'Training Run',
    session: { score: 200, accuracy: 60, bestStreak: 2 },
    expected: 'Training Run',
  },
  {
    name: 'Training Run (Low accuracy)',
    session: { score: 600, accuracy: 50, bestStreak: 5 },
    expected: 'Training Run',
  },
];

let passed = 0;
let failed = 0;

testCases.forEach((testCase) => {
  const label = getSessionLabel(testCase.session);
  const success = label === testCase.expected;

  if (success) {
    console.log(`✅ ${testCase.name}`);
    console.log(`   Score: ${testCase.session.score}, Accuracy: ${testCase.session.accuracy}%, Streak: ${testCase.session.bestStreak}`);
    console.log(`   Expected: ${testCase.expected}, Got: ${label}\n`);
    passed++;
  } else {
    console.log(`❌ ${testCase.name}`);
    console.log(`   Score: ${testCase.session.score}, Accuracy: ${testCase.session.accuracy}%, Streak: ${testCase.session.bestStreak}`);
    console.log(`   Expected: ${testCase.expected}, Got: ${label}\n`);
    failed++;
  }
});

console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed out of ${testCases.length} tests`);

if (failed === 0) {
  console.log('🎉 All tests passed! Session labeling is working correctly.');
} else {
  console.log('⚠️ Some tests failed. Please review the logic.');
}


