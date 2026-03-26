import { useEffect, useMemo, useRef, useState } from 'react';
import PuzzleShape from '../components/PuzzleShape';
import SequenceSprintPuzzle from '../components/SequenceSprintPuzzle';
import { checkAnswer, getRandomPuzzle } from '../game/puzzleEngine';
import { getRandomSequenceSprintPuzzle } from '../game/sequenceSprintPuzzles';
import { recordSession } from '../game/sessionTracker';
import { calculateLiveAdaptiveDifficulty } from '../analytics/liveAdaptiveDifficulty.js';
import { useLocation } from 'react-router-dom';
import { evaluateSessionOutcome } from '../analytics/sessionOutcomeEvaluator';
import { classifyCognitiveIdentity } from '../analytics/cognitiveIdentity';
import {
  PUZZLE_TYPES,
  getPuzzleTypeMetadata,
} from '../utils/puzzleTypeRegistry';

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
  recover: 'Recovery Mode',
  steady: 'Stable Load',
  challenge: 'Challenge Mode',
};

const adaptiveStateColorMap = {
  recover: 'text-yellow-300',
  steady: 'text-cyan-300',
  challenge: 'text-fuchsia-300',
};

const adaptiveConfidenceColorMap = {
  low: 'text-slate-300',
  medium: 'text-cyan-200',
  high: 'text-emerald-300',
};

const adaptiveCoachingMessageMap = {
  recover: 'Focus on accuracy over speed.',
  steady: 'Stay consistent. You have a good rhythm.',
  challenge: 'Strong momentum. Keep pressing.',
};

const adaptiveFeedbackMap = {
  recover: {
    correct: 'Correct. Rebuilding stability.',
    incorrect: 'Incorrect. Focus on the next one.',
  },
  steady: {
    correct: 'Correct. Nice rhythm.',
    incorrect: 'Incorrect. Reset and stay steady.',
  },
  challenge: {
    correct: 'Correct. Exceptional read.',
    incorrect: 'Incorrect. Stay sharp.',
  },
};

const adaptiveShiftMessageMap = {
  easy: 'Adaptive shift: easing difficulty',
  medium: 'Adaptive shift: stabilizing load',
  hard: 'Adaptive shift: increasing challenge',
};

const liveCoachingToneMap = {
  recover: 'border-amber-500/20 bg-amber-500/5 text-amber-200',
  steady: 'border-cyan-500/20 bg-cyan-500/5 text-cyan-200',
  challenge: 'border-violet-500/20 bg-violet-500/5 text-violet-200',
  default: 'border-slate-700/70 bg-slate-800/40 text-slate-200',
};

const recommendedSessionStyles = {
  challenge: {
    border: 'border-violet-500/30',
    label: 'text-violet-300',
    badge: 'bg-violet-500/15 text-violet-200 border border-violet-400/30',
  },
  steady: {
    border: 'border-cyan-500/20',
    label: 'text-cyan-300',
    badge: 'bg-cyan-500/15 text-cyan-200 border border-cyan-400/30',
  },
  recover: {
    border: 'border-amber-500/30',
    label: 'text-amber-300',
    badge: 'bg-amber-500/15 text-amber-200 border border-amber-400/30',
  },
  default: {
    border: 'border-slate-700',
    label: 'text-slate-300',
    badge: 'bg-slate-500/15 text-slate-200 border border-slate-400/20',
  },
};

const recommendedSessionLabels = {
  challenge: 'Challenge',
  steady: 'Steady',
  recover: 'Recovery',
  default: 'Adaptive',
};

const recommendedAlignmentToneMap = {
  aligned: 'text-emerald-300',
  shifted: 'text-amber-300',
  inactive: 'text-slate-400',
};

const recommendedDifficultyLabels = {
  easy: 'EASY',
  medium: 'MEDIUM',
  hard: 'HARD',
};

const recommendedSessionReasonMap = {
  challenge:
    'The system detected strong recent performance and is opening at a higher challenge level.',
  steady:
    'The system detected balanced recent performance and is opening at a stable training level.',
  recover:
    'The system detected a need for controlled recovery and is easing the opening difficulty.',
  default:
    'The system is using your recent training behavior to shape this session.',
};

const adaptiveStateToDifficultyMap = {
  recover: 'easy',
  steady: 'medium',
  challenge: 'hard',
};

