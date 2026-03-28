import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrophy,
  faStar,
  faWaveSquare,
  faCircleExclamation,
  faSkull,
  faLayerGroup,
  faChevronRight,
  faArrowRight,
  faRotateRight,
  faBrain,
  faBolt,
  faBullseye,
} from "@fortawesome/free-solid-svg-icons";
import PuzzleShape from "../components/PuzzleShape";
import { checkAnswer, getRandomPuzzle } from "../game/puzzleEngine";
import sequenceSprintPuzzles, {
  getRandomSequenceSprintPuzzle,
} from "../game/sequenceSprintPuzzles";
import {
  formatGridAsMatrix,
  getRandomGridRecallPuzzle,
} from "../game/gridRecallPuzzles";
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
import sequenceSprintRunner from "../assets/sequenceSprintRunner.png";

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
const GRID_RECALL_TOTAL_PUZZLES = 5;

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

const buildSequenceSprintResultsCopy = ({
  accuracy = 0,
  correctAnswers = 0,
  ruleType = "sequence logic",
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
      summary: `Partial progress. Keep refining your ${ruleType} recognition.`,
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
  difficulty = "medium",
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
      summary: `Partial spatial mapping. Keep refining your focus on the ${difficulty} matrices.`,
    };
  }

  return {
    eyebrow: "Session Complete",
    title: "Grid Recall Results",
    summary:
      "Session timed out. Rebuild your spatial encoding with simpler patterns.",
  };
};

