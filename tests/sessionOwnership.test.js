import test from "node:test";
import assert from "node:assert/strict";
import { setAccountId } from "../src/auth/accountIdentity.js";
const values = new Map();
globalThis.localStorage = {
  getItem: (k) => values.get(k) ?? null,
  setItem: (k, v) => values.set(k, v),
  removeItem: (k) => values.delete(k),
};
globalThis.window = new EventTarget();
const { recordSession, getSessions } =
  await import("../src/game/sessionTracker.js");
const run = {
  score: 120,
  puzzlesAttempted: 4,
  puzzlesCorrect: 3,
  puzzleType: "pattern_rush",
};
test("guest history and two account histories remain isolated across switches", () => {
  recordSession({ ...run, ownerId: null });
  assert.equal(getSessions().length, 1);
  setAccountId("account-a");
  assert.equal(getSessions().length, 0);
  recordSession({ ...run, ownerId: "account-a" });
  setAccountId("account-b");
  assert.equal(getSessions().length, 0);
  recordSession({ ...run, ownerId: "account-a" });
  assert.equal(getSessions().length, 0);
  recordSession({ ...run, ownerId: "account-b" });
  setAccountId("account-a");
  assert.equal(getSessions().length, 1);
  assert.equal(getSessions()[0].ownerId, "account-a");
  setAccountId(null);
  assert.equal(getSessions().length, 1);
  assert.equal(getSessions()[0].ownerId, null);
});