function getAdaptiveFeedback(adaptiveState, isCorrect) {
  const feedbackSet =
    adaptiveFeedbackMap[adaptiveState] ?? adaptiveFeedbackMap.steady;
  return isCorrect ? feedbackSet.correct : feedbackSet.incorrect;
}

function getFeedbackBadgeClass(feedback, isCyber) {
  if (feedback.startsWith('Correct')) {
    return 'bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/20';
  }

  if (feedback.startsWith('Incorrect') || feedback.startsWith('Missed')) {
    return 'bg-fuchsia-500/10 text-fuchsia-300 ring-1 ring-fuchsia-400/20';
  }

  return isCyber
    ? 'bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/20'
    : 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';
}

// const DEFAULT_PUZZLE_TYPE = PUZZLE_TYPES.PATTERN_RUSH;
const DEFAULT_PUZZLE_TYPE = PUZZLE_TYPES.SEQUENCE_SPRINT;

function Arena({ theme }) {
  // Navigation/session context
  const isCyber = theme === 'cyber';

  const location = useLocation();
  const recommendedSession = location.state?.recommendedSession ?? null;
  const recommendedSessionKey = recommendedSession
    ? `${recommendedSession.source || 'direct'}-${recommendedSession.adaptiveState || 'steady'}-${recommendedSession.recommendation || ''}`
    : null;
  const initialTargetDifficulty =
    adaptiveStateToDifficultyMap[recommendedSession?.adaptiveState] || 'medium';
  const recommendedOpeningDifficulty =
    recommendedDifficultyLabels[initialTargetDifficulty] || 'MEDIUM';

  const routePuzzleType = location.state?.puzzleType;
  const initialPuzzleType =
    Object.values(PUZZLE_TYPES).includes(routePuzzleType)
      ? routePuzzleType
      : DEFAULT_PUZZLE_TYPE;

  const recommendedSessionReason =
    recommendedSessionReasonMap[recommendedSession?.adaptiveState] ||
    recommendedSessionReasonMap.default;
  const initialAdaptiveReason = recommendedSession
    ? 'Session initialized from adaptive coaching recommendation.'
    : 'Not enough live data yet.';
  const recommendedSessionTone =
    recommendedSessionStyles[recommendedSession?.adaptiveState] ||
    recommendedSessionStyles.default;
  const initialPuzzle = useMemo(() => {
    if (initialPuzzleType === PUZZLE_TYPES.SEQUENCE_SPRINT) {
      return getRandomSequenceSprintPuzzle(initialTargetDifficulty);
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
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [feedback, setFeedback] = useState('');
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
    state: recommendedSession?.adaptiveState || 'steady',
    targetDifficulty: initialTargetDifficulty,
    confidence: 'low',
    reason: initialAdaptiveReason,
  });
  const [recentAnswerHistory, setRecentAnswerHistory] = useState([]);
  const [adaptiveShiftMessage, setAdaptiveShiftMessage] = useState('');
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
      : currentPuzzle;
  const activePuzzleMeta = getPuzzleTypeMetadata(activePuzzleType);
  const currentPuzzleDifficulty =
    activePuzzle?.difficulty || activePuzzle?.difficultyBucket || 'medium';
  const nextTargetDifficulty =
    liveAdaptiveDifficulty.targetDifficulty?.toUpperCase() || 'MEDIUM';
  const currentPuzzleDifficultyLabel = currentPuzzleDifficulty.toUpperCase();
  const adaptiveStateLabel =
    adaptiveStateLabelMap[liveAdaptiveDifficulty.state] ?? 'Stable Load';

  const adaptiveStateColor =
    adaptiveStateColorMap[liveAdaptiveDifficulty.state] ?? 'text-cyan-300';

  const adaptiveConfidenceColor =
    adaptiveConfidenceColorMap[liveAdaptiveDifficulty.confidence] ??
    'text-slate-300';

  const adaptiveCoachingMessage =
    adaptiveCoachingMessageMap[liveAdaptiveDifficulty.state] ??
    'Stay consistent and keep building momentum.';


  const isRecommendedSessionAligned =
    Boolean(recommendedSession?.adaptiveState) &&
    recommendedSession.adaptiveState === liveAdaptiveDifficulty.state;

  const recommendedSessionAlignmentLabel = !recommendedSession?.adaptiveState
    ? 'No recommended session active'
    : didBreakRecommendedAlignment || !isRecommendedSessionAligned
      ? 'Shifted away from recommended training state'
      : 'Aligned with recommended training state';

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

  const liveCoachingPressureClass =
    streak >= 6
      ? 'shadow-[0_0_32px_rgba(217,70,239,0.22)] scale-[1.01]'
      : streak >= 4
        ? 'shadow-[0_0_22px_rgba(34,211,238,0.14)] scale-[1.005]'
        : streak >= 2
          ? 'shadow-[0_0_14px_rgba(34,211,238,0.08)]'
          : '';

  function getNextPuzzleByType(puzzleType, difficulty) {
    switch (puzzleType) {
      case PUZZLE_TYPES.SEQUENCE_SPRINT:
        return getRandomSequenceSprintPuzzle(difficulty);
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
      puzzleMetrics: sequenceSprintPuzzleMetrics,
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
         puzzleMetrics: sequenceSprintPuzzleMetrics,
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

  // Handlers
  function applyLiveAdaptiveDifficulty(nextDifficulty) {
    setLiveAdaptiveDifficulty(nextDifficulty);
  }

  const handleStartRecommendedSession = () => {
    const recommendedDifficulty =
      sessionOutcome?.nextRecommendedDifficulty || 'medium';

    resetGame(recommendedDifficulty);
  };

  function loadNextPuzzle(preferredDifficulty = 'medium') {
    const nextPuzzle = getNextPuzzleByType(activePuzzleType, preferredDifficulty);
    if (activePuzzleType === PUZZLE_TYPES.SEQUENCE_SPRINT) {
      setSequenceSprintSelectedAnswer(null);
      setSequenceSprintPuzzle(nextPuzzle);
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
        adaptiveShiftMessageMap[nextTarget] || 'Adaptive shift detected',
      );

      if (adaptiveShiftTimeoutRef.current) {
        clearTimeout(adaptiveShiftTimeoutRef.current);
      }
      adaptiveShiftTimeoutRef.current = setTimeout(() => {
        setAdaptiveShiftMessage('');
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
      setFeedback('');
      if (allowAfterFeedbackWhileGameOver || !gameOverRef.current) {
        afterFeedback?.(nextTarget);
      }
      isTransitioningRef.current = false;
    }, 700);
  }
  function handleAnswer(selectedAnswer) {
    if (gameOverRef.current || isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    dismissRecommendedBanner();

    if (activePuzzleType === PUZZLE_TYPES.SEQUENCE_SPRINT) {
      setSequenceSprintSelectedAnswer(selectedAnswer);
    }

    const isCorrect =
      activePuzzleType === PUZZLE_TYPES.SEQUENCE_SPRINT
        ? selectedAnswer === sequenceSprintPuzzle.answer
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
        activePuzzleType === PUZZLE_TYPES.SEQUENCE_SPRINT,
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
    } else {
      setCurrentPuzzle(newPuzzle);
    }
    applyLiveAdaptiveDifficulty({
      state:
        Object.keys(adaptiveStateToDifficultyMap).find(
          (state) => adaptiveStateToDifficultyMap[state] === nextDifficulty,
        ) || 'steady',
      targetDifficulty: nextDifficulty,
      confidence: 'low',
      reason: initialAdaptiveReason,
    });
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setFeedback('');
    setCorrectAnswers(0);
    setTotalAnswers(0);
    setPuzzlesSeen(1);
    setTimeLeft(45);
    setRecentAnswerHistory([]);
    setAdaptiveShiftMessage('');
    setDidBreakRecommendedAlignment(false);
    isTransitioningRef.current = false;
    setGameOver(false);
    setSessionOutcome(null);
    setCognitiveIdentity(null);
  }
  const accuracy =
    totalAnswers === 0
      ? '--'
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
  function getPerformanceMessage() {
    if (totalAnswers === 0) {
      return 'No response data captured.';
    }

    const accuracyValue = Math.round((correctAnswers / totalAnswers) * 100);

    if (accuracyValue >= 90 && bestStreak >= 6) {
      return 'Exceptional stability. Pattern recognition remained precise under pressure.';
    }

    if (accuracyValue >= 80 && bestStreak >= 4) {
      return 'Strong performance. Reliable recognition throughout the round.';
    }

    if (accuracyValue >= 70) {
      return 'Good analytical performance with solid accuracy.';
    }

    if (accuracyValue >= 60) {
      return 'Moderate stability. Pattern recognition is developing.';
    }

    return 'Unstable response under pressure. Additional reps recommended.';
  }

  const outcomeToneStyles = {
    gold: {
      border: 'border-amber-300/45',
      bg: 'bg-amber-500/12',
      label: 'text-amber-200',
      shadow: 'shadow-[0_0_30px_rgba(251,191,36,0.24)]',
    },
    positive: {
      border: 'border-emerald-400/30',
      bg: 'bg-emerald-500/10',
      label: 'text-emerald-300',
      shadow: 'shadow-[0_0_28px_rgba(52,211,153,0.18)]',
    },
    supportive: {
      border: 'border-cyan-400/30',
      bg: 'bg-cyan-500/10',
      label: 'text-cyan-300',
      shadow: 'shadow-[0_0_28px_rgba(34,211,238,0.16)]',
    },
    alert: {
      border: 'border-yellow-400/30',
      bg: 'bg-yellow-500/10',
      label: 'text-yellow-300',
      shadow: 'shadow-[0_0_28px_rgba(250,204,21,0.16)]',
    },
    caution: {
      border: 'border-red-400/30',
      bg: 'bg-red-500/10',
      label: 'text-red-300',
      shadow: 'shadow-[0_0_28px_rgba(248,113,113,0.18)]',
    },
    neutral: {
      border: 'border-slate-500/30',
      bg: 'bg-slate-500/10',
      label: 'text-slate-300',
      shadow: 'shadow-[0_0_18px_rgba(148,163,184,0.10)]',
    },
  };
  const toneStyle =
    outcomeToneStyles[sessionOutcome?.tone] || outcomeToneStyles.neutral;

  return (
    <div className="px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div
          className={`rounded-[28px] border p-6 md:p-8 ${
            isCyber
              ? 'border-cyan-400/20 bg-[#09101d]/80 shadow-[0_0_40px_rgba(0,0,0,0.35)] backdrop-blur-xl'
              : 'border-slate-200 bg-white shadow-sm'
          }`}
        >
          {recommendedSession && showRecommendedBanner && (
            <div
              className={`overflow-hidden transition-all duration-500 ${
                isBannerHiding
                  ? 'mb-0 max-h-0 -translate-y-4 opacity-0'
                  : 'mb-4 max-h-60 translate-y-0 opacity-100'
              }`}
            >
              <div
                className={`rounded-2xl border bg-slate-900/70 px-4 py-3 shadow-lg transition-all duration-500 ${
                  recommendedSessionTone.border
                } ${isBannerHiding ? 'scale-[0.98]' : 'scale-100'}`}
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div
                    className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${
                      recommendedSessionTone.label
                    }`}
                  >
                    Recommended Session
                  </div>

                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
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
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <div
              className={`rounded-2xl border px-5 py-4 ${
                isCyber
                  ? 'border-cyan-400/20 bg-cyan-400/5'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-[0.25em] ${
                  isCyber ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Challenge
              </p>
              <h1
                className={`mt-2 text-2xl font-bold ${
                  isCyber ? 'text-cyan-400' : 'text-cyan-600'
                }`}
              >
                {activePuzzleMeta.label}
              </h1>
              <p
                className={`mt-2 text-sm leading-5 ${
                  isCyber ? 'text-slate-200' : 'text-slate-500'
                }`}
              >
                {activePuzzleMeta.description}
              </p>
              {activePuzzleMeta.cognitiveSkills?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {activePuzzleMeta.cognitiveSkills.map((skill) => (
                    <span
                      key={skill}
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold tracking-tight ${
                        isCyber
                          ? 'border-slate-500/40 bg-slate-900/40 text-slate-200'
                          : 'border-slate-200 bg-slate-100 text-slate-600'
                      }`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div
              className={`rounded-2xl border px-5 py-4 text-center ${
                isCyber
                  ? 'border-fuchsia-400/20 bg-fuchsia-500/5'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-[0.25em] ${
                  isCyber ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Time Remaining
              </p>
              <div
                className={`mt-2 font-mono text-3xl font-bold ${
                  isCyber ? 'text-fuchsia-400' : 'text-slate-800'
                }`}
              >
                {timeLeft.toString().padStart(2, '0')}s
              </div>
            </div>

            <div
              className={`rounded-2xl border px-5 py-4 ${
                isCyber
                  ? 'border-cyan-400/20 bg-cyan-400/5'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <p
                className={`text-xs font-semibold uppercase tracking-[0.25em] ${
                  isCyber ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Mode
              </p>
              <div
                className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                  isCyber
                    ? 'bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/20'
                    : 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200'
                }`}
              >
                Solo Arena
              </div>
            </div>
          </div>

          <div
            className={`mt-6 rounded-3xl border p-6 md:p-10 ${
              isCyber
                ? 'border-cyan-400/20 bg-[linear-gradient(180deg,rgba(10,17,32,0.95)_0%,rgba(7,11,20,0.98)_100%)] shadow-[inset_0_0_0_1px_rgba(34,211,238,0.04)]'
                : 'border-slate-200 bg-white'
            }`}
          >
            {gameOver ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p
                  className={`text-sm font-semibold uppercase tracking-[0.25em] ${
                    isCyber ? 'text-fuchsia-400' : 'text-cyan-600'
                  }`}
                >
                  Round Complete
                </p>

                <h2
                  className={`mt-4 text-4xl font-bold ${
                    isCyber ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  Pattern Rush Results
                </h2>

                <p
                  className={`mt-4 max-w-xl text-lg leading-8 ${
                    isCyber ? 'text-cyan-100' : 'text-slate-600'
                  }`}
                >
                  {getPerformanceMessage()}
                </p>

                {sessionOutcome && (
                  <div
                    className={`mt-4 rounded-2xl border ${toneStyle.border} ${toneStyle.bg} ${toneStyle.shadow} p-4`}
                    data-cognitive-identity={
                      cognitiveIdentity?.label ?? 'unknown'
                    }
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-300">
                        Session Insight
                      </h3>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${toneStyle.label} bg-white/5 border border-white/10`}
                      >
                        {sessionOutcome.alignmentLabel}
                      </span>
                    </div>

                    <p className="text-lg font-bold text-white">
                      {sessionOutcome.title}
                    </p>

                    <p className="mt-1 text-sm leading-relaxed text-cyan-100/90">
                      {sessionOutcome.summary}
                    </p>

                    {cognitiveIdentity && (
                      <div className="mt-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 space-y-1 shadow-[0_0_18px_rgba(15,118,207,0.08)]">
                        <p className="text-[11px] uppercase tracking-[0.25em] text-cyan-200/95">
                          Cognitive Identity
                        </p>
                        <p className="text-sm font-semibold tracking-tight text-white">
                          {cognitiveIdentity.label}
                        </p>
                        <p className="text-xs leading-5 text-cyan-100/85">
                          {cognitiveIdentity.description}
                        </p>
                      </div>
                    )}

                    {cognitiveIdentity?.primarySignal && (
                      <div className="mt-3 border-t border-white/15 pt-4 space-y-1">
                        <p className="text-[11px] uppercase tracking-[0.24em] text-cyan-200/95">
                          Primary Signal
                        </p>
                        <p className="text-sm font-semibold tracking-tight text-cyan-100">
                          {cognitiveIdentity.primarySignal}
                        </p>
                      </div>
                    )}

                    {cognitiveIdentity?.shiftSignal && (
                      <p className="mt-2 text-xs leading-5 text-fuchsia-100/85">
                        {cognitiveIdentity.shiftSignal}
                      </p>
                    )}

                    {sessionOutcome?.trainingDirection && (
                      <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                        <span className="text-[11px] uppercase tracking-[0.24em] text-cyan-200/95">
                          Training Direction
                        </span>

                        <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-[0_0_18px_rgba(59,130,246,0.45)] ring-1 ring-white/20">
                          {sessionOutcome.trainingDirection}
                        </span>
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/15 pt-3">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-cyan-200/95 font-semibold">
                          Next Recommendation
                        </span>
                        <span className="text-base font-bold text-cyan-200 uppercase tracking-[0.35em] mt-0.5">
                          {sessionOutcome.nextRecommendedDifficulty}
                        </span>
                      </div>

                      <button
                        onClick={handleStartRecommendedSession}
                        className="inline-flex items-center justify-center rounded-xl bg-cyan-400 px-5 py-2 text-sm font-bold text-slate-950 transition-all duration-300 hover:-translate-y-0.5 hover:bg-cyan-300 hover:shadow-[0_10px_40px_rgba(34,211,238,0.45)] shadow-lg shadow-cyan-400/20"
                      >
                        Start Session
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-10 grid w-full max-w-3xl gap-4 md:grid-cols-3">
                  <div
                    className={`rounded-2xl border px-5 py-6 ${
                      isCyber
                        ? 'border-cyan-400/20 bg-cyan-400/5'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <p
                      className={`text-sm uppercase tracking-[0.2em] ${
                        isCyber ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Final Score
                    </p>
                    <div
                      className={`mt-3 font-mono text-3xl font-bold ${
                        isCyber ? 'text-cyan-300' : 'text-slate-800'
                      }`}
                    >
                      {score.toString().padStart(4, '0')}
                    </div>
                  </div>

                  <div
                    className={`rounded-2xl border px-5 py-6 ${
                      isCyber
                        ? 'border-fuchsia-400/20 bg-fuchsia-500/5'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <p
                      className={`text-sm uppercase tracking-[0.2em] ${
                        isCyber ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Best Streak
                    </p>
                    <div
                      className={`mt-3 font-mono text-3xl font-bold ${
                        isCyber ? 'text-fuchsia-300' : 'text-slate-800'
                      }`}
                    >
                      x{bestStreak.toString().padStart(2, '0')}
                    </div>
                  </div>

                  <div
                    className={`rounded-2xl border px-5 py-6 ${
                      isCyber
                        ? 'border-cyan-400/20 bg-cyan-400/5'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <p
                      className={`text-sm uppercase tracking-[0.2em] ${
                        isCyber ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Accuracy
                    </p>
                    <div
                      className={`mt-3 font-mono text-3xl font-bold ${
                        isCyber ? 'text-cyan-300' : 'text-slate-800'
                      }`}
                    >
                      {accuracy}
                    </div>
                  </div>
                </div>

                <button
                  onClick={resetGame}
                  className={`mt-10 rounded-xl px-8 py-4 font-semibold transition ${
                    isCyber
                      ? 'bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.25)] hover:bg-cyan-300'
                      : 'bg-cyan-600 text-white hover:bg-cyan-500'
                  }`}
                >
                  Play Again
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p
                      className={`text-[10px] font-semibold uppercase tracking-[0.25em] ${
                        isCyber ? 'text-slate-500' : 'text-slate-500'
                      }`}
                    >
                      Puzzle Feed
                    </p>
                    <h2
                      className={`mt-1 text-lg font-semibold ${
                        isCyber ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {activePuzzleType === PUZZLE_TYPES.SEQUENCE_SPRINT
                        ? 'Sequence Sprint'
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
                  <div className="mt-6">
                    <SequenceSprintPuzzle
                      prompt={sequenceSprintPuzzle.prompt}
                      sequence={sequenceSprintPuzzle.sequence}
                      options={sequenceSprintPuzzle.options}
                      selectedAnswer={sequenceSprintSelectedAnswer}
                      onSelectAnswer={handleAnswer}
                    />
                  </div>
                ) : (
                  <div className="mt-6">
                    <div className="rounded-3xl border border-cyan-500/30 bg-[#030c1c]/80 p-6 shadow-[0_0_55px_rgba(14,165,233,0.35)] backdrop-blur-[32px]">
                      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.35em] text-cyan-300">
                            Pattern Rush Arena
                          </p>
                          <h3 className="text-2xl font-semibold text-white">
                            {currentPuzzle.title}
                          </h3>
                          <p className="text-xs text-slate-400">
                            Resolve the missing tile and keep the momentum alive.
                          </p>
                        </div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-500">
                          Live Arena Feed
                        </p>
                      </div>

                      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px] xl:items-start">
                        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-5">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">
                            Prompt Sequence
                          </p>
                          <p className="text-xs text-slate-500">Read the pattern</p>
                          <div className="mt-4 grid grid-cols-3 gap-4 md:gap-5">
                            {currentPuzzle.grid.map((item, index) => {
                              const isMissingSlot = item === 'missing';
                              return (
                                <div
                                  key={`${item}-${index}`}
                                  className={`flex aspect-square items-center justify-center rounded-2xl border ${
                                    isMissingSlot
                                      ? 'border-dashed border-cyan-500/70 bg-cyan-500/5 shadow-[0_0_25px_rgba(34,211,238,0.25)]'
                                      : isCyber
                                        ? 'border-cyan-400/10 bg-[#111b31] shadow-[inset_0_0_20px_rgba(34,211,238,0.03)]'
                                        : 'border-slate-200 bg-white'
                                  }`}
                                >
                                  <PuzzleShape shape={item} />
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="xl:sticky xl:top-6">
                          <div className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-5">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-slate-400">
                              Answer Tray
                            </p>
                            <p className="text-xs text-slate-500">Choose the missing tile</p>
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
                                  <button
                                    key={choice}
                                    onClick={() => handleAnswer(choice)}
                                    disabled={gameOver}
                                    className={`group flex min-w-40 flex-col items-center justify-center rounded-2xl border px-5 py-4 text-center transition ${
                                      gameOver ? 'cursor-not-allowed opacity-50' : ''
                                    } ${
                                      isCyber
                                        ? 'border-cyan-400/15 bg-cyan-400/5 text-white hover:border-fuchsia-400/40 hover:bg-fuchsia-500/10 hover:shadow-[0_0_24px_rgba(217,70,239,0.12)]'
                                        : 'border-slate-200 bg-white text-slate-900 hover:border-cyan-300'
                                    }`}
                                  >
                                    <span
                                      className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400"
                                    >
                                      Response
                                    </span>
                                    <div className="mt-3 flex items-center justify-center">
                                      <PuzzleShape shape={choice} />
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
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
                  ? 'border-cyan-400/20 bg-cyan-400/5'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <p
                className={`text-[10px] font-semibold uppercase tracking-[0.25em] ${
                  isCyber ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Score
              </p>
              <div
                className={`mt-1 font-mono text-2xl font-bold ${
                  isCyber ? 'text-cyan-300' : 'text-slate-800'
                }`}
              >
                {score.toString().padStart(4, '0')}
              </div>
            </div>

            <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/70 px-5 py-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500">
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
                        ? 'Aligned'
                        : 'Shifted'}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-1">
                    {liveAdaptiveDifficulty.reason}
                  </p>
                </div>

                <div className="flex gap-4 border-l border-white/10 pl-4">
                  <div className="text-center">
                    <p className="text-[9px] uppercase tracking-tighter text-slate-500">
                      Current
                    </p>
                    <p className="text-sm font-bold text-slate-300">
                      {currentPuzzleDifficultyLabel}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] uppercase tracking-tighter text-slate-500">
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
                      ? 'border-fuchsia-400/90 bg-fuchsia-500/25'
                      : streak >= 4
                        ? 'border-fuchsia-400/60 bg-fuchsia-500/18'
                        : streak >= 2
                          ? 'border-fuchsia-400/35 bg-fuchsia-500/10'
                          : 'border-fuchsia-400/20 bg-fuchsia-500/5'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <p
                  className={`text-[10px] font-semibold uppercase tracking-[0.25em] ${
                    isCyber ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Streak
                </p>
                <div
                  className={`mt-1 font-mono text-2xl font-bold ${
                    isCyber ? 'text-fuchsia-300' : 'text-slate-800'
                  }`}
                >
                  x{streak.toString().padStart(2, '0')}
                </div>
              </div>

              <div
                className={`rounded-2xl border px-5 py-4 ${
                  isCyber
                    ? comboMultiplier >= 3
                      ? 'border-fuchsia-400/30 bg-fuchsia-500/10'
                      : 'border-cyan-400/20 bg-cyan-400/5'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <p
                  className={`text-[10px] font-semibold uppercase tracking-[0.25em] ${
                    isCyber ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  Combo
                </p>
                <div
                  className={`mt-1 font-mono text-2xl font-bold ${
                    isCyber
                      ? comboMultiplier >= 3
                        ? 'text-fuchsia-300'
                        : 'text-cyan-300'
                      : 'text-slate-800'
                  }`}
                >
                  {comboMultiplier === null ? '--' : `x${comboMultiplier}`}
                </div>
              </div>
            </div>

            <div
              className={`rounded-2xl border px-5 py-4 ${
                isCyber
                  ? 'border-cyan-400/20 bg-cyan-400/5'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <p
                className={`text-[10px] font-semibold uppercase tracking-[0.25em] ${
                  isCyber ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Accuracy
              </p>
              <div
                className={`mt-1 font-mono text-2xl font-bold ${
                  isCyber ? 'text-cyan-300' : 'text-slate-800'
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
