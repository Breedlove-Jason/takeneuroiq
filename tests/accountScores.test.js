import test from "node:test";
import assert from "node:assert/strict";
import { makeScorePayload } from "../src/lib/scorePayload.js";
import { rankLocalSessions } from "../src/lib/leaderboard.js";
const user = "11111111-1111-4111-8111-111111111111";
const run = {
  id: "22222222-2222-4222-8222-222222222222",
  ownerId: user,
  puzzleType: "pattern_rush",
  score: 600,
  puzzlesAttempted: 10,
  puzzlesCorrect: 8,
  bestStreak: 4,
};
test("guest and another account cannot claim a run", () => {
  assert.equal(makeScorePayload(run, null), null);
  assert.equal(makeScorePayload(run, "other"), null);
  assert.equal(makeScorePayload({ ...run, ownerId: null }, user), null);
});
test("score payload excludes private analytics and client timestamps", () => {
  const p = makeScorePayload(
    { ...run, email: "private@example.test", timestamp: "2099-01-01" },
    user,
  );
  assert.deepEqual(
    Object.keys(p).sort(),
    [
      "id",
      "user_id",
      "puzzle_type",
      "score",
      "attempted",
      "correct",
      "streak",
    ].sort(),
  );
});
test("invalid score and puzzle submissions are rejected", () => {
  for (const patch of [
    { score: NaN },
    { score: -1 },
    { score: 1.5 },
    { score: 1000001 },
    { puzzlesCorrect: 11 },
    { puzzlesAttempted: 0 },
    { puzzleType: "unknown" },
    { id: "invalid" },
  ])
    assert.equal(makeScorePayload({ ...run, ...patch }, user), null);
});
test("device board compares same family, period and one best run per player", () => {
  const sessions = [
    {
      name: "A",
      score: 200,
      puzzleType: "pattern_rush",
      timestamp: "2026-09-18",
      puzzlesAttempted: 10,
      puzzlesCorrect: 7,
    },
    {
      name: "A",
      score: 250,
      puzzleType: "pattern_rush",
      timestamp: "2026-09-18",
      puzzlesAttempted: 10,
      puzzlesCorrect: 8,
    },
    {
      name: "B",
      score: 9999,
      puzzleType: "logic_gate",
      timestamp: "2026-09-18",
    },
    {
      name: "C",
      score: 9999,
      puzzleType: "pattern_rush",
      timestamp: "2020-01-01",
    },
  ];
  const rows = rankLocalSessions(
    sessions,
    "pattern_rush",
    Date.parse("2026-09-11"),
  );
  assert.equal(rows.length, 1);
  assert.equal(rows[0].score, 250);
  assert.equal(rows[0].accuracy, 80);
});
test("ties use accuracy and malformed dates are excluded", () => {
  const base = {
    puzzleType: "pattern_rush",
    score: 200,
    puzzlesAttempted: 10,
    timestamp: "2026-09-18",
  };
  assert.deepEqual(
    rankLocalSessions(
      [
        { ...base, name: "A", puzzlesCorrect: 5 },
        { ...base, name: "B", puzzlesCorrect: 8 },
        { ...base, name: "Bad", timestamp: "invalid" },
      ],
      "pattern_rush",
    ).map((x) => x.display_name),
    ["B", "A"],
  );
});
