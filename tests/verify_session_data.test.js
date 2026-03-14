// Verification script for useSessionData.js normalization logic

// Mocking the normalization logic from useSessionData.js
function normalizeSession(session) {
  const puzzlesAttempted = session.puzzlesAttempted ?? session.puzzlesSeen ?? 0;
  const puzzlesCorrect = session.puzzlesCorrect ?? session.correctAnswers ?? 0;

  return {
    ...session,
    puzzlesAttempted,
    puzzlesCorrect,
  };
}

// Mocking getLeaderboardSessions from sessionTracker.js (as used in useSessionData.js)
function getLeaderboardSessions(sourceSessions) {
  return [...sourceSessions]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((session, index) => ({
      rank: index + 1,
      name: session.name || `Player ${index + 1}`,
      score: session.score ?? 0,
      accuracy: `${session.accuracy ?? 0}%`,
      streak: session.bestStreak ?? session.streak ?? 0,
    }));
}

const testSessions = [
  {
    id: 'old-1',
    name: 'Old User',
    score: 500,
    accuracy: 80,
    streak: 4,
    bestStreak: 5,
    puzzlesSeen: 10,
    correctAnswers: 8,
    timestamp: Date.now() - 100000,
  },
  {
    id: 'new-1',
    name: 'New User',
    score: 800,
    accuracy: 90,
    streak: 8,
    bestStreak: 10,
    puzzlesAttempted: 12,
    puzzlesCorrect: 10,
    timestamp: Date.now(),
  },
  {
    id: 'mixed-1',
    name: 'Mixed User',
    score: 300,
    accuracy: 60,
    streak: 2,
    bestStreak: 3,
    puzzlesSeen: 5,
    puzzlesAttempted: 5,
    puzzlesCorrect: 3,
    correctAnswers: 3,
    timestamp: Date.now() - 50000,
  },
  {
    id: 'minimal-1',
    name: 'Minimal User',
    score: 100,
    accuracy: 50,
    streak: 1,
    bestStreak: 1,
    timestamp: Date.now() - 200000,
  }
];

console.log('🧪 Running Verification for Session Data Normalization\n');

let passed = 0;
let failed = 0;

const normalized = testSessions.map(normalizeSession);

normalized.forEach(session => {
  console.log(`Checking session: ${session.id} (${session.name})`);
  
  const hasAttempted = 'puzzlesAttempted' in session;
  const hasCorrect = 'puzzlesCorrect' in session;
  
  if (hasAttempted && hasCorrect) {
    console.log(`  ✅ Fields present: puzzlesAttempted=${session.puzzlesAttempted}, puzzlesCorrect=${session.puzzlesCorrect}`);
    
    // Check values for specific cases
    if (session.id === 'old-1') {
      if (session.puzzlesAttempted === 10 && session.puzzlesCorrect === 8) {
        console.log('  ✅ Old data correctly mapped');
        passed++;
      } else {
        console.log(`  ❌ Old data mismatch: expected (10, 8), got (${session.puzzlesAttempted}, ${session.puzzlesCorrect})`);
        failed++;
      }
    } else if (session.id === 'new-1') {
      if (session.puzzlesAttempted === 12 && session.puzzlesCorrect === 10) {
        console.log('  ✅ New data correctly preserved');
        passed++;
      } else {
        console.log(`  ❌ New data mismatch: expected (12, 10), got (${session.puzzlesAttempted}, ${session.puzzlesCorrect})`);
        failed++;
      }
    } else if (session.id === 'minimal-1') {
        if (session.puzzlesAttempted === 0 && session.puzzlesCorrect === 0) {
            console.log('  ✅ Minimal data correctly defaulted');
            passed++;
        } else {
            console.log(`  ❌ Minimal data mismatch: expected (0, 0), got (${session.puzzlesAttempted}, ${session.puzzlesCorrect})`);
            failed++;
        }
    } else {
        passed++;
    }
  } else {
    console.log(`  ❌ Fields MISSING: puzzlesAttempted=${hasAttempted}, puzzlesCorrect=${hasCorrect}`);
    failed++;
  }
  console.log('');
});

console.log('🧪 Verifying Leaderboard with Normalized Data\n');
const leaderboard = getLeaderboardSessions(normalized);

if (leaderboard.length === 4) {
    console.log('✅ Leaderboard contains all 4 entries');
    passed++;
} else {
    console.log(`❌ Leaderboard size mismatch: expected 4, got ${leaderboard.length}`);
    failed++;
}

if (leaderboard[0].name === 'New User' && leaderboard[0].score === 800) {
    console.log('✅ Top scorer is correct');
    passed++;
} else {
    console.log(`❌ Top scorer mismatch: expected New User (800), got ${leaderboard[0].name} (${leaderboard[0].score})`);
    failed++;
}

console.log(`\n📊 Verification Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('🎉 Normalization logic is robust and backward compatible!');
} else {
  console.log('⚠️ Verification failed. Please review the logic.');
  process.exit(1);
}
