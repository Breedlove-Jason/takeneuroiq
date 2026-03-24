import { classifyCognitiveIdentity } from "./cognitiveIdentity";

export function summarizeCognitiveIdentity(sessions = []) {
  if (!Array.isArray(sessions) || sessions.length === 0) {
    return {
      dominantIdentity: null,
      identityCounts: {},
      totalClassifiedSessions: 0,
      recentIdentitySession: null,
      identityShift: {
        key: "insufficient_data",
        label: "Not enough data",
        description: "Complete more classified sessions to detect an identity shift.",
      },
    };
  }

  const identityCounts = {};

  const getClassifiedIdentity = (session) => {
    let identity = session?.cognitiveIdentity;

    const rawLabel =
      typeof identity?.label === "string" ? identity.label.trim() : "";
    const hasValidLabel =
      rawLabel &&
      rawLabel.toLowerCase() !== "unknown" &&
      rawLabel.toLowerCase() !== "unclassified";

    if (!identity?.identityKey || !hasValidLabel || !identity?.description) {
      identity = classifyCognitiveIdentity(session);
    }

    if (!identity?.identityKey || !identity?.label) {
      return null;
    }

    return identity;
  };

  sessions.forEach((session) => {
    const identity = getClassifiedIdentity(session);

    if (!identity) {
      return;
    }

    const identityKey = identity.identityKey;
    const identityLabel = identity.label;
    const identityDescription = identity.description;

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

  const recentIdentitySession = [...sessions]
    .reverse()
    .find((session) => session?.cognitiveIdentity?.identityKey) ?? null;

  const recentClassifiedIdentities = [];
  for (let index = sessions.length - 1; index >= 0 && recentClassifiedIdentities.length < 5; index -= 1) {
    const identity = getClassifiedIdentity(sessions[index]);
    if (identity) {
      recentClassifiedIdentities.push(identity);
    }
  }

  const recentIdentityCounts = {};
  recentClassifiedIdentities.forEach((identity) => {
    if (!recentIdentityCounts[identity.identityKey]) {
      recentIdentityCounts[identity.identityKey] = {
        identityKey: identity.identityKey,
        label: identity.label,
        description: identity.description,
        count: 0,
      };
    }
    recentIdentityCounts[identity.identityKey].count += 1;
  });
  const recentIdentityList = Object.values(recentIdentityCounts).sort(
    (a, b) => b.count - a.count,
  );
  const recentDominantIdentity = recentIdentityList[0] || null;

  const identityShift = (() => {
    if (!identityList[0] || !recentDominantIdentity) {
      return {
        key: "insufficient_data",
        label: "Not enough data",
        description: "Complete more classified sessions to detect an identity shift.",
      };
    }

    const allTimeKey = identityList[0].identityKey;
    const recentKey = recentDominantIdentity.identityKey;

    if (allTimeKey === recentKey) {
      return {
        key: "stable",
        label: "Stable",
        description: "Your recent training pattern is consistent with your longer-term identity.",
      };
    }

    if (recentKey === "climber") {
      return {
        key: "climbing",
        label: "Climbing",
        description: "Your recent sessions suggest more upward challenge tolerance than your longer-term pattern.",
      };
    }

    if (recentKey === "recovery_builder") {
      return {
        key: "recovery",
        label: "Recovery Trend",
        description: "Your recent sessions suggest stabilization or recalibration compared with your longer-term pattern.",
      };
    }

    if (recentKey === "overreacher") {
      return {
        key: "volatile",
        label: "Volatile",
        description: "Your recent sessions show more instability than your longer-term pattern.",
      };
    }

    return {
      key: "shifting",
      label: "Shifting",
      description: "Your recent sessions suggest an evolving training pattern.",
    };
  })();

  return {
    dominantIdentity: identityList[0] || null,
    identityCounts,
    totalClassifiedSessions: identityList.reduce(
      (total, item) => total + item.count,
      0,
    ),
    recentIdentitySession,
    identityShift,
  };
}
