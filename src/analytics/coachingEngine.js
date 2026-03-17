export function generateCoachingInsight({
  cognitiveTracks,
  neuralTrend,
  pressureState,
  adaptiveDifficulty,
}) {
  const safeTracks = cognitiveTracks || {
    patternRecognition: 0,
    focusStability: 0,
    processingSpeed: 0,
    consistency: 0,
  };

  const safeTrend = neuralTrend || { direction: "neutral", change: 0 };
  const safePressure = pressureState || { state: "neutral" };
  const safeAdaptive = adaptiveDifficulty || {
    state: "steady",
    label: "Steady Mode",
    targetDifficulty: "medium",
  };

  const strengths = [];
  const needsWork = [];

  if (safeTracks.patternRecognition >= 80) {
    strengths.push("pattern recognition is strong");
  } else if (safeTracks.patternRecognition < 60) {
    needsWork.push("pattern recognition needs reinforcement");
  }

  if (safeTracks.focusStability >= 75) {
    strengths.push("focus stability is holding well");
  } else if (safeTracks.focusStability < 60) {
    needsWork.push("focus stability is still developing");
  }

  if (safeTracks.processingSpeed >= 75) {
    strengths.push("processing speed is becoming a reliable asset");
  } else if (safeTracks.processingSpeed < 60) {
    needsWork.push("processing speed could improve with more repetition");
  }

  if (safeTracks.consistency >= 75) {
    strengths.push("consistency is giving your sessions a stable base");
  } else if (safeTracks.consistency < 60) {
    needsWork.push("consistency is still uneven across runs");
  }

  let headline = "Balanced Cognitive Growth";
  let summary =
    "Your recent sessions show a stable training rhythm with room to keep building performance.";
  let focus =
    "Stay with balanced challenge and reinforce clean, repeatable execution.";

  if (safeAdaptive.state === "challenge") {
    headline = "Ready for Greater Challenge";
    summary =
      "Recent performance signals suggest you can handle more complexity without losing control.";
    focus =
      "Push into harder puzzle patterns and maintain accuracy under higher cognitive load.";
  } else if (safeAdaptive.state === "recover") {
    headline = "Rebuild Stability First";
    summary =
      "Recent performance suggests cognitive load may be outrunning control and consistency.";
    focus =
      "Reduce difficulty slightly and focus on accurate, steady clears before pushing speed.";
  } else if (safeTrend.direction === "improving") {
    headline = "Momentum Is Building";
    summary =
      "Recent neural performance is trending upward, suggesting your current training rhythm is working.";
    focus =
      "Protect that momentum by keeping precision high while gradually increasing challenge.";
  } else if (safeTrend.direction === "declining") {
    headline = "Stabilize Before Scaling";
    summary =
      "Recent sessions show a dip in performance, which suggests it is time to tighten execution before adding difficulty.";
    focus =
      "Prioritize accuracy and streak control over raw speed for the next few runs.";
  }

  if (safePressure.state === "under-pressure") {
    focus =
      "Your accuracy is surviving pressure, but streak control is slipping. Slow down slightly and rebuild clean chains.";
  } else if (safePressure.state === "locked-in") {
    focus =
      "You are handling pressure well. This is a good window to introduce tougher puzzles and extend streak expectations.";
  }

  const detailParts = [];

  if (strengths.length > 0) {
    detailParts.push(`Strengths: ${strengths.join(", ")}.`);
  }

  if (needsWork.length > 0) {
    detailParts.push(`Focus area: ${needsWork.join(", ")}.`);
  }

  const detail = detailParts.join(" ");

  return {
    headline,
    summary,
    focus,
    detail,
  };
}