// const DEFAULT_PUZZLE_TYPE = PUZZLE_TYPES.PATTERN_RUSH;
const DEFAULT_PUZZLE_TYPE = PUZZLE_TYPES.SEQUENCE_SPRINT;

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
  const initialPuzzleType = Object.values(PUZZLE_TYPES).includes(
    routePuzzleType,
  )
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
    SHOW_PATTERN_RUSH_ANSWERS,
    SHOW_SEQUENCE_SPRINT_ANSWERS,
    SHOW_PUZZLE_DEBUG_META,
    SHOW_GRID_RECALL_ANSWERS,
  } = PUZZLE_DEV_FLAGS;
  const initialPuzzle = useMemo(() => {
    if (initialPuzzleType === PUZZLE_TYPES.SEQUENCE_SPRINT) {
      return getRandomSequenceSprintPuzzle(initialTargetDifficulty);
    }
    if (initialPuzzleType === PUZZLE_TYPES.GRID_RECALL) {
      return getRandomGridRecallPuzzle(initialTargetDifficulty);
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
  const [gridRecallPuzzle, setGridRecallPuzzle] = useState(() =>
    getRandomGridRecallPuzzle(initialTargetDifficulty),
  );
  const [gridRecallPhase, setGridRecallPhase] = useState("memorize");
  const [recallPulse, setRecallPulse] = useState(false);
  const [score, setScore] = useState(0);
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
  const recommendedBannerHideTimeoutRef = useRef(null);
  const recommendedBannerRemoveTimeoutRef = useRef(null);
  const previousTargetDifficultyRef = useRef(
    liveAdaptiveDifficulty.targetDifficulty,
  );
  const hasRecordedSessionRef = useRef(false);
  const activePuzzle =
    activePuzzleType === PUZZLE_TYPES.SEQUENCE_SPRINT
      ? sequenceSprintPuzzle
      : activePuzzleType === PUZZLE_TYPES.GRID_RECALL
        ? gridRecallPuzzle
        : currentPuzzle;
  const activePuzzleMeta = getPuzzleTypeMetadata(activePuzzleType);
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

    return {
      difficulty: gridRecallPuzzle?.difficulty || "medium",
      gridSignature: gridRecallPuzzle?.answer || null,
      decoyCount: Array.isArray(gridRecallPuzzle?.options)
        ? gridRecallPuzzle.options.length - 1
        : 0,
    };
  }, [activePuzzleType, gridRecallPuzzle]);

  const patternDebugInfo = useMemo(() => {
    return {
      id: currentPuzzle?.id ?? "Unknown",
      difficulty:
        currentPuzzle?.difficulty ??
        currentPuzzle?.difficultyBucket ??
        "Unknown",
      answer: currentPuzzle?.correctAnswer ?? "Unknown",
    };
  }, [currentPuzzle]);

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

  const shouldShowPatternDebug =
    SHOW_PATTERN_RUSH_ANSWERS || SHOW_PUZZLE_DEBUG_META;
  const shouldShowSequenceDebug =
    SHOW_SEQUENCE_SPRINT_ANSWERS || SHOW_PUZZLE_DEBUG_META;
  const shouldShowGridRecallDebug =
    SHOW_GRID_RECALL_ANSWERS || SHOW_PUZZLE_DEBUG_META;

  const sequenceTotalCount = SEQUENCE_SPRINT_TOTAL_PROBLEMS;
  const sequenceSolvedCount = sequenceSprintSolvedCount;
  const sequenceSprintProgress = getSequenceSprintProgressPercent({
    solvedCount: sequenceSolvedCount,
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

    return buildAccuracySummary({
      correctAnswers,
      attemptedAnswers: totalAnswers,
      totalPuzzles: GRID_RECALL_TOTAL_PUZZLES,
      decimals: 0,
    });
  }, [isGridRecallSession, correctAnswers, totalAnswers]);

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
      case PUZZLE_TYPES.PATTERN_RUSH:
      default:
        return getRandomPuzzle(difficulty);
    }
  }

  function dismissRecommendedBanner() {
    if (!recommendedSession || isBannerHiding || !showRecommendedBanner) {
      return;
    }

    if (recommendedBannerHideTimeoutRef.current) {
      clearTimeout(recommendedBannerHideTimeoutRef.current);
    }
    if (recommendedBannerRemoveTimeoutRef.current) {
      clearTimeout(recommendedBannerRemoveTimeoutRef.current);
    }

    setIsBannerHiding(true);
    recommendedBannerRemoveTimeoutRef.current = setTimeout(() => {
      setShowRecommendedBanner(false);
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
    };
  }, []);

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
            : {},
      ...sequenceSprintOverrides,
    };

    const outcomeTimer = setTimeout(() => {
      const computedFinalSessionDataWithLatest = {
        ...computedFinalSessionData,
        score,
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
    if (recommendedBannerHideTimeoutRef.current) {
      clearTimeout(recommendedBannerHideTimeoutRef.current);
      recommendedBannerHideTimeoutRef.current = null;
    }
    if (recommendedBannerRemoveTimeoutRef.current) {
      clearTimeout(recommendedBannerRemoveTimeoutRef.current);
      recommendedBannerRemoveTimeoutRef.current = null;
    }

    if (!recommendedSessionKey) {
      return;
    }

    const bannerShowTimer = setTimeout(() => {
      setShowRecommendedBanner(true);
      setIsBannerHiding(false);
    }, 0);
    recommendedBannerHideTimeoutRef.current = setTimeout(() => {
      setIsBannerHiding(true);
    }, 3500);
    recommendedBannerRemoveTimeoutRef.current = setTimeout(() => {
      setShowRecommendedBanner(false);
    }, 4000);

    return () => {
      clearTimeout(bannerShowTimer);
      if (recommendedBannerHideTimeoutRef.current) {
        clearTimeout(recommendedBannerHideTimeoutRef.current);
        recommendedBannerHideTimeoutRef.current = null;
      }
      if (recommendedBannerRemoveTimeoutRef.current) {
        clearTimeout(recommendedBannerRemoveTimeoutRef.current);
        recommendedBannerRemoveTimeoutRef.current = null;
      }
    };
  }, [recommendedSessionKey]);

  useEffect(() => {
    if (!gridRecallPuzzle) {
      return undefined;
    }

    const recallTimer = setTimeout(() => {
      setGridRecallPhase("recall");
    }, 1500);

    return () => clearTimeout(recallTimer);
  }, [gridRecallPuzzle]);

  useEffect(() => {
    if (gridRecallPhase === "recall") {
      setRecallPulse(true);
      const timer = setTimeout(() => setRecallPulse(false), 500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [gridRecallPhase]);

  // Handlers
  function applyLiveAdaptiveDifficulty(nextDifficulty) {
    setLiveAdaptiveDifficulty(nextDifficulty);
  }

  const handleStartRecommendedSession = () => {
    const recommendedDifficulty =
      sessionOutcome?.nextRecommendedDifficulty || "medium";

    resetGame(recommendedDifficulty);
  };

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
      setScore((prev) => prev + 100);
      setStreak(nextStreak);
      setBestStreak(nextBestStreak);
      setCorrectAnswers(nextCorrectAnswers);
      setFeedback(adaptiveFeedback);
    } else {
      setStreak(0);
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
      <div className="rounded-2xl border border-violet-400/30 bg-slate-950/70 p-4 shadow-[0_0_28px_rgba(168,85,247,0.18)] backdrop-blur-md transition-all duration-300">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[9px] uppercase tracking-[0.35em] text-violet-300">
              Sequence Sprint Lane
            </p>
            <p className="text-lg font-semibold text-white">Momentum Track</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-cyan-400/30 bg-slate-900/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-cyan-200">
              {sequenceSolvedCount}/{sequenceTotalCount} solved
            </span>
            <span className="rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-fuchsia-300">
              {Math.round(sequenceSprintProgress)}%
            </span>
          </div>
        </div>
        <div className="mt-6 space-y-2">
          <div className="relative h-2.5 rounded-full bg-slate-900/80 shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)]">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-linear-to-r from-cyan-400 via-violet-500 to-fuchsia-500 transition-all duration-300"
              style={{ width: `${sequenceSprintProgress}%` }}
            />
            <div
              className={`absolute right-0 top-0 h-full w-12 transition-opacity duration-300 ${sequenceSprintRunnerFx.finishGlow}`}
            />
            <div
              className={`absolute top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/95 shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all duration-300 ${sequenceSprintRunnerFx.wrapper}`}
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
    <div className="rounded-2xl border border-emerald-400/40 bg-[#02140c]/80 p-5 shadow-[inset_0_0_30px_rgba(16,185,129,0.25)]">
      <div className="flex items-center justify-between border-b border-emerald-400/10 pb-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-emerald-300">
          Memory Grid
        </p>
        <span className="text-[10px] font-medium text-emerald-500/60">
          Spatial Matrix
        </span>
      </div>
      <div
        className={`mt-6 grid grid-cols-3 gap-3 border relative overflow-hidden rounded-xl transition-all duration-500 ${
          recallPulse
            ? "border-emerald-400/50 drop-shadow-[0_0_20px_rgba(52,211,153,0.8)]"
            : "border-white/10"
        }`}
      >
        {gridRecallPhase === "memorize" && (
          <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-400/5 to-transparent" />
            <div className="absolute -inset-x-4 -top-1/2 h-2/3 rounded-full bg-gradient-to-b from-emerald-300/0 via-emerald-300/35 to-emerald-300/0 blur-xl opacity-80 mix-blend-screen animate-grid-scan" />
          </div>
        )}

        {displayedGridRecallMatrix.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isVisible = gridRecallPhase === "memorize" && cell;
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`flex aspect-square items-center justify-center rounded-2xl border transition ${
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
    <div className="rounded-2xl border border-emerald-400/40 bg-[#02140c]/80 p-5 shadow-[inset_0_0_30px_rgba(16,185,129,0.25)]">
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
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] ${getFeedbackBadgeClass(feedback, isCyber)}`}
            >
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
            {gridRecallPuzzle.options.map((option) => {
              const optionMatrix = formatGridAsMatrix(option);
              const normalizedOptionMatrix =
                optionMatrix.length === 3
                  ? optionMatrix
                  : displayedGridRecallMatrix;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleAnswer(option)}
                  disabled={gameOver}
                  className="group flex items-center gap-4 rounded-2xl border border-emerald-400/40 bg-[#052114] px-4 py-3 text-left transition-all duration-200 hover:border-emerald-300/70 hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <div className="grid h-16 w-16 grid-cols-3 gap-1">
                    {normalizedOptionMatrix.map((row, rowIndex) =>
                      row.map((cell, colIndex) => (
                        <span
                          key={`${rowIndex}-${colIndex}`}
                          className={`block rounded-sm border ${
                            cell
                              ? "border-emerald-300 bg-emerald-300/80 shadow-[0_0_10px_rgba(16,185,129,0.65)]"
                              : "border-emerald-400/20 bg-transparent"
                          }`}
                        />
                      )),
                    )}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-200">
                    Recall Choice
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderGridRecallReadout = () => (
    <div className="rounded-2xl border border-emerald-400/40 bg-[#02140c]/80 p-5 shadow-[inset_0_0_30px_rgba(16,185,129,0.25)]">
      <div className="mb-4 flex items-center justify-between border-b border-emerald-400/10 pb-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">
          Neural Readout
        </p>
        <div className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
      </div>
      <div className="grid gap-3">
        <div className="group rounded-xl border border-emerald-400/10 bg-emerald-500/5 p-4 transition-all hover:bg-emerald-500/10">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-500/60 group-hover:text-emerald-400/80 transition-colors">
            ACCURACY
          </p>
          <p className="mt-1 text-3xl font-black text-white text-glow-emerald">
            {gridRecallSummary?.accuracy ?? 0}%
          </p>
        </div>
        <div className="group rounded-xl border border-emerald-400/10 bg-emerald-500/5 p-4 transition-all hover:bg-emerald-500/10">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-500/60 group-hover:text-emerald-400/80 transition-colors">
            STREAK
          </p>
          <div className="mt-1 flex items-end gap-2">
            <p className="text-3xl font-black text-emerald-400 text-glow-emerald">
              {streak}
            </p>
            {streak >= 3 && (
              <span className="mb-1 text-[10px] font-bold uppercase text-emerald-300 animate-bounce">
                Lock!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSequencePrompt = () => (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.2)] backdrop-blur-sm transition-all duration-300">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-400">
          Sequence Prompt
        </p>
        <span className="text-[10px] font-medium text-slate-500">
          Track the pattern
        </span>
      </div>
      <div className="mt-4">
        <h3 className="text-xl font-bold text-white text-glow-blue">
          {sequenceSprintPuzzle.prompt}
        </h3>
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        {(sequenceSprintPuzzle.sequence ?? []).map((value, index) => (
          <span
            key={`${value}-${index}`}
            className="flex min-w-14 items-center justify-center rounded-xl border border-fuchsia-500/30 bg-[#0b1324] px-5 py-4 text-xl font-black text-white shadow-[inset_0_0_15px_rgba(0,0,0,0.6),0_0_15px_rgba(217,70,239,0.2)]"
          >
            {value}
          </span>
        ))}
        <span className="flex min-w-14 animate-pulse items-center justify-center rounded-xl border border-cyan-400/40 bg-cyan-500/10 px-5 py-4 text-xl font-black text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.25)]">
          ?
        </span>
      </div>
    </div>
  );

  const renderSequenceAnswers = () => (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.2)] backdrop-blur-sm transition-all duration-300">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
          Answer Lane
        </p>
        <span className="text-[10px] font-medium text-slate-500">
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
                    : "border-white/10 bg-cyber-bg-accent/80 text-slate-200 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] hover:border-violet-400/40 hover:bg-[#11182f] hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]"
                }`}
              >
                <div className="absolute inset-x-0 -top-px h-px bg-linear-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="mb-2 block text-[9px] font-black uppercase tracking-[0.25em] text-slate-500 transition-colors group-hover:text-violet-300">
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

  const renderSprintReadout = () => (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.2)] backdrop-blur-sm transition-all duration-300">
      <div className="mb-4 flex items-center justify-between border-b border-white/5 pb-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">
          Sprint Readout
        </p>
        <div className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
      </div>
      <div className="grid gap-3">
        <div className="group rounded-xl border border-white/5 bg-slate-900/60 p-4 transition-all hover:bg-slate-900/80 hover:border-white/10">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 group-hover:text-slate-400 transition-colors">
            ACCURACY
          </p>
          <p className="mt-1 text-3xl font-black text-white text-glow-blue">
            {sequenceSprintSummary?.accuracy ?? 0}%
          </p>
        </div>
        <div className="group rounded-xl border border-white/5 bg-slate-900/60 p-4 transition-all hover:bg-slate-900/80 hover:border-white/10">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 group-hover:text-slate-400 transition-colors">
            SOLVED
          </p>
          <p className="mt-1 text-3xl font-black text-white">
            {sequenceSolvedCount}
            <span className="mx-2 text-lg font-medium text-slate-500">/</span>
            <span className="text-xl text-slate-400">{sequenceTotalCount}</span>
          </p>
        </div>
        <div className="group rounded-xl border border-white/5 bg-slate-900/60 p-4 transition-all hover:bg-slate-900/80 hover:border-white/10">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 group-hover:text-slate-400 transition-colors">
            STREAK
          </p>
          <div className="mt-1 flex items-end gap-2">
            <p className="text-3xl font-black text-fuchsia-400 text-glow-pink">
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

  function handleAnswer(selectedAnswer) {
    if (gameOverRef.current || isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    dismissRecommendedBanner();

    if (activePuzzleType === PUZZLE_TYPES.SEQUENCE_SPRINT) {
      setSequenceSprintSelectedAnswer(selectedAnswer);
      setSequenceSprintSolvedCount((prev) =>
        Math.min(prev + 1, sequenceTotalCount),
      );
    }

    const isCorrect =
      activePuzzleType === PUZZLE_TYPES.SEQUENCE_SPRINT
        ? selectedAnswer === sequenceSprintPuzzle.answer
        : activePuzzleType === PUZZLE_TYPES.GRID_RECALL
          ? selectedAnswer === gridRecallPuzzle.answer
          : checkAnswer(currentPuzzle, selectedAnswer);

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
  const comboMultiplier =
    totalAnswers === 0
      ? null
      : streak >= 6
        ? 4
        : streak >= 4
          ? 3
          : streak >= 2
            ? 2
            : 1;
  const gridRecallPhaseLabel =
    gridRecallPhase === "memorize" ? "Memorization Phase" : "Recall Phase";
  const gridRecallMatrix = useMemo(
    () => formatGridAsMatrix(gridRecallPuzzle?.answer),
    [gridRecallPuzzle],
  );
  const displayedGridRecallMatrix =
    gridRecallMatrix.length === 3
      ? gridRecallMatrix
      : Array.from({ length: 3 }, () => Array(3).fill(false));
  const sequenceSprintAccuracy = sequenceSprintSummary?.accuracy ?? 0;
  const sequenceSprintTotalPuzzles =
    sequenceSprintSummary?.totalPuzzles ?? sequenceTotalCount;
  const sequenceSprintUnanswered = Math.max(
    0,
    sequenceSprintSummary?.unanswered ??
      sequenceSprintTotalPuzzles - totalAnswers,
  );
  const sequenceRuleType =
    sequenceSprintPuzzleMetrics.ruleType ?? "sequence logic";

  const resultsCopy =
    activePuzzleType === PUZZLE_TYPES.SEQUENCE_SPRINT
      ? buildSequenceSprintResultsCopy({
          accuracy: sequenceSprintAccuracy,
          correctAnswers,
          totalPuzzles: sequenceSprintTotalPuzzles,
          unanswered: sequenceSprintUnanswered,
          ruleType: sequenceRuleType,
        })
      : activePuzzleType === PUZZLE_TYPES.GRID_RECALL
        ? buildGridRecallResultsCopy({
            accuracy: gridRecallSummary?.accuracy ?? 0,
            correctAnswers,
            difficulty: gridRecallPuzzle?.difficulty ?? "medium",
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

  const outcomeToneStyles = {
    gold: {
      border: "border-yellow-400/50",
      bg: "bg-yellow-400/10",
      label: "text-yellow-300 text-glow-yellow",
      shadow: "shadow-[0_0_40px_rgba(250,204,21,0.25)]",
      icon: faTrophy,
    },
    positive: {
      border: "border-emerald-400/40",
      bg: "bg-emerald-500/10",
      label: "text-emerald-300 text-glow-emerald",
      shadow: "shadow-[0_0_30px_rgba(16,185,129,0.18)]",
      icon: faStar,
    },
    supportive: {
      border: "border-cyan-400/40",
      bg: "bg-cyan-500/10",
      label: "text-cyan-300 text-glow-blue",
      shadow: "shadow-[0_0_30px_rgba(6,182,212,0.16)]",
      icon: faWaveSquare,
    },
    alert: {
      border: "border-orange-400/40",
      bg: "bg-orange-500/10",
      label: "text-orange-300 text-glow-orange",
      shadow: "shadow-[0_0_28px_rgba(251,146,60,0.15)]",
      icon: faCircleExclamation,
    },
    caution: {
      border: "border-red-400/40",
      bg: "bg-red-500/10",
      label: "text-red-300 text-glow-red",
      shadow: "shadow-[0_0_28px_rgba(248,113,113,0.18)]",
      icon: faSkull,
    },
    neutral: {
      border: "border-slate-500/30",
      bg: "bg-slate-500/10",
      label: "text-slate-300",
      shadow: "shadow-[0_0_18px_rgba(148,163,184,0.10)]",
      icon: faLayerGroup,
    },
  };
  const toneStyle =
    outcomeToneStyles[sessionOutcome?.tone] || outcomeToneStyles.neutral;

  return (
    <div className="animate-fadeIn px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div
          className={`rounded-[28px] border p-6 md:p-8 ${
            isCyber
              ? "border-cyan-400/20 bg-[#09101d]/80 shadow-[0_0_50px_rgba(14,165,233,0.15)] backdrop-blur-xl"
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
                    <FontAwesomeIcon icon={faBolt} className="animate-pulse" />
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
                  ? "border-cyan-400/20 bg-cyan-400/5 shadow-[0_0_15px_rgba(34,211,238,0.05)] hover:border-cyan-400/40"
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
                <FontAwesomeIcon icon={faBrain} className="text-[10px]" />
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
                  ? "border-fuchsia-400/20 bg-fuchsia-500/5 shadow-[0_0_15px_rgba(217,70,239,0.05)] hover:border-fuchsia-400/40"
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
                <FontAwesomeIcon icon={faBolt} className="text-[10px]" />
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
                <FontAwesomeIcon icon={faLayerGroup} className="text-[10px]" />
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
            className={`mt-6 rounded-3xl border p-6 md:p-10 ${
              isCyber
                ? "border-cyan-400/20 bg-[linear-gradient(180deg,rgba(10,17,32,0.95)_0%,rgba(7,11,20,0.98)_100%)] shadow-[inset_0_0_0_1px_rgba(34,211,238,0.04)]"
                : "border-slate-200 bg-white"
            }`}
          >
            {gameOver ? (
              <div className="relative flex flex-col items-center justify-center py-10 text-center">
                {isCyber && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-grid-cyber opacity-[0.03]" />
                    <div
                      className={`absolute -top-32 -left-32 w-80 h-80 rounded-full blur-[120px] opacity-10 ${toneStyle.bg}`}
                    />
                    <div
                      className={`absolute -bottom-32 -right-32 w-80 h-80 rounded-full blur-[120px] opacity-10 ${toneStyle.bg}`}
                    />
                  </div>
                )}

                <div className="relative z-10 flex flex-col items-center">
                  <div
                    className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border transition-all duration-700 ${toneStyle.border} ${toneStyle.bg} ${toneStyle.shadow}`}
                  >
                    <FontAwesomeIcon
                      icon={toneStyle.icon}
                      className={`text-2xl ${toneStyle.label}`}
                    />
                  </div>

                  {activePuzzleType === "sequence_sprint" ? (
                    <>
                      <p
                        className={`text-sm font-semibold uppercase tracking-[0.3em] ${
                          isCyber ? "text-fuchsia-400" : "text-cyan-600"
                        }`}
                      >
                        {resultsCopy.eyebrow}
                      </p>

                      <h2
                        className={`mt-3 text-4xl font-black tracking-tight ${
                          isCyber
                            ? "text-white text-glow-blue"
                            : "text-slate-900"
                        }`}
                      >
                        {resultsCopy.title}
                      </h2>

                      <p
                        className={`mt-4 max-w-xl text-lg font-medium leading-relaxed ${
                          isCyber ? "text-cyan-100/90" : "text-slate-600"
                        }`}
                      >
                        {resultsCopy.summary}
                      </p>

                      <p
                        className={`mt-3 text-sm font-semibold uppercase tracking-[0.2em] ${
                          isCyber ? "text-cyan-200" : "text-slate-500"
                        }`}
                      >
                        Rule Type: {sequenceRuleType}
                      </p>
                    </>
                  ) : activePuzzleType === "grid_recall" ? (
                    <>
                      <p
                        className={`text-sm font-semibold uppercase tracking-[0.3em] ${
                          isCyber ? "text-fuchsia-400" : "text-cyan-600"
                        }`}
                      >
                        {resultsCopy.eyebrow}
                      </p>
                      <h2
                        className={`mt-3 text-4xl font-black tracking-tight ${
                          isCyber
                            ? "text-white text-glow-blue"
                            : "text-slate-900"
                        }`}
                      >
                        {resultsCopy.title}
                      </h2>
                      <p
                        className={`mt-4 max-w-xl text-lg font-medium leading-relaxed ${
                          isCyber ? "text-cyan-100/90" : "text-slate-600"
                        }`}
                      >
                        {resultsCopy.summary}
                      </p>
                    </>
                  ) : (
                    <>
                      <p
                        className={`text-sm font-semibold uppercase tracking-[0.3em] ${
                          isCyber ? "text-fuchsia-400" : "text-cyan-600"
                        }`}
                      >
                        Round Complete
                      </p>
                      <h2
                        className={`mt-3 text-4xl font-black tracking-tight ${
                          isCyber
                            ? "text-white text-glow-blue"
                            : "text-slate-900"
                        }`}
                      >
                        Pattern Rush{" "}
                        <span
                          className={
                            isCyber ? "text-cyan-400" : "text-cyan-600"
                          }
                        >
                          Results
                        </span>
                      </h2>
                      <p
                        className={`mt-4 max-w-xl text-lg font-medium leading-relaxed ${
                          isCyber ? "text-cyan-100/90" : "text-slate-600"
                        }`}
                      >
                        {getPerformanceMessage()}
                      </p>
                    </>
                  )}
                </div>

                {sessionOutcome && (
                  <div
                    className={`relative mt-8 w-full max-w-2xl overflow-hidden rounded-3xl border transition-all duration-500 ${toneStyle.border} ${toneStyle.bg} ${toneStyle.shadow} p-6 md:p-8`}
                    data-cognitive-identity={
                      cognitiveIdentity?.label ?? "unknown"
                    }
                  >
                    {isCyber && (
                      <div
                        className={`absolute top-0 left-0 h-1 w-full bg-linear-to-r from-transparent via-${
                          toneStyle.label.split("-")[1]
                        }-400 to-transparent opacity-50`}
                      />
                    )}

                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-3">
                          <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400/80">
                            Session Insight
                          </h3>
                          <span
                            className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${toneStyle.label} bg-white/5 border border-white/10`}
                          >
                            {sessionOutcome.alignmentLabel}
                          </span>
                        </div>

                        <p
                          className={`mt-4 text-3xl font-black tracking-tight text-white ${
                            toneStyle.label.includes("text-glow")
                              ? toneStyle.label.split(" ").pop()
                              : ""
                          }`}
                        >
                          {sessionOutcome.title}
                        </p>

                        <p className="mt-3 text-base leading-relaxed text-cyan-100/80">
                          {sessionOutcome.summary}
                        </p>
                      </div>

                      {cognitiveIdentity && (
                        <div className="w-full md:w-64 shrink-0 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md shadow-inner">
                          <div className="flex items-center gap-2 mb-3">
                            <FontAwesomeIcon
                              icon={faBrain}
                              className="text-cyan-400 text-xs"
                            />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300/90">
                              Cognitive Identity
                            </p>
                          </div>
                          <p className="text-xl font-black tracking-tight text-white">
                            {cognitiveIdentity.label}
                          </p>
                          <p className="mt-2 text-xs leading-5 text-cyan-100/70 italic">
                            "{cognitiveIdentity.description}"
                          </p>

                          {cognitiveIdentity?.primarySignal && (
                            <div className="mt-4 border-t border-white/10 pt-4">
                              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400/70">
                                Primary Signal
                              </p>
                              <p className="mt-1 text-xs font-bold text-white uppercase tracking-wider">
                                {cognitiveIdentity.primarySignal}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {cognitiveIdentity?.shiftSignal && (
                      <div className="mt-4 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 px-4 py-2 text-left">
                        <p className="text-xs leading-5 text-fuchsia-100/90 italic">
                          <FontAwesomeIcon
                            icon={faBolt}
                            className="mr-2 text-[10px]"
                          />
                          {cognitiveIdentity.shiftSignal}
                        </p>
                      </div>
                    )}

                    <div className="mt-8 flex flex-wrap items-center justify-between gap-6 border-t border-white/10 pt-6">
                      {sessionOutcome?.trainingDirection && (
                        <div className="flex items-center gap-4">
                          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400/70">
                            Direction
                          </span>
                          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.15em] text-white shadow-lg ring-1 ring-white/20">
                            <FontAwesomeIcon
                              icon={faArrowRight}
                              className="text-[10px] text-cyan-400"
                            />
                            {sessionOutcome.trainingDirection}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-400/70">
                            Next Recommendation
                          </p>
                          <p className="text-sm font-black text-white uppercase tracking-widest mt-0.5">
                            {sessionOutcome.nextRecommendedDifficulty}
                          </p>
                        </div>
                        <button
                          onClick={handleStartRecommendedSession}
                          className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-cyan-400 px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-950 transition-all hover:bg-cyan-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] active:scale-95"
                        >
                          <span>Start</span>
                          <FontAwesomeIcon
                            icon={faChevronRight}
                            className="transition-transform group-hover:translate-x-1"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-12 grid w-full max-w-3xl grid-cols-1 gap-4 md:grid-cols-3">
                  <div
                    className={`group relative overflow-hidden rounded-2xl border px-6 py-8 transition-all duration-300 ${
                      isCyber
                        ? "border-cyan-400/20 bg-cyan-400/5 hover:border-cyan-400/40 hover:bg-cyan-400/10"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    {isCyber && (
                      <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-cyan-400/10 blur-2xl transition-all group-hover:bg-cyan-400/20" />
                    )}
                    <div className="relative flex flex-col items-center">
                      <FontAwesomeIcon
                        icon={faBullseye}
                        className={`mb-3 text-lg ${
                          isCyber ? "text-cyan-400" : "text-slate-400"
                        }`}
                      />
                      <p
                        className={`text-[10px] font-black uppercase tracking-[0.3em] ${
                          isCyber ? "text-cyan-300/70" : "text-slate-500"
                        }`}
                      >
                        FINAL SCORE
                      </p>
                      <div
                        className={`mt-3 font-mono text-4xl font-black tracking-tighter ${
                          isCyber
                            ? "text-white text-glow-blue"
                            : "text-slate-800"
                        }`}
                      >
                        {score.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`group relative overflow-hidden rounded-2xl border px-6 py-8 transition-all duration-300 ${
                      isCyber
                        ? "border-fuchsia-400/20 bg-fuchsia-500/5 hover:border-fuchsia-400/40 hover:bg-fuchsia-500/10"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    {isCyber && (
                      <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-fuchsia-400/10 blur-2xl transition-all group-hover:bg-fuchsia-400/20" />
                    )}
                    <div className="relative flex flex-col items-center">
                      <FontAwesomeIcon
                        icon={faBolt}
                        className={`mb-3 text-lg ${
                          isCyber ? "text-fuchsia-400" : "text-slate-400"
                        }`}
                      />
                      <p
                        className={`text-[10px] font-black uppercase tracking-[0.3em] ${
                          isCyber ? "text-fuchsia-300/70" : "text-slate-500"
                        }`}
                      >
                        BEST STREAK
                      </p>
                      <div
                        className={`mt-3 font-mono text-4xl font-black tracking-tighter ${
                          isCyber
                            ? "text-white text-glow-pink"
                            : "text-slate-800"
                        }`}
                      >
                        x{bestStreak.toString().padStart(2, "0")}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`group relative overflow-hidden rounded-2xl border px-6 py-8 transition-all duration-300 ${
                      isCyber
                        ? "border-emerald-400/20 bg-emerald-400/5 hover:border-emerald-400/40 hover:bg-emerald-400/10"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    {isCyber && (
                      <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-emerald-400/10 blur-2xl transition-all group-hover:bg-emerald-400/20" />
                    )}
                    <div className="relative flex flex-col items-center">
                      <FontAwesomeIcon
                        icon={faStar}
                        className={`mb-3 text-lg ${
                          isCyber ? "text-emerald-400" : "text-slate-400"
                        }`}
                      />
                      <p
                        className={`text-[10px] font-black uppercase tracking-[0.3em] ${
                          isCyber ? "text-emerald-300/70" : "text-slate-500"
                        }`}
                      >
                        ACCURACY
                      </p>
                      <div
                        className={`mt-3 font-mono text-4xl font-black tracking-tighter ${
                          isCyber
                            ? "text-white text-glow-emerald"
                            : "text-slate-800"
                        }`}
                      >
                        {accuracy}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => resetGame()}
                  className={`group relative mt-12 overflow-hidden rounded-xl px-10 py-4 font-black uppercase tracking-[0.2em] transition-all duration-300 ${
                    isCyber
                      ? "bg-cyan-400 text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.3)] hover:bg-cyan-300 hover:shadow-[0_0_50px_rgba(34,211,238,0.5)] hover:scale-105 active:scale-95"
                      : "bg-cyan-600 text-white hover:bg-cyan-500 shadow-lg"
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-3">
                    <FontAwesomeIcon
                      icon={faRotateRight}
                      className="transition-transform duration-500 group-hover:rotate-180"
                    />
                    Play Again
                  </span>
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p
                      className={`text-[10px] font-semibold uppercase tracking-[0.25em] ${
                        isCyber ? "text-slate-500" : "text-slate-500"
                      }`}
                    >
                      Puzzle Feed
                    </p>
                    <h2
                      className={`mt-1 text-lg font-semibold ${
                        isCyber ? "text-white" : "text-slate-900"
                      }`}
                    >
                      {activePuzzleType === PUZZLE_TYPES.SEQUENCE_SPRINT
                        ? "Sequence Sprint"
                        : currentPuzzle.title}
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
                  <div className="rounded-3xl border border-fuchsia-500/30 bg-slate-900/80 p-6 shadow-[0_0_20px_rgba(217,70,239,0.1)] backdrop-blur-md">
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-fuchsia-400">
                          Sequence Sprint Arena
                        </p>
                        <h2 className="text-xl font-bold text-white">
                          Read the logic. Finish the lane.
                        </h2>
                      </div>
                      <span className="rounded-full border border-fuchsia-500/30 bg-fuchsia-500/20 px-3 py-1 text-xs font-semibold text-fuchsia-300">
                        Momentum Logic Live
                      </span>
                    </div>

                    {renderSequenceSprintRunner()}

                    <div className="grid gap-6 xl:grid-cols-3">
                      <div className="space-y-6 xl:col-span-2">
                        {renderSequencePrompt()}
                        {renderSequenceAnswers()}
                      </div>
                      <div className="space-y-6 xl:col-span-1">
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
                                    {sequenceDebugInfo.rule}
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
                ) : activePuzzleType === PUZZLE_TYPES.GRID_RECALL ? (
                  <div className="rounded-3xl border border-emerald-500/30 bg-slate-900/80 p-6 shadow-[0_0_20px_rgba(16,185,129,0.1)] backdrop-blur-md">
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.2em] text-emerald-400">
                          Grid Recall Arena
                        </p>
                        <h2 className="text-xl font-bold text-white">
                          Neuro spatial imprint. Match the pattern.
                        </h2>
                      </div>
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                        {gridRecallPhaseLabel}
                      </span>
                    </div>

                    <div className="grid gap-6 xl:grid-cols-3">
                      <div className="space-y-6 xl:col-span-2">
                        {renderGridRecallGrid()}
                        {renderGridRecallAnswers()}
                      </div>
                      <div className="space-y-6 xl:col-span-1">
                        {renderGridRecallReadout()}

                        {shouldShowGridRecallDebug && (
                          <DevDebugPanel title="Grid Recall Dev">
                            {SHOW_GRID_RECALL_ANSWERS && (
                              <div>
                                <div className="font-bold text-white">
                                  Answer Matrix:
                                </div>
                                <div className="mt-2 flex flex-col gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-900/40 p-3">
                                  {formatGridAsMatrix(
                                    gridRecallPuzzle?.answer || "000000000",
                                  ).map((row, rIdx) => (
                                    <div key={rIdx} className="flex gap-1.5">
                                      {row.map((cell, cIdx) => (
                                        <div
                                          key={cIdx}
                                          className={`h-5 w-5 rounded-md border ${
                                            cell
                                              ? "border-emerald-300 bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]"
                                              : "border-white/10 bg-black/40"
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
                                    {gridRecallDebugInfo.difficulty}
                                  </span>
                                </div>
                              </>
                            )}
                          </DevDebugPanel>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 relative">
                    <div className="pointer-events-none absolute inset-0">
                      <div className="absolute inset-4 rounded-4xl bg-cyan-500/20 blur-[60px] opacity-50" />
                      <div className="absolute inset-x-12 top-8 h-16 rounded-3xl bg-cyan-400/10 blur-2xl" />
                    </div>
                    <div className="relative rounded-3xl border border-cyan-400/40 bg-[#020813]/80 p-6 shadow-[inset_0_0_45px_rgba(6,182,212,0.45),0_20px_40px_rgba(2,6,23,0.6)] backdrop-blur-[32px]">
                      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-cyan-300">
                            Pattern Rush Arena
                          </p>
                          <h3 className="text-2xl font-bold text-white">
                            {currentPuzzle.title}
                          </h3>
                          <p className="text-xs font-medium text-slate-300">
                            Resolve the missing tile and keep the momentum
                            alive.
                          </p>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
                          Live Arena Feed
                        </p>
                      </div>

                      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
                        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-5 shadow-[inset_0_0_35px_rgba(2,6,23,0.6),0_0_30px_rgba(6,182,212,0.15)] backdrop-blur-[14px]">
                          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-slate-300">
                            Prompt Sequence
                          </p>
                          <p className="text-xs font-medium text-slate-400">
                            Read the pattern
                          </p>
                          <div className="mt-4 grid grid-cols-3 gap-4 md:gap-5">
                            {currentPuzzle.grid.map((item, index) => {
                              const isMissingSlot = item === "missing";
                              return (
                                <div
                                  key={`${item}-${index}`}
                                  className="flex aspect-square items-center justify-center rounded-2xl border bg-slate-900/70 shadow-[inset_0_0_20px_rgba(2,6,23,0.8)]"
                                >
                                  {isMissingSlot ? (
                                    <div className="flex h-[88%] w-[88%] items-center justify-center rounded-2xl border-dashed border-cyan-400/80 bg-linear-to-b from-cyan-500/15 to-transparent shadow-[0_0_35px_rgba(34,211,238,0.6)] text-xl font-black text-cyan-100/80 animate-pulse">
                                      <span className="text-3xl">?</span>
                                    </div>
                                  ) : (
                                    <PuzzleShape shape={item} disabled={true} />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="xl:sticky xl:top-6">
                          <div className="rounded-2xl border border-slate-800/70 bg-slate-950/60 p-5 shadow-[inset_0_0_35px_rgba(2,6,23,0.6),0_0_30px_rgba(6,182,212,0.15)]">
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
                              <div className="flex w-full flex-wrap justify-center gap-4">
                                {currentPuzzle.choices.map((choice) => (
                                  <PuzzleShape
                                    key={choice}
                                    shape={choice}
                                    onClick={() => handleAnswer(choice)}
                                    disabled={gameOver}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          {shouldShowPatternDebug && (
                            <div className="mt-4">
                              <DevDebugPanel title="Pattern Rush Dev">
                                {SHOW_PATTERN_RUSH_ANSWERS && (
                                  <div>
                                    <span className="font-bold text-white">
                                      Answer:
                                    </span>{" "}
                                    <span className="text-amber-100">
                                      {patternDebugInfo.answer}
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
                                        Difficulty:
                                      </span>{" "}
                                      <span className="text-amber-100">
                                        {patternDebugInfo.difficulty}
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
              </>
            )}
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-[180px_1fr_180px_180px]">
            <div
              className={`rounded-2xl border px-5 py-4 ${
                isCyber
                  ? "border-cyan-400/20 bg-cyan-400/5"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <p
                className={`text-[10px] font-bold uppercase tracking-[0.25em] ${
                  isCyber ? "text-slate-300" : "text-slate-500"
                }`}
              >
                SCORE
              </p>
              <div
                className={`mt-1 font-mono text-2xl font-bold ${
                  isCyber ? "text-cyan-300" : "text-slate-800"
                }`}
              >
                {score.toString().padStart(4, "0")}
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

            <div className="grid gap-4">
              <div
                className={`rounded-2xl border px-5 py-4 transition-all duration-300 ${
                  isCyber
                    ? streak >= 6
                      ? "border-fuchsia-400/90 bg-fuchsia-500/25"
                      : streak >= 4
                        ? "border-fuchsia-400/60 bg-fuchsia-500/18"
                        : streak >= 2
                          ? "border-fuchsia-400/35 bg-fuchsia-500/10"
                          : "border-fuchsia-400/20 bg-fuchsia-500/5"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <p
                  className={`text-[10px] font-bold uppercase tracking-[0.25em] ${
                    isCyber ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  STREAK
                </p>
                <div
                  className={`mt-1 font-mono text-2xl font-bold ${
                    isCyber ? "text-fuchsia-300" : "text-slate-800"
                  }`}
                >
                  x{streak.toString().padStart(2, "0")}
                </div>
              </div>

              <div
                className={`rounded-2xl border px-5 py-4 ${
                  isCyber
                    ? comboMultiplier >= 3
                      ? "border-fuchsia-400/30 bg-fuchsia-500/10"
                      : "border-cyan-400/20 bg-cyan-400/5"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <p
                  className={`text-[10px] font-bold uppercase tracking-[0.25em] ${
                    isCyber ? "text-slate-300" : "text-slate-500"
                  }`}
                >
                  COMBO
                </p>
                <div
                  className={`mt-1 font-mono text-2xl font-bold ${
                    isCyber
                      ? comboMultiplier >= 3
                        ? "text-fuchsia-300"
                        : "text-cyan-300"
                      : "text-slate-800"
                  }`}
                >
                  {comboMultiplier === null ? "--" : `x${comboMultiplier}`}
                </div>
              </div>
            </div>

            <div
              className={`rounded-2xl border px-5 py-4 ${
                isCyber
                  ? "border-cyan-400/20 bg-cyan-400/5"
                  : "border-slate-200 bg-slate-50"
              }`}
            >
              <p
                className={`text-[10px] font-bold uppercase tracking-[0.25em] ${
                  isCyber ? "text-slate-300" : "text-slate-500"
                }`}
              >
                ACCURACY
              </p>
              <div
                className={`mt-1 font-mono text-2xl font-bold ${
                  isCyber ? "text-cyan-300" : "text-slate-800"
                }`}
              >
                {accuracy}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Arena;
