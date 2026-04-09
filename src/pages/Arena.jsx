import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLayerGroup,
  faRotateRight,
  faBrain,
  faBolt,
} from "@fortawesome/pro-duotone-svg-icons";
import PuzzleShape from "../components/PuzzleShape";
import MatrixRain from "../components/MatrixRain";
import { checkAnswer, getRandomPuzzle } from "../game/puzzleEngine";
import sequenceSprintPuzzles, {
  getRandomSequenceSprintPuzzle,
} from "../game/sequenceSprintPuzzles";
import { getRandomRuleShiftPuzzle } from "../game/puzzleGenerators/ruleShiftGenerator";
import {
  formatGridAsMatrix,
  getRandomGridRecallPuzzle,
} from "../game/gridRecallPuzzles";
import { getRandomLogicGridPuzzle } from "../game/logicGridPuzzles";
import { getRandomLogicGatePuzzle } from "../game/logicGatePuzzles";
import { getRandomSignalPathPuzzle } from "../game/signalPathPuzzles";
import { recordSession } from "../game/sessionTracker";
import { calculateLiveAdaptiveDifficulty } from "../analytics/liveAdaptiveDifficulty.js";
import { useLocation } from "react-router-dom";
import { evaluateSessionOutcome } from "../analytics/sessionOutcomeEvaluator";
import { classifyCognitiveIdentity } from "../analytics/cognitiveIdentity";
import {
  PUZZLE_TYPES,
  getPuzzleTypeMetadata,
} from "../utils/puzzleTypeRegistry";
import { buildAccuracySummary } from "../utils/puzzleAccuracy";
import { PUZZLE_DEV_FLAGS } from "../config/puzzleDevFlags";
import sequenceSprintRunner from "../assets/running.png";
import neuralProfileImage from "../assets/neuro.png";

/**
 * Arena Component
 *
 * The primary gameplay container for the 'Pattern Rush' challenge.
 *
 * Responsibilities:
 * - Managing the game loop (timer, puzzle rotation, answer handling).
 * - Tracking real-time performance metrics (score, streak, accuracy).
 * - Recording session data to the global tracker upon game completion.
 * - Providing visual feedback (correct/incorrect) and game-over states.
 *
 * @param {Object} props - Component properties.
 * @param {string} props.theme - Current UI theme ('cyber' or 'light').
 */

const adaptiveStateLabelMap = {
  recover: "Recovery Mode",
  steady: "Stable Load",
  challenge: "Challenge Mode",
};

const adaptiveStateColorMap = {
  recover: "text-yellow-300",
  steady: "text-cyan-300",
  challenge: "text-fuchsia-300",
};

const adaptiveConfidenceColorMap = {
  low: "text-slate-300",
  medium: "text-cyan-200",
  high: "text-emerald-300",
};

const adaptiveCoachingMessageMap = {
  recover: "Focus on accuracy over speed.",
  steady: "Stay consistent. You have a good rhythm.",
  challenge: "Strong momentum. Keep pressing.",
};

const adaptiveFeedbackMap = {
  recover: {
    correct: "Correct. Rebuilding stability.",
    incorrect: "Incorrect. Focus on the next one.",
  },
  steady: {
    correct: "Correct. Nice rhythm.",
    incorrect: "Incorrect. Reset and stay steady.",
  },
  challenge: {
    correct: "Correct. Exceptional read.",
    incorrect: "Incorrect. Stay sharp.",
  },
};

const adaptiveShiftMessageMap = {
  easy: "Adaptive shift: easing difficulty",
  medium: "Adaptive shift: stabilizing load",
  hard: "Adaptive shift: increasing challenge",
};

const liveCoachingToneMap = {
  recover: "border-yellow-400/20 bg-yellow-400/5 text-yellow-200",
  steady: "border-cyan-500/20 bg-cyan-500/5 text-cyan-200",
  challenge: "border-violet-500/20 bg-violet-500/5 text-violet-200",
  default: "border-slate-700/70 bg-slate-800/40 text-slate-200",
};

const recommendedSessionStyles = {
  challenge: {
    border: "border-violet-500/30",
    label: "text-violet-300",
    badge: "bg-violet-500/15 text-violet-200 border border-violet-400/30",
  },
  steady: {
    border: "border-cyan-500/20",
    label: "text-cyan-300",
    badge: "bg-cyan-500/15 text-cyan-200 border border-cyan-400/30",
  },
  recover: {
    border: "border-yellow-500/30",
    label: "text-yellow-300",
    badge: "bg-yellow-500/15 text-yellow-200 border border-yellow-400/30",
  },
  default: {
    border: "border-slate-700",
    label: "text-slate-300",
    badge: "bg-slate-500/15 text-slate-200 border border-slate-400/20",
  },
};

const recommendedSessionLabels = {
  challenge: "Challenge",
  steady: "Steady",
  recover: "Recovery",
  default: "Adaptive",
};

const recommendedAlignmentToneMap = {
  aligned: "text-emerald-300",
  shifted: "text-amber-300",
  inactive: "text-slate-400",
};

const recommendedDifficultyLabels = {
  easy: "EASY",
  medium: "MEDIUM",
  hard: "HARD",
};

const recommendedSessionReasonMap = {
  challenge:
    "The system detected strong recent performance and is opening at a higher challenge level.",
  steady:
    "The system detected balanced recent performance and is opening at a stable training level.",
  recover:
    "The system detected a need for controlled recovery and is easing the opening difficulty.",
  default:
    "The system is using your recent training behavior to shape this session.",
};

const analysisProfileMap = {
  pattern_rush: {
    title: "Pattern Analysis Matrix",
    analysisLines: [
      "Pattern recognition stable",
      "Visual decoding efficiency high",
      "Signal alignment consistent",
    ],
    tone: "calibrated",
    accentColor: "#22d3ee",
    animationStyle: "steady_scan",
  },
  sequence_sprint: {
    title: "Momentum Analysis Matrix",
    analysisLines: [
      "Momentum sustained",
      "Prediction flow accelerating",
      "Execution rhythm stabilized",
    ],
    tone: "surging",
    accentColor: "#d946ef",
    animationStyle: "tempo_surge",
  },
  grid_recall: {
    title: "Memory Analysis Matrix",
    analysisLines: [
      "Memory imprint retained",
      "Spatial recall stabilizing",
      "Retention fidelity improving",
    ],
    tone: "stabilizing",
    accentColor: "#34d399",
    animationStyle: "memory_resonance",
  },
  logic_grid: {
    title: "Inference Analysis Matrix",
    analysisLines: [
      "Matrix rule extraction stable",
      "Hidden-cell inference sharpening",
      "Structured deduction holding",
    ],
    tone: "deductive",
    accentColor: "#22d3ee",
    animationStyle: "matrix_resonance",
  },
  rule_shift: {
    title: "Rule Shift Analysis Matrix",
    analysisLines: [
      "Arithmetic transition stabilized",
      "Shift timing held under pressure",
      "Rule switching remained clean",
    ],
    tone: "adaptive",
    accentColor: "#a78bfa",
    animationStyle: "rule_shift_rhythm",
  },
  logic_gate: {
    title: "Logic Analysis Matrix",
    analysisLines: [
      "Logical precision maintained",
      "Operator consistency high",
      "Decision pathways optimized",
    ],
    tone: "precise",
    accentColor: "#f59e0b",
    animationStyle: "precision_lock",
  },
  signal_path: {
    title: "Signal Analysis Matrix",
    analysisLines: [
      "Routing stability confirmed",
      "Constraint navigation improving",
      "Signal discipline established",
    ],
    tone: "disciplined",
    accentColor: "#a78bfa",
    animationStyle: "route_trace",
  },
};

const analysisAnimationProfileMap = {
  steady_scan: {
    scanDurationMs: 1700,
    lineStartDelayMs: 220,
    lineStaggerMs: 280,
    lineDurationMs: 500,
    auraDurationMs: 7200,
    brainPulseMs: 1200,
  },
  tempo_surge: {
    scanDurationMs: 1480,
    lineStartDelayMs: 170,
    lineStaggerMs: 230,
    lineDurationMs: 460,
    auraDurationMs: 6200,
    brainPulseMs: 950,
  },
  memory_resonance: {
    scanDurationMs: 1760,
    lineStartDelayMs: 240,
    lineStaggerMs: 300,
    lineDurationMs: 560,
    auraDurationMs: 7800,
    brainPulseMs: 1320,
  },
  matrix_resonance: {
    scanDurationMs: 1620,
    lineStartDelayMs: 200,
    lineStaggerMs: 250,
    lineDurationMs: 500,
    auraDurationMs: 7400,
    brainPulseMs: 1080,
  },
  rule_shift_rhythm: {
    scanDurationMs: 1580,
    lineStartDelayMs: 190,
    lineStaggerMs: 240,
    lineDurationMs: 480,
    auraDurationMs: 7100,
    brainPulseMs: 1040,
  },
  precision_lock: {
    scanDurationMs: 1560,
    lineStartDelayMs: 180,
    lineStaggerMs: 250,
    lineDurationMs: 450,
    auraDurationMs: 6400,
    brainPulseMs: 980,
  },
  route_trace: {
    scanDurationMs: 1660,
    lineStartDelayMs: 210,
    lineStaggerMs: 270,
    lineDurationMs: 490,
    auraDurationMs: 7000,
    brainPulseMs: 1100,
  },
};

function DevDebugPanel({ title, children }) {
  return (
    <div className="rounded-2xl border border-amber-400/40 bg-amber-500/5 p-3 text-[10px] uppercase tracking-[0.3em] text-amber-200 shadow-[0_0_18px_rgba(251,191,36,0.25)]">
      {title && (
        <div className="text-[9px] font-semibold text-amber-300">{title}</div>
      )}
      <div className="mt-1 space-y-1 text-[11px] leading-snug text-amber-100">
        {children}
      </div>
    </div>
  );
}

function clamp(value, min = 0, max = 100) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return min;
  }
  return Math.min(Math.max(value, min), max);
}

