import { classifyCognitiveIdentity } from "./cognitiveIdentity";

export function summarizeCognitiveIdentity(sessions = []) {
  if (!Array.isArray(sessions) || sessions.length === 0) {
    return {
      dominantIdentity: null,
      identityCounts: {},
      totalClassifiedSessions: 0,
    };
  }

  const identityCounts = {};

  sessions.forEach((session) => {
    let identity = session?.cognitiveIdentity;

    if (!identity?.identityKey || !identity?.label) {
      identity = classifyCognitiveIdentity(session);
    }

    const identityKey = identity?.identityKey;
    const identityLabel = identity?.label;
    const identityDescription = identity?.description;

    if (!identityKey || !identityLabel) {
      return;
    }

    if (!identityCounts[identityKey]) {
      identityCounts[identityKey] = {
        identityKey,
        label: identityLabel,
        description: identityDescription,
        count: 0,
      };
    }

    identityCounts[identityKey].count += 1;
  });

  const identityList = Object.values(identityCounts).sort(
    (a, b) => b.count - a.count,
  );

  return {
    dominantIdentity: identityList[0] || null,
    identityCounts,
    totalClassifiedSessions: identityList.reduce(
      (total, item) => total + item.count,
      0,
    ),
  };
}