function hexToRgba(hexColor, alpha = 1) {
  if (typeof hexColor !== "string") {
    return `rgba(34, 211, 238, ${alpha})`;
  }
  const normalizedHex = hexColor.replace("#", "");
  if (normalizedHex.length !== 6) {
    return `rgba(34, 211, 238, ${alpha})`;
  }
  const intValue = Number.parseInt(normalizedHex, 16);
  if (Number.isNaN(intValue)) {
    return `rgba(34, 211, 238, ${alpha})`;
  }
  const red = (intValue >> 16) & 255;
  const green = (intValue >> 8) & 255;
  const blue = intValue & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function buildBlankGridMatrix(size = 3) {
  const normalizedSize =
    Number.isFinite(size) && size > 0 ? Math.round(size) : 3;
  return Array.from({ length: normalizedSize }, () =>
    Array.from({ length: normalizedSize }, () => false),
  );
}

function formatDevValue(value, fallback = "—") {
  if (value === null || value === undefined) {
    return fallback;
  }
  if (typeof value !== "string") {
    return value;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }
  return trimmed.replace(/_/g, " ");
}

function isValidGridMatrix(matrix, size) {
  const normalizedSize =
    Number.isFinite(size) && size > 0 ? Math.round(size) : 0;
  if (!normalizedSize || !Array.isArray(matrix)) {
    return false;
  }
  return (
    matrix.length === normalizedSize &&
    matrix.every(
      (row) => Array.isArray(row) && row.length === normalizedSize,
    )
  );
}

function getSequenceSprintProgressPercent({ solvedCount = 0, totalCount = 1 }) {
  if (!Number.isFinite(totalCount) || totalCount <= 0) {
    return 0;
  }
  const rawPercent = (solvedCount / totalCount) * 100;
  return clamp(rawPercent, 0, 100);
}

const getSequenceSprintPhase = (progress = 0) => {
  if (progress >= 90) {
    return "finishing";
  }
  if (progress >= 55) {
    return "surging";
  }
  if (progress > 0) {
    return "moving";
  }
  return "idle";
};

const getSequenceSprintRunnerClasses = (phase) => {
  const fx = {
    finishing: {
      wrapper: "animate-pulse",
      image: "drop-shadow-[0_0_15px_rgba(217,70,239,0.8)]",
      trail: "opacity-80 w-16 bg-gradient-to-r from-transparent to-fuchsia-500",
      finishGlow: "opacity-100 bg-fuchsia-500/30",
    },
    surging: {
      wrapper: "animate-bounce",
      image: "drop-shadow-[0_0_10px_rgba(217,70,239,0.6)]",
      trail: "opacity-50 w-10 bg-gradient-to-r from-transparent to-fuchsia-400",
      finishGlow: "opacity-40 bg-fuchsia-500/20",
    },
    moving: {
      wrapper: "",
      image: "drop-shadow-[0_0_5px_rgba(217,70,239,0.4)]",
      trail: "opacity-30 w-6 bg-gradient-to-r from-transparent to-fuchsia-400",
      finishGlow: "opacity-0",
    },
    idle: {
      wrapper: "",
      image: "drop-shadow-[0_0_2px_rgba(217,70,239,0.2)]",
      trail: "opacity-0",
      finishGlow: "opacity-0",
    },
  };
  return fx[phase] || fx.idle;
};

const SEQUENCE_SPRINT_TOTAL_PROBLEMS = Math.max(
  1,
  sequenceSprintPuzzles.length,
);

const adaptiveStateToDifficultyMap = {
  recover: "easy",
  steady: "medium",
  challenge: "hard",
};

function getAdaptiveFeedback(adaptiveState, isCorrect) {
  const feedbackSet =
    adaptiveFeedbackMap[adaptiveState] ?? adaptiveFeedbackMap.steady;
  return isCorrect ? feedbackSet.correct : feedbackSet.incorrect;
}

function getFeedbackBadgeClass(feedback, isCyber) {
  if (feedback.startsWith("Correct")) {
    return "bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/20";
  }

  if (feedback.startsWith("Incorrect") || feedback.startsWith("Missed")) {
    return "bg-fuchsia-500/10 text-fuchsia-300 ring-1 ring-fuchsia-400/20";
  }

  return isCyber
    ? "bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/20"
    : "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

const BASE_CORRECT_ANSWER_SCORE = 100;
const MAX_COMBO_MULTIPLIER = 4;

function getComboMultiplier(streak = 0) {
  const normalizedStreak = Number.isFinite(streak)
    ? Math.max(0, Math.floor(streak))
    : 0;

  if (normalizedStreak >= 7) {
    return 4;
  }
  if (normalizedStreak >= 5) {
    return 3;
  }
  if (normalizedStreak >= 3) {
    return 2;
  }
  return 1;
}

function getSequenceSprintOverflowComboMultiplier(overflowSolvedCount = 0) {
  if (overflowSolvedCount <= 0) {
    return 1;
  }
  return Math.min(MAX_COMBO_MULTIPLIER, Math.max(2, overflowSolvedCount + 1));
}

function getScoreAwardBreakdown({
  streak = 0,
  puzzleType,
  sequenceSolvedCount = 0,
  sequenceTotalCount = 0,
} = {}) {
  const baseAward = BASE_CORRECT_ANSWER_SCORE;
  const isSequenceSprint = puzzleType === PUZZLE_TYPES.SEQUENCE_SPRINT;
  const normalizedSequenceSolvedCount = Math.max(0, sequenceSolvedCount);
  const normalizedSequenceTotalCount = Math.max(0, sequenceTotalCount);
  const sequenceFinishLineReached =
    isSequenceSprint &&
    normalizedSequenceTotalCount > 0 &&
    normalizedSequenceSolvedCount >= normalizedSequenceTotalCount;
  const sequenceOverflowSolvedCount = isSequenceSprint
    ? Math.max(
        0,
        normalizedSequenceSolvedCount - normalizedSequenceTotalCount,
      )
    : 0;

  const streakComboMultiplier = getComboMultiplier(streak);
  const sequenceOverflowComboMultiplier =
    getSequenceSprintOverflowComboMultiplier(sequenceOverflowSolvedCount);
  const comboMultiplier = Math.max(
    1,
    isSequenceSprint
      ? Math.max(streakComboMultiplier, sequenceOverflowComboMultiplier)
      : streakComboMultiplier,
  );
  const comboScoreValue = baseAward * comboMultiplier;
  const comboBonusAward = Math.max(0, comboScoreValue - baseAward);

  return {
    baseAward,
    comboMultiplier,
    comboScoreValue,
    comboBonusAward,
    totalAwarded: baseAward + comboBonusAward,
    streakComboMultiplier,
    sequenceOverflowSolvedCount,
    sequenceOverflowComboMultiplier,
    sequenceFinishLineReached,
    scoreStateLabel:
      comboMultiplier > 1
        ? isSequenceSprint
          ? sequenceOverflowSolvedCount > 0
            ? "Finish-line combo"
            : "Combo bonus"
          : "Combo bonus"
        : isSequenceSprint
          ? sequenceFinishLineReached
            ? "Finish line reached"
            : "Lane build"
          : "Base award",
  };
}

const buildSequenceSprintResultsCopy = ({
  accuracy = 0,
  correctAnswers = 0,
} = {}) => {
  if (accuracy >= 90) {
    return {
      eyebrow: "Sprint Complete",
      title: "Sequence Sprint Results",
      summary:
        "Excellent sequence control. Rule recognition stayed sharp and your sprint pace held strong.",
    };
  }

  if (accuracy >= 70) {
    return {
      eyebrow: "Sprint Complete",
      title: "Sequence Sprint Results",
      summary:
        "Solid momentum. Sequence logic is stabilizing, and your recognition lane is building consistency.",
    };
  }

  if (correctAnswers > 0) {
    return {
      eyebrow: "Sprint Complete",
      title: "Sequence Sprint Results",
      summary: "Partial progress. Keep refining your sequence logic recognition.",
    };
  }

  return {
    eyebrow: "Sprint Complete",
    title: "Sequence Sprint Results",
    summary: "Sprint timed out. Reset and focus on the initial sequence rule.",
  };
};

const buildGridRecallResultsCopy = ({
  accuracy = 0,
  correctAnswers = 0,
} = {}) => {
  if (accuracy >= 90) {
    return {
      eyebrow: "Session Complete",
      title: "Grid Recall Results",
      summary:
        "Superior spatial accuracy. Your neural imprint was extremely stable even under load.",
    };
  }

  if (accuracy >= 70) {
    return {
      eyebrow: "Session Complete",
      title: "Grid Recall Results",
      summary:
        "Solid spatial memory. You held the patterns well throughout the neural encoding phases.",
    };
  }

  if (correctAnswers > 0) {
    return {
      eyebrow: "Session Complete",
      title: "Grid Recall Results",
      summary: "Partial spatial mapping. Keep refining your focus on the neural matrices.",
    };
  }

  return {
    eyebrow: "Session Complete",
    title: "Grid Recall Results",
    summary:
      "Session timed out. Rebuild your spatial encoding with simpler patterns.",
  };
};

const buildLogicGridResultsCopy = ({
  accuracy = 0,
  correctAnswers = 0,
} = {}) => {
  if (accuracy >= 90) {
    return {
      eyebrow: "Matrix Complete",
      title: "Logic Grid Results",
      summary:
        "Excellent matrix reasoning. Rule extraction stayed sharp and hidden-cell inference held under pressure.",
    };
  }

  if (accuracy >= 70) {
    return {
      eyebrow: "Matrix Complete",
      title: "Logic Grid Results",
      summary:
        "Solid deduction. Structured grid reads are stabilizing and matrix logic is becoming cleaner.",
    };
  }

  if (correctAnswers > 0) {
    return {
      eyebrow: "Matrix Complete",
      title: "Logic Grid Results",
      summary:
        "Partial progress. Keep refining matrix rule extraction and hidden-cell inference.",
    };
  }

  return {
    eyebrow: "Matrix Complete",
    title: "Logic Grid Results",
    summary:
      "Matrix timed out. Rebuild rule reading from the grid structure and simplify deduction under pressure.",
  };
};

const buildRuleShiftResultsCopy = ({
  accuracy = 0,
  correctAnswers = 0,
} = {}) => {
  if (accuracy >= 90) {
    return {
      eyebrow: "Shift Complete",
      title: "Rule Shift Results",
      summary:
        "Excellent transition control. Rule A and Rule B stayed sharply separated under pressure.",
    };
  }

  if (accuracy >= 70) {
    return {
      eyebrow: "Shift Complete",
      title: "Rule Shift Results",
      summary:
        "Strong rule tracking. The arithmetic shift stayed readable and your sequence logic remained clean.",
    };
  }

  if (correctAnswers > 0) {
    return {
      eyebrow: "Shift Complete",
      title: "Rule Shift Results",
      summary:
        "Partial progress. Keep tightening the transition point and the arithmetic handoff.",
    };
  }

  return {
    eyebrow: "Shift Complete",
    title: "Rule Shift Results",
    summary:
      "Shift timed out. Rebuild the sequence from Rule A and watch the transition into Rule B.",
  };
};

const buildLogicGateResultsCopy = ({
  accuracy = 0,
  correctAnswers = 0,
} = {}) => {

  if (accuracy >= 90) {
    return {
      eyebrow: "Circuit Complete",
      title: "Logic Gate Results",
      summary:
        "Excellent signal control. Binary reasoning stayed precise through the circuit flow.",
    };
  }

  if (accuracy >= 70) {
    return {
      eyebrow: "Circuit Complete",
      title: "Logic Gate Results",
      summary:
        "Solid reasoning. Signal resolution is stabilizing and gate recognition is improving.",
    };
  }

  if (correctAnswers > 0) {
    return {
      eyebrow: "Circuit Complete",
      title: "Logic Gate Results",
      summary: "Partial progress. Keep refining your binary gate recognition.",
    };
  }

  return {
    eyebrow: "Circuit Complete",
    title: "Logic Gate Results",
    summary:
      "Circuit timed out. Rebuild the signal path and focus on the gate relationship.",
  };
};

const formatSignalPathRuleTypeLabel = (ruleType = "unknown") => {
  const normalizedRuleType =
    typeof ruleType === "string" ? ruleType.trim() : "";

  if (!normalizedRuleType) {
    return "Unknown";
  }

  return normalizedRuleType
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const buildSignalPathResultsCopy = ({
  accuracy = 0,
  correctAnswers = 0,
  ruleType = "unknown",
} = {}) => {
  const ruleTypeLabel = formatSignalPathRuleTypeLabel(ruleType);

  if (accuracy >= 90) {
    return {
      eyebrow: "Route Complete",
      title: "Signal Path Results",
      summary:
        "Excellent routing discipline. Constraint logic stayed sharp and your signal path remained stable under pressure.",
      detail: `Active Rule: ${ruleTypeLabel}`,
    };
  }

  if (accuracy >= 70) {
    return {
      eyebrow: "Route Complete",
      title: "Signal Path Results",
      summary:
        "Solid path control. Routing logic is stabilizing and signal selection is becoming more reliable.",
      detail: `Active Rule: ${ruleTypeLabel}`,
    };
  }

  if (correctAnswers > 0) {
    return {
      eyebrow: "Route Complete",
      title: "Signal Path Results",
      summary:
        "Partial progress. Keep refining your route reading and constraint discipline.",
      detail: `Active Rule: ${ruleTypeLabel}`,
    };
  }

  return {
    eyebrow: "Route Complete",
    title: "Signal Path Results",
    summary:
      "Route timed out. Rebuild the signal path and focus on the active routing rule.",
    detail: `Active Rule: ${ruleTypeLabel}`,
  };
};

// const DEFAULT_PUZZLE_TYPE = PUZZLE_TYPES.PATTERN_RUSH;
const DEFAULT_PUZZLE_TYPE = PUZZLE_TYPES.SEQUENCE_SPRINT;
const RULE_SHIFT_PUZZLE_TYPE = "rule_shift";
const RULE_SHIFT_PUZZLE_META = {
  label: "Rule Shift",
  shortLabel: "Shift",
  description: "Solve the arithmetic sequence, then catch the rule transition.",
  color: "violet",
  cognitiveSkills: ["Arithmetic Reasoning", "Rule Switching", "Pattern Adaptation"],
  icon: "shuffle",
};

const terminalAnalysisToneMap = {
  pattern_rush: ["text-cyan-100/84", "text-cyan-100/76", "text-fuchsia-200/78"],
  sequence_sprint: ["text-fuchsia-100/84", "text-fuchsia-100/76", "text-cyan-100/78"],
  grid_recall: ["text-emerald-100/84", "text-cyan-100/76", "text-emerald-200/78"],
  logic_grid: ["text-cyan-100/84", "text-violet-100/76", "text-fuchsia-200/78"],
  rule_shift: ["text-cyan-100/84", "text-violet-100/76", "text-amber-200/78"],
  logic_gate: ["text-amber-100/84", "text-cyan-100/76", "text-fuchsia-200/78"],
  signal_path: ["text-violet-100/84", "text-cyan-100/76", "text-violet-200/78"],
};

const terminalSignalProfileLabels = {
  pattern_rush: "VISUAL SIGNAL",
  sequence_sprint: "MOMENTUM FLOW",
  grid_recall: "MEMORY TRACE",
  logic_grid: "MATRIX INFERENCE",
  rule_shift: "STRUCTURED DEDUCTION",
  logic_gate: "LOGIC CIRCUIT",
  signal_path: "ROUTING DISCIPLINE",
};

function formatTerminalFallbackLabel(value, fallback = "UNCLASSIFIED") {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized) {
    return fallback;
  }

  return normalized.replace(/_/g, " ").toUpperCase();
}

function formatTerminalIdentityLabel(cognitiveIdentityLabel, resultsCopy) {
  return formatTerminalFallbackLabel(
    cognitiveIdentityLabel,
    formatTerminalFallbackLabel(
      resultsCopy?.title || resultsCopy?.eyebrow,
      "UNCLASSIFIED",
    ),
  );
}

function buildTerminalSignalProfileLabel(
  activePuzzleType,
  activeAnalysisProfile,
  resultsCopy,
) {
  const familyLabel =
    terminalSignalProfileLabels[activePuzzleType] || "ADAPTIVE SIGNAL";
  const profileTone = formatTerminalFallbackLabel(
    activeAnalysisProfile?.tone,
    "CALIBRATED",
  );
  const resultTag = formatTerminalFallbackLabel(
    resultsCopy?.eyebrow,
    "SESSION LOCK",
  );

  return `${familyLabel} · ${profileTone} · ${resultTag}`;
}

function terminalizeAnalysisLine(line) {
  const normalized = typeof line === "string" ? line.trim() : "";

  if (!normalized) {
    return "SYSTEM STABLE";
  }

  const collapsed = normalized.replace(/\s+/g, " ");
  const words = collapsed.split(" ");

  if (words.length <= 1) {
    return collapsed.toUpperCase();
  }

  const value = words.pop();
  return `${words.join(" ").toUpperCase()}: ${value.toUpperCase()}`;
}

function buildTerminalAnalysisLines(activePuzzleType, activeAnalysisProfile) {
  const sourceLines = Array.isArray(activeAnalysisProfile?.analysisLines)
    ? activeAnalysisProfile.analysisLines.slice(0, 3)
    : [];
  const toneSet =
    terminalAnalysisToneMap[activePuzzleType] || terminalAnalysisToneMap.pattern_rush;

  return sourceLines.map((line, index) => ({
    text: terminalizeAnalysisLine(line),
    tone: toneSet[index] || toneSet[toneSet.length - 1],
    delayMs: index * 180,
    isFinal: index === sourceLines.length - 1,
  }));
}

function buildPhantomTerminalLines({
  cognitiveIdentityLabel,
  activePuzzleType,
  activeAnalysisProfile,
  resultsCopy,
}) {
  return [
    { text: "ANALYSIS COMPLETE", tone: "text-cyan-100/82", delayMs: 0 },
    {
      text: `IDENTITY LOCK: ${formatTerminalIdentityLabel(
        cognitiveIdentityLabel,
        resultsCopy,
      )}`,
      tone: "text-fuchsia-100/80",
      delayMs: 220,
    },
    {
      text: `SIGNAL PROFILE: ${buildTerminalSignalProfileLabel(
        activePuzzleType,
        activeAnalysisProfile,
        resultsCopy,
      )}`,
      tone: "text-cyan-100/76",
      delayMs: 440,
    },
    { text: "AWAITING NEXT INPUT", tone: "text-white/78", delayMs: 660 },
  ];
}

function Arena({ theme }) {
  // Navigation/session context
  const isCyber = theme === "cyber";

  const location = useLocation();
  const recommendedSession = location.state?.recommendedSession ?? null;
  const recommendedSessionKey = recommendedSession
    ? `${recommendedSession.source || "direct"}-${recommendedSession.adaptiveState || "steady"}-${recommendedSession.recommendation || ""}`
    : null;
  const initialTargetDifficulty =
    adaptiveStateToDifficultyMap[recommendedSession?.adaptiveState] || "medium";
  const recommendedOpeningDifficulty =
    recommendedDifficultyLabels[initialTargetDifficulty] || "MEDIUM";

  const routePuzzleType = location.state?.puzzleType;
  const initialPuzzleType =
    Object.values(PUZZLE_TYPES).includes(routePuzzleType) ||
    routePuzzleType === RULE_SHIFT_PUZZLE_TYPE
      ? routePuzzleType
      : DEFAULT_PUZZLE_TYPE;

  const recommendedSessionReason =
    recommendedSessionReasonMap[recommendedSession?.adaptiveState] ||
    recommendedSessionReasonMap.default;
  const initialAdaptiveReason = recommendedSession
    ? "Session initialized from adaptive coaching recommendation."
    : "Not enough live data yet.";
  const recommendedSessionTone =
    recommendedSessionStyles[recommendedSession?.adaptiveState] ||
    recommendedSessionStyles.default;
  const {
    SHOW_ANSWERS,
    SHOW_PATTERN_RULE,
    SHOW_PATTERN_RUSH_ANSWERS,
    SHOW_SEQUENCE_SPRINT_ANSWERS,
    SHOW_PUZZLE_DEBUG_META,
    SHOW_GRID_RECALL_ANSWERS,
    SHOW_LOGIC_GATE_ANSWERS,
    SHOW_SIGNAL_PATH_ANSWERS,
  } = PUZZLE_DEV_FLAGS;
  const initialPuzzle = useMemo(() => {
    if (initialPuzzleType === PUZZLE_TYPES.SEQUENCE_SPRINT) {
      return getRandomSequenceSprintPuzzle(initialTargetDifficulty);
    }
    if (initialPuzzleType === PUZZLE_TYPES.GRID_RECALL) {
      return getRandomGridRecallPuzzle(initialTargetDifficulty);
    }
    if (initialPuzzleType === PUZZLE_TYPES.LOGIC_GRID) {
      return getRandomLogicGridPuzzle(initialTargetDifficulty);
    }
    if (initialPuzzleType === RULE_SHIFT_PUZZLE_TYPE) {
      return getRandomRuleShiftPuzzle(initialTargetDifficulty);
    }
    if (initialPuzzleType === PUZZLE_TYPES.LOGIC_GATE) {
      return getRandomLogicGatePuzzle(initialTargetDifficulty);
    }
    if (initialPuzzleType === PUZZLE_TYPES.SIGNAL_PATH) {
      return getRandomSignalPathPuzzle(initialTargetDifficulty);
    }
    return getRandomPuzzle(initialTargetDifficulty);
  }, [initialTargetDifficulty, initialPuzzleType]);

  // Core game state
  const [activePuzzleType, setActivePuzzleType] = useState(initialPuzzleType);
  const [currentPuzzle, setCurrentPuzzle] = useState(initialPuzzle);
  const [sequenceSprintPuzzle, setSequenceSprintPuzzle] = useState(() =>
    getRandomSequenceSprintPuzzle(initialTargetDifficulty),
  );
  const [sequenceSprintSelectedAnswer, setSequenceSprintSelectedAnswer] =
    useState(null);
  const [sequenceSprintSolvedCount, setSequenceSprintSolvedCount] = useState(0);
  const [ruleShiftPuzzle, setRuleShiftPuzzle] = useState(() =>
    initialPuzzleType === RULE_SHIFT_PUZZLE_TYPE
      ? initialPuzzle
      : getRandomRuleShiftPuzzle(initialTargetDifficulty),
  );
  const [ruleShiftSelectedAnswer, setRuleShiftSelectedAnswer] = useState(null);
  const [gridRecallPuzzle, setGridRecallPuzzle] = useState(() =>
    getRandomGridRecallPuzzle(initialTargetDifficulty),
  );
  const [logicGridPuzzle, setLogicGridPuzzle] = useState(() =>
    initialPuzzleType === PUZZLE_TYPES.LOGIC_GRID
      ? initialPuzzle
      : getRandomLogicGridPuzzle(initialTargetDifficulty),
  );
  const [logicGatePuzzle, setLogicGatePuzzle] = useState(() =>
    initialPuzzleType === PUZZLE_TYPES.LOGIC_GATE
      ? initialPuzzle
      : getRandomLogicGatePuzzle(initialTargetDifficulty),
  );
  const [signalPathPuzzle, setSignalPathPuzzle] = useState(() =>
    initialPuzzleType === PUZZLE_TYPES.SIGNAL_PATH
      ? initialPuzzle
      : getRandomSignalPathPuzzle(initialTargetDifficulty),
  );
  const [gridRecallPhase, setGridRecallPhase] = useState("memorize");
  const [recallPulse, setRecallPulse] = useState(false);
  const [score, setScore] = useState(0);
  const [baseScoreEarned, setBaseScoreEarned] = useState(0);
  const [comboBonusEarned, setComboBonusEarned] = useState(0);
  const [lastScoreGain, setLastScoreGain] = useState(null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalAnswers, setTotalAnswers] = useState(0);
  const [puzzlesSeen, setPuzzlesSeen] = useState(1);
  const [timeLeft, setTimeLeft] = useState(45);
  const [gameOver, setGameOver] = useState(false);
  const [showRecommendedBanner, setShowRecommendedBanner] = useState(
    Boolean(recommendedSession),
  );
  const [isBannerHiding, setIsBannerHiding] = useState(false);
  const [didBreakRecommendedAlignment, setDidBreakRecommendedAlignment] =
    useState(false);
  const [sessionOutcome, setSessionOutcome] = useState(null);
  const [cognitiveIdentity, setCognitiveIdentity] = useState(null);
  const [showPuzzleTransitionFx, setShowPuzzleTransitionFx] = useState(false);
  const [showSolveFx, setShowSolveFx] = useState(false);
  const [isLightningActive, setIsLightningActive] = useState(false);
  const [matrixOverdrive, setMatrixOverdrive] = useState(false);
  const [showNeuralProfile, setShowNeuralProfile] = useState(false);
  const [neuralScanActive, setNeuralScanActive] = useState(false);
  const [neuralScanCompleted, setNeuralScanCompleted] = useState(false);
  const [identityLockVisible, setIdentityLockVisible] = useState(false);
  const [analysisLineCount, setAnalysisLineCount] = useState(0);
  const [showPerformanceStrip, setShowPerformanceStrip] = useState(false);
  const [showScoreBreakdown, setShowScoreBreakdown] = useState(false);
  const [showActionButton, setShowActionButton] = useState(false);
  const [terminalRevealComplete, setTerminalRevealComplete] = useState(false);
  const [scoreDisplay, setScoreDisplay] = useState(0);
  const [baseScoreDisplay, setBaseScoreDisplay] = useState(0);
  const [comboScoreDisplay, setComboScoreDisplay] = useState(0);

  const [liveAdaptiveDifficulty, setLiveAdaptiveDifficulty] = useState({
    state: recommendedSession?.adaptiveState || "steady",
    targetDifficulty: initialTargetDifficulty,
    confidence: "low",
    reason: initialAdaptiveReason,
  });
  const [recentAnswerHistory, setRecentAnswerHistory] = useState([]);
  const [adaptiveShiftMessage, setAdaptiveShiftMessage] = useState("");
  const gameOverRef = useRef(gameOver);
  const isTransitioningRef = useRef(false);
  const adaptiveShiftTimeoutRef = useRef(null);
  const feedbackTimeoutRef = useRef(null);
  const lightningTimeoutRef = useRef(null);
  const recommendedBannerHideTimeoutRef = useRef(null);
  const recommendedBannerRemoveTimeoutRef = useRef(null);
  const hasHandledRecommendedSessionRef = useRef(false);
  const previousRecommendedSessionKeyRef = useRef(null);
  const puzzleTransitionFxTimeoutRef = useRef(null);
  const solveFxTimeoutRef = useRef(null);
  const previousTargetDifficultyRef = useRef(
    liveAdaptiveDifficulty.targetDifficulty,
  );
  const hasRecordedSessionRef = useRef(false);
  const activePuzzle =
    activePuzzleType === PUZZLE_TYPES.SEQUENCE_SPRINT
      ? sequenceSprintPuzzle
      : activePuzzleType === PUZZLE_TYPES.GRID_RECALL
        ? gridRecallPuzzle
        : activePuzzleType === PUZZLE_TYPES.LOGIC_GRID
          ? logicGridPuzzle
          : activePuzzleType === RULE_SHIFT_PUZZLE_TYPE
            ? ruleShiftPuzzle
        : activePuzzleType === PUZZLE_TYPES.LOGIC_GATE
          ? logicGatePuzzle
          : activePuzzleType === PUZZLE_TYPES.SIGNAL_PATH
            ? signalPathPuzzle
            : currentPuzzle;
  const isRuleShiftPuzzle = activePuzzleType === RULE_SHIFT_PUZZLE_TYPE;
  const activePuzzleMeta = isRuleShiftPuzzle
    ? RULE_SHIFT_PUZZLE_META
    : getPuzzleTypeMetadata(activePuzzleType);
  const puzzleFeedTitle =
    activePuzzleType === PUZZLE_TYPES.SEQUENCE_SPRINT
      ? "Sequence Sprint"
      : activePuzzleType === PUZZLE_TYPES.GRID_RECALL
        ? "Grid Recall"
        : activePuzzleType === PUZZLE_TYPES.LOGIC_GRID
          ? "Logic Grid"
          : isRuleShiftPuzzle
            ? "Rule Shift"
            : activePuzzleType === PUZZLE_TYPES.LOGIC_GATE
              ? "Logic Gate"
              : activePuzzleType === PUZZLE_TYPES.SIGNAL_PATH
                ? "Signal Path"
                : activePuzzleType === PUZZLE_TYPES.PATTERN_RUSH
                  ? currentPuzzle?.title || activePuzzleMeta.label || "Pattern Rush"
                  : activePuzzleMeta.label || "Arena Challenge";
  const currentPuzzleDifficulty =
    activePuzzle?.difficulty || activePuzzle?.difficultyBucket || "medium";
  const nextTargetDifficulty =
    liveAdaptiveDifficulty.targetDifficulty?.toUpperCase() || "MEDIUM";
  const currentPuzzleDifficultyLabel = currentPuzzleDifficulty.toUpperCase();
  const adaptiveStateLabel =
    adaptiveStateLabelMap[liveAdaptiveDifficulty.state] ?? "Stable Load";

  const adaptiveStateColor =
    adaptiveStateColorMap[liveAdaptiveDifficulty.state] ?? "text-cyan-300";

  const adaptiveConfidenceColor =
    adaptiveConfidenceColorMap[liveAdaptiveDifficulty.confidence] ??
    "text-slate-300";

  const adaptiveCoachingMessage =
    adaptiveCoachingMessageMap[liveAdaptiveDifficulty.state] ??
    "Stay consistent and keep building momentum.";
  const activeAnalysisProfile =
    analysisProfileMap[activePuzzleType] || analysisProfileMap.pattern_rush;
  const activeAnalysisAnimationProfile =
    analysisAnimationProfileMap[activeAnalysisProfile.animationStyle] ||
    analysisAnimationProfileMap.steady_scan;

  const matrixRainMode = useMemo(() => {
    if (gameOver) return "victory";
    if (showSolveFx) return "success";
    if (showPuzzleTransitionFx) return "transition";
    return "idle";
  }, [gameOver, showPuzzleTransitionFx, showSolveFx]);

  const isRecommendedSessionAligned =
    Boolean(recommendedSession?.adaptiveState) &&
    recommendedSession.adaptiveState === liveAdaptiveDifficulty.state;

  const recommendedSessionAlignmentLabel = !recommendedSession?.adaptiveState
    ? "No recommended session active"
    : didBreakRecommendedAlignment || !isRecommendedSessionAligned
      ? "Shifted away from recommended training state"
      : "Aligned with recommended training state";

  const recommendedSessionAlignmentTone = !recommendedSession?.adaptiveState
    ? recommendedAlignmentToneMap.inactive
    : didBreakRecommendedAlignment || !isRecommendedSessionAligned
      ? recommendedAlignmentToneMap.shifted
      : recommendedAlignmentToneMap.aligned;

  const liveCoachingTone =
    liveCoachingToneMap[liveAdaptiveDifficulty.state] ||
    liveCoachingToneMap.default;

  const sequenceSprintPuzzleMetrics = useMemo(() => {
    if (activePuzzleType !== PUZZLE_TYPES.SEQUENCE_SPRINT) {
      return {};
    }

    return {
      sequenceLength: Array.isArray(activePuzzle?.sequence)
        ? activePuzzle.sequence.length
        : 0,
      ruleType: activePuzzle?.rule ?? null,
      optionCount: Array.isArray(activePuzzle?.options)
        ? activePuzzle.options.length
        : 0,
    };
  }, [activePuzzleType, activePuzzle]);

  const gridRecallPuzzleMetrics = useMemo(() => {
    if (activePuzzleType !== PUZZLE_TYPES.GRID_RECALL) {
      return {};
    }

    const baseMetrics = gridRecallPuzzle?.puzzleMetrics ?? {};
    const inferredOptionCount = Number.isInteger(baseMetrics.optionCount)
      ? baseMetrics.optionCount
      : Array.isArray(gridRecallPuzzle?.options)
        ? gridRecallPuzzle.options.length
        : 0;

    return {
      difficulty: gridRecallPuzzle?.difficulty || "medium",
      gridSignature: gridRecallPuzzle?.answer || null,
      gridSize: baseMetrics.gridSize || 3,
      activeNodes: baseMetrics.activeNodes || 0,
      optionCount: inferredOptionCount,
      decoyCount: Math.max(0, inferredOptionCount - 1),
    };
  }, [activePuzzleType, gridRecallPuzzle]);

  const logicGatePuzzleMetrics = useMemo(() => {
    if (activePuzzleType !== PUZZLE_TYPES.LOGIC_GATE) {
      return {};
    }

    return {
      difficulty: logicGatePuzzle?.difficulty || "medium",
      variant: logicGatePuzzle?.variant || "output",
      gate: logicGatePuzzle?.gate || null,
      expression: logicGatePuzzle?.expression || null,
      inputCount: Object.keys(logicGatePuzzle?.inputs ?? {}).length,
      optionCount: Array.isArray(logicGatePuzzle?.options)
        ? logicGatePuzzle.options.length
        : 0,
    };
  }, [activePuzzleType, logicGatePuzzle]);

  const logicGridPuzzleMetrics = useMemo(() => {
    if (activePuzzleType !== PUZZLE_TYPES.LOGIC_GRID) {
      return {};
    }

    const baseMeta = logicGridPuzzle?.meta ?? {};
    return {
      difficulty: logicGridPuzzle?.difficulty || "medium",
      ruleType: baseMeta.ruleType || null,
      gridSize: baseMeta.gridSize || null,
      ruleDescription: baseMeta.ruleDescription || null,
      sequenceSignature: baseMeta.sequenceSignature || logicGridPuzzle?.signature || null,
      optionCount: Array.isArray(logicGridPuzzle?.options) ? logicGridPuzzle.options.length : 0,
      missingIndex: logicGridPuzzle?.missingIndex ?? null,
    };
  }, [activePuzzleType, logicGridPuzzle]);

  const ruleShiftPuzzleMetrics = useMemo(() => {
    if (!isRuleShiftPuzzle) {
      return {};
    }

    return {
      difficulty: ruleShiftPuzzle?.difficulty || "medium",
      sequenceLength: Array.isArray(ruleShiftPuzzle?.sequence)
        ? ruleShiftPuzzle.sequence.length
        : 0,
      shiftIndex: Number.isInteger(ruleShiftPuzzle?.shiftIndex)
        ? ruleShiftPuzzle.shiftIndex
        : null,
      ruleA: ruleShiftPuzzle?.ruleA || null,
      ruleB: ruleShiftPuzzle?.ruleB || null,
      optionCount: Array.isArray(ruleShiftPuzzle?.options)
        ? ruleShiftPuzzle.options.length
        : 0,
    };
  }, [isRuleShiftPuzzle, ruleShiftPuzzle]);

  const signalPathPuzzleMetrics = useMemo(() => {
    if (activePuzzleType !== PUZZLE_TYPES.SIGNAL_PATH) {
      return {};
    }

    const baseMetrics = signalPathPuzzle?.puzzleMetrics ?? {};
    return {
      difficulty: signalPathPuzzle?.difficulty || "medium",
      ruleType: baseMetrics.ruleType || signalPathPuzzle?.ruleType || null,
      nodeCount:
        baseMetrics.nodeCount ??
        (Array.isArray(signalPathPuzzle?.nodes) ? signalPathPuzzle.nodes.length : 0),
      optionCount:
        baseMetrics.optionCount ??
        (Array.isArray(signalPathPuzzle?.options) ? signalPathPuzzle.options.length : 0),
      pathLength: baseMetrics.pathLength ?? null,
      correctPathId: baseMetrics.correctPathId ?? null,
      pathCount: Array.isArray(signalPathPuzzle?.paths)
        ? signalPathPuzzle.paths.length
        : 0,
    };
  }, [activePuzzleType, signalPathPuzzle]);

  const patternRushPuzzleMetrics = useMemo(() => {
    if (activePuzzleType !== PUZZLE_TYPES.PATTERN_RUSH) {
      return {};
    }

    const baseMetrics = currentPuzzle?.puzzleMetrics ?? {};
    const choiceCount = Number.isInteger(baseMetrics.choiceCount)
      ? baseMetrics.choiceCount
      : Array.isArray(currentPuzzle?.choices)
        ? currentPuzzle.choices.length
        : Array.isArray(currentPuzzle?.options)
          ? currentPuzzle.options.length
          : 0;

    return {
      difficulty: currentPuzzle?.difficulty || currentPuzzle?.difficultyBucket || "medium",
      patternType:
        baseMetrics.patternType ?? currentPuzzle?.meta?.patternType ?? currentPuzzle?.patternType ?? null,
      ruleDescription:
        baseMetrics.ruleDescription ?? currentPuzzle?.meta?.ruleDescription ?? currentPuzzle?.ruleDescription ?? null,
      sequenceSignature:
        baseMetrics.sequenceSignature ??
        currentPuzzle?.meta?.sequenceSignature ??
        currentPuzzle?.sequenceSignature ??
        currentPuzzle?.signature ??
        null,
      choiceCount,
    };
  }, [activePuzzleType, currentPuzzle]);

  const rawGridRecallGridSize =
    gridRecallPuzzle?.puzzleMetrics?.gridSize ||
    Math.sqrt(gridRecallPuzzle?.answer?.length || 9);
  const gridRecallGridSize =
    Number.isFinite(rawGridRecallGridSize) && rawGridRecallGridSize > 0
      ? Math.max(1, Math.round(rawGridRecallGridSize))
      : 3;

  const logicGridDebugInfo = useMemo(() => {
    if (activePuzzleType !== PUZZLE_TYPES.LOGIC_GRID) {
      return null;
    }

    return {
      id: logicGridPuzzle?.id ?? "Unknown",
      answer: logicGridPuzzle?.answer ?? "Unknown",
      ruleType: logicGridPuzzle?.meta?.ruleType ?? "Unknown",
      gridSize: logicGridPuzzle?.meta?.gridSize ?? "Unknown",
      missingIndex: logicGridPuzzle?.missingIndex ?? null,
    };
  }, [activePuzzleType, logicGridPuzzle]);

  const ruleShiftDebugInfo = useMemo(() => {
    if (!isRuleShiftPuzzle) {
      return null;
    }

    return {
      id: ruleShiftPuzzle?.id ?? "Unknown",
      answer: ruleShiftPuzzle?.answer ?? "Unknown",
      shiftIndex: ruleShiftPuzzle?.shiftIndex ?? null,
      ruleA: ruleShiftPuzzle?.ruleA ?? "Unknown",
      ruleB: ruleShiftPuzzle?.ruleB ?? "Unknown",
    };
  }, [isRuleShiftPuzzle, ruleShiftPuzzle]);

  const patternDebugInfo = useMemo(() => {
    if (activePuzzleType === PUZZLE_TYPES.LOGIC_GRID && logicGridDebugInfo) {
      return {
        id: logicGridDebugInfo.id,
        difficulty:
          logicGridPuzzle?.difficulty ?? logicGridPuzzle?.difficultyBucket ?? "Unknown",
        answer: logicGridDebugInfo.answer,
        patternType: logicGridDebugInfo.ruleType,
        ruleDescription:
          logicGridPuzzle?.meta?.ruleDescription ?? logicGridPuzzle?.ruleDescription ?? "Unknown",
      };
    }

    return {
      id: currentPuzzle?.id ?? "Unknown",
      difficulty:
        currentPuzzle?.difficulty ??
        currentPuzzle?.difficultyBucket ??
        "Unknown",
      answer: currentPuzzle?.correctAnswer ?? "Unknown",
      patternType:
        currentPuzzle?.meta?.patternType ?? currentPuzzle?.patternType ?? "Unknown",
      ruleDescription:
        currentPuzzle?.meta?.ruleDescription ?? currentPuzzle?.ruleDescription ?? "Unknown",
    };
  }, [activePuzzleType, currentPuzzle, logicGridDebugInfo, logicGridPuzzle]);

  const sequenceDebugInfo = useMemo(() => {
    const sequenceArray = Array.isArray(sequenceSprintPuzzle?.sequence)
      ? sequenceSprintPuzzle.sequence
      : [];
    return {
      id: sequenceSprintPuzzle?.id ?? "Unknown",
      answer: sequenceSprintPuzzle?.answer ?? "Unknown",
      rule: sequenceSprintPuzzle?.rule ?? "Unknown",
      length: sequenceArray.length,
    };
  }, [sequenceSprintPuzzle]);

  const gridRecallDebugInfo = useMemo(() => {
    return {
      id: gridRecallPuzzle?.id ?? "Unknown",
      answer: gridRecallPuzzle?.answer ?? "Unknown",
      difficulty: gridRecallPuzzle?.difficulty ?? "Unknown",
    };
  }, [gridRecallPuzzle]);

  const signalPathDebugInfo = useMemo(() => {
    return {
      id: signalPathPuzzle?.id ?? "Unknown",
      answer: signalPathPuzzle?.answer ?? "Unknown",
      ruleType: signalPathPuzzle?.ruleType ?? "Unknown",
      rule: signalPathPuzzle?.rule ?? "Unknown",
      difficulty: signalPathPuzzle?.difficulty ?? "Unknown",
      nodeCount: Array.isArray(signalPathPuzzle?.nodes)
        ? signalPathPuzzle.nodes.length
        : 0,
      pathCount: Array.isArray(signalPathPuzzle?.paths)
        ? signalPathPuzzle.paths.length
        : 0,
    };
  }, [signalPathPuzzle]);

  const shouldShowPatternDebug =
    SHOW_ANSWERS || SHOW_PATTERN_RUSH_ANSWERS || SHOW_PATTERN_RULE || SHOW_PUZZLE_DEBUG_META;
  const shouldShowSequenceDebug =
    SHOW_SEQUENCE_SPRINT_ANSWERS || SHOW_PUZZLE_DEBUG_META;
  const shouldShowGridRecallDebug =
    SHOW_GRID_RECALL_ANSWERS || SHOW_PUZZLE_DEBUG_META;
  const shouldShowSignalPathDebug =
    SHOW_SIGNAL_PATH_ANSWERS || SHOW_PUZZLE_DEBUG_META;
  const shouldShowLogicGridDebug = SHOW_ANSWERS || SHOW_PUZZLE_DEBUG_META;

  const sequenceTotalCount = SEQUENCE_SPRINT_TOTAL_PROBLEMS;
  const sequenceSolvedCount = sequenceSprintSolvedCount;
  const sequenceVisibleSolvedCount = Math.min(
    sequenceSolvedCount,
    sequenceTotalCount,
  );
  const sequenceOverflowSolvedCount = Math.max(
    0,
    sequenceSolvedCount - sequenceTotalCount,
  );
  const sequenceSprintComboMultiplier =
    getSequenceSprintOverflowComboMultiplier(sequenceOverflowSolvedCount);
  const sequenceSprintComboLabel =
    sequenceOverflowSolvedCount > 0
      ? `Finish-line x${sequenceSprintComboMultiplier}`
      : sequenceVisibleSolvedCount >= sequenceTotalCount
        ? "Finish line cleared"
        : null;
  const sequenceSprintProgress = getSequenceSprintProgressPercent({
    solvedCount: sequenceVisibleSolvedCount,
    totalCount: sequenceTotalCount,
  });
  const sequenceSprintPhase = getSequenceSprintPhase(sequenceSprintProgress);
  const sequenceSprintRunnerFx =
    getSequenceSprintRunnerClasses(sequenceSprintPhase);

  const isSequenceSprintSession =
    activePuzzleType === PUZZLE_TYPES.SEQUENCE_SPRINT;

  const isGridRecallSession = activePuzzleType === PUZZLE_TYPES.GRID_RECALL;

  const sequenceSprintSummary = useMemo(() => {
    if (!isSequenceSprintSession) {
      return null;
    }

    return buildAccuracySummary({
      correctAnswers,
      attemptedAnswers: totalAnswers,
      totalPuzzles: sequenceTotalCount,
      decimals: 0,
    });
  }, [
    isSequenceSprintSession,
    correctAnswers,
    totalAnswers,
    sequenceTotalCount,
  ]);

  const gridRecallSummary = useMemo(() => {
    if (!isGridRecallSession) {
      return null;
    }

    return {
      correctAnswers,
      attemptedAnswers: totalAnswers,
    };
  }, [isGridRecallSession, correctAnswers, totalAnswers]);

  const gridRecallAccuracy = useMemo(() => {
    if (!gridRecallSummary || !gridRecallSummary.attemptedAnswers) {
      return 0;
    }
    return Math.round(
      (gridRecallSummary.correctAnswers /
        gridRecallSummary.attemptedAnswers) *
        100,
    );
  }, [gridRecallSummary]);

  const liveCoachingPressureClass =
    streak >= 6
      ? "shadow-[0_0_32px_rgba(217,70,239,0.22)] scale-[1.01]"
      : streak >= 4
        ? "shadow-[0_0_22px_rgba(34,211,238,0.14)] scale-[1.005]"
        : streak >= 2
          ? "shadow-[0_0_14px_rgba(34,211,238,0.08)]"
          : "";

  function getNextPuzzleByType(puzzleType, difficulty) {
    switch (puzzleType) {
      case PUZZLE_TYPES.SEQUENCE_SPRINT:
        return getRandomSequenceSprintPuzzle(difficulty);
      case PUZZLE_TYPES.GRID_RECALL:
        return getRandomGridRecallPuzzle(difficulty);
      case PUZZLE_TYPES.LOGIC_GRID:
        return getRandomLogicGridPuzzle(difficulty);
      case RULE_SHIFT_PUZZLE_TYPE:
        return getRandomRuleShiftPuzzle(difficulty);
      case PUZZLE_TYPES.LOGIC_GATE:
        return getRandomLogicGatePuzzle(difficulty);
      case PUZZLE_TYPES.SIGNAL_PATH:
        return getRandomSignalPathPuzzle(difficulty);
      case PUZZLE_TYPES.PATTERN_RUSH:
      default:
        return getRandomPuzzle(difficulty);
    }
  }

  function dismissRecommendedBanner() {
    if (!recommendedSession || isBannerHiding || !showRecommendedBanner) {
      return;
    }

    hasHandledRecommendedSessionRef.current = true;

    if (recommendedBannerHideTimeoutRef.current) {
      clearTimeout(recommendedBannerHideTimeoutRef.current);
      recommendedBannerHideTimeoutRef.current = null;
    }
    if (recommendedBannerRemoveTimeoutRef.current) {
      clearTimeout(recommendedBannerRemoveTimeoutRef.current);
      recommendedBannerRemoveTimeoutRef.current = null;
    }

    setIsBannerHiding(true);
    recommendedBannerRemoveTimeoutRef.current = setTimeout(() => {
      setShowRecommendedBanner(false);
      recommendedBannerRemoveTimeoutRef.current = null;
    }, 500);
  }

  // Effects
  useEffect(() => {
    gameOverRef.current = gameOver;
  }, [gameOver]);

  useEffect(() => {
    return () => {
      if (adaptiveShiftTimeoutRef.current) {
        clearTimeout(adaptiveShiftTimeoutRef.current);
      }
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
      if (recommendedBannerHideTimeoutRef.current) {
        clearTimeout(recommendedBannerHideTimeoutRef.current);
      }
      if (recommendedBannerRemoveTimeoutRef.current) {
        clearTimeout(recommendedBannerRemoveTimeoutRef.current);
      }
      if (puzzleTransitionFxTimeoutRef.current) {
        clearTimeout(puzzleTransitionFxTimeoutRef.current);
      }
      if (solveFxTimeoutRef.current) {
        clearTimeout(solveFxTimeoutRef.current);
      }
      if (lightningTimeoutRef.current) {
        clearTimeout(lightningTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (gameOver) {
      return;
    }
    const showTimer = setTimeout(() => {
      setShowPuzzleTransitionFx(true);
    }, 0);
    if (puzzleTransitionFxTimeoutRef.current) {
      clearTimeout(puzzleTransitionFxTimeoutRef.current);
    }
    puzzleTransitionFxTimeoutRef.current = setTimeout(() => {
      setShowPuzzleTransitionFx(false);
    }, 720);
    return () => clearTimeout(showTimer);
  }, [puzzlesSeen, gameOver]);

  useEffect(() => {
    if (!gameOver || hasRecordedSessionRef.current) return;

    const accuracyValue =
      totalAnswers === 0
        ? 0
        : Math.round((correctAnswers / totalAnswers) * 100);

    const sequenceSprintOverrides =
      isSequenceSprintSession && sequenceSprintSummary
        ? {
            accuracy: sequenceSprintSummary.accuracy,
            puzzlesCorrect: sequenceSprintSummary.correctAnswers,
            puzzlesAttempted: sequenceSprintSummary.attemptedAnswers,
            unanswered: sequenceSprintSummary.unanswered,
            wrongAnswers: sequenceSprintSummary.wrongAnswers,
          }
        : {};

    const computedFinalSessionData = {
      score,
      accuracy: accuracyValue,
      bestStreak,
      puzzlesSeen,
      correctAnswers,
      puzzlesAttempted: totalAnswers,
      puzzlesCorrect: correctAnswers,
      recentAnswerHistory,
      timestamp: Date.now(),
      liveAdaptiveDifficulty,
      isRecommendedSessionAligned,
      recommendedSessionAlignmentLabel,
      didBreakRecommendedAlignment,
      puzzleType: activePuzzleType,
      puzzleMetrics:
        activePuzzleType === PUZZLE_TYPES.SEQUENCE_SPRINT
          ? sequenceSprintPuzzleMetrics
          : activePuzzleType === PUZZLE_TYPES.GRID_RECALL
            ? gridRecallPuzzleMetrics
            : activePuzzleType === PUZZLE_TYPES.LOGIC_GRID
              ? logicGridPuzzleMetrics
              : activePuzzleType === RULE_SHIFT_PUZZLE_TYPE
                ? ruleShiftPuzzleMetrics
              : activePuzzleType === PUZZLE_TYPES.LOGIC_GATE
                ? logicGatePuzzleMetrics
                : activePuzzleType === PUZZLE_TYPES.SIGNAL_PATH
                  ? signalPathPuzzleMetrics
                  : activePuzzleType === PUZZLE_TYPES.PATTERN_RUSH
                    ? patternRushPuzzleMetrics
                    : {},
      ...sequenceSprintOverrides,
    };

    const outcomeTimer = setTimeout(() => {
      const computedFinalSessionDataWithLatest = {
        ...computedFinalSessionData,
        score,
        totalScore: score,
        baseScoreEarned,
        comboBonusEarned,
        roundScoreEarned: baseScoreEarned + comboBonusEarned,
        comboMultiplier: lastScoreGain?.comboMultiplier ?? 1,
        lastScoreGain,
        accuracy: accuracyValue,
        bestStreak,
        puzzlesSeen,
        correctAnswers,
        puzzlesAttempted: totalAnswers,
        puzzlesCorrect: correctAnswers,
        recentAnswerHistory,
        liveAdaptiveDifficulty,
        puzzleType: activePuzzleType,
        puzzleMetrics:
          activePuzzleType === PUZZLE_TYPES.SEQUENCE_SPRINT
            ? sequenceSprintPuzzleMetrics
            : activePuzzleType === PUZZLE_TYPES.GRID_RECALL
              ? gridRecallPuzzleMetrics
              : activePuzzleType === PUZZLE_TYPES.LOGIC_GRID
                ? logicGridPuzzleMetrics
                : activePuzzleType === RULE_SHIFT_PUZZLE_TYPE
                  ? ruleShiftPuzzleMetrics
                : activePuzzleType === PUZZLE_TYPES.LOGIC_GATE
                  ? logicGatePuzzleMetrics
                  : activePuzzleType === PUZZLE_TYPES.SIGNAL_PATH
                    ? signalPathPuzzleMetrics
                    : activePuzzleType === PUZZLE_TYPES.PATTERN_RUSH
                      ? patternRushPuzzleMetrics
                      : {},
        ...sequenceSprintOverrides,
      };

      const evaluatedOutcome = evaluateSessionOutcome(
        computedFinalSessionDataWithLatest,
      );
      setSessionOutcome(evaluatedOutcome);
      const identity = classifyCognitiveIdentity(
        computedFinalSessionDataWithLatest,
      );
      setCognitiveIdentity(identity);

      recordSession({
        ...computedFinalSessionDataWithLatest,
        sessionOutcome: evaluatedOutcome,
        cognitiveIdentity: identity,
      });
    }, 0);
    hasRecordedSessionRef.current = true;

    return () => clearTimeout(outcomeTimer);
  }, [
    gameOver,
    totalAnswers,
    correctAnswers,
    score,
    baseScoreEarned,
    comboBonusEarned,
    lastScoreGain,
    bestStreak,
    puzzlesSeen,
    recentAnswerHistory,
    liveAdaptiveDifficulty,
    isRecommendedSessionAligned,
    recommendedSessionAlignmentLabel,
    didBreakRecommendedAlignment,
    activePuzzleType,
    sequenceSprintPuzzleMetrics,
    gridRecallPuzzleMetrics,
    logicGridPuzzleMetrics,
    logicGatePuzzleMetrics,
    signalPathPuzzleMetrics,
    patternRushPuzzleMetrics,
    ruleShiftPuzzleMetrics,
    sequenceSprintSummary,
    isSequenceSprintSession,
  ]);

  useEffect(() => {
    if (gameOver) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOver(true);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameOver]);

  useEffect(() => {
    if (!gameOver) return undefined;

    const scanDurationMs = activeAnalysisAnimationProfile.scanDurationMs;
    const lineStartDelayMs = activeAnalysisAnimationProfile.lineStartDelayMs;
    const lineStaggerMs = activeAnalysisAnimationProfile.lineStaggerMs;
    const identityRevealDelayMs = 180;
    const scanStartDelayMs = 220;
    const scanCompleteDelayMs = scanStartDelayMs + scanDurationMs;
    const firstLineDelayMs = scanCompleteDelayMs + lineStartDelayMs;
    const terminalLineCount = 4;
    const terminalCompleteDelayMs =
      firstLineDelayMs +
      lineStaggerMs * Math.max(0, terminalLineCount - 1) +
      260;
    const performanceStripDelayMs = firstLineDelayMs + 180;
    const scoreBreakdownDelayMs = performanceStripDelayMs + 260;
    const actionButtonDelayMs = scoreBreakdownDelayMs + 240;
    const timerIds = [];
    const schedule = (delayMs, callback) => {
      const timerId = setTimeout(callback, delayMs);
      timerIds.push(timerId);
      return timerId;
    };

    const overdriveStartTimer = setTimeout(() => {
      setMatrixOverdrive(true);
    }, 0);
    const overdriveTimer = setTimeout(() => {
      setMatrixOverdrive(false);
    }, 1180);

    const revealTimer = setTimeout(() => {
      setShowNeuralProfile(true);
    }, 120);
    const scanStartTimer = setTimeout(() => {
      setNeuralScanActive(true);
    }, scanStartDelayMs);
    const scanCompleteTimer = setTimeout(() => {
      setNeuralScanActive(false);
      setNeuralScanCompleted(true);
    }, scanCompleteDelayMs);
    const identityLockTimer = setTimeout(() => {
      setIdentityLockVisible(true);
    }, scanCompleteDelayMs + identityRevealDelayMs);
    activeAnalysisProfile.analysisLines.forEach((_, lineIndex) => {
      schedule(firstLineDelayMs + lineStaggerMs * lineIndex, () => {
        setAnalysisLineCount(lineIndex + 1);
      });
    });
    const performanceStripTimer = setTimeout(() => {
      setShowPerformanceStrip(true);
    }, performanceStripDelayMs);
    const scoreBreakdownTimer = setTimeout(() => {
      setShowScoreBreakdown(true);
    }, scoreBreakdownDelayMs);
    const actionButtonTimer = setTimeout(() => {
      setShowActionButton(true);
    }, actionButtonDelayMs);
    const terminalCompleteTimer = setTimeout(() => {
      setTerminalRevealComplete(true);
    }, terminalCompleteDelayMs);

    return () => {
      clearTimeout(overdriveStartTimer);
      clearTimeout(overdriveTimer);
      clearTimeout(revealTimer);
      clearTimeout(scanStartTimer);
      clearTimeout(scanCompleteTimer);
      clearTimeout(identityLockTimer);
      clearTimeout(performanceStripTimer);
      clearTimeout(scoreBreakdownTimer);
      clearTimeout(actionButtonTimer);
      clearTimeout(terminalCompleteTimer);
      timerIds.forEach((timerId) => clearTimeout(timerId));
    };
  }, [
    gameOver,
    activeAnalysisAnimationProfile,
    activeAnalysisProfile,
    activePuzzleType,
    cognitiveIdentity?.label,
  ]);

  useEffect(() => {
    if (previousRecommendedSessionKeyRef.current !== recommendedSessionKey) {
      previousRecommendedSessionKeyRef.current = recommendedSessionKey;
      hasHandledRecommendedSessionRef.current = false;
    }

    if (!recommendedSession || hasHandledRecommendedSessionRef.current) {
      return undefined;
    }

    hasHandledRecommendedSessionRef.current = true;
    const showTimer = setTimeout(() => {
      setShowRecommendedBanner(true);
      setIsBannerHiding(false);
    }, 0);

    if (recommendedBannerHideTimeoutRef.current) {
      clearTimeout(recommendedBannerHideTimeoutRef.current);
      recommendedBannerHideTimeoutRef.current = null;
    }
    if (recommendedBannerRemoveTimeoutRef.current) {
      clearTimeout(recommendedBannerRemoveTimeoutRef.current);
      recommendedBannerRemoveTimeoutRef.current = null;
    }

    recommendedBannerHideTimeoutRef.current = setTimeout(() => {
      setIsBannerHiding(true);
      recommendedBannerRemoveTimeoutRef.current = setTimeout(() => {
        setShowRecommendedBanner(false);
        recommendedBannerRemoveTimeoutRef.current = null;
      }, 500);
    }, 3500);

    return () => {
      clearTimeout(showTimer);
      if (recommendedBannerHideTimeoutRef.current) {
        clearTimeout(recommendedBannerHideTimeoutRef.current);
        recommendedBannerHideTimeoutRef.current = null;
      }
      if (recommendedBannerRemoveTimeoutRef.current) {
        clearTimeout(recommendedBannerRemoveTimeoutRef.current);
        recommendedBannerRemoveTimeoutRef.current = null;
      }
    };
  }, [recommendedSession, recommendedSessionKey]);

  useEffect(() => {
    if (!gridRecallPuzzle) {
      return undefined;
    }

    const memorizeTimer = setTimeout(() => {
      setGridRecallPhase("memorize");
    }, 0);
    const recallTimer = setTimeout(() => {
      setGridRecallPhase("recall");
    }, 1500);

    return () => {
      clearTimeout(memorizeTimer);
      clearTimeout(recallTimer);
    };
  }, [gridRecallPuzzle]);

  useEffect(() => {
    if (gridRecallPhase === "recall") {
      const frameId = requestAnimationFrame(() => setRecallPulse(true));
      const timer = setTimeout(() => setRecallPulse(false), 500);
      return () => {
        cancelAnimationFrame(frameId);
        clearTimeout(timer);
      };
    }
    return undefined;
  }, [gridRecallPhase]);

  // Handlers
  function applyLiveAdaptiveDifficulty(nextDifficulty) {
    setLiveAdaptiveDifficulty(nextDifficulty);
  }

  function loadNextPuzzle(preferredDifficulty = "medium") {
    const nextPuzzle = getNextPuzzleByType(
      activePuzzleType,
      preferredDifficulty,
    );
    if (activePuzzleType === PUZZLE_TYPES.SEQUENCE_SPRINT) {
      setSequenceSprintSelectedAnswer(null);
      setSequenceSprintPuzzle(nextPuzzle);
    } else if (activePuzzleType === PUZZLE_TYPES.GRID_RECALL) {
      setGridRecallPuzzle(nextPuzzle);
      setGridRecallPhase("memorize");
    } else if (activePuzzleType === PUZZLE_TYPES.LOGIC_GRID) {
      setLogicGridPuzzle(nextPuzzle);
    } else if (activePuzzleType === RULE_SHIFT_PUZZLE_TYPE) {
      setRuleShiftSelectedAnswer(null);
      setRuleShiftPuzzle(nextPuzzle);
    } else if (activePuzzleType === PUZZLE_TYPES.LOGIC_GATE) {
      setLogicGatePuzzle(nextPuzzle);
    } else if (activePuzzleType === PUZZLE_TYPES.SIGNAL_PATH) {
      setSignalPathPuzzle(nextPuzzle);
    } else {
      setCurrentPuzzle(nextPuzzle);
    }
    setPuzzlesSeen((prev) => prev + 1);
  }

  function processAnswerResult({
    isCorrect,
    nextTotalAnswers,
    nextCorrectAnswers,
    nextStreak,
    nextBestStreak,
    nextLiveAdaptiveDifficulty,
    puzzleType,
    nextSequenceSolvedCount,
    afterFeedback,
    allowAfterFeedbackWhileGameOver = false,
  }) {
    setTotalAnswers(nextTotalAnswers);

    const adaptiveFeedback = getAdaptiveFeedback(
      nextLiveAdaptiveDifficulty.state,
      isCorrect,
    );
    const previousTarget = previousTargetDifficultyRef.current;
    const nextTarget = nextLiveAdaptiveDifficulty.targetDifficulty;

    if (
      recommendedSession?.adaptiveState &&
      recommendedSession.adaptiveState !== nextLiveAdaptiveDifficulty.state
    ) {
      setDidBreakRecommendedAlignment(true);
    }

    if (previousTarget && nextTarget && previousTarget !== nextTarget) {
      setAdaptiveShiftMessage(
        adaptiveShiftMessageMap[nextTarget] || "Adaptive shift detected",
      );

      if (adaptiveShiftTimeoutRef.current) {
        clearTimeout(adaptiveShiftTimeoutRef.current);
      }
      adaptiveShiftTimeoutRef.current = setTimeout(() => {
        setAdaptiveShiftMessage("");
      }, 1600);
    }

    previousTargetDifficultyRef.current = nextTarget;

    if (isCorrect) {
      const scoreAward = getScoreAwardBreakdown({
        streak: nextStreak,
        puzzleType,
        sequenceSolvedCount: nextSequenceSolvedCount,
        sequenceTotalCount,
      });
      setIsLightningActive(true);
      if (lightningTimeoutRef.current) {
        clearTimeout(lightningTimeoutRef.current);
      }
      lightningTimeoutRef.current = setTimeout(() => {
        setIsLightningActive(false);
      }, 240);
      setScore((prev) => prev + scoreAward.totalAwarded);
      setBaseScoreEarned((prev) => prev + scoreAward.baseAward);
      setComboBonusEarned((prev) => prev + scoreAward.comboBonusAward);
      setLastScoreGain(scoreAward);
      setStreak(nextStreak);
      setBestStreak(nextBestStreak);
      setCorrectAnswers(nextCorrectAnswers);
      setFeedback(adaptiveFeedback);
      setShowSolveFx(true);
      if (solveFxTimeoutRef.current) {
        clearTimeout(solveFxTimeoutRef.current);
      }
      solveFxTimeoutRef.current = setTimeout(() => {
        setShowSolveFx(false);
      }, 420);
    } else {
      setIsLightningActive(false);
      if (lightningTimeoutRef.current) {
        clearTimeout(lightningTimeoutRef.current);
      }
      setStreak(0);
      setLastScoreGain({
        baseAward: 0,
        comboBonusAward: 0,
        totalAwarded: 0,
        comboMultiplier: 1,
        comboScoreValue: 0,
        streakComboMultiplier: 1,
        sequenceOverflowSolvedCount: 0,
        sequenceOverflowComboMultiplier: 1,
        sequenceFinishLineReached: false,
        scoreStateLabel: "Base award",
      });
      setFeedback(adaptiveFeedback);
    }

    applyLiveAdaptiveDifficulty(nextLiveAdaptiveDifficulty);

    setRecentAnswerHistory((prev) => {
      return [...prev, isCorrect].slice(-5);
    });

    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }
    feedbackTimeoutRef.current = setTimeout(() => {
      setFeedback("");
      if (allowAfterFeedbackWhileGameOver || !gameOverRef.current) {
        afterFeedback?.(nextTarget);
      }
      isTransitioningRef.current = false;
    }, 700);
  }
  // --- RENDER HELPERS (SEQUENCE SPRINT) ---
  const renderSequenceSprintRunner = () => (
    <div className="mb-8">
      <div className="rounded-2xl border border-fuchsia-400/40 bg-slate-950/70 p-4 shadow-[0_0_28px_rgba(217,70,239,0.22)] backdrop-blur-md transition-all duration-300">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-fuchsia-300">
              Sequence Sprint Lane
            </p>
            <p className="text-lg font-semibold text-white">Momentum Track</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-fuchsia-400/40 bg-slate-900/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-fuchsia-200">
              {sequenceVisibleSolvedCount}/{sequenceTotalCount} solved
            </span>
            {sequenceOverflowSolvedCount > 0 && (
              <span className="rounded-full border border-fuchsia-400/40 bg-fuchsia-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-fuchsia-200 shadow-[0_0_18px_rgba(217,70,239,0.25)]">
                +{sequenceOverflowSolvedCount} overflow
              </span>
            )}
            <span className="rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-fuchsia-300">
              {Math.round(sequenceSprintProgress)}%
            </span>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <div className="relative h-2.5 rounded-full bg-slate-900/80 shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)]">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-fuchsia-400 via-fuchsia-500 to-fuchsia-600 transition-all duration-300"
              style={{ width: `${sequenceSprintProgress}%` }}
            />
            <div
              className={`absolute right-0 top-0 h-full w-12 transition-opacity duration-300 ${sequenceSprintRunnerFx.finishGlow}`}
            />
            {sequenceSprintComboLabel && (
              <div className="pointer-events-none absolute right-1.5 -top-7 z-20 animate-pulse rounded-full border border-fuchsia-300/60 bg-fuchsia-500/20 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.22em] text-fuchsia-100 shadow-[0_0_18px rgba(217,70,239,0.55)]">
                {sequenceSprintComboLabel}
              </div>
            )}

            <div
              className={`absolute top-1/2 flex items-center justify-center -translate-y-1/2 transition-all duration-300 ${sequenceSprintRunnerFx.wrapper}`}
              style={{
                left: `${sequenceSprintProgress}%`,
                transform: "translateX(-50%)",
              }}
              aria-hidden="true"
            >
              <div
                className={`absolute right-full top-1/2 h-1 -translate-y-1/2 transition-all duration-300 ${sequenceSprintRunnerFx.trail}`}
              />
              <img
                src={sequenceSprintRunner}
                alt="Runner"
                className={`h-9 w-9 object-contain transition-all duration-300 ${sequenceSprintRunnerFx.image}`}
                draggable={false}
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-1 text-[10px] font-bold uppercase tracking-[0.35em] text-slate-500">
            <span>Start</span>
            <span>Finish</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGridRecallGrid = () => (
    <div className="rounded-2xl border border-emerald-400/40 bg-slate-950/80 p-5 shadow-[inset_0_0_30px_rgba(16,185,129,0.25)]">
      <div className="flex items-center justify-between border-b border-emerald-400/10 pb-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-emerald-300">
          Memory Grid
        </p>
        <span className="text-[10px] font-medium text-emerald-500/60">
          Spatial Matrix
        </span>
      </div>
      <div
        className={`relative mt-6 grid overflow-hidden rounded-xl border transition-all duration-500 gap-3 ${
          recallPulse
            ? "border-emerald-400/50 drop-shadow-[0_0_20px_rgba(52,211,153,0.8)]"
            : "border-white/10"
        }`}
        style={{
          gridTemplateColumns: `repeat(${gridRecallGridSize}, minmax(0, 1fr))`,
        }}
      >
        {gridRecallPhase === "memorize" && (
          <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-b from-transparent via-emerald-400/5 to-transparent" />
            <div className="absolute -inset-x-4 -top-1/2 h-2/3 rounded-full bg-linear-to-b from-emerald-300/0 via-emerald-300/35 to-emerald-300/0 blur-xl opacity-80 mix-blend-screen animate-grid-scan" />
          </div>
        )}

        {displayedGridRecallMatrix.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isVisible = gridRecallPhase === "memorize" && cell;
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`flex aspect-square items-center justify-center rounded-xl border transition ${
                  isVisible
                    ? "border-emerald-400/70 bg-emerald-400/90 shadow-[0_0_30px_rgba(16,185,129,0.45)]"
                    : "border-emerald-400/15 bg-white/5"
                }`}
              >
                {isVisible && (
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.9)]" />
                )}
              </div>
            );
          }),
        )}
      </div>
    </div>
  );

  const renderGridRecallAnswers = () => (
    <div className="rounded-2xl border border-emerald-400/40 bg-slate-950/80 p-5 shadow-[inset_0_0_30px_rgba(16,185,129,0.25)]">
      <div className="flex items-center justify-between border-b border-emerald-400/10 pb-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-emerald-300/90">
          Answer Tray
        </p>
        <span className="text-[10px] font-medium text-emerald-500/60">
          Neural Recall
        </span>
      </div>

      <div className="mt-6 flex flex-col gap-4">
        {feedback && (
          <div className="flex justify-center">
            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] ${getFeedbackBadgeClass(feedback, isCyber)}`}>
              {feedback}
            </span>
          </div>
        )}

        {gridRecallPhase === "memorize" ? (
          <div className="rounded-2xl border border-emerald-500/50 bg-emerald-500/10 px-4 py-8 text-center text-emerald-100/90">
            <p className="text-sm font-semibold uppercase tracking-[0.35em]">
              Scanning Matrix...
            </p>
            <p className="mt-1 text-xs text-emerald-100/80">
              Hold steady—your neural nets are encoding the pattern.
            </p>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-emerald-500/20">
              <div className="h-full w-3/4 animate-pulse bg-linear-to-r from-emerald-400 to-transparent" />
            </div>
          </div>
        ) : (
          <div className="grid gap-3">
            {Array.isArray(gridRecallPuzzle?.options)
              ? gridRecallPuzzle.options.map((option) => {
                  const optionMatrix = formatGridAsMatrix(option);
                  const normalizedOptionMatrix = isValidGridMatrix(
                    optionMatrix,
                    gridRecallGridSize,
                  )
                    ? optionMatrix
                    : buildBlankGridMatrix(gridRecallGridSize);

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleAnswer(option)}
                      disabled={gameOver}
                      className="group flex items-center gap-4 rounded-2xl border border-emerald-400/40 bg-slate-900 px-4 py-3 text-left transition hover:border-emerald-300 hover:bg-slate-800 hover:shadow-[0_0_20px_rgba(16,185,129,0.25)]"
                    >
                      <div
                        className="grid h-16 w-16 gap-1"
                        style={{
                          gridTemplateColumns: `repeat(${gridRecallGridSize}, minmax(0, 1fr))`,
                        }}
                      >
                        {normalizedOptionMatrix.map((row, rowIndex) =>
                          row.map((cell, colIndex) => (
                            <span
                              key={`${rowIndex}-${colIndex}`}
                              className={`block rounded-sm border ${cell ? "border-emerald-300 bg-emerald-300/80 shadow-[0_0_10px_rgba(16,185,129,0.65)]" : "border-white/20 bg-transparent"}`}
                            />
                          ))
                        )}
                      </div>

                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-200">
                        Recall Choice
                      </span>
                    </button>
                  );
                })
              : null}
          </div>
        )}
      </div>
    </div>
  );

  const renderGridRecallReadout = () => (
    <div className={`rounded-2xl border backdrop-blur-sm transition-all duration-300 p-5 ${isCyber ? "border-emerald-500/20 bg-slate-950/60 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]" : "border-emerald-400/40 bg-slate-950/80 shadow-[inset_0_0_30px_rgba(16,185,129,0.25)]"}`}>
      <div className={`mb-4 flex items-center justify-between border-b pb-3 ${isCyber ? "border-emerald-500/10" : "border-emerald-400/10"}`}>
        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isCyber ? "text-emerald-400 text-glow-emerald" : "text-emerald-400"}`}>
          Neural Readout
        </p>
        <div className={`flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse`} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className={`group rounded-xl border p-4 transition-all ${isCyber ? "border-white/10 bg-slate-900/40 hover:bg-slate-900/60 hover:border-emerald-500/30" : "border-emerald-400/10 bg-emerald-500/5 hover:bg-emerald-500/10"}`}>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-500/60 group-hover:text-emerald-400/80 transition-colors">
            ACCURACY
          </p>
          <p className={`mt-1 text-3xl font-black ${isCyber ? "text-white text-glow-emerald" : "text-white"}`}>
            {gridRecallAccuracy}%
          </p>
        </div>
        <div className={`group rounded-xl border p-4 transition-all ${isCyber ? "border-white/10 bg-slate-900/40 hover:bg-slate-900/60 hover:border-emerald-500/30" : "border-emerald-400/10 bg-emerald-500/5 hover:bg-emerald-500/10"}`}>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-500/60 group-hover:text-emerald-400/80 transition-colors">
            STREAK
          </p>
          <div className="mt-1 flex items-end gap-2">
            <p className={`text-3xl font-black ${isCyber ? "text-emerald-400 text-glow-emerald" : "text-emerald-400 text-glow-emerald"}`}>
              {streak}
            </p>
            {streak >= 3 && (
              <span className={`mb-1 text-[10px] font-bold uppercase text-emerald-300 animate-bounce`}>
                Lock!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const getLogicGridSize = (puzzle = logicGridPuzzle) => {
    const grid = Array.isArray(puzzle?.grid) ? puzzle.grid : [];
    const metaGridSize = Number.isInteger(puzzle?.meta?.gridSize) ? puzzle.meta.gridSize : null;
    if (metaGridSize && metaGridSize > 0) {
      return metaGridSize;
    }

    const inferredSize = Math.sqrt(grid.length || 0);
    return Number.isFinite(inferredSize) && inferredSize >= 2 ? Math.round(inferredSize) : 3;
  };

  const getLogicGridMissingIndex = (puzzle = logicGridPuzzle, gridSize = getLogicGridSize(puzzle)) => {
    const missingIndex = puzzle?.missingIndex;
    if (Number.isInteger(missingIndex)) {
      return missingIndex;
    }
    if (missingIndex && typeof missingIndex === "object") {
      if (Number.isInteger(missingIndex.index)) {
        return missingIndex.index;
      }
      if (Number.isInteger(missingIndex.row) && Number.isInteger(missingIndex.col)) {
        return missingIndex.row * gridSize + missingIndex.col;
      }
    }
    return null;
  };

  const renderLogicGridRulePanel = () => {
    const title = logicGridPuzzle?.title || "Logic Grid Arena";
    const prompt = logicGridPuzzle?.prompt || "Resolve the missing cell using matrix reasoning.";
    const ruleType = logicGridPuzzle?.meta?.ruleType || "unknown";
    const ruleDescription = logicGridPuzzle?.meta?.ruleDescription || "Rule details unavailable.";

    return (
      <div className={`rounded-2xl border backdrop-blur-sm transition-all duration-300 p-5 ${isCyber ? "border-cyan-500/20 bg-slate-950/60 shadow-[inset_0_0_20px_rgba(34,211,238,0.1)]" : "border-cyan-400/30 bg-slate-950/80"}`}>
        <div className={`flex items-center justify-between border-b pb-3 ${isCyber ? "border-cyan-500/10" : "border-cyan-400/10"}`}>
          <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isCyber ? "text-cyan-400 text-glow-blue" : "text-cyan-400"}`}>
            Matrix Intel
          </p>
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
            Binary feed
          </span>
        </div>
        <div className="mt-4 space-y-3">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500">Title</p>
            <h3 className={`mt-1 text-lg font-black ${isCyber ? "text-white text-glow-blue" : "text-white"}`}>
              {title}
            </h3>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500">Prompt</p>
            <p className="mt-1 text-sm leading-relaxed text-slate-200">{prompt}</p>
          </div>
          <div className="rounded-xl border border-cyan-500/15 bg-slate-900/40 px-3 py-2">
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-cyan-300/80">Rule Type</p>
            <p className="mt-1 text-xs leading-relaxed text-cyan-100/90">{formatDevValue(ruleType).replace(/_/g, " ")}</p>
            <p className="mt-2 text-[10px] leading-relaxed text-slate-300/90">{ruleDescription}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderLogicGridMatrix = () => {
    const gridSize = getLogicGridSize();
    const grid = Array.isArray(logicGridPuzzle?.grid) ? logicGridPuzzle.grid : [];
    const missingIndex = getLogicGridMissingIndex(logicGridPuzzle, gridSize);
    const flatGrid = grid.flat?.() ?? grid;
    const cellCount = Math.max(gridSize * gridSize, flatGrid.length || 0);
    const cells = Array.from({ length: cellCount }, (_, index) => flatGrid[index]);

    return (
      <div className={`rounded-2xl border backdrop-blur-sm transition-all duration-300 p-5 ${isCyber ? "border-cyan-500/20 bg-slate-950/60 shadow-[inset_0_0_20px_rgba(34,211,238,0.12)]" : "border-cyan-400/30 bg-slate-950/80"}`}>
        <div className={`mb-4 flex items-center justify-between border-b pb-3 ${isCyber ? "border-cyan-500/10" : "border-cyan-400/10"}`}>
          <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isCyber ? "text-cyan-400 text-glow-blue" : "text-cyan-400"}`}>
            Matrix Display
          </p>
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-violet-300/70">
            Solve the missing cell
          </span>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-4 shadow-[inset_0_0_24px_rgba(2,6,23,0.7)]">
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
          >
            {cells.length > 0 ? (
              cells.map((cell, index) => {
                const isMissing = index === missingIndex || cell === "missing" || cell === null || cell === undefined || cell === "";
                const displayValue = isMissing ? "?" : String(cell);
                const toneClass = isMissing
                  ? "border-dashed border-violet-400/70 bg-linear-to-br from-violet-500/10 via-cyan-400/10 to-amber-400/5 shadow-[0_0_22px_rgba(168,85,247,0.22)] animate-pulse"
                  : "border-cyan-400/20 bg-slate-900/80 shadow-[inset_0_0_18px_rgba(2,6,23,0.7),0_0_12px_rgba(34,211,238,0.12)] hover:border-cyan-300/50 hover:shadow-[0_0_18px_rgba(34,211,238,0.18)]";

                return (
                  <div
                    key={`logic-grid-cell-${index}`}
                    className={`group relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border transition-all duration-300 ${toneClass}`}
                  >
                    <div className="pointer-events-none absolute inset-0 rounded-xl bg-linear-to-br from-emerald-400/0 via-emerald-300/5 to-cyan-300/0 opacity-70" />
                    <div className="logic-dot-pulse absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
                    
                    {isMissing ? (
                      <div className="flex h-[80%] w-[80%] flex-col items-center justify-center rounded-lg border border-dashed border-violet-300/60 bg-slate-950/55 text-center shadow-[0_0_18px_rgba(168,85,247,0.22)]">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-200/70">
                          Missing
                        </span>
                        <span className="mt-1 font-mono text-3xl font-black text-cyan-100 text-glow-blue logic-core-flicker">
                          ?
                        </span>
                      </div>
                    ) : (
                      <span className="font-mono text-[clamp(1.4rem,3vw,2.35rem)] font-black uppercase tracking-[0.22em] text-white text-glow-blue">
                        {displayValue}
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="col-span-full rounded-xl border border-dashed border-cyan-400/40 bg-cyan-500/5 px-4 py-10 text-center text-slate-300">
                Matrix unavailable. Awaiting puzzle data.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderLogicGridAnswers = () => {
    const options = Array.isArray(logicGridPuzzle?.options) ? logicGridPuzzle.options : [];
    const fallbackOptions = logicGridPuzzle?.answer ? [logicGridPuzzle.answer] : [];
    const answerOptions = options.length > 0 ? options : fallbackOptions;

    return (
      <div className={`rounded-2xl border backdrop-blur-sm transition-all duration-300 ${isCyber ? "border-violet-500/20 bg-slate-950/60 shadow-[inset_0_0_20px_rgba(168,85,247,0.12)]" : "border-violet-400/30 bg-slate-950/80"}`}>
        <div className={`flex items-center justify-between border-b pb-3 px-5 pt-5 ${isCyber ? "border-violet-500/10" : "border-violet-400/10"}`}>
          <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isCyber ? "text-violet-400 text-glow-purple" : "text-violet-400"}`}>
            Answer Tray
          </p>
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">Select the match</span>
        </div>
        <div className="space-y-4 p-5">
          {feedback && (
            <div className="flex justify-center">
              <span className={`rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.3em] shadow-lg ${getFeedbackBadgeClass(feedback, isCyber)}`}>
                {feedback}
              </span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            {answerOptions.length > 0 ? (
              answerOptions.map((option) => {
                return (
                  <button
                    key={`logic-grid-option-${option}`}
                    type="button"
                    onClick={() => handleAnswer(option)}
                    disabled={gameOver}
                    className="group relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/65 p-5 text-center text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/40 hover:bg-slate-900/85 hover:shadow-[0_0_25px_rgba(34,211,238,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                  >
                    <div className="absolute inset-x-0 -top-px h-px bg-linear-to-r from-transparent via-white/40 to-transparent opacity-30 transition-opacity group-hover:opacity-100" />
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-5 bg-linear-to-b from-white/8 to-transparent opacity-10 transition-opacity group-hover:opacity-25" />
                    <div className="pointer-events-none absolute inset-y-0 left-[-35%] w-1/3 -skew-x-12 bg-linear-to-r from-transparent via-white/18 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 logic-scanline" />
                    <span
                      className="block text-4xl font-black uppercase tracking-widest text-white text-glow-blue"
                    >
                      {option}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="col-span-full rounded-xl border border-dashed border-violet-400/40 bg-violet-500/5 px-4 py-6 text-center text-sm text-slate-300">
                Answer options unavailable.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderLogicGridReadout = () => {
    const logicGridAccuracy = totalAnswers === 0 ? 0 : Math.round((correctAnswers / totalAnswers) * 100);
    const gridSize = getLogicGridSize();
    const ruleType = logicGridPuzzle?.meta?.ruleType || "unknown";

    return (
      <div className={`relative overflow-hidden rounded-2xl border backdrop-blur-md transition-all duration-300 p-5 ${isCyber ? "border-cyan-500/20 bg-slate-950/60 shadow-[inset_0_0_20px_rgba(34,211,238,0.1)]" : "border-cyan-400/30 bg-slate-950/80"}`}>
        <div className={`mb-4 flex items-center justify-between border-b pb-3 ${isCyber ? "border-cyan-500/10" : "border-cyan-400/10"}`}>
          <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isCyber ? "text-cyan-400 text-glow-blue" : "text-cyan-400"}`}>
            Matrix Readout
          </p>
          <div className="flex h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.7)] animate-pulse" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/40 p-4 transition-all hover:border-cyan-500/30 hover:bg-slate-900/60">
            <div className="logic-dot-pulse absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-cyan-300/80" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-500/60 group-hover:text-cyan-400/80 transition-colors">
              ACCURACY
            </p>
            <p className="mt-1 text-3xl font-black text-white text-glow-emerald">
              {logicGridAccuracy}%
            </p>
          </div>
          <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/40 p-4 transition-all hover:border-violet-500/30 hover:bg-slate-900/60">
            <div className="logic-dot-pulse absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-violet-300/80" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-violet-500/60 group-hover:text-violet-400/80 transition-colors">
              RULE TYPE
            </p>
            <p className="mt-1 text-xl font-black uppercase text-white text-glow-purple">
              {formatDevValue(ruleType).replace(/_/g, " ")}
            </p>
          </div>
          <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/40 p-4 transition-all hover:border-amber-500/30 hover:bg-slate-900/60">
            <div className="logic-dot-pulse absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-amber-300/80" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500/60 group-hover:text-amber-400/80 transition-colors">
              GRID SIZE
            </p>
            <p className="mt-1 text-3xl font-black text-white text-glow-amber">
              {gridSize}×{gridSize}
            </p>
          </div>
          <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/40 p-4 transition-all hover:border-fuchsia-500/30 hover:bg-slate-900/60">
            <div className="logic-dot-pulse absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-fuchsia-300/80" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-fuchsia-500/60 group-hover:text-fuchsia-400/80 transition-colors">
              STREAK
            </p>
            <div className="mt-1 flex items-end gap-2">
              <p className="text-3xl font-black text-white text-glow-pink">
                {streak}
              </p>
              {streak >= 3 && (
                <span className="mb-1 text-[10px] font-bold uppercase text-fuchsia-300 animate-bounce">
                  Hot!
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSequencePrompt = () => (
    <div className={`rounded-2xl border backdrop-blur-sm transition-all duration-300 p-5 ${isCyber ? "border-fuchsia-500/20 bg-slate-950/60 shadow-[inset_0_0_20px_rgba(217,70,239,0.12)]" : "border-white/10 bg-slate-950/40 shadow-[0_4px_20px_rgba(0,0,0,0.2)]"}`}>
      <div className={`flex items-center justify-between border-b pb-3 ${isCyber ? "border-fuchsia-500/10" : "border-white/5"}`}>
        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isCyber ? "text-fuchsia-400 text-glow-pink" : "text-fuchsia-400"}`}>
          Sequence Prompt
        </p>
        <span className={`text-[10px] font-medium ${isCyber ? "text-slate-400" : "text-slate-500"}`}>
          Track the pattern
        </span>
      </div>
      <div className="mt-4">
        <h3 className={`text-xl font-bold ${isCyber ? "text-white text-glow-blue" : "text-white"}`}>
          {sequenceSprintPuzzle.prompt}
        </h3>
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        {(sequenceSprintPuzzle.sequence ?? []).map((value, index) => (
          <span
            key={`${value}-${index}`}
            className={`flex min-w-14 items-center justify-center rounded-xl border px-5 py-4 text-xl font-black transition-all ${isCyber ? "border-fuchsia-500/40 bg-slate-900/80 text-white shadow-[inset_0_0_15px_rgba(0,0,0,0.6),0_0_15px_rgba(217,70,239,0.3)]" : "border-fuchsia-500/30 bg-slate-900 text-white shadow-[inset_0_0_15px_rgba(0,0,0,0.6),0_0_15px_rgba(217,70,239,0.2)]"}`}
          >
            {value}
          </span>
        ))}
        <span className={`flex min-w-14 animate-pulse items-center justify-center rounded-xl border px-5 py-4 text-xl font-black ${isCyber ? "border-fuchsia-400/50 bg-fuchsia-500/20 text-fuchsia-200 shadow-[0_0_25px_rgba(217,70,239,0.4)]" : "border-fuchsia-400/40 bg-fuchsia-500/10 text-fuchsia-200 shadow-[0_0_20px_rgba(217,70,239,0.25)]"}`}>
          ?
        </span>
      </div>
    </div>
  );

  const renderSequenceAnswers = () => (
    <div className={`rounded-2xl border backdrop-blur-sm transition-all duration-300 ${isCyber ? "border-fuchsia-500/20 bg-slate-950/60 shadow-[inset_0_0_20px_rgba(217,70,239,0.12)]" : "border-white/10 bg-slate-950/40 shadow-[0_4px_20px_rgba(0,0,0,0.2)]"}`}>
      <div className={`flex items-center justify-between border-b pb-3 ${isCyber ? "border-fuchsia-500/10" : "border-white/5"}`}>
        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isCyber ? "text-fuchsia-400 text-glow-pink" : "text-fuchsia-400"}`}>
          Answer Lane
        </p>
        <span className={`text-[10px] font-medium ${isCyber ? "text-slate-400" : "text-slate-500"}`}>
          Select the next match
        </span>
      </div>
      <div className="mt-6 flex flex-col items-center gap-4">
        {feedback && (
          <div className="flex justify-center">
            <span
              className={`rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.3em] shadow-lg ${getFeedbackBadgeClass(feedback, isCyber)}`}
            >
              {feedback}
            </span>
          </div>
        )}
        <div className="grid w-full gap-4 sm:grid-cols-2">
          {sequenceSprintPuzzle.options.map((option) => {
            const isSelected = sequenceSprintSelectedAnswer === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => handleAnswer(option)}
                className={`group relative rounded-xl border p-5 text-center transition-all duration-300 ${
                  isSelected
                    ? "border-fuchsia-400/80 bg-fuchsia-500/20 text-white shadow-[0_0_35px_rgba(217,70,239,0.3)] scale-[1.02]"
                    : "border-white/10 bg-slate-900/60 text-slate-200 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] hover:border-cyan-400/40 hover:bg-slate-900/80 hover:shadow-[0_0_25px_rgba(34,211,238,0.2)]"
                }`}
              >
                <div className="absolute inset-x-0 -top-px h-px bg-linear-to-r from-transparent via-white/50 to-transparent opacity-40 transition-opacity group-hover:opacity-100" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-5 bg-linear-to-b from-white/8 to-transparent opacity-10 transition-opacity group-hover:opacity-25" />
                <div className="pointer-events-none absolute inset-y-0 left-[-35%] w-1/3 -skew-x-12 bg-linear-to-r from-transparent via-white/18 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 logic-scanline" />
                <span
                  className="block text-4xl font-black uppercase tracking-widest text-white text-glow-pink"
                >
                  {option}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderRuleShiftPrompt = () => (
    <div className={`rounded-2xl border backdrop-blur-sm transition-all duration-300 p-5 ${isCyber ? "border-cyan-500/25 bg-slate-950/60 shadow-[inset_0_0_20px_rgba(34,211,238,0.12)]" : "border-white/10 bg-slate-950/40 shadow-[0_4px_20px_rgba(0,0,0,0.2)]"}`}>
      <div className={`flex items-center justify-between border-b pb-3 ${isCyber ? "border-violet-500/10" : "border-white/5"}`}>
        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isCyber ? "text-cyan-400 text-glow-blue" : "text-cyan-400"}`}>
          Rule Shift Sequence
        </p>
        <span className={`text-[10px] font-medium ${isCyber ? "text-slate-400" : "text-slate-500"}`}>
          Catch the transition
        </span>
      </div>
      <div className="mt-4">
        <h3 className={`text-xl font-bold ${isCyber ? "text-white text-glow-blue" : "text-white"}`}>
          The first rule changes mid-stream. Solve the final value.
        </h3>
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        {(ruleShiftPuzzle?.sequence ?? []).map((value, index) => (
          <span
            key={`${value}-${index}`}
            className={`flex min-w-14 items-center justify-center rounded-xl border px-5 py-4 text-xl font-black transition-all ${isCyber ? "border-cyan-500/40 bg-slate-900/80 text-white shadow-[inset_0_0_15px_rgba(0,0,0,0.6),0_0_15px_rgba(34,211,238,0.25)]" : "border-cyan-500/30 bg-slate-900 text-white shadow-[inset_0_0_15px_rgba(0,0,0,0.6),0_0_15px_rgba(34,211,238,0.2)]"}`}
          >
            {value}
          </span>
        ))}
        <span className={`flex min-w-14 animate-pulse items-center justify-center rounded-xl border px-5 py-4 text-xl font-black ${isCyber ? "border-violet-400/50 bg-violet-500/20 text-violet-200 shadow-[0_0_25px_rgba(167,139,250,0.35)]" : "border-violet-400/40 bg-violet-500/10 text-violet-200 shadow-[0_0_20px_rgba(167,139,250,0.25)]"}`}>
          ?
        </span>
      </div>
    </div>
  );

  const renderRuleShiftAnswers = () => (
    <div className={`rounded-2xl border backdrop-blur-sm transition-all duration-300 ${isCyber ? "border-cyan-500/25 bg-slate-950/60 shadow-[inset_0_0_20px_rgba(34,211,238,0.12)]" : "border-white/10 bg-slate-950/40 shadow-[0_4px_20px_rgba(0,0,0,0.2)]"}`}>
      <div className={`flex items-center justify-between border-b pb-3 ${isCyber ? "border-violet-500/10" : "border-white/5"}`}>
        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isCyber ? "text-violet-400 text-glow-pink" : "text-violet-400"}`}>
          Answer Lane
        </p>
        <span className={`text-[10px] font-medium ${isCyber ? "text-slate-400" : "text-slate-500"}`}>
          Select the final value
        </span>
      </div>
      <div className="mt-6 flex flex-col items-center gap-4">
        {feedback && (
          <div className="flex justify-center">
            <span
              className={`rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.3em] shadow-lg ${getFeedbackBadgeClass(feedback, isCyber)}`}
            >
              {feedback}
            </span>
          </div>
        )}
        <div className="grid w-full gap-4 sm:grid-cols-2">
          {ruleShiftPuzzle.options.map((option) => {
            const isSelected = ruleShiftSelectedAnswer === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => handleAnswer(option)}
                className={`group relative rounded-xl border p-5 text-center transition-all duration-300 ${
                  isSelected
                    ? "border-violet-400/80 bg-violet-500/20 text-white shadow-[0_0_35px_rgba(167,139,250,0.3)] scale-[1.02]"
                    : "border-white/10 bg-slate-900/60 text-slate-200 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] hover:border-cyan-400/40 hover:bg-slate-900/80 hover:shadow-[0_0_25px_rgba(34,211,238,0.2)]"
                }`}
              >
                <div className="absolute inset-x-0 -top-px h-px bg-linear-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="mb-2 block text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 transition-colors group-hover:text-cyan-300">
                  Response
                </span>
                <span className="block text-4xl font-black uppercase tracking-widest text-white text-glow-pink">
                  {option}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderRuleShiftReadout = () => {
    const sequenceLength = Array.isArray(ruleShiftPuzzle?.sequence)
      ? ruleShiftPuzzle.sequence.length
      : 0;
    const shiftAfterStep = Number.isInteger(ruleShiftPuzzle?.shiftIndex)
      ? ruleShiftPuzzle.shiftIndex
      : null;
    return (
      <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-slate-950/60 p-5 shadow-[inset_0_0_20px_rgba(139,92,246,0.08)] backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-violet-500/10 pb-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-400">
            Shift Readout
          </p>
          <div className="logic-dot-pulse h-2 w-2 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.6)]" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/40 p-4 transition-all hover:border-cyan-500/30 hover:bg-slate-900/60">
            <div className="logic-dot-pulse absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-cyan-300/80" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-500/60 group-hover:text-cyan-400/80 transition-colors">
              Rule A
            </p>
            <p className="mt-1 text-[clamp(0.72rem,1.8vw,1rem)] font-black uppercase tracking-widest leading-tight text-white text-glow-blue">
              {ruleShiftPuzzle?.ruleA ?? "Unknown"}
            </p>
          </div>
          <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/40 p-4 transition-all hover:border-violet-500/30 hover:bg-slate-900/60">
            <div className="logic-dot-pulse absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-violet-300/80" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-violet-500/60 group-hover:text-violet-400/80 transition-colors">
              Rule B
            </p>
            <p className="mt-1 text-[clamp(0.72rem,1.8vw,1rem)] font-black uppercase tracking-widest leading-tight text-white text-glow-purple">
              {ruleShiftPuzzle?.ruleB ?? "Unknown"}
            </p>
          </div>
          <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/40 p-4 transition-all hover:border-amber-500/30 hover:bg-slate-900/60">
            <div className="logic-dot-pulse absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-amber-300/80" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500/60 group-hover:text-amber-400/80 transition-colors">
              Shift Point
            </p>
            <p className="mt-1 text-3xl font-black text-white text-glow-amber">
              {shiftAfterStep !== null ? `After ${shiftAfterStep}` : "—"}
            </p>
          </div>
          <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/40 p-4 transition-all hover:border-cyan-500/30 hover:bg-slate-900/60">
            <div className="logic-dot-pulse absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-cyan-300/80" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-500/60 group-hover:text-cyan-400/80 transition-colors">
              Sequence Length
            </p>
            <p className="mt-1 text-3xl font-black text-white text-glow-blue">
              {sequenceLength}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // --- RENDER HELPERS (LOGIC GATE) ---
  const LOGIC_GATE_VARIANT_META = {
    output: { title: "Output Lane", subtitle: "Select the final signal", variantLabel: "Output" },
    missing_gate: { title: "Missing Gate", subtitle: "Choose the gate that produced the output", variantLabel: "Gate" },
    missing_input: { title: "Missing Signal", subtitle: "Fill in the hidden input", variantLabel: "Signal" },
  };
  const normalizeLogicGateVariant = (variant) =>
    variant === "output_prediction" ? "output" : variant || "output";
  const LOGIC_GATE_VARIANT_TONE = {
    output: {
      shell: "border-cyan-500/20 bg-slate-950/60",
      label: "text-cyan-300",
      wire: "from-cyan-300/70 via-violet-300/60 to-cyan-300/70",
      answerGlow: "group-hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]",
    },
    missing_gate: {
      shell: "border-violet-500/25 bg-slate-950/65",
      label: "text-violet-300",
      wire: "from-violet-300/70 via-amber-300/60 to-violet-300/70",
      answerGlow: "group-hover:shadow-[0_0_32px_rgba(167,139,250,0.24)]",
    },
    missing_input: {
      shell: "border-amber-500/25 bg-slate-950/65",
      label: "text-amber-300",
      wire: "from-amber-300/70 via-cyan-300/50 to-amber-300/70",
      answerGlow: "group-hover:shadow-[0_0_28px_rgba(251,191,36,0.2)]",
    },
  };
  const getLogicGateVariantTone = (variant) =>
    LOGIC_GATE_VARIANT_TONE[variant] || LOGIC_GATE_VARIANT_TONE.output;
  const getLogicGateVariantMeta = (variant) =>
    LOGIC_GATE_VARIANT_META[variant] || LOGIC_GATE_VARIANT_META.output;
  const renderLogicGateInputs = () => {
    const variant = normalizeLogicGateVariant(logicGatePuzzle?.variant);
    const variantTone = getLogicGateVariantTone(variant);
    const logicGateInputs = logicGatePuzzle?.inputs ?? { A: 0, B: 0 };
    const inputEntries = Object.entries(logicGateInputs);
    const columnCount = Math.max(2, Math.min(3, inputEntries.length || 2));
    const gridStyle = {
      gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
    };

    return (
      <div className={`rounded-2xl border p-5 shadow-[inset_0_0_20px_rgba(245,158,11,0.1)] backdrop-blur-md ${variantTone.shell}`}>
        <div className="flex items-center justify-between border-b border-amber-500/10 pb-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400 text-glow-amber">
            Signal Inputs
          </p>
          <span className="text-[10px] font-medium text-amber-500/40 uppercase tracking-widest">
            Binary feed
          </span>
        </div>
        <div className="mt-6 grid gap-4" style={gridStyle}>
          {inputEntries.map(([key, value]) => {
            const isMissing = value === "?" || value === null || value === undefined;
            const displayValue = isMissing ? "?" : String(value);
            const baseClass = isMissing
              ? "border-amber-400/45 border-dashed bg-linear-to-br from-amber-400/12 via-slate-900/80 to-amber-500/5 shadow-[0_0_14px_rgba(245,158,11,0.26)]"
              : "border-white/10 bg-slate-900/45 shadow-[inset_0_0_22px_rgba(15,23,42,0.45)] hover:border-emerald-400/35 hover:bg-slate-900/70";
            return (
              <div
                key={key}
                className={`group relative overflow-hidden flex flex-col items-center justify-center rounded-xl border py-6 transition-all duration-300 ${baseClass}`}
              >
                {!isMissing && (
                  <>
                    <div className="pointer-events-none absolute inset-0 rounded-xl bg-linear-to-br from-emerald-400/0 via-emerald-300/5 to-cyan-300/0 opacity-70" />
                    <div className="logic-dot-pulse absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
                  </>
                )}
                {isMissing && (
                  <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
                    <div className="logic-scanline absolute inset-y-0 w-1/3 -skew-x-12 bg-linear-to-r from-transparent via-amber-300/25 to-transparent" />
                  </div>
                )}
                <div className="absolute -top-px inset-x-0 h-px bg-linear-to-r from-transparent via-amber-400/20 to-transparent" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-500/60 group-hover:text-amber-400/80">
                  Input {key}
                </span>
                <span
                  className={`mt-2 text-4xl font-black ${isMissing ? "text-amber-200 text-glow-amber logic-core-flicker" : "text-white text-glow-blue"}`}
                >
                  {displayValue}
                </span>
                <div className="mt-3 flex gap-1">
                  <div
                    className={`h-1 w-3 rounded-full ${isMissing ? "bg-amber-400 logic-core-flicker shadow-[0_0_8px_rgba(245,158,11,0.6)]" : "bg-emerald-300 logic-dot-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]"}`}
                  />
                  <div className="h-1 w-3 rounded-full bg-slate-800" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderLogicGateCore = () => {
    const variant = normalizeLogicGateVariant(logicGatePuzzle?.variant);
    const variantTone = getLogicGateVariantTone(variant);
    const expression = logicGatePuzzle?.expression;
    const gateLabel = logicGatePuzzle?.gate || "Unknown";
    const coreDisplay = variant === "missing_gate" ? "?" : expression || gateLabel;
    const displaySizeClass = coreDisplay.length > 10 ? "text-xl sm:text-[2.1rem]" : "text-2xl sm:text-[2.1rem]";
    const inputLabels = Object.keys(logicGatePuzzle?.inputs ?? {});
    const leftInputLabel = inputLabels[0] ?? "A";
    const rightInputLabel = inputLabels[inputLabels.length - 1] ?? "B";

    return (
      <div className="rounded-2xl border border-violet-500/20 bg-slate-950/60 p-5 shadow-[inset_0_0_20px_rgba(139,92,246,0.1)] backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-violet-500/10 pb-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-400 text-glow-purple">
            Gate Core
          </p>
          <span className="text-[10px] font-medium text-violet-500/40 uppercase tracking-widest">
            Resolve the output
          </span>
        </div>
        <div className="mt-8 flex flex-col items-center justify-center py-4">
          <div className="relative flex w-full items-center justify-between px-6 sm:px-8">
            {/* Connector Lines */}
            <div className="absolute inset-x-10 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-white/10" />
            <div className={`logic-signal-flow absolute inset-x-10 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-linear-to-r ${variantTone.wire}`} />
            <div className="logic-dot-pulse absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-300/90 shadow-[0_0_10px_rgba(167,139,250,0.9)]" />
            
            <div className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-lg border border-amber-500/40 bg-slate-900 shadow-[0_0_15px_rgba(245,158,11,0.25)] ${variant === "missing_input" ? "logic-core-flicker" : ""}`}>
              <span className="font-mono text-xl font-black text-amber-300">{leftInputLabel}</span>
            </div>

            <div className="relative z-10 flex flex-col items-center">
               <div className={`relative overflow-hidden flex min-h-24 min-w-37.5 max-w-70 items-center justify-center rounded-2xl border-2 px-6 sm:px-7 py-4 shadow-[0_0_30px_rgba(167,139,250,0.3),inset_0_0_15px_rgba(167,139,250,0.2)] ${variant === "missing_gate" ? "border-amber-400/65 bg-linear-to-br from-slate-950 via-amber-950/20 to-slate-950" : "border-violet-400/60 bg-slate-950"}`}>
                  {variant === "missing_gate" && (
                    <>
                      <div className="logic-scanline absolute inset-y-0 w-1/3 -skew-x-12 bg-linear-to-r from-transparent via-amber-300/30 to-transparent" />
                      <div className="logic-core-flicker absolute inset-0 bg-amber-400/5" />
                    </>
                  )}
                  <span className={`font-black uppercase tracking-[0.2em] text-center text-white text-glow-purple wrap-break-word leading-tight ${displaySizeClass}`}>
                    {coreDisplay}
                  </span>
               </div>
               <div className={`mt-3 rounded-full border px-3 py-0.5 ${variant === "missing_gate" ? "border-amber-400/45 bg-amber-500/15" : "border-violet-500/30 bg-violet-500/10"}`}>
                 <span className={`text-[8px] font-bold uppercase tracking-[0.25em] ${variant === "missing_gate" ? "text-amber-200 logic-core-flicker" : "text-violet-300"}`}>
                   {variant === "missing_gate" ? "Unknown Logic" : "Active Logic"}
                 </span>
               </div>
               {variant !== "missing_gate" && expression && expression !== gateLabel && (
                 <p className="mt-1 text-[8px] uppercase tracking-[0.3em] text-amber-200">
                   {gateLabel}
                 </p>
               )}
            </div>

            <div className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-lg border border-amber-500/40 bg-slate-900 shadow-[0_0_15px_rgba(245,158,11,0.25)] ${variant === "missing_input" ? "logic-core-flicker" : ""}`}>
              <span className="font-mono text-xl font-black text-amber-300">{rightInputLabel}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderLogicGateAnswers = () => {
    const variant = normalizeLogicGateVariant(logicGatePuzzle?.variant);
    const variantTone = getLogicGateVariantTone(variant);
    const variantMeta = getLogicGateVariantMeta(variant);
    const fallbackOptions =
      variant === "missing_gate"
        ? ["AND", "OR", "XOR", "NAND", "XNOR", "NOT"]
        : ["0", "1"];
    const answerOptions =
      Array.isArray(logicGatePuzzle?.options) && logicGatePuzzle.options.length
        ? logicGatePuzzle.options
        : fallbackOptions;
    const variantHeaderClass =
      variant === "missing_gate"
        ? "text-violet-400 text-glow-purple"
        : variant === "missing_input"
          ? "text-amber-400 text-glow-amber"
          : "text-cyan-400 text-glow-blue";
    const variantBorderClass =
      variant === "missing_gate"
        ? "border-violet-500/10"
        : variant === "missing_input"
          ? "border-amber-500/10"
          : "border-cyan-500/10";
    return (
      <div className="rounded-2xl border border-cyan-500/20 bg-slate-950/60 p-5 shadow-[inset_0_0_20px_rgba(6,182,212,0.1)] backdrop-blur-md">
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-2 ${variantBorderClass}`}>
          <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${variantHeaderClass}`}>
            {variantMeta.title}
          </p>
          <span className="text-[10px] font-medium text-slate-500/80 uppercase tracking-widest">
            {variantMeta.subtitle}
          </span>
        </div>
        <div className="mt-6 flex flex-col gap-4">
          {feedback && (
            <div className="flex justify-center">
              <span
                className={`rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.3em] shadow-lg ${getFeedbackBadgeClass(feedback, isCyber)}`}
              >
                {feedback}
              </span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            {answerOptions.map((option) => (
              <button
                key={`logic-answer-${variant}-${option}`}
                type="button"
                onClick={() => handleAnswer(option)}
                className={`group relative overflow-hidden rounded-xl border p-5 text-center transition-all duration-300 border-white/10 bg-slate-900/60 text-slate-200 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] hover:-translate-y-0.5 hover:border-violet-400/40 hover:bg-slate-900/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${variantTone.answerGlow}`}
              >
                <div className="absolute inset-x-0 -top-px h-px bg-linear-to-r from-transparent via-white/50 to-transparent opacity-40 transition-opacity group-hover:opacity-100" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-5 bg-linear-to-b from-white/8 to-transparent opacity-10 transition-opacity group-hover:opacity-25" />
                <div className="pointer-events-none absolute inset-y-0 left-[-35%] w-1/3 -skew-x-12 bg-linear-to-r from-transparent via-white/18 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 logic-scanline" />
                <span
                  className={`block ${variant === "missing_gate" ? "text-2xl font-semibold uppercase tracking-[0.25em]" : "text-4xl font-black uppercase tracking-widest"} text-white text-glow-pink`}
                >
                  {option}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };
  const renderLogicGateReadout = () => {
    const variant = normalizeLogicGateVariant(logicGatePuzzle?.variant);
    const variantTone = getLogicGateVariantTone(variant);
    const variantMeta = getLogicGateVariantMeta(variant);
    const activeExpression = logicGatePuzzle?.expression;
    const activeLabel = activeExpression || logicGatePuzzle?.gate || "Unknown";
    const activeTitle = activeExpression ? "EXPRESSION" : "ACTIVE GATE";
    return (
      <div className={`relative overflow-hidden rounded-2xl border p-5 shadow-[inset_0_0_20px_rgba(245,158,11,0.1)] backdrop-blur-md ${variantTone.shell}`}>
        <div className={`logic-signal-flow pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r ${variantTone.wire} opacity-60`} />
        <div className="mb-4 flex items-center justify-between border-b border-amber-500/10 pb-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-400 text-glow-amber">
            Circuit Readout
          </p>
          <div className="logic-dot-pulse flex h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/40 p-4 transition-all hover:border-amber-500/30 hover:bg-slate-900/60">
            <div className="logic-dot-pulse absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-amber-300/85" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500/60 group-hover:text-amber-400/80 transition-colors">
              VARIANT
            </p>
            <p className={`mt-1 font-black text-white text-glow-amber wrap-break-word leading-tight ${
              variantMeta.variantLabel.length > 12 ? "text-xl" : "text-2xl"
            }`}>
              {variantMeta.variantLabel}
            </p>
            <p className="text-[8px] uppercase tracking-[0.3em] text-amber-200/80">
              {variantMeta.title}
            </p>
          </div>
          <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/40 p-4 transition-all hover:border-amber-500/30 hover:bg-slate-900/60">
            <div className="logic-dot-pulse absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-amber-300/85" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500/60 group-hover:text-amber-400/80 transition-colors">
              ACCURACY
            </p>
            <p className="mt-1 text-3xl font-black text-white text-glow-amber">
              {accuracy}
            </p>
          </div>
          <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/40 p-4 transition-all hover:border-violet-500/30 hover:bg-slate-900/60">
            <div className="logic-dot-pulse absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-violet-300/80" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-violet-500/60 group-hover:text-violet-400/80 transition-colors">
              {activeTitle}
            </p>
            <p className="mt-1 text-2xl font-black text-white text-glow-purple">
              {activeLabel}
            </p>
          </div>
          <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/40 p-4 transition-all hover:border-fuchsia-500/30 hover:bg-slate-900/60">
            <div className="logic-dot-pulse absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-fuchsia-300/80" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-fuchsia-500/60 group-hover:text-fuchsia-400/80 transition-colors">
              STREAK
            </p>
            <p className="mt-1 text-3xl font-black text-white text-glow-pink">
              {streak}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // --- RENDER HELPERS (SIGNAL PATH) ---
  const renderSignalPathRulePanel = () => {
    const ruleText = signalPathPuzzle?.rule || "Choose the path that satisfies the signal constraint.";
    const ruleType = signalPathPuzzle?.ruleType || "unknown";
    const ruleTypeLabel = ruleType.replace(/_/g, " ").toUpperCase();
    return (
      <div className="rounded-2xl border border-violet-500/25 bg-slate-950/60 p-5 shadow-[inset_0_0_20px_rgba(139,92,246,0.08)] backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-violet-500/15 pb-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-400">
            Routing Rule
          </p>
          <span className="max-w-[60%] min-w-0 truncate rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-[0.25em] text-violet-300 sm:text-[9px] whitespace-nowrap" title={ruleTypeLabel}>
            {ruleTypeLabel}
          </span>
        </div>
        <div className="mt-5">
          <p className="text-sm font-semibold leading-relaxed text-white">
            {ruleText}
          </p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-violet-400/60">
            Choose the path that satisfies the signal constraint.
          </p>
        </div>
      </div>
    );
  };

  const renderSignalPathNetwork = () => {
    const nodes = Array.isArray(signalPathPuzzle?.nodes) ? signalPathPuzzle.nodes : [];
    const paths = Array.isArray(signalPathPuzzle?.paths) ? signalPathPuzzle.paths : [];
    const nodeValueMap = nodes.reduce((acc, node) => {
      acc[node.id] = node.value;
      return acc;
    }, {});

    return (
      <div className="rounded-2xl border border-violet-500/20 bg-slate-950/60 p-5 shadow-[inset_0_0_20px_rgba(139,92,246,0.08)] backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-violet-500/10 pb-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-400">
            Signal Network
          </p>
          <span className="text-[10px] font-medium text-violet-500/40 uppercase tracking-widest">
            {nodes.length} nodes
          </span>
        </div>

        {/* Node Map */}
        <div className="mt-5">
          <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500">
            Node Map
          </p>
          <div className="flex flex-wrap gap-2">
            {nodes.length > 0 ? nodes.map((node) => (
              <div
                key={node.id}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
                  node.value === 1
                    ? "border-violet-400/40 bg-violet-400/10 shadow-[0_0_10px_rgba(139,92,246,0.2)]"
                    : "border-slate-600/40 bg-slate-900/60"
                }`}
              >
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">
                  {node.id}
                </span>
                <span
                  className={`text-base font-black ${
                    node.value === 1
                      ? "text-violet-300"
                      : "text-slate-500"
                  }`}
                >
                  {node.value}
                </span>
                <div
                  className={`h-1.5 w-1.5 rounded-full ${
                    node.value === 1
                      ? "bg-violet-400 shadow-[0_0_6px_rgba(139,92,246,0.7)]"
                      : "bg-slate-700"
                  }`}
                />
              </div>
            )) : (
              <p className="text-xs text-slate-500">No node data</p>
            )}
          </div>
        </div>

        {/* Path Routes */}
        <div className="mt-5">
          <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.3em] text-slate-500">
            Candidate Routes
          </p>
          <div className="space-y-2">
            {paths.length > 0 ? paths.map((path) => (
              <div
                key={path.id}
                className="flex items-center gap-2 rounded-xl border border-white/5 bg-slate-900/40 px-3 py-2"
              >
                <span className="w-14 shrink-0 text-[9px] font-black uppercase tracking-[0.2em] text-violet-400/70">
                  {path.label || `Path ${path.id}`}
                </span>
                <div className="flex flex-1 flex-wrap items-center gap-1.5">
                  {Array.isArray(path.route) ? path.route.map((nodeId, index) => {
                    const val = nodeValueMap[nodeId];
                    return (
                      <span key={`${nodeId}-${index}`} className="flex items-center gap-1">
                        <span
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-md border text-[10px] font-black transition-all duration-200 ${
                            val === 1
                              ? "border-violet-400/50 bg-violet-400/15 text-violet-200 group-hover:bg-violet-400/25 group-hover:shadow-[0_0_8px_rgba(139,92,246,0.4)]"
                              : "border-slate-600/40 bg-slate-900/70 text-slate-400"
                          }`}
                        >
                          {nodeId}={val ?? "?"}
                        </span>
                        {index < path.route.length - 1 && (
                          <span className="text-[9px] text-violet-500/50">→</span>
                        )}
                      </span>
                    );
                  }) : null}
                </div>
              </div>
            )) : (
              <p className="text-xs text-slate-500">No path data</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSignalPathAnswers = () => {
    const paths = Array.isArray(signalPathPuzzle?.paths) ? signalPathPuzzle.paths : [];
    const options = Array.isArray(signalPathPuzzle?.options) ? signalPathPuzzle.options : [];
    const displayOptions = options.length > 0 ? options : paths.map((p) => p.id);

    return (
      <div className="rounded-2xl border border-violet-500/20 bg-slate-950/60 p-5 shadow-[inset_0_0_20px_rgba(139,92,246,0.08)] backdrop-blur-md">
        <div className="flex items-center justify-between border-b border-violet-500/10 pb-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-400">
            Route Selection
          </p>
          <span className="text-[10px] font-medium text-violet-500/40 uppercase tracking-widest">
            Select the correct path
          </span>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          {feedback && (
            <div className="flex justify-center">
              <span className={`rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.3em] shadow-lg ${getFeedbackBadgeClass(feedback, isCyber)}`}>
                {feedback}
              </span>
            </div>
          )}

          {displayOptions.length > 0 ? displayOptions.map((optionId) => {
            return (
              <button
                key={`signal-answer-${optionId}`}
                type="button"
                onClick={() => handleAnswer(optionId)}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/60 p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-400/40 hover:bg-slate-900/80 hover:shadow-[0_0_28px_rgba(139,92,246,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                <div className="absolute inset-x-0 -top-px h-px bg-linear-to-r from-transparent via-violet-300/40 to-transparent opacity-30 transition-opacity group-hover:opacity-100" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-5 bg-linear-to-b from-white/8 to-transparent opacity-10 transition-opacity group-hover:opacity-25" />
                <div className="pointer-events-none absolute inset-y-0 left-[-35%] w-1/3 -skew-x-12 bg-linear-to-r from-transparent via-white/18 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 logic-scanline" />
                <span
                  className="block text-4xl font-black uppercase tracking-widest text-white text-glow-pink"
                >
                  {optionId}
                </span>
              </button>
            );
          }) : (
            <p className="text-xs text-slate-500">No options available</p>
          )}
        </div>
      </div>
    );
  };

  const renderSignalPathReadout = () => {
    const ruleType = signalPathPuzzle?.ruleType ?? "unknown";
    const ruleTypeDisplay = ruleType.replace(/_/g, " ").toUpperCase();
    const nodeCount = Array.isArray(signalPathPuzzle?.nodes) ? signalPathPuzzle.nodes.length : 0;
    return (
      <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-slate-950/60 p-5 shadow-[inset_0_0_20px_rgba(139,92,246,0.08)] backdrop-blur-md">
        <div className="logic-signal-flow pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-violet-300/60 via-fuchsia-300/50 to-violet-300/60 opacity-55" />
        <div className="mb-4 flex items-center justify-between border-b border-violet-500/10 pb-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-400">
            Path Readout
          </p>
          <div className="logic-dot-pulse h-2 w-2 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.6)]" />
        </div>
        <div className="grid gap-3">
          <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/40 p-4 transition-all hover:border-violet-500/30 hover:bg-slate-900/60">
            <div className="logic-dot-pulse absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-violet-300/80" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-violet-500/60 group-hover:text-violet-400/80 transition-colors">
              ACCURACY
            </p>
            <p className="mt-1 text-3xl font-black text-white text-glow-emerald">
              {accuracy}
            </p>
          </div>
          <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/40 p-4 transition-all hover:border-violet-500/30 hover:bg-slate-900/60">
            <div className="logic-dot-pulse absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-violet-300/80" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-violet-500/60 group-hover:text-violet-400/80 transition-colors">
              RULE TYPE
            </p>
            <p className={`mt-1 font-black uppercase tracking-[0.2em] text-white text-glow-purple wrap-break-word text-center leading-tight ${
              ruleTypeDisplay.length > 12 ? "text-lg sm:text-xl" : ruleTypeDisplay.length > 8 ? "text-xl sm:text-2xl" : "text-[2rem]"
            }`}>
              {ruleTypeDisplay}
            </p>
          </div>
          <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/40 p-4 transition-all hover:border-amber-500/30 hover:bg-slate-900/60">
            <div className="logic-dot-pulse absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-amber-300/80" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500/60 group-hover:text-amber-400/80 transition-colors">
              NODE COUNT
            </p>
            <p className="mt-1 text-3xl font-black text-white text-glow-amber">
              {nodeCount}
            </p>
          </div>
          <div className="group relative overflow-hidden rounded-xl border border-white/10 bg-slate-900/40 p-4 transition-all hover:border-cyan-500/30 hover:bg-slate-900/60">
            <div className="logic-dot-pulse absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-fuchsia-300/80" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-fuchsia-500/60 group-hover:text-fuchsia-400/80 transition-colors">
              STREAK
            </p>
            <div className="mt-1 flex items-end gap-2">
              <p className="text-3xl font-black text-white text-glow-pink">
                {streak}
              </p>
              {streak >= 3 && (
                <span className="mb-1 text-[10px] font-bold uppercase text-fuchsia-300 animate-bounce">
                  Hot!
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSprintReadout = () => (
    <div className={`rounded-2xl border backdrop-blur-sm transition-all duration-300 p-5 ${isCyber ? "border-fuchsia-500/20 bg-slate-950/60 shadow-[inset_0_0_20px_rgba(217,70,239,0.12)]" : "border-white/10 bg-slate-950/40 shadow-[0_4px_20px_rgba(0,0,0,0.2)]"}`}>
      <div className={`mb-4 flex items-center justify-between border-b pb-3 ${isCyber ? "border-fuchsia-500/10" : "border-white/5"}`}>
        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isCyber ? "text-fuchsia-400 text-glow-pink" : "text-fuchsia-400"}`}>
          Sprint Readout
        </p>
        <div className={`flex h-2 w-2 rounded-full bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,0.5)] animate-pulse`} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className={`group rounded-xl border p-4 transition-all ${isCyber ? "border-white/10 bg-slate-900/40 hover:bg-slate-900/60 hover:border-fuchsia-500/30" : "border-white/5 bg-slate-900/60 hover:bg-slate-900/80 hover:border-white/10"}`}>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 group-hover:text-slate-400 transition-colors">
            ACCURACY
          </p>
          <p className={`mt-1 text-3xl font-black ${isCyber ? "text-white text-glow-blue" : "text-white"}`}>
            {sequenceSprintSummary?.accuracy ?? 0}%
          </p>
        </div>
        <div className={`group rounded-xl border p-4 transition-all ${isCyber ? "border-white/10 bg-slate-900/40 hover:bg-slate-900/60 hover:border-fuchsia-500/30" : "border-white/5 bg-slate-900/60 hover:bg-slate-900/80 hover:border-white/10"}`}>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 group-hover:text-slate-400 transition-colors">
            SOLVED
          </p>
          <p className="mt-1 text-3xl font-black text-white">
            {sequenceSolvedCount}
            <span className="mx-2 text-lg font-medium text-slate-500">/</span>
            <span className="text-xl text-slate-400">{sequenceTotalCount}</span>
          </p>
        </div>
        <div className={`group rounded-xl border p-4 transition-all ${isCyber ? "border-white/10 bg-slate-900/40 hover:bg-slate-900/60 hover:border-fuchsia-500/30" : "border-white/5 bg-slate-900/60 hover:bg-slate-900/80 hover:border-white/10"}`}>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 group-hover:text-slate-400 transition-colors">
            STREAK
          </p>
          <div className="mt-1 flex items-end gap-2">
            <p className={`text-3xl font-black ${isCyber ? "text-fuchsia-400 text-glow-pink" : "text-fuchsia-400"}`}>
              {streak}
            </p>
            {streak >= 3 && (
              <span className={`mb-1 text-[10px] font-bold uppercase text-fuchsia-300 animate-bounce`}>
                Hot!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  function handleAnswer(selectedAnswer) {
    if (gameOverRef.current || isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    dismissRecommendedBanner();

    if (activePuzzleType === PUZZLE_TYPES.SEQUENCE_SPRINT) {
      setSequenceSprintSelectedAnswer(selectedAnswer);
    }
    if (activePuzzleType === RULE_SHIFT_PUZZLE_TYPE) {
      setRuleShiftSelectedAnswer(selectedAnswer);
    }

    const isCorrect =
      activePuzzleType === PUZZLE_TYPES.SEQUENCE_SPRINT
        ? selectedAnswer === sequenceSprintPuzzle.answer
        : activePuzzleType === PUZZLE_TYPES.GRID_RECALL
          ? selectedAnswer === gridRecallPuzzle.answer
          : activePuzzleType === PUZZLE_TYPES.LOGIC_GRID
            ? selectedAnswer === logicGridPuzzle.answer
            : activePuzzleType === RULE_SHIFT_PUZZLE_TYPE
              ? selectedAnswer === ruleShiftPuzzle.answer
              : activePuzzleType === PUZZLE_TYPES.LOGIC_GATE
                ? selectedAnswer === logicGatePuzzle.answer
                : activePuzzleType === PUZZLE_TYPES.SIGNAL_PATH
                  ? selectedAnswer === signalPathPuzzle.answer
                  : checkAnswer(currentPuzzle, selectedAnswer);

    const nextSequenceSolvedCount =
      activePuzzleType === PUZZLE_TYPES.SEQUENCE_SPRINT && isCorrect
        ? sequenceSolvedCount + 1
        : sequenceSolvedCount;

    if (activePuzzleType === PUZZLE_TYPES.SEQUENCE_SPRINT && isCorrect) {
      setSequenceSprintSolvedCount((prev) => prev + 1);
    }

    const nextTotalAnswers = totalAnswers + 1;
    const nextCorrectAnswers = isCorrect ? correctAnswers + 1 : correctAnswers;
    const nextStreak = isCorrect ? streak + 1 : 0;
    const nextBestStreak = isCorrect
      ? Math.max(bestStreak, nextStreak)
      : bestStreak;

    const nextLiveAdaptiveDifficulty = calculateLiveAdaptiveDifficulty({
      puzzlesAttempted: nextTotalAnswers,
      puzzlesCorrect: nextCorrectAnswers,
      currentStreak: nextStreak,
      averageReactionTime: 0,
      recentAnswerHistory: [...recentAnswerHistory, isCorrect].slice(-5),
    });

    processAnswerResult({
      isCorrect,
      nextTotalAnswers,
      nextCorrectAnswers,
      nextStreak,
      nextBestStreak,
      nextLiveAdaptiveDifficulty,
      puzzleType: activePuzzleType,
      nextSequenceSolvedCount,
      allowAfterFeedbackWhileGameOver:
        activePuzzleType === PUZZLE_TYPES.SEQUENCE_SPRINT ||
        activePuzzleType === PUZZLE_TYPES.GRID_RECALL,
      afterFeedback: (targetDifficulty) => {
        loadNextPuzzle(targetDifficulty);
      },
    });
  }

  function resetGame(
    nextDifficulty = initialTargetDifficulty,
    nextPuzzleType = activePuzzleType,
  ) {
    setActivePuzzleType(nextPuzzleType);
    const newPuzzle = getNextPuzzleByType(nextPuzzleType, nextDifficulty);
    hasRecordedSessionRef.current = false;
    if (nextPuzzleType === PUZZLE_TYPES.SEQUENCE_SPRINT) {
      setSequenceSprintSelectedAnswer(null);
      setSequenceSprintPuzzle(newPuzzle);
    } else if (nextPuzzleType === PUZZLE_TYPES.GRID_RECALL) {
      setGridRecallPuzzle(newPuzzle);
      setGridRecallPhase("memorize");
    } else if (nextPuzzleType === PUZZLE_TYPES.LOGIC_GRID) {
      setLogicGridPuzzle(newPuzzle);
    } else if (nextPuzzleType === RULE_SHIFT_PUZZLE_TYPE) {
      setRuleShiftSelectedAnswer(null);
      setRuleShiftPuzzle(newPuzzle);
    } else if (nextPuzzleType === PUZZLE_TYPES.LOGIC_GATE) {
      setLogicGatePuzzle(newPuzzle);
    } else if (nextPuzzleType === PUZZLE_TYPES.SIGNAL_PATH) {
      setSignalPathPuzzle(newPuzzle);
    } else {
      setCurrentPuzzle(newPuzzle);
    }
    applyLiveAdaptiveDifficulty({
      state:
        Object.keys(adaptiveStateToDifficultyMap).find(
          (state) => adaptiveStateToDifficultyMap[state] === nextDifficulty,
        ) || "steady",
      targetDifficulty: nextDifficulty,
      confidence: "low",
      reason: initialAdaptiveReason,
    });
    setScore(0);
    setBaseScoreEarned(0);
    setComboBonusEarned(0);
    setLastScoreGain(null);
    setStreak(0);
    setBestStreak(0);
    setFeedback("");
    setCorrectAnswers(0);
    setTotalAnswers(0);
    setPuzzlesSeen(1);
    setTimeLeft(45);
    setRecentAnswerHistory([]);
    setAdaptiveShiftMessage("");
    setDidBreakRecommendedAlignment(false);
    setShowPuzzleTransitionFx(false);
    setShowSolveFx(false);
    setIsLightningActive(false);
    setMatrixOverdrive(false);
    setShowNeuralProfile(false);
    setNeuralScanActive(false);
    setNeuralScanCompleted(false);
    setIdentityLockVisible(false);
    setAnalysisLineCount(0);
    setShowPerformanceStrip(false);
    setShowScoreBreakdown(false);
    setShowActionButton(false);
    setTerminalRevealComplete(false);
    setScoreDisplay(0);
    setBaseScoreDisplay(0);
    setComboScoreDisplay(0);
    isTransitioningRef.current = false;
    setGameOver(false);
    setSessionOutcome(null);
    setCognitiveIdentity(null);
    setSequenceSprintSolvedCount(0);
  }
  const accuracy =
    totalAnswers === 0
      ? "--"
      : `${Math.round((correctAnswers / totalAnswers) * 100)}%`;
  const answeredAccuracyValue =
    totalAnswers === 0
      ? 0
      : Math.round((correctAnswers / totalAnswers) * 100);
  const totalScore = score;
  const roundScoreEarned = baseScoreEarned + comboBonusEarned;
  const sessionScoreEarned = roundScoreEarned;
  const comboMultiplier =
    totalAnswers === 0
      ? null
      : getComboMultiplier(streak);
  const scoreBreakdown = useMemo(() => {
    const displayComboMultiplier =
      lastScoreGain?.comboMultiplier ?? comboMultiplier ?? 1;

    return {
      totalScore,
      baseScoreEarned,
      comboBonusEarned,
      roundScoreEarned,
      sessionScoreEarned,
      comboMultiplier: displayComboMultiplier,
      comboStateLabel:
        lastScoreGain?.scoreStateLabel ??
        (totalAnswers === 0
          ? "Awaiting first solve"
          : displayComboMultiplier > 1
            ? "Combo bonus"
            : "Base award"),
      lastGain: lastScoreGain?.totalAwarded ?? 0,
      lastScoreGain,
    };
  }, [
    totalScore,
    baseScoreEarned,
    comboBonusEarned,
    roundScoreEarned,
    sessionScoreEarned,
    totalAnswers,
    comboMultiplier,
    lastScoreGain,
  ]);

  useEffect(() => {
    if (!gameOver) return undefined;

    const durationMs = 1200;
    const startTime = performance.now();
    let rafId;

    const animate = (now) => {
      const progress = Math.min((now - startTime) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setScoreDisplay(Math.round(totalScore * eased));
      setBaseScoreDisplay(Math.round(baseScoreEarned * eased));
      setComboScoreDisplay(Math.round(comboBonusEarned * eased));

      if (progress < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [gameOver, totalScore, baseScoreEarned, comboBonusEarned]);
  const gridRecallPhaseLabel =
    gridRecallPhase === "memorize" ? "Memorization Phase" : "Recall Phase";
  const gridRecallMatrix = useMemo(
    () => formatGridAsMatrix(gridRecallPuzzle?.answer),
    [gridRecallPuzzle],
  );
  const displayedGridRecallMatrix = isValidGridMatrix(
    gridRecallMatrix,
    gridRecallGridSize,
  )
    ? gridRecallMatrix
    : buildBlankGridMatrix(gridRecallGridSize);
  const sequenceSprintAccuracy = sequenceSprintSummary?.accuracy ?? 0;
  const sequenceSprintTotalPuzzles =
    sequenceSprintSummary?.totalPuzzles ?? sequenceTotalCount;
  const sequenceSprintUnanswered = Math.max(
    0,
    sequenceSprintSummary?.unanswered ??
      sequenceSprintTotalPuzzles - totalAnswers,
  );

    const resultsCopy =
    activePuzzleType === PUZZLE_TYPES.SEQUENCE_SPRINT
      ? buildSequenceSprintResultsCopy({
          accuracy: sequenceSprintAccuracy,
          correctAnswers,
          totalPuzzles: sequenceSprintTotalPuzzles,
          unanswered: sequenceSprintUnanswered,
        })
      : activePuzzleType === PUZZLE_TYPES.GRID_RECALL
        ? buildGridRecallResultsCopy({
            accuracy: gridRecallAccuracy,
            correctAnswers,
          })
        : activePuzzleType === PUZZLE_TYPES.LOGIC_GRID
          ? buildLogicGridResultsCopy({
              accuracy: answeredAccuracyValue,
              correctAnswers,
            })
          : activePuzzleType === RULE_SHIFT_PUZZLE_TYPE
            ? buildRuleShiftResultsCopy({
                accuracy: answeredAccuracyValue,
                correctAnswers,
              })
          : activePuzzleType === PUZZLE_TYPES.LOGIC_GATE
            ? buildLogicGateResultsCopy({
                accuracy: answeredAccuracyValue,
                correctAnswers,
              })
            : activePuzzleType === PUZZLE_TYPES.SIGNAL_PATH
              ? buildSignalPathResultsCopy({
                  accuracy: answeredAccuracyValue,
                  correctAnswers,
                  ruleType: signalPathPuzzle?.ruleType,
                })
            : {
                eyebrow: "Challenge Complete",
                title: "Pattern Rush Results",
                summary: getPerformanceMessage(),
              };
  function getPerformanceMessage() {
    if (totalAnswers === 0) {
      return "No response data captured.";
    }

    const accuracyValue = Math.round((correctAnswers / totalAnswers) * 100);

    if (accuracyValue >= 90 && bestStreak >= 6) {
      return "Exceptional stability. Pattern recognition remained precise under pressure.";
    }

    if (accuracyValue >= 80 && bestStreak >= 4) {
      return "Strong performance. Reliable recognition throughout the round.";
    }

    if (accuracyValue >= 70) {
      return "Good analytical performance with solid accuracy.";
    }

    if (accuracyValue >= 60) {
      return "Moderate stability. Pattern recognition is developing.";
    }

    return "Unstable response under pressure. Additional reps recommended.";
  }

  const activeAnalysisAccent = activeAnalysisProfile.accentColor;
  const terminalRevealLines = buildPhantomTerminalLines({
    cognitiveIdentityLabel: cognitiveIdentity?.label,
    activePuzzleType,
    activeAnalysisProfile,
    resultsCopy,
  });
  const neuralAnalysisLines = buildTerminalAnalysisLines(
    activePuzzleType,
    activeAnalysisProfile,
  );

  return (
    <div className="animate-fadeIn px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div
          className={`rounded-[28px] border p-6 md:p-8 ${
            isCyber
              ? "border-cyan-400/20 bg-slate-950/80 shadow-[0_0_50px_rgba(14,165,233,0.15)] backdrop-blur-xl"
              : "border-slate-200 bg-white shadow-sm"
          }`}
        >
          {recommendedSession && showRecommendedBanner && (
            <div
              className={`overflow-hidden transition-all duration-500 ${
                isBannerHiding
                  ? "mb-0 max-h-0 -translate-y-4 opacity-0"
                  : "mb-4 max-h-60 translate-y-0 opacity-100"
              }`}
            >
              <div
                className={`rounded-2xl border bg-slate-900/70 px-4 py-3 shadow-lg transition-all duration-500 ${
                  recommendedSessionTone.border
                } ${isBannerHiding ? "scale-[0.98]" : "scale-100"}`}
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div
                    className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] ${
                      recommendedSessionTone.label
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={faBolt}
                      className="text-cyan-400 [--fa-secondary-color:var(--color-fuchsia-500)] [--fa-secondary-opacity:1]"
                    />
                    Recommended Session
                  </div>

                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${
                      recommendedSessionTone.badge
                    }`}
                  >
                    {recommendedSessionLabels[
                      recommendedSession.adaptiveState
                    ] || recommendedSessionLabels.default}
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-slate-200 md:text-base">
                    {recommendedSession.recommendation}
                  </p>
                  <p className="text-xs leading-6 text-slate-400 md:text-sm">
                    {recommendedSessionReason}
                  </p>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500 md:text-xs">
                    Opening difficulty: {recommendedOpeningDifficulty}
                  </p>
                </div>
                {activePuzzleType === PUZZLE_TYPES.GRID_RECALL && (
                  <div className="mt-3 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-300">
                    <span className="text-white">Recall phase</span>
                    <span className="rounded-full border border-cyan-400/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-200">
                      {gridRecallPhaseLabel}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <div
              className={`group relative overflow-hidden rounded-2xl border px-5 py-4 transition-all duration-300 ${
                isCyber
                  ? "border-cyan-400/20 bg-cyan-400/5 shadow-[0_0_15px_rgba(34,211,238,0.05)]"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              {isCyber && (
                <div className="absolute -right-4 -top-4 h-12 w-12 rounded-full bg-cyan-400/5 blur-xl transition-all group-hover:bg-cyan-400/10" />
              )}
              <p
                className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] ${
                  isCyber ? "text-cyan-300 text-glow-blue" : "text-slate-500"
                }`}
              >
                <FontAwesomeIcon
                  icon={faBrain}
                  className="text-cyan-400 [--fa-secondary-color:var(--color-fuchsia-500)] [--fa-secondary-opacity:1]"
                />
                Challenge
              </p>
              <h1
                className={`mt-2 text-2xl font-black tracking-tight ${
                  isCyber ? "text-cyan-400" : "text-cyan-600"
                }`}
              >
                {activePuzzleMeta.label}
              </h1>
              <p
                className={`mt-2 text-sm leading-5 ${
                  isCyber ? "text-slate-200" : "text-slate-500"
                }`}
              >
                {activePuzzleMeta.description}
              </p>
              {activePuzzleMeta.cognitiveSkills?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {activePuzzleMeta.cognitiveSkills.map((skill) => (
                    <span
                      key={skill}
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-black tracking-tight uppercase ${
                        isCyber
                          ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-200"
                          : "border-slate-200 bg-slate-100 text-slate-600"
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div
              className={`group relative overflow-hidden rounded-2xl border px-5 py-4 text-center transition-all duration-300 ${
                isCyber
                  ? "border-fuchsia-400/20 bg-fuchsia-500/5 shadow-[0_0_15px_rgba(217,70,239,0.05)]"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              {isCyber && (
                <div className="absolute -right-4 -top-4 h-12 w-12 rounded-full bg-fuchsia-400/5 blur-xl transition-all group-hover:bg-fuchsia-400/10" />
              )}
              <p
                className={`flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] ${
                  isCyber ? "text-fuchsia-300 text-glow-pink" : "text-slate-500"
                }`}
              >
                <FontAwesomeIcon
                  icon={faBolt}
                  className="text-cyan-400 [--fa-secondary-color:var(--color-fuchsia-500)] [--fa-secondary-opacity:1]"
                />
                Time Remaining
              </p>
              <div
                className={`mt-2 font-mono text-3xl font-black ${
                  isCyber
                    ? `text-fuchsia-400 ${
                        timeLeft <= 5
                          ? "animate-pulse text-red-400"
                          : "text-glow-pink"
                      }`
                    : "text-slate-800"
                }`}
              >
                {timeLeft.toString().padStart(2, "0")}s
              </div>
            </div>

            <div
              className={`group relative overflow-hidden rounded-2xl border px-5 py-4 transition-all duration-300 ${
                isCyber
                  ? "border-cyan-400/20 bg-cyan-400/5 hover:border-cyan-400/40"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              {isCyber && (
                <div className="absolute -right-4 -top-4 h-12 w-12 rounded-full bg-cyan-400/5 blur-xl transition-all group-hover:bg-cyan-400/10" />
              )}
              <p
                className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] ${
                  isCyber ? "text-slate-400" : "text-slate-500"
                }`}
              >
                <FontAwesomeIcon
                  icon={faLayerGroup}
                  className="text-cyan-400 [--fa-secondary-color:var(--color-fuchsia-500)] [--fa-secondary-opacity:1]"
                />
                Mode
              </p>
              <div
                className={`mt-2 inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                  isCyber
                    ? "bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/20"
                    : "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200"
                }`}
              >
                Solo Arena
              </div>
            </div>
          </div>

          <div
            className={`relative mt-6 overflow-hidden rounded-3xl border p-6 md:p-10 ${
              isCyber
                ? activePuzzleType === PUZZLE_TYPES.SEQUENCE_SPRINT
                  ? "border-fuchsia-500/30 bg-[linear-gradient(180deg,rgba(18,10,28,0.95)_0%,rgba(9,6,20,0.98)_100%)] shadow-[inset_0_0_0_1px_rgba(217,70,239,0.08)]"
                  : "border-cyan-400/20 bg-[linear-gradient(180deg,rgba(10,17,32,0.95)_0%,rgba(7,11,20,0.98)_100%)] shadow-[inset_0_0_0_1px_rgba(34,211,238,0.04)]"
                : "border-slate-200 bg-white"
            }`}
          >
            <MatrixRain
              mode={matrixRainMode}
              intensity={gameOver ? (matrixOverdrive ? "heavy" : "light") : "medium"}
              opacity={gameOver ? (matrixOverdrive ? 0.72 : 0.5) : 1}
              className={`-inset-12 z-0 transition-opacity duration-1000 ${
                gameOver
                  ? matrixOverdrive
                    ? "opacity-[0.55]"
                    : "opacity-40"
                  : "opacity-80"
              }`}
            />

                {isLightningActive && (
                  <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
                    <style>{`@keyframes arena-lightning-strike { 0% { opacity: 0; transform: scale(0.985) translateY(-3px); } 10% { opacity: 1; transform: scale(1.01) translateY(0); } 22% { opacity: 0.82; } 45% { opacity: 1; } 70% { opacity: 0.36; } 100% { opacity: 0; transform: scale(1.015) translateY(2px); } } @keyframes arena-lightning-flicker { 0%, 100% { opacity: 0.72; } 50% { opacity: 1; } } @keyframes arena-terminal-line { 0% { opacity: 0; transform: translateY(8px); filter: blur(4px); } 100% { opacity: 1; transform: translateY(0); filter: blur(0); } } @keyframes arena-terminal-cursor-blink { 0%, 45% { opacity: 1; } 50%, 100% { opacity: 0; } } @keyframes arena-terminal-flicker { 0%, 100% { opacity: 0.28; transform: scaleX(0.985); } 50% { opacity: 0.6; transform: scaleX(1.01); } } @keyframes arena-terminal-key-pulse { 0%, 100% { opacity: 0.5; filter: brightness(1); } 50% { opacity: 0.8; filter: brightness(1.3); } }`}</style>
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-72 overflow-hidden"
                  aria-hidden="true"
                >
                  <div
                    className={`absolute inset-x-0 bottom-14 h-16 bg-[radial-gradient(circle_at_50%_50%,rgba(34,211,238,0.16),rgba(217,70,239,0.08)_42%,transparent_72%)] blur-3xl transition-opacity duration-700 ${
                      terminalRevealComplete ? "opacity-100" : "opacity-70"
                    }`}
                    style={{ animation: "arena-terminal-flicker 4.8s ease-in-out infinite" }}
                    aria-hidden="true"
                  />
                  <div className="absolute inset-x-0 bottom-16 flex justify-center px-6">
                    <div className="w-full max-w-3xl">
                      <div className="mb-4 flex flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em]">
                        {terminalRevealLines.map((line, index) => {
                          const isFinalLine =
                            index === terminalRevealLines.length - 1;
                          const accentGlow =
                            index === 1
                              ? "rgba(217, 70, 239, 0.32)"
                              : "rgba(34, 211, 238, 0.28)";
                          const isPulseLine = terminalRevealComplete && isFinalLine;

                          return (
                            <p
                              key={`${line.text}-${index}`}
                              className={`flex items-center gap-2 transition-all duration-500 ${line.tone} ${
                                isPulseLine ? "text-white/90" : ""
                              }`}
                              style={{
                                animation: "arena-terminal-line 420ms ease-out both",
                                animationDelay: `${line.delayMs}ms`,
                                textShadow: isPulseLine
                                  ? `0 0 16px ${accentGlow}`
                                  : `0 0 10px ${accentGlow}`,
                              }}
                            >
                              <span className="text-slate-300/50">&gt;</span>
                              <span className="whitespace-nowrap">
                                {line.text}
                                {isFinalLine && (
                                  <span
                                    className="ml-0.5 inline-block text-cyan-100/90"
                                    style={{
                                      animation:
                                        "arena-terminal-cursor-blink 1s steps(1, end) infinite",
                                    }}
                                  >
                                    _
                                  </span>
                                )}
                              </span>
                            </p>
                          );
                        })}
                      </div>

                      <div
                        className={`relative h-24 overflow-hidden rounded-[28px] border border-cyan-300/10 bg-slate-950/20 px-5 py-4 blur-sm transition-all duration-700 ${
                          terminalRevealComplete ? "opacity-[0.11]" : "opacity-[0.08]"
                        }`}
                      >
                        <div
                          className={`pointer-events-none absolute inset-0 rounded-[28px] bg-[linear-gradient(90deg,rgba(34,211,238,0),rgba(34,211,238,0.08),rgba(217,70,239,0.08),rgba(34,211,238,0))] transition-opacity duration-700 ${
                            terminalRevealComplete ? "opacity-100" : "opacity-40"
                          }`}
                        />
                        <div className="grid grid-cols-12 gap-2">
                          {Array.from({ length: 48 }).map((_, keyIndex) => {
                            const isWide = keyIndex % 7 === 0 || keyIndex % 11 === 0;
                            const keyTone =
                              keyIndex % 6 === 0
                                ? "bg-cyan-200/85"
                                : keyIndex % 5 === 0
                                  ? "bg-fuchsia-200/75"
                                  : "bg-white/70";

                            return (
                              <span
                                key={`phantom-key-${keyIndex}`}
                                className={`h-2.5 rounded-sm ${isWide ? "col-span-2" : "col-span-1"} ${keyTone}`}
                                style={{
                                  opacity: isWide ? 0.8 : 0.65,
                                  animation: terminalRevealComplete
                                    ? "arena-terminal-key-pulse 1.8s ease-in-out infinite"
                                    : undefined,
                                  animationDelay: `${(keyIndex % 8) * 80}ms`,
                                  filter: `drop-shadow(0 0 6px ${
                                    keyIndex % 5 === 0
                                      ? "rgba(217, 70, 239, 0.16)"
                                      : "rgba(34, 211, 238, 0.12)"
                                  })`,
                                }}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                </div>
              )}
              {isCyber && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-grid-cyber opacity-[0.03]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(217,70,239,0.12),transparent_55%)]" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_80%,rgba(34,211,238,0.14),transparent_60%)]" />
                  </div>
                )}

                <div className="relative z-10 flex w-full max-w-5xl flex-col items-center gap-10">
                  <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                      <div
                        className="pointer-events-none absolute -inset-8 rounded-full blur-3xl"
                        style={{
                          background: `radial-gradient(circle at 50% 50%, ${hexToRgba(activeAnalysisAccent, 0.5)}, transparent 70%)`,
                          animation: "neural-glow 5.6s ease-in-out infinite",
                        }}
                      />
                      <div
                        className={`relative h-44 w-44 overflow-hidden rounded-4xl border border-white/10 bg-slate-950/70 p-2 backdrop-blur-md transition-all duration-700 md:h-52 md:w-52 ${
                          showNeuralProfile ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                        }`}
                        style={{
                          boxShadow: `0 0 40px ${hexToRgba(activeAnalysisAccent, 0.25)}`,
                        }}
                      >
                        <div
                          className="pointer-events-none absolute inset-0 rounded-[28px]"
                          style={{
                            background: `radial-gradient(circle at 50% 46%, ${hexToRgba(activeAnalysisAccent, 0.25)}, transparent 65%)`,
                            animation: "neural-breath 6s ease-in-out infinite",
                          }}
                        />
                        <img
                          src={neuralProfileImage}
                          alt="Neural identity profile"
                          className={`relative z-10 h-full w-full rounded-3xl object-cover transition-all duration-700 ${
                            neuralScanActive
                              ? "brightness-110 contrast-115 saturate-125"
                              : neuralScanCompleted
                                ? "brightness-105 contrast-125 saturate-115"
                                : "brightness-95 contrast-105 saturate-105"
                          }`}
                          style={{
                            filter:
                              neuralScanActive || neuralScanCompleted
                                ? `drop-shadow(0 0 ${neuralScanActive ? 30 : 20}px ${hexToRgba(activeAnalysisAccent, neuralScanActive ? 0.5 : 0.3)})`
                                : undefined,
                            animation: "neural-breath 6s ease-in-out infinite",
                          }}
                        />
                        {neuralScanActive && (
                          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
                            <div
                              className="neural-scan-pass absolute inset-x-0 top-0 h-20 mix-blend-screen"
                              style={{
                                background: `linear-gradient(to bottom, ${hexToRgba(activeAnalysisAccent, 0)}, ${hexToRgba(activeAnalysisAccent, 0.34)}, ${hexToRgba(activeAnalysisAccent, 0)})`,
                                animationDuration: `${activeAnalysisAnimationProfile.scanDurationMs}ms`,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300/80">
                        Neural Identity
                      </p>
                      <h2
                        className={`text-4xl font-black uppercase tracking-[0.2em] transition-all duration-700 md:text-5xl ${
                          identityLockVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                        }`}
                        style={{
                          color: identityLockVisible
                            ? hexToRgba(activeAnalysisAccent, 0.98)
                            : hexToRgba(activeAnalysisAccent, 0.45),
                          textShadow: identityLockVisible
                            ? `0 0 26px ${hexToRgba(activeAnalysisAccent, 0.5)}`
                            : "none",
                        }}
                      >
                        {cognitiveIdentity?.label || resultsCopy.title}
                      </h2>
                    </div>
                  </div>

                  <div className="w-full max-w-2xl text-left">
                    <div className="space-y-2 font-mono text-[11px] leading-6 uppercase tracking-[0.22em] text-cyan-100/80">
                      {neuralAnalysisLines.slice(0, 3).map((line, index) => {
                        const isVisible = analysisLineCount > index;
                        return (
                          <p
                            key={`${line.text}-${index}`}
                            className={`flex items-center gap-2 transition-all duration-500 ${
                              isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                            } ${line.isFinal ? "text-white/90" : ""}`}
                            style={{
                              transitionDuration: `${activeAnalysisAnimationProfile.lineDurationMs}ms`,
                              color: isVisible
                                ? hexToRgba(activeAnalysisAccent, index === 2 ? 0.9 : 0.84)
                                : hexToRgba(activeAnalysisAccent, 0.42),
                              textShadow: isVisible
                                ? `0 0 12px ${hexToRgba(activeAnalysisAccent, index === 2 ? 0.34 : 0.22)}`
                                : "none",
                            }}
                          >
                            <span className="text-slate-300/55">&gt;</span>
                            <span>{line.text}</span>
                          </p>
                        );
                      })}
                    </div>
                  </div>

                  <div
                    className={`flex w-full max-w-3xl flex-col items-center justify-between gap-6 rounded-2xl bg-white/5 px-6 py-4 text-center transition-all duration-700 sm:flex-row ${
                      showPerformanceStrip ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-300/70">
                        Score
                      </p>
                      <p className="font-mono text-3xl font-black text-white text-glow-blue">
                        {scoreDisplay.toLocaleString()}
                      </p>
                    </div>
                    <div className="h-px w-20 bg-white/10 sm:h-12 sm:w-px" />
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-300/70">
                        Accuracy
                      </p>
                      <p className="font-mono text-3xl font-black text-white text-glow-emerald">
                        {accuracy}
                      </p>
                    </div>
                    <div className="h-px w-20 bg-white/10 sm:h-12 sm:w-px" />
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-fuchsia-300/70">
                        Streak
                      </p>
                      <p className="font-mono text-3xl font-black text-white text-glow-pink">
                        x{bestStreak.toString().padStart(2, "0")}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 px-6 py-5 text-left shadow-[0_0_40px_rgba(34,211,238,0.15)] backdrop-blur-md transition-all duration-700 ${
                      showScoreBreakdown ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-200/80">
                        Score Breakdown
                      </p>
                      <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-fuchsia-200/80">
                        {scoreBreakdown.comboStateLabel}
                      </span>
                    </div>
                    <div className="mt-4 grid gap-4 text-left sm:grid-cols-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                          Base Score
                        </p>
                        <p className="mt-2 font-mono text-2xl font-black text-cyan-100">
                          {baseScoreDisplay.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                          Combo Bonus
                        </p>
                        <p className="mt-2 font-mono text-2xl font-black text-fuchsia-200">
                          +{comboScoreDisplay.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                          Total
                        </p>
                        <p className="mt-2 font-mono text-2xl font-black text-white">
                          {scoreDisplay.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`flex flex-col items-center gap-4 transition-all duration-700 ${
                      showActionButton ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
                    }`}
                  >
                    {sessionOutcome?.nextRecommendedDifficulty && (
                      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-200/70">
                        Suggested Difficulty: {sessionOutcome.nextRecommendedDifficulty}
                      </p>
                    )}
                    <button
                      onClick={() => resetGame()}
                      className={`group relative overflow-hidden rounded-xl px-10 py-4 font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                        isCyber
                          ? "bg-cyan-400 text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:bg-cyan-300 hover:shadow-[0_0_50px_rgba(34,211,238,0.5)] hover:scale-105 active:scale-95"
                          : "bg-cyan-600 text-white hover:bg-cyan-500 shadow-lg"
                      }`}
                    >
                      <span className="relative z-10 flex items-center gap-3">
                        <FontAwesomeIcon
                          icon={faRotateRight}
                          className="text-cyan-400 [--fa-secondary-color:var(--color-fuchsia-500)] [--fa-secondary-opacity:1] transition-transform duration-500 group-hover:rotate-180"
                        />
                        Run Again
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p
                        className={`text-[10px] font-semibold uppercase tracking-[0.25em] ${
                          isCyber ? "text-cyan-300" : "text-cyan-600"
                        }`}
                      >
                        Puzzle Feed
                      </p>
                      <h2
                        className={`mt-1 text-lg font-semibold ${
                          isCyber ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {puzzleFeedTitle}
                      </h2>
                    </div>
                  </div>
                <div
                  className={`mt-6 rounded-2xl border px-4 py-3 transition-all duration-300 ${liveCoachingTone} ${liveCoachingPressureClass}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        Live Coaching
                      </p>

                      <p className="mt-1 text-sm leading-relaxed">
                        {adaptiveCoachingMessage}
                      </p>
                    </div>
                  </div>
                </div>

                {activePuzzleType === PUZZLE_TYPES.SEQUENCE_SPRINT ? (
                  <div className="relative overflow-hidden rounded-3xl border border-fuchsia-500/30 bg-slate-900/80 p-6 shadow-[0_0_20px_rgba(217,70,239,0.1)] backdrop-blur-md">
                    <div className="relative z-10">
                      <div className="mb-6 flex items-center justify-between">
                        <div>
                          <p className={`text-[11px] uppercase tracking-[0.2em] ${isCyber ? "text-fuchsia-400 text-glow-pink" : "text-fuchsia-400"}`}>
                            Sequence Sprint Arena
                          </p>
                          <h2 className={`text-xl font-bold ${isCyber ? "text-white text-glow-blue" : "text-white"}`}>
                            Read the logic. Finish the lane.
                          </h2>
                        </div>
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${isCyber ? "border-fuchsia-500/50 bg-fuchsia-500/30 text-fuchsia-200 shadow-[0_0_15px_rgba(217,70,239,0.4)]" : "border-fuchsia-500/30 bg-fuchsia-500/20 text-fuchsia-300"}`}>
                          Momentum Logic Live
                        </span>
                      </div>

                      {renderSequenceSprintRunner()}

                      <div className="grid gap-6 lg:grid-cols-3">
                        {renderSequencePrompt()}
                        {renderSequenceAnswers()}
                        <div className="space-y-6 lg:col-span-1">
                          {renderSprintReadout()}

                          {shouldShowSequenceDebug && (
                            <DevDebugPanel title="Sequence Sprint Dev">
                              {SHOW_SEQUENCE_SPRINT_ANSWERS && (
                                <div>
                                  <span className="font-bold text-white">
                                    Answer:
                                  </span>{" "}
                                  <span className="text-amber-100">
                                    {sequenceDebugInfo.answer}
                                  </span>
                                </div>
                              )}
                              {SHOW_PUZZLE_DEBUG_META && (
                                <>
                                  <div>
                                    <span className="font-bold text-white">
                                      ID:
                                    </span>{" "}
                                    <span className="text-amber-100">
                                      {sequenceDebugInfo.id}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-bold text-white">
                                      Rule:
                                    </span>{" "}
                                    <span className="text-amber-100">
                                      {formatDevValue(sequenceDebugInfo.rule)}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-bold text-white">
                                      Length:
                                    </span>{" "}
                                    <span className="text-amber-100">
                                      {sequenceDebugInfo.length}
                                    </span>
                                  </div>
                                </>
                              )}
                            </DevDebugPanel>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : activePuzzleType === RULE_SHIFT_PUZZLE_TYPE ? (
                  <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-slate-900/80 p-6 shadow-[0_0_20px_rgba(34,211,238,0.1)] backdrop-blur-md">
                    <div className="relative z-10">
                      <div className="mb-6 flex items-center justify-between">
                        <div>
                          <p className={`text-[11px] uppercase tracking-[0.2em] ${isCyber ? "text-cyan-400 text-glow-blue" : "text-cyan-400"}`}>
                            Rule Shift Arena
                          </p>
                          <h2 className={`text-xl font-bold ${isCyber ? "text-white text-glow-blue" : "text-white"}`}>
                            Read the first rule. Catch the shift.
                          </h2>
                        </div>
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${isCyber ? "border-violet-500/50 bg-violet-500/20 text-violet-200 shadow-[0_0_15px_rgba(167,139,250,0.28)]" : "border-violet-500/30 bg-violet-500/20 text-violet-300"}`}>
                          Arithmetic Transition Live
                        </span>
                      </div>

                      <div className="grid gap-6 lg:grid-cols-3">
                        <div className="space-y-6 lg:col-span-2">
                          {renderRuleShiftPrompt()}
                          {renderRuleShiftAnswers()}
                        </div>
                        <div className="space-y-6 lg:col-span-1">
                          {renderRuleShiftReadout()}

                          {shouldShowSequenceDebug && (
                            <DevDebugPanel title="Rule Shift Dev">
                              {SHOW_ANSWERS && (
                                <div className="flex items-center justify-between rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-2">
                                  <span className="text-[10px] font-bold uppercase text-cyan-300">Answer</span>
                                  <span className="font-mono text-lg font-black text-white">
                                    {ruleShiftDebugInfo?.answer ?? "—"}
                                  </span>
                                </div>
                              )}
                              {SHOW_PUZZLE_DEBUG_META && (
                                <div className="mt-4 space-y-1.5 border-t border-white/5 pt-3 text-[10px]">
                                  <div className="flex justify-between">
                                    <span className="font-bold uppercase text-slate-500">ID</span>
                                    <span className="font-mono text-cyan-200">{ruleShiftDebugInfo?.id}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-bold uppercase text-slate-500">Rule A</span>
                                    <span className="font-mono text-cyan-200">{formatDevValue(ruleShiftDebugInfo?.ruleA)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-bold uppercase text-slate-500">Rule B</span>
                                    <span className="font-mono text-violet-200">{formatDevValue(ruleShiftDebugInfo?.ruleB)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="font-bold uppercase text-slate-500">Shift Index</span>
                                    <span className="font-mono text-amber-200">
                                      {ruleShiftDebugInfo?.shiftIndex !== null && ruleShiftDebugInfo?.shiftIndex !== undefined
                                        ? JSON.stringify(ruleShiftDebugInfo.shiftIndex)
                                        : "—"}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </DevDebugPanel>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : activePuzzleType === PUZZLE_TYPES.SIGNAL_PATH ? (
                  <div className="relative overflow-hidden rounded-3xl border border-violet-500/30 bg-slate-900/80 p-6 shadow-[0_0_20px_rgba(139,92,246,0.1)] backdrop-blur-md">
                    <div className="relative z-10">
                      <div className="mb-6 flex items-center justify-between">
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-violet-400">
                            Signal Path Arena
                          </p>
                          <h2 className="text-xl font-bold text-white text-glow-blue">
                            Route the signal. Obey the rule.
                          </h2>
                        </div>
                        <span className="rounded-full border border-violet-500/50 bg-violet-500/20 px-3 py-1 text-xs font-semibold text-violet-200 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                          Constraint Logic Live
                        </span>
                      </div>

                      <div className="grid gap-6 lg:grid-cols-3">
                        <div className="space-y-6 lg:col-span-2">
                          {renderSignalPathRulePanel()}
                          {renderSignalPathNetwork()}
                          {renderSignalPathAnswers()}
                        </div>
                        <div className="space-y-6 lg:col-span-1">
                          {renderSignalPathReadout()}

                          {shouldShowSignalPathDebug && (
                            <DevDebugPanel title="Signal Path Dev">
                              {SHOW_SIGNAL_PATH_ANSWERS && (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between rounded-lg bg-violet-500/10 p-2 border border-violet-500/20">
                                    <span className="text-[10px] font-bold text-violet-400 uppercase">Answer</span>
                                    <span className="font-mono text-lg font-black text-white">
                                      {signalPathPuzzle?.answer ?? "—"}
                                    </span>
                                  </div>
                                </div>
                              )}
                              {SHOW_PUZZLE_DEBUG_META && (
                                <div className="mt-4 space-y-1.5 border-t border-white/5 pt-3 text-[10px]">
                                  <div className="flex justify-between">
                                    <span className="text-slate-500 uppercase font-bold">ID</span>
                                    <span className="text-amber-200 font-mono">{signalPathDebugInfo.id}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500 uppercase font-bold">Difficulty</span>
                                    <span className="text-amber-200 font-mono">{formatDevValue(signalPathDebugInfo.difficulty)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500 uppercase font-bold">Rule Type</span>
                                    <span className="text-amber-200 font-mono">{formatDevValue(signalPathDebugInfo.ruleType)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500 uppercase font-bold">Nodes</span>
                                    <span className="text-amber-200 font-mono">{signalPathDebugInfo.nodeCount}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500 uppercase font-bold">Paths</span>
                                    <span className="text-amber-200 font-mono">{signalPathDebugInfo.pathCount}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500 uppercase font-bold">Correct Path</span>
                                    <span className="text-amber-200 font-mono">
                                      {signalPathPuzzle?.puzzleMetrics?.correctPathId ?? "—"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-slate-500 uppercase font-bold">Rule</span>
                                    <p className="mt-1 text-[9px] leading-4 text-violet-200/80">{formatDevValue(signalPathDebugInfo.rule)}</p>
                                  </div>
                                </div>
                              )}
                            </DevDebugPanel>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : activePuzzleType === PUZZLE_TYPES.LOGIC_GATE ? (
                  <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-slate-900/80 p-6 shadow-[0_0_20px_rgba(245,158,11,0.1)] backdrop-blur-md">
                    <div className="relative z-10">
                      <div className="mb-6 flex items-center justify-between">
                        <div>
                          <p className={`text-[11px] font-bold uppercase tracking-[0.2em] ${isCyber ? "text-amber-400 text-glow-amber" : "text-amber-400"}`}>
                            Logic Gate Arena
                          </p>
                          <h2 className={`text-xl font-bold ${isCyber ? "text-white text-glow-blue" : "text-white"}`}>
                            Resolve the signal. Predict the output.
                          </h2>
                        </div>
                        <span className="rounded-full border border-amber-500/50 bg-amber-500/30 px-3 py-1 text-xs font-semibold text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                          Binary Reasoning Live
                        </span>
                      </div>

                      <div className="grid gap-6 lg:grid-cols-3">
                        <div className="space-y-6 lg:col-span-2">
                          {renderLogicGateInputs()}
                          {renderLogicGateCore()}
                          {renderLogicGateAnswers()}
                        </div>
                        <div className="space-y-6 lg:col-span-1">
                          {renderLogicGateReadout()}

                          {(SHOW_LOGIC_GATE_ANSWERS || SHOW_PUZZLE_DEBUG_META) && (
                            <DevDebugPanel title="Logic Gate Dev">
                              {SHOW_LOGIC_GATE_ANSWERS && (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between rounded-lg bg-emerald-500/10 p-2 border border-emerald-500/20">
                                    <span className="text-[10px] font-bold uppercase text-emerald-400">Answer</span>
                                    <span className="font-mono text-lg font-black text-white">{logicGatePuzzle.answer}</span>
                                  </div>
                                </div>
                              )}
                              {SHOW_PUZZLE_DEBUG_META && (
                                <div className="mt-4 space-y-1.5 border-t border-white/5 pt-3 text-[10px]">
                                  <div className="flex justify-between">
                                    <span className="text-slate-500 uppercase font-bold">ID</span>
                                    <span className="text-amber-200 font-mono">{logicGatePuzzle.id}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500 uppercase font-bold">Difficulty</span>
                                    <span className="text-amber-200 font-mono">{formatDevValue(logicGatePuzzle.difficulty)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500 uppercase font-bold">Variant</span>
                                    <span className="text-amber-200 font-mono">{formatDevValue(logicGatePuzzle.variant ?? "output")}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500 uppercase font-bold">Expression</span>
                                    <span className="text-amber-200 font-mono">{formatDevValue(logicGatePuzzle.expression ?? "N/A")}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500 uppercase font-bold">Gate</span>
                                    <span className="text-amber-200 font-mono">{formatDevValue(logicGatePuzzle.gate ?? "Unknown")}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-500 uppercase font-bold">Inputs</span>
                                    <div className="mt-1 space-y-1">
                                      {Object.entries(logicGatePuzzle.inputs ?? {}).length ? (
                                        Object.entries(logicGatePuzzle.inputs ?? {}).map(([key, value]) => (
                                          <div key={key} className="flex items-center justify-between">
                                            <span className="text-slate-400 uppercase font-bold">{key}</span>
                                            <span className="text-amber-200 font-mono">
                                              {value === undefined || value === null ? "?" : value}
                                            </span>
                                          </div>
                                        ))
                                      ) : (
                                        <div className="flex justify-between">
                                          <span className="text-slate-500 uppercase font-bold">None</span>
                                          <span className="text-amber-200 font-mono">—</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DevDebugPanel>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : activePuzzleType === PUZZLE_TYPES.GRID_RECALL ? (
                  <div className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-slate-900/80 p-6 shadow-[0_0_20px_rgba(16,185,129,0.1)] backdrop-blur-md">
                    <div className="relative z-10">
                      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                        <div>
                          <p className={`text-[11px] uppercase tracking-[0.2em] ${isCyber ? "text-emerald-400 text-glow-emerald" : "text-emerald-400"}`}>
                            Grid Recall Arena
                          </p>
                          <h2 className={`text-xl font-bold ${isCyber ? "text-white text-glow-blue" : "text-white"}`}>
                            Neuro spatial imprint. Match the pattern.
                          </h2>
                        </div>
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${isCyber ? "border-emerald-500/50 bg-emerald-500/30 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "border-emerald-500/30 bg-emerald-500/20 text-emerald-300"}`}>
                          {gridRecallPhaseLabel}
                        </span>
                      </div>

                      <div className="grid gap-6 lg:grid-cols-3">
                        {renderGridRecallGrid()}
                        {renderGridRecallAnswers()}
                        <div className="space-y-6 lg:col-span-1">
                          {renderGridRecallReadout()}

                          {shouldShowGridRecallDebug && (
                            <DevDebugPanel title="Grid Recall Dev">
                              {SHOW_GRID_RECALL_ANSWERS && (
                                <div>
                                  <div className="font-bold text-white">
                                    Answer Matrix:
                                  </div>
                                  <div className="mt-2 flex flex-col gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-900/40 p-3">
                                    {displayedGridRecallMatrix.map((row, rIdx) => (
                                      <div key={rIdx} className="flex gap-1.5">
                                        {row.map((cell, cIdx) => (
                                          <div
                                            key={cIdx}
                                            className={`h-5 w-5 rounded-md border ${
                                              cell
                                                ? "border-emerald-300 bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]"
                                                : "border-white/20 bg-transparent"
                                            }`}
                                          />
                                        ))}
                                      </div>
                                    ))}
                                  </div>
                                  <p className="mt-2 text-[10px] font-mono text-emerald-400/70">
                                    Raw: {gridRecallPuzzle?.answer}
                                  </p>
                                </div>
                              )}
                              {SHOW_PUZZLE_DEBUG_META && (
                                <>
                                  <div>
                                    <span className="font-bold text-white">
                                      ID:
                                    </span>{" "}
                                    <span className="text-amber-100">
                                      {gridRecallDebugInfo.id}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-bold text-white">
                                      Difficulty:
                                    </span>{" "}
                                    <span className="text-amber-100">
                                      {formatDevValue(gridRecallDebugInfo.difficulty)}
                                    </span>
                                  </div>
                                </>
                              )}
                            </DevDebugPanel>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : activePuzzleType === PUZZLE_TYPES.LOGIC_GRID ? (
                  <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-slate-900/80 p-6 shadow-[0_0_20px_rgba(34,211,238,0.1)] backdrop-blur-md">
                    <div className="relative z-10">
                      <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                        <div>
                          <p className={`text-[11px] font-bold uppercase tracking-[0.2em] ${isCyber ? "text-cyan-400 text-glow-blue" : "text-cyan-400"}`}>
                            Logic Grid Arena
                          </p>
                          <h2 className={`text-xl font-bold ${isCyber ? "text-white text-glow-blue" : "text-white"}`}>
                            Decode the matrix. Resolve the missing cell.
                          </h2>
                        </div>
                        <span className="rounded-full border border-cyan-400/50 bg-cyan-500/20 px-3 py-1 text-xs font-semibold text-cyan-100 shadow-[0_0_15px_rgba(34,211,238,0.25)]">
                          Matrix Reasoning Live
                        </span>
                      </div>

                      <div className="grid gap-6 lg:grid-cols-3">
                        <div className="space-y-6 lg:col-span-2">
                          {renderLogicGridRulePanel()}
                          {renderLogicGridMatrix()}
                          {renderLogicGridAnswers()}
                        </div>
                        <div className="space-y-6 lg:col-span-1">
                          {renderLogicGridReadout()}

                          {shouldShowLogicGridDebug && (
                            <DevDebugPanel title="Logic Grid Dev">
                              {SHOW_ANSWERS && (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between rounded-lg border border-cyan-500/20 bg-cyan-500/10 p-2">
                                    <span className="text-[10px] font-bold uppercase text-cyan-300">Answer</span>
                                    <span className="font-mono text-lg font-black text-white">
                                      {logicGridPuzzle?.answer ?? "—"}
                                    </span>
                                  </div>
                                </div>
                              )}
                              {SHOW_PUZZLE_DEBUG_META && (
                                <div className="mt-4 space-y-1.5 border-t border-white/5 pt-3 text-[10px]">
                                  <div className="flex justify-between">
                                    <span className="text-slate-500 uppercase font-bold">ID</span>
                                    <span className="text-amber-200 font-mono">{logicGridDebugInfo.id}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500 uppercase font-bold">Rule Type</span>
                                    <span className="text-amber-200 font-mono">{formatDevValue(logicGridDebugInfo.ruleType)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500 uppercase font-bold">Grid Size</span>
                                    <span className="text-amber-200 font-mono">{formatDevValue(logicGridDebugInfo.gridSize ?? getLogicGridSize())}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-slate-500 uppercase font-bold">Missing Index</span>
                                    <span className="text-amber-200 font-mono">
                                      {logicGridDebugInfo.missingIndex !== null && logicGridDebugInfo.missingIndex !== undefined
                                        ? JSON.stringify(logicGridDebugInfo.missingIndex)
                                        : "—"}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </DevDebugPanel>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative mt-6 overflow-hidden rounded-3xl border border-cyan-400/30 bg-slate-900/80 p-6 shadow-[inset_0_0_45px_rgba(6,182,212,0.25),0_20px_40px_rgba(2,6,23,0.6)] backdrop-blur-md">
                    <div className="relative z-10">
                      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                        <div>
                          <p className={`text-[10px] font-bold uppercase tracking-[0.35em] ${isCyber ? "text-cyan-300 text-glow-blue" : "text-cyan-300"}`}>
                            Pattern Rush Arena
                          </p>
                          <h3 className={`text-2xl font-bold ${isCyber ? "text-white text-glow-blue" : "text-white"}`}>
                            {currentPuzzle?.title || "Pattern Rush"}
                          </h3>
                          <p className="text-xs font-medium text-slate-300">
                            Resolve the missing tile and keep the momentum
                            alive.
                          </p>
                        </div>
                        <p className={`text-[10px] font-bold uppercase tracking-[0.3em] ${isCyber ? "text-slate-400 text-glow-blue/30" : "text-slate-400"}`}>
                          Live Arena Feed
                        </p>
                      </div>

                      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
                        <div className="rounded-2xl border border-cyan-500/10 bg-slate-950/60 p-5 shadow-[inset_0_0_35px_rgba(2,6,23,0.6),0_0_30px_rgba(6,182,212,0.15)] backdrop-blur-[14px]">
                          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-cyan-300/90">
                            Prompt Sequence
                          </p>
                          <p className="text-xs font-medium text-slate-300">
                            Read the pattern
                          </p>
                          <div className="mt-4 grid grid-cols-3 gap-3 md:gap-4">
                            {currentPuzzle.grid.map((item, index) => {
                              const isMissingSlot = item === "missing";
                              return (
                                <div
                                  key={`${item}-${index}`}
                                  className="flex aspect-square items-center justify-center rounded-xl border border-white/5 bg-slate-900/40 shadow-[inset_0_0_20px_rgba(2,6,23,0.8)] overflow-hidden"
                                >
                                  {isMissingSlot ? (
                                    <div className="flex h-[80%] w-[80%] items-center justify-center rounded-xl border-2 border-dashed border-cyan-400/80 bg-linear-to-b from-cyan-500/10 to-transparent shadow-[0_0_30px_rgba(34,211,238,0.4)] text-xl font-black text-cyan-100/80 animate-pulse">
                                      <span className="text-3xl font-mono">?</span>
                                    </div>
                                  ) : (
                                    <div className="scale-75 md:scale-90">
                                      <PuzzleShape shape={item} disabled={true} />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="xl:sticky xl:top-6">
                          <div className="rounded-2xl border border-cyan-500/10 bg-slate-950/60 p-5 shadow-[inset_0_0_35px_rgba(2,6,23,0.6),0_0_30px_rgba(6,182,212,0.15)]">
                            <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-cyan-300/90">
                              Answer Tray
                            </p>
                            <p className="text-xs font-medium text-slate-300">
                              Choose the missing tile
                            </p>
                            <div className="mt-4 flex flex-col items-center gap-3">
                              {feedback && (
                                <div className="flex justify-center">
                                  <span
                                    className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] ${getFeedbackBadgeClass(feedback, isCyber)}`}
                                  >
                                    {feedback}
                                  </span>
                                </div>
                              )}
                              <div className="flex w-full flex-wrap justify-center gap-3 md:gap-4">
                                {currentPuzzle.choices.map((choice) => (
                                  <div key={choice} className="scale-90 md:scale-100">
                                    <PuzzleShape
                                      shape={choice}
                                      onClick={() => handleAnswer(choice)}
                                      disabled={gameOver}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {shouldShowPatternDebug && (
                            <div className="mt-4">
                              <DevDebugPanel title="Pattern Rush Dev">
                                {(SHOW_ANSWERS || SHOW_PATTERN_RUSH_ANSWERS) && (
                                  <div>
                                    <span className="font-bold text-white">
                                      Answer:
                                    </span>{" "}
                                    <span className="text-amber-100">
                                      {patternDebugInfo.answer}
                                    </span>
                                  </div>
                                )}
                                {(SHOW_PATTERN_RULE || SHOW_PUZZLE_DEBUG_META) && (
                                  <div>
                                    <span className="font-bold text-white">
                                      Rule:
                                    </span>{" "}
                                    <span className="text-amber-100">
                                      {formatDevValue(patternDebugInfo.ruleDescription)}
                                    </span>
                                  </div>
                                )}
                                {SHOW_PUZZLE_DEBUG_META && (
                                  <>
                                    <div>
                                      <span className="font-bold text-white">
                                        ID:
                                      </span>{" "}
                                      <span className="text-amber-100">
                                        {patternDebugInfo.id}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="font-bold text-white">
                                        Pattern Type:
                                      </span>{" "}
                                      <span className="text-amber-100">
                                        {formatDevValue(patternDebugInfo.patternType)}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="font-bold text-white">
                                        Difficulty:
                                      </span>{" "}
                                      <span className="text-amber-100">
                                        {formatDevValue(patternDebugInfo.difficulty)}
                                      </span>
                                    </div>
                                  </>
                                )}
                              </DevDebugPanel>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
            <div
              className={`relative overflow-hidden rounded-2xl border px-6 py-5 ${
                isCyber
                  ? "border-cyan-400/40 bg-[linear-gradient(145deg,rgba(34,211,238,0.15)_0%,rgba(8,16,30,0.95)_100%)] shadow-[0_0_30px_rgba(34,211,238,0.2)]"
                  : "border-slate-200 bg-slate-50 shadow-sm"
              }`}
            >
              {isCyber && (
                <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-cyan-400/20 blur-3xl animate-pulse" />
              )}
              <div className="flex items-center justify-between">
                <p
                  className={`text-[12px] font-black uppercase tracking-[0.3em] ${
                    isCyber ? "text-cyan-400/80 text-glow-blue" : "text-slate-500"
                  }`}
                >
                  Total Score
                </p>
                {isCyber && (
                  <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                )}
              </div>
              <div
                className={`mt-3 font-mono text-[clamp(2.5rem,5vw,3.75rem)] font-black leading-none tracking-tighter ${
                  isCyber
                    ? "text-white drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                    : "text-slate-900"
                }`}
              >
                {scoreBreakdown.totalScore.toLocaleString()}
              </div>
              <div className="mt-5 grid gap-3 border-t border-white/10 pt-4 text-[11px]">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className={isCyber ? "text-slate-400 uppercase tracking-widest font-bold text-[9px]" : "text-slate-500 font-bold text-[9px]"}>
                      Base Reward
                    </span>
                    <span className={`font-mono text-sm font-bold ${isCyber ? "text-cyan-200" : "text-slate-700"}`}>
                      {scoreBreakdown.baseScoreEarned.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className={isCyber ? "text-slate-400 uppercase tracking-widest font-bold text-[9px]" : "text-slate-500 font-bold text-[9px]"}>
                      Combo Bonus
                    </span>
                    <span className={`font-mono text-sm font-bold ${isCyber ? "text-fuchsia-300" : "text-slate-700"}`}>
                      +{scoreBreakdown.comboBonusEarned.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="mt-1 flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 border border-white/5">
                  <span className={isCyber ? "text-slate-300 font-bold uppercase tracking-tighter" : "text-slate-600 font-bold"}>
                    Round Gain
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-base font-black ${isCyber ? "text-white text-glow-blue" : "text-slate-900"}`}>
                      {scoreBreakdown.roundScoreEarned.toLocaleString()}
                    </span>
                    {scoreBreakdown.lastGain > 0 && (
                      <span className={`animate-bounce-subtle font-mono text-[10px] font-bold ${isCyber ? "text-emerald-400" : "text-emerald-600"}`}>
                        (+{scoreBreakdown.lastGain.toLocaleString()})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/70 px-5 py-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300">
                  Cognitive State
                </p>
                <div className="flex items-center gap-3">
                  {adaptiveShiftMessage && (
                    <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider animate-pulse">
                      {adaptiveShiftMessage}
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${adaptiveConfidenceColor}`}
                  >
                    {liveAdaptiveDifficulty.confidence} confidence
                  </span>
                </div>
              </div>

              <div className="mt-2 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <p className={`text-lg font-bold ${adaptiveStateColor}`}>
                      {adaptiveStateLabel}
                    </p>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/5 ${recommendedSessionAlignmentTone} border border-white/10`}
                    >
                      {isRecommendedSessionAligned &&
                      !didBreakRecommendedAlignment
                        ? "Aligned"
                        : "Shifted"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-1">
                    {liveAdaptiveDifficulty.reason}
                  </p>
                </div>

                <div className="flex gap-4 border-l border-white/10 pl-4">
                  <div className="text-center">
                    <p className="text-[9px] font-bold uppercase tracking-tighter text-slate-400">
                      Current
                    </p>
                    <p className="text-sm font-bold text-slate-300">
                      {currentPuzzleDifficultyLabel}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-bold uppercase tracking-tighter text-slate-400">
                      Target
                    </p>
                    <p className="text-sm font-bold text-slate-200">
                      {nextTargetDifficulty}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`relative overflow-hidden rounded-2xl border px-6 py-5 transition-all duration-500 ${
                isCyber
                  ? streak >= 6
                    ? "border-fuchsia-400 bg-[linear-gradient(145deg,rgba(217,70,239,0.2)_0%,rgba(15,10,30,0.95)_100%)] shadow-[0_0_40px_rgba(217,70,239,0.25)]"
                    : streak >= 4
                      ? "border-fuchsia-400/60 bg-fuchsia-500/14"
                      : streak >= 2
                        ? "border-fuchsia-400/35 bg-fuchsia-500/8"
                        : "border-fuchsia-400/20 bg-fuchsia-500/5"
                  : "border-slate-200 bg-slate-50 shadow-sm"
              }`}
            >
              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${isCyber ? (streak >= 4 ? 'bg-fuchsia-400 animate-ping' : 'bg-slate-500') : 'bg-slate-400'}`} />
                  <p
                    className={`text-[11px] font-black uppercase tracking-[0.25em] ${
                      isCyber ? "text-slate-300" : "text-slate-500"
                    }`}
                  >
                    Performance
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] transition-transform duration-300 ${
                    isCyber
                      ? comboMultiplier >= 3
                        ? "bg-fuchsia-500/20 text-fuchsia-200 ring-1 ring-fuchsia-400/40 scale-110 shadow-[0_0_15px_rgba(217,70,239,0.3)]"
                        : "bg-cyan-400/10 text-cyan-200 ring-1 ring-cyan-400/30"
                      : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                  }`}
                >
                  {comboMultiplier === null ? "--" : `x${comboMultiplier}`}
                </span>
              </div>
              
              <div className="mt-5 flex items-center justify-between px-1">
                <div className="flex flex-col">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                    Accuracy
                  </p>
                  <div
                    className={`mt-1 font-mono text-3xl font-black ${
                      isCyber ? "text-cyan-300 text-glow-blue" : "text-slate-800"
                    }`}
                  >
                    {accuracy}
                  </div>
                </div>
                
                <div className="h-10 w-px bg-white/10" />

                <div className="flex flex-col text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                    Streak
                  </p>
                  <div
                    className={`mt-1 font-mono text-3xl font-black ${
                      isCyber ? "text-fuchsia-300 text-glow-pink" : "text-slate-800"
                    }`}
                  >
                    {streak.toString().padStart(2, "0")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Arena;